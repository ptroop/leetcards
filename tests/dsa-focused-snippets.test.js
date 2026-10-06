import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dsaFocusedSubtopics } from '../src/data/dsaFocusedSubtopics.js';

test('every focused DSA problem has independent warning-clean C and C++ implementations', async (context) => {
  const cCompiler = spawnSync('gcc', ['--version'], { encoding: 'utf8' });
  const cppCompiler = spawnSync('g++', ['--version'], { encoding: 'utf8' });
  if (cCompiler.status !== 0 || cppCompiler.status !== 0) {
    context.skip('gcc and g++ are both required for focused DSA verification');
    return;
  }

  const directory = await mkdtemp(join(tmpdir(), 'leetcards-dsa-focused-'));
  try {
    for (const problem of dsaFocusedSubtopics) {
      for (const variant of [
        { id: 'c', compiler: 'gcc', standard: 'c17', extension: 'c' },
        { id: 'cpp', compiler: 'g++', standard: 'c++20', extension: 'cpp' },
      ]) {
        const source = join(directory, `${problem.id}.${variant.extension}`);
        await writeFile(source, problem[variant.id], 'utf8');
        const result = spawnSync(
          variant.compiler,
          [`-std=${variant.standard}`, '-Wall', '-Wextra', '-Wpedantic', '-fsyntax-only', source],
          { encoding: 'utf8' },
        );
        assert.equal(
          result.status,
          0,
          `${problem.id} ${variant.id} implementation does not compile:\n${result.stdout}${result.stderr}`,
        );
      }
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
