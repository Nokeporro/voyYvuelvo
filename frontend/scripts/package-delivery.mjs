import { readdir, mkdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
// Solo empaqueta archivos del proyecto. Nunca incluye dependencias ni secretos de entorno.
const root = resolve('.');
const excluded = new Set(['node_modules', '.git', 'dist', 'coverage', 'tmp', 'entrega', '.codex', '.agents']);
const paths = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name === '.env' || entry.name.endsWith('.local')) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile()) paths.push(relative(root, path).split(sep).join('/'));
  }
}
await walk(root);
await mkdir('entrega', { recursive: true });
// ZipArchive conserva la estructura relativa de cada entrada en Windows.
const script = "$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.IO.Compression; Add-Type -AssemblyName System.IO.Compression.FileSystem; $items = Get-Content -LiteralPath 'entrega/files.json' -Raw | ConvertFrom-Json; $stream = [System.IO.File]::Open('entrega/Voy-y-Vuelvo-EP2.zip', [System.IO.FileMode]::Create); $zip = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create); try { foreach ($item in $items) { [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, [System.IO.Path]::GetFullPath($item), $item) | Out-Null } } finally { $zip.Dispose(); $stream.Dispose() }";
const { writeFile } = await import('node:fs/promises');
await writeFile('entrega/files.json', JSON.stringify(paths));
execFileSync('powershell.exe', ['-NoProfile', '-Command', script], { stdio: 'inherit' });
console.log('Entrega generada: entrega/Voy-y-Vuelvo-EP2.zip');
