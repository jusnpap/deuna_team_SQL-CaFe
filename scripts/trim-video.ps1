# Recorta el webm más reciente a 40 segundos y exporta mp4 si ffmpeg está disponible
param(
  [string]$InputDir = (Join-Path $PSScriptRoot "..\demos"),
  [int]$DurationSec = 40
)

$webm = Get-ChildItem -Path $InputDir -Filter "*.webm" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $webm) {
  Write-Error "No se encontró .webm en $InputDir"
  exit 1
}

$outMp4 = Join-Path $InputDir "demo_deuna_fins_40s.mp4"
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue

if ($ffmpeg) {
  & ffmpeg -y -i $webm.FullName -t $DurationSec -c:v libx264 -pix_fmt yuv420p -movflags +faststart $outMp4
  Write-Host "OK: $outMp4"
} else {
  $outWebm = Join-Path $InputDir "demo_deuna_fins_40s.webm"
  Copy-Item $webm.FullName $outWebm -Force
  Write-Host "ffmpeg no instalado. Copiado: $outWebm (recorta manualmente a ${DurationSec}s)"
}
