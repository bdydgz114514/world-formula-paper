# render-png.ps1 —— 用 Edge 无头把 _render/page-NN.html 渲染成 1920x1080 PNG
# 命令形式与第二期一致：--headless=new + --force-device-scale-factor=2 + --window-size=960,540 + 绝对路径
$ErrorActionPreference = "Continue"   # Edge 会把 QQBrowser 之类的无害警告写到 stderr；Stop 会让脚本在第一页就中断
$Edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$Here = $PSScriptRoot
$n = 0
Get-ChildItem (Join-Path $Here "_render\page-*.html") | Sort-Object Name | ForEach-Object {
  $name = $_.BaseName
  $out  = Join-Path $Here ("png\" + $name + ".png")
  $url  = "file:///" + ($_.FullName -replace '\\','/')
  if (Test-Path $out) { Remove-Item $out -Force }
  & $Edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=960,540 --screenshot="$out" "$url" 2>$null | Out-Null
  if (Test-Path $out) { $n++ } else { Write-Host "FAILED $name" }
}
Write-Host "rendered $n pages"
