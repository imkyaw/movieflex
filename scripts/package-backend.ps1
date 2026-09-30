$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$repo = Split-Path -Parent $PSScriptRoot
$output = Join-Path $repo 'build'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$zipPath = Join-Path $output ("cloudflex-backend-{0}.zip" -f [Guid]::NewGuid().ToString('N'))

# Explicit allowlist: never archive the repo root or copy .env/node_modules.
$entries = @{}
foreach ($path in @('package.json', 'package-lock.json', 'server/package.json', 'server/tsconfig.json', 'client/package.json')) {
    $entries[$path] = Join-Path $repo $path
}
$entries['Procfile'] = Join-Path $repo 'server/Procfile'
foreach ($mapping in @(
    @('server/src', 'server/src'),
    @('server/prisma/postgres', 'server/prisma/postgres'),
    @('server/dist', 'server/dist'),
    @('server/.ebextensions', '.ebextensions'),
    @('server/.platform', '.platform')
)) {
    $source = Join-Path $repo $mapping[0]
    foreach ($file in Get-ChildItem -LiteralPath $source -Recurse -File -Force) {
        $relative = $file.FullName.Substring($source.Length).TrimStart('\', '/').Replace('\', '/')
        $entries["$($mapping[1])/$relative"] = $file.FullName
    }
}
foreach ($name in $entries.Keys) {
    if ($name -match '(^|/)(\.env[^/]*|node_modules|\.git)(/|$)|\.(pem|key|db)$') {
        throw "Forbidden bundle entry: $name"
    }
    if (-not (Test-Path -LiteralPath $entries[$name] -PathType Leaf)) { throw "Missing source: $name" }
}
foreach ($required in @(
    '.platform/hooks/prebuild/01_build.sh',
    '.platform/confighooks/prebuild/01_build.sh',
    '.platform/hooks/predeploy/01_verify_build.sh',
    '.platform/confighooks/predeploy/01_verify_build.sh'
)) {
    if (-not $entries.ContainsKey($required)) { throw "Missing deployment hook: $required" }
}
foreach ($required in @('server/dist/server.js')) {
    if (-not $entries.ContainsKey($required)) { throw "Missing $required. Run: npm run build --workspace=server" }
}
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($name in ($entries.Keys | Sort-Object)) {
        if ($name.EndsWith('.sh') -or $name -eq 'Procfile') {
            $entry = $archive.CreateEntry($name)
            $writer = [System.IO.StreamWriter]::new($entry.Open(), [System.Text.UTF8Encoding]::new($false))
            try { $writer.Write([System.IO.File]::ReadAllText($entries[$name]).Replace("`r`n", "`n")) }
            finally { $writer.Dispose() }
        } else {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $entries[$name], $name) | Out-Null
        }
    }
} finally { $archive.Dispose() }
Write-Output "Created $zipPath ($($entries.Count) allowlisted files)."
Write-Output 'Packaging only: validate PostgreSQL migrations and builds before uploading.'
