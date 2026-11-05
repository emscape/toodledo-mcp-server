import { afterEach, describe, expect, it } from 'vitest';
import { pathToFileURL } from 'url';
import * as path from 'path';
import { isMain } from './isMain.js';

describe('isMain', () => {
  const originalArgv = process.argv;
  afterEach(() => {
    process.argv = originalArgv;
  });

  it('matches the launched script', () => {
    const script = path.resolve('build', 'index.js');
    process.argv = ['node', script];
    expect(isMain(pathToFileURL(script).href)).toBe(true);
  });

  it('does not match a different module', () => {
    process.argv = ['node', path.resolve('build', 'index.js')];
    expect(isMain(pathToFileURL(path.resolve('build', 'authorize.js')).href)).toBe(false);
  });

  it('is false with no script argument', () => {
    process.argv = ['node'];
    expect(isMain(pathToFileURL(path.resolve('build', 'index.js')).href)).toBe(false);
  });

  it.runIf(process.platform === 'win32')('ignores drive-letter case on Windows', () => {
    const script = path.resolve('build', 'index.js');
    process.argv = ['node', script[0].toLowerCase() + script.slice(1)];
    expect(isMain(pathToFileURL(script[0].toUpperCase() + script.slice(1)).href)).toBe(true);
  });
});
