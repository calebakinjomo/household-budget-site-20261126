// Hearth & Ledger — the hand-in program for the best household budget site.
// It runs on Node 22 with the standard library only, no network and no build step:
// it copies this repository's app/ and screenshots/ into the output directory
// the grader provides, then writes dossier.json there with the vendored
// make.fun frontend library, exactly as the scorer rebuilds it.
//
// Usage outside the grader (the grader sets /output itself):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader hands us /output; anywhere else MAKEFUN_OUTPUT_DIR stands in for it.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });

// The whole site, as plain static files.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// The screenshots, first by name the cover. The folder may be absent in a
// partial checkout; the dossier builder refuses an entry without them, so
// only copy when the folder is really there.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier the judge reads: the site's first load, its source outline and
// the screenshots, as buildDossier writes them from the copied files. The
// caps mirror the gate's own: at most 4 screenshots of 256 KiB, app/ within
// 993 files and 16 MiB, and the dossier text capped at 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
