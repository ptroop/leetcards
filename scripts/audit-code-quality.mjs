import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoots = ['src', 'extension', 'scripts'];
const failures = [];

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesBelow(path));
    else if (['.js', '.jsx', '.mjs'].includes(extname(entry.name))) files.push(path);
  }
  return files;
}

const files = (await Promise.all(sourceRoots.map((path) => filesBelow(join(root, path)))))
  .flat();

const forbidden = [
  ['placeholder implementation', /\/\/\s*(?:TODO|implement here|rest of code|similar to above)/i],
  ['raw HTML execution', /dangerouslySetInnerHTML|\beval\s*\(|new\s+Function\s*\(/],
  ['empty swallowed exception', /catch\s*(?:\([^)]*\))?\s*\{\s*\}/],
  ['disabled test', /\b(?:test|it|describe)\.skip\s*\(/],
];

for (const path of files) {
  if (path.endsWith('audit-code-quality.mjs')) continue;
  const source = await readFile(path, 'utf8');
  const display = relative(root, path);
  for (const [label, pattern] of forbidden) {
    if (pattern.test(source)) failures.push(`${display}: ${label}`);
  }
}

if (failures.length) {
  console.error(`Code-quality audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Code-quality audit passed: ${files.length} source files checked for placeholders, unsafe execution, swallowed failures, and disabled tests.`);
}
