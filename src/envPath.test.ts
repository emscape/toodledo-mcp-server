import { describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fileURLToPath } from 'url';

vi.mock('dotenv', () => ({ config: vi.fn() }));

const projectEnv = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');

describe('.env loading', () => {
  it('projectEnvPath points at the project root .env', async () => {
    const { projectEnvPath } = await import('./isMain.js');
    expect(projectEnvPath).toBe(projectEnv);
  });

  it.each(['./index.js', './authorize.js'])('%s loads the working-directory .env before the project one', async (entry) => {
    const dotenv = await import('dotenv');
    vi.mocked(dotenv.config).mockClear();
    vi.resetModules();
    await import(entry);
    expect(dotenv.config).toHaveBeenCalledWith(expect.objectContaining({ path: ['.env', projectEnv] }));
  });

  it('a value in the first file wins over the same key in the second', async () => {
    const actual = await vi.importActual<typeof import('dotenv')>('dotenv');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toodledo-env-'));
    const cwdEnv = path.join(dir, 'cwd.env');
    const rootEnv = path.join(dir, 'root.env');
    fs.writeFileSync(cwdEnv, 'TOODLEDO_CLIENT_ID=from-cwd\n');
    fs.writeFileSync(rootEnv, 'TOODLEDO_CLIENT_ID=from-root\nTOODLEDO_CLIENT_SECRET=root-secret\n');
    try {
      const target: Record<string, string> = {};
      actual.config({ quiet: true, path: [cwdEnv, rootEnv], processEnv: target });
      expect(target).toEqual({ TOODLEDO_CLIENT_ID: 'from-cwd', TOODLEDO_CLIENT_SECRET: 'root-secret' });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
