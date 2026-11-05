import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

export function releasePath(root, relative) {
  if (typeof relative !== 'string' || relative.startsWith('/') || relative.includes('\\') || relative.split('/').some(part => !part || part === '..' || part === '.')) throw new Error('Invalid release path');
  if (!(relative.endsWith('.html') || relative.startsWith('assets/') || ['robots.txt','sitemap.xml','site.webmanifest'].includes(relative))) throw new Error('Unsupported release path');
  return resolve(root, relative);
}
export function digest(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
export function validateBranchRelease(root, parentRevision) {
  const manifest = JSON.parse(readFileSync(resolve(root, '.pages-release.json'), 'utf8'));
  if (!/^[a-f0-9]{40}$/.test(manifest.sourceRevision) || manifest.sourceRevision !== parentRevision) throw new Error('Prepare a fresh branch release from the preceding source commit with npm run publish:branch.');
  if (!existsSync(resolve(root, '.nojekyll'))) throw new Error('Branch release requires .nojekyll');
  for (const required of ['index.html','404.html','robots.txt','sitemap.xml','site.webmanifest']) {
    if (!Object.hasOwn(manifest.files ?? {}, required)) throw new Error('Incomplete release: '+required);
  }
  for (const [relative, hash] of Object.entries(manifest.files)) {
    const path = releasePath(root, relative);
    if (!statSync(path).isFile() || digest(path) !== hash) throw new Error('Release content changed: '+relative);
  }
  const home = readFileSync(resolve(root, 'index.html'), 'utf8');
  if (!home.includes(`name="build-revision" content="${manifest.sourceRevision}"`) || !/src="\/assets\/app-[^"]+\.js"/.test(home)) throw new Error('Branch homepage is not the compiled production release');
  return manifest.sourceRevision;
}
