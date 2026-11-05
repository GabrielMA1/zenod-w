// Turn a supplied image (for example a ChatGPT Images export) into the website files for
// one slot in data/image-manifest.json, then mark the slot "ready-for-review".
//
//   npm run images:process -- <slot> <file> [--crop] [--focal=0.5,0.5] [--photo]
//     --photo marks a real photograph of the product (removes the visualisation caption)
//   npm run images:approve -- <slot>          (after visual review: renders it on the site)
//   npm run images:status                     (lists every slot and its status)
//
// The original is kept under media-source/<slot>/ with its checksum. Outputs are sRGB,
// orientation-normalised and stripped of metadata. Images are never upscaled.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, 'data/image-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const [command, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, value = 'true'] = arg.slice(2).split('=');
  return [key, value];
}));
const positional = rest.filter((arg) => !arg.startsWith('--'));

function save() {
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function slotFor(id) {
  const slot = manifest.slots[id];
  if (!slot) fail(`Unknown slot "${id}". Run "npm run images:status" for the list.`);
  return slot;
}

function filesFor(slot, widths) {
  return widths.flatMap((width) => [`${slot.destination}-${width}.avif`, `${slot.destination}-${width}.webp`]);
}

async function processImage(id, file) {
  const slot = slotFor(id);
  if (slot.status === 'blocked') fail(`"${id}" is blocked: ${slot.blockedBy}.`);
  const source = resolve(process.cwd(), file ?? '');
  if (!file || !existsSync(source)) fail('Provide the path to the supplied image.');
  const { default: sharp } = await import('sharp');
  const input = sharp(source, { failOn: 'error' }).rotate();
  const meta = await input.metadata();
  const oriented = meta.orientation >= 5 ? { width: meta.height, height: meta.width } : { width: meta.width, height: meta.height };
  const [rw, rh] = slot.ratio;
  const target = rw / rh;
  const actual = oriented.width / oriented.height;
  const ratioOff = Math.abs(actual - target) / target;
  console.log(`Source ${basename(source)}: ${oriented.width} × ${oriented.height} (${meta.format}), slot ratio ${rw}:${rh}.`);
  if (oriented.width < slot.minSource[0] || oriented.height < slot.minSource[1]) {
    fail(`Source is smaller than the slot minimum ${slot.minSource.join(' × ')}. Request a larger export.`);
  }
  let pipeline = input;
  let width = oriented.width;
  let height = oriented.height;
  if (ratioOff > 0.02) {
    if (flags.crop !== 'true') {
      fail(`Aspect ratio ${actual.toFixed(3)} does not match ${rw}:${rh} (${target.toFixed(3)}). Re-export at ${rw}:${rh}, or rerun with --crop [--focal=x,y] to crop around a focal point.`);
    }
    const [fx, fy] = (flags.focal ?? (slot.focal ?? [0.5, 0.5]).join(',')).split(',').map(Number);
    if (actual > target) { width = Math.round(oriented.height * target); height = oriented.height; }
    else { width = oriented.width; height = Math.round(oriented.width / target); }
    const left = Math.max(0, Math.min(oriented.width - width, Math.round(fx * oriented.width - width / 2)));
    const top = Math.max(0, Math.min(oriented.height - height, Math.round(fy * oriented.height - height / 2)));
    pipeline = pipeline.extract({ left, top, width, height });
    console.log(`Cropped to ${width} × ${height} around focal ${fx}, ${fy}.`);
  }
  const buffer = await pipeline.toColourspace('srgb').toBuffer();
  const widths = slot.widths.filter((candidate) => candidate <= width);
  if (!widths.length) fail('Source is too small for every configured width.');
  mkdirSync(resolve(root, dirname(slot.destination)), { recursive: true });
  for (const outputWidth of widths) {
    const resized = sharp(buffer).resize({ width: outputWidth, withoutEnlargement: true });
    await resized.clone().avif({ quality: 52, effort: 6 }).toFile(resolve(root, `${slot.destination}-${outputWidth}.avif`));
    await resized.clone().webp({ quality: 80, effort: 6 }).toFile(resolve(root, `${slot.destination}-${outputWidth}.webp`));
    if (id === 'social-default') await resized.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(resolve(root, `${slot.destination}-${outputWidth}.jpg`));
  }
  const largest = widths.at(-1);
  const finalHeight = Math.round(largest * (height / width));
  const archiveDir = resolve(root, 'media-source', id);
  mkdirSync(archiveDir, { recursive: true });
  const archived = `media-source/${id}/${basename(source)}`;
  copyFileSync(source, resolve(root, archived));
  const sha256 = createHash('sha256').update(readFileSync(source)).digest('hex');
  Object.assign(slot, {
    status: 'ready-for-review', width: largest, height: finalHeight, widths,
    source: { file: archived, sha256, original: [oriented.width, oriented.height], processedAt: new Date().toISOString().slice(0, 10) },
  });
  if (flags.focal) slot.focal = flags.focal.split(',').map(Number);
  if (flags.photo === 'true') slot.generated = false;
  save();
  console.log(`\nWrote ${widths.length * 2} files to ${dirname(slot.destination)}/ and archived the original as ${archived}.`);
  console.log(`"${id}" is now ready-for-review. Check it against the validation criteria in docs/IMAGE-PRODUCTION-QUEUE.md, then run:\n  npm run images:approve -- ${id}\n`);
}

function approve(id) {
  const slot = slotFor(id);
  if (!['ready-for-review', 'implemented'].includes(slot.status)) fail(`"${id}" is ${slot.status}; process an image first.`);
  const missing = filesFor(slot, slot.widths).filter((path) => !existsSync(resolve(root, path)));
  if (missing.length) fail(`Missing files: ${missing.join(', ')}`);
  slot.status = 'implemented';
  save();
  console.log(`"${id}" is implemented. Regenerate (npm run generate) and review the pages that use it: ${slot.location}.`);
}

function status() {
  const rows = Object.entries(manifest.slots).sort(([, a], [, b]) => a.priority - b.priority);
  for (const [id, slot] of rows) {
    const shown = slot.status === 'implemented' ? 'final asset' : slot.fallback ? `fallback: ${slot.fallback}` : slot.status === 'interim' ? 'interim file' : 'hidden/placeholder';
    console.log(`P${slot.priority}  ${id.padEnd(22)} ${slot.status.padEnd(20)} ${shown}`);
  }
}

if (command === 'process') await processImage(positional[0], positional[1]);
else if (command === 'approve') approve(positional[0]);
else if (command === 'status') status();
else fail('Use: process <slot> <file> [--crop] [--focal=x,y] | approve <slot> | status');
