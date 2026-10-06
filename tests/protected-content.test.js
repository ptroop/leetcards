import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const hashes = JSON.parse(
  await readFile(new URL('./fixtures/protected-content-hashes.json', import.meta.url), 'utf8'),
);

test('excluded prep and college content remains unchanged', async () => {
  assert.equal(Object.keys(hashes).length, 12);
  for (const [relativePath, expected] of Object.entries(hashes)) {
    const bytes = await readFile(new URL(`../${relativePath}`, import.meta.url));
    const actual = createHash('sha256').update(bytes).digest('hex');
    assert.equal(actual, expected, relativePath);
  }
});
