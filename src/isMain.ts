/**
 * True when the module at `moduleUrl` is the script Node was launched with.
 *
 * Comparing `import.meta.url` to `file://${process.argv[1]}` only works on
 * POSIX: on Windows argv[1] is `C:\...` while the module URL is
 * `file:///C:/...`, and the drive letter's case can differ between the two.
 */
import * as path from 'path';
import { fileURLToPath } from 'url';

export function isMain(moduleUrl: string): boolean {
  const script = process.argv[1];
  if (!script) return false;
  const a = fileURLToPath(moduleUrl);
  const b = path.resolve(script);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

