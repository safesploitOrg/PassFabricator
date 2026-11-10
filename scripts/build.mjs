import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUTPUT = join(ROOT, 'dist');
const REPORTS = join(ROOT, 'reports');

async function listFiles(directory) {
  const FILES = [];
  for (const ENTRY of await readdir(directory, { withFileTypes: true })) {
    const PATH = join(directory, ENTRY.name);
    if (ENTRY.isDirectory()) FILES.push(...await listFiles(PATH));
    else if (ENTRY.isFile()) FILES.push(PATH);
    else throw new Error(`Unsupported build input: ${PATH}`);
  }
  return FILES.sort();
}

async function main() {
  // Only this script's generated directory is removed.
  await rm(OUTPUT, { recursive: true, force: true });
  await cp(join(ROOT, 'public'), OUTPUT, { recursive: true, dereference: false });
  await cp(join(ROOT, 'CNAME'), join(OUTPUT, 'CNAME'));
  await writeFile(join(OUTPUT, '.nojekyll'), '');
  const SUMS = [];
  for (const FILE of await listFiles(OUTPUT)) {
    const DIGEST = createHash('sha256').update(await readFile(FILE)).digest('hex');
    SUMS.push(`${DIGEST}  ${relative(OUTPUT, FILE).split('\\').join('/')}`);
  }
  await mkdir(REPORTS, { recursive: true });
  await writeFile(join(REPORTS, 'site-SHA256SUMS.txt'), `${SUMS.join('\n')}\n`);
  console.log(`Built ${SUMS.length} static files in dist/; hashes in reports/site-SHA256SUMS.txt.`);
}

await main();
