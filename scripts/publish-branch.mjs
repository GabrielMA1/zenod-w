import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, releasePath } from './branch-release.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
if (git(['status','--porcelain'])) throw new Error('Commit source changes locally before preparing the branch release. Existing work has been left intact.');
const revision = git(['rev-parse','HEAD']);
const result = spawnSync('npm', ['run','qa'], { cwd: root, stdio: 'inherit', env: { ...process.env, SITE_SOURCE_REVISION: revision, SITE_BASE_PATH: '/', SITE_BASE_URL: 'https://zenodetail.com/' } });
if (result.status !== 0) throw new Error('Release checks failed; no branch artifact was prepared.');
const files = {};
function copy(directory, prefix = '') {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) { copy(resolve(directory, entry.name), relative+'/'); continue; }
    const destination = releasePath(root, relative);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(resolve(directory, entry.name), destination);
    files[relative] = digest(destination);
  }
}
copy(resolve(root, 'dist'));
const manifestPath = resolve(root, '.pages-release.json');
if (existsSync(manifestPath)) {
  const previous = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const relative of Object.keys(previous.files ?? {})) {
    // Only remove owned, obsolete flat bundle assets. Source folders remain intact.
    if (/^assets\/[^/]+$/.test(relative) && !Object.hasOwn(files, relative)) {
      const destination = releasePath(root, relative);
      if (existsSync(destination)) unlinkSync(destination);
    }
  }
}
writeFileSync(resolve(root, '.nojekyll'), '');
writeFileSync(manifestPath, JSON.stringify({ sourceRevision: revision, files }, null, 2)+'\n');
console.log(`Prepared ${Object.keys(files).length} production files from source ${revision}. Commit these generated files, then push the source and release commits together.`);
