'use strict';

// Rebuilds the four COBOL gates from unmodified source into Windows
// executables. See docs/adr/0002-rebuild-cobol-gates-on-windows.md.
//
// The sources are FIXED-FORMAT COBOL (column-positioned). GnuCOBOL's default
// source format is fixed, so no -free and no -fixed override is passed; the
// compiler is invoked exactly as the ADR records it.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const KERNEL_DIR = path.join(REPO_ROOT, 'kernel');
const BIN_DIR = path.join(KERNEL_DIR, 'bin');
const MANIFEST_PATH = path.join(BIN_DIR, 'BUILD-MANIFEST.json');

const GATES = [
  'tenet_gate',
  'provenance_validate',
  'rune_authorize',
  'rune_rotation'
];

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

// Locate cobc on PATH ourselves rather than just spawning the name. Two of the
// toolchain facts recorded in briefs/phase-1-handoff.md are solved from the
// compiler's own install prefix, so we need to know where it lives:
//
//   1. Outside an MSYS2 shell, cobc resolves COB_CONFIG_DIR to an MSYS-style
//      path ('/ucrt64/share/gnucobol/config') that Windows cannot open. We
//      derive the Windows-path equivalent from the binary's location and pass
//      it explicitly. Nothing is hardcoded to one machine's install.
//   2. The gates it produces link against libcob and the C runtime DLLs that
//      sit beside cobc.exe. That directory is recorded in the manifest so the
//      conformance runner can put it on PATH before spawning a gate.
function resolveCobc() {
  const exts = process.platform === 'win32'
    ? (process.env.PATHEXT || '.EXE').split(';').map(e => e.toLowerCase())
    : [''];
  const entries = (process.env.PATH || '').split(path.delimiter).filter(Boolean);

  for (const dir of entries) {
    for (const ext of exts) {
      const candidate = path.join(dir, `cobc${ext}`);
      try {
        if (fs.statSync(candidate).isFile()) {
          return { binary: candidate, dir: path.resolve(dir) };
        }
      } catch {
        // not here; keep looking
      }
    }
  }

  throw new Error(
    'cobc not found on PATH. GnuCOBOL for Windows must be installed before the ' +
    'kernel can be rebuilt. Tooling installs are a human step — see ' +
    'briefs/phase-1-handoff.md.'
  );
}

function cobcEnv(cobc) {
  const prefix = path.dirname(cobc.dir); // <prefix>/bin/cobc.exe -> <prefix>
  const env = { ...process.env };

  // Only fill these in if the caller has not already chosen. An explicitly set
  // COB_CONFIG_DIR wins — this is a fallback, not an override.
  if (!env.COB_CONFIG_DIR) {
    env.COB_CONFIG_DIR = path.join(prefix, 'share', 'gnucobol', 'config');
  }
  if (!env.COB_COPY_DIR) {
    env.COB_COPY_DIR = path.join(prefix, 'share', 'gnucobol', 'copy');
  }

  if (!fs.existsSync(path.join(env.COB_CONFIG_DIR, 'default.conf'))) {
    throw new Error(
      `COB_CONFIG_DIR does not contain default.conf: ${env.COB_CONFIG_DIR}\n` +
      'cobc cannot compile without its configuration. Set COB_CONFIG_DIR to the ' +
      'Windows path of the GnuCOBOL config directory and retry.'
    );
  }

  return env;
}

function cobcVersion(cobc, env) {
  const proc = spawnSync(cobc.binary, ['--version'], { encoding: 'utf8', env });

  if (proc.error) throw proc.error;

  if (proc.status !== 0) {
    throw new Error(`cobc --version exited ${proc.status}: ${proc.stderr}`);
  }

  return String(proc.stdout).replace(/\r\n/g, '\n').trim();
}

function compile(gate, cobc, env) {
  const source = path.join(KERNEL_DIR, `${gate}.cbl`);
  const output = path.join(BIN_DIR, `${gate}.exe`);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing source: ${source}`);
  }

  const args = ['-x', '-o', output, source];
  const proc = spawnSync(cobc.binary, args, { encoding: 'utf8', env });

  if (proc.error) throw proc.error;

  if (proc.stdout && proc.stdout.trim()) {
    process.stdout.write(proc.stdout);
  }
  if (proc.stderr && proc.stderr.trim()) {
    process.stderr.write(proc.stderr);
  }

  if (proc.status !== 0) {
    throw new Error(
      `cobc failed on ${gate}.cbl (exit ${proc.status}). The COBOL source is ` +
      'not to be modified to make it compile — a compile fix is a decision, ' +
      'not a chore. Stop and ask.'
    );
  }

  if (!fs.existsSync(output)) {
    throw new Error(`cobc reported success but produced no ${output}`);
  }

  return {
    gate,
    source: path.basename(source),
    sourceSha256: sha256File(source),
    output: path.basename(output),
    outputSha256: sha256File(output)
  };
}

function main() {
  fs.mkdirSync(BIN_DIR, { recursive: true });

  const cobc = resolveCobc();
  const env = cobcEnv(cobc);

  console.log(`cobc:            ${cobc.binary}`);
  console.log(`COB_CONFIG_DIR:  ${env.COB_CONFIG_DIR}`);
  console.log(`COB_COPY_DIR:    ${env.COB_COPY_DIR}`);
  console.log('');

  const version = cobcVersion(cobc, env);
  console.log('cobc --version:');
  console.log(version);
  console.log('');

  const gates = [];
  for (const gate of GATES) {
    console.log(`building ${gate} ...`);
    const record = compile(gate, cobc, env);
    gates.push(record);
    console.log(`  source ${record.source}  sha256 ${record.sourceSha256}`);
    console.log(`  output ${record.output}  sha256 ${record.outputSha256}`);
  }

  const manifest = {
    schema: 'ag3nt24/kernel-build-manifest/1',
    compiler: {
      command: 'cobc -x -o kernel/bin/<name>.exe kernel/<name>.cbl',
      binary: cobc.binary,
      version,
      configDir: env.COB_CONFIG_DIR,
      copyDir: env.COB_COPY_DIR
    },
    // Directory holding libcob and the C runtime DLLs the built gates link
    // against. Windows resolves those from PATH, not from the exe's own
    // directory, so the conformance runner puts this on PATH before spawning a
    // gate. Without it a gate fails to START, which would otherwise surface as
    // a changed verdict rather than as the missing-runtime error it is.
    runtimeDir: cobc.dir,
    platform: {
      os: process.platform,
      arch: process.arch,
      node: process.version
    },
    gates
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log('');
  console.log(`wrote ${path.relative(REPO_ROOT, MANIFEST_PATH)}`);
  console.log(`${gates.length}/${GATES.length} gates built`);
}

try {
  main();
} catch (err) {
  console.error('');
  console.error(`BUILD FAILED: ${err.message}`);
  process.exit(1);
}
