<#
serve-lab.ps1
Simple static server wrapper for Windows PowerShell.
Tries Python first (python -m http.server), falls back to Node if available.
Usage: .\serve-lab.ps1 -Port 8000
#>
param(
    [int]$Port = 8000
)
Write-Host "Serving LAB on http://localhost:$Port"

# Try Python (python or python3)
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { $py = Get-Command python3 -ErrorAction SilentlyContinue }
if ($py) {
    Write-Host "Using Python ($($py.Path))"
    Start-Process -NoNewWindow -FilePath $py.Path -ArgumentList "-m","http.server",$Port -WorkingDirectory (Get-Location)
    Write-Host "Server started (python) on http://localhost:$Port . Use task manager to stop the background process or run 'Stop-Process -Name python' if needed."
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:$Port/lab.html"
    return
}

# Try Node fallback
$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "Using Node ($($node.Path))"
    $code = @"
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = parseInt(process.argv[2]||8000);
const root = process.cwd();
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};
const server = http.createServer((req,res)=>{
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/lab.html';
    let p = path.join(root, reqPath);
    fs.stat(p, (err, st) => {
      if (err) { res.statusCode = 404; res.end('Not found'); return; }
      if (st.isDirectory()) p = path.join(p, 'index.html');
      const ext = path.extname(p).toLowerCase();
      const ct = mime[ext] || 'application/octet-stream';
      res.statusCode = 200; res.setHeader('Content-Type', ct);
      fs.createReadStream(p).on('error', ()=>{ res.statusCode=404; res.end('Not found'); }).pipe(res);
    });
  } catch(e){ res.statusCode=500; res.end('Server error'); }
});
server.listen(port, ()=>console.log('Listening on http://localhost:'+port));
"@
    $tmp = [IO.Path]::Combine([IO.Path]::GetTempPath(), ([System.Guid]::NewGuid().ToString() + '.js'))
    $code | Out-File -FilePath $tmp -Encoding utf8
    Start-Process -NoNewWindow -FilePath $node.Path -ArgumentList $tmp, $Port -WorkingDirectory (Get-Location)
    Write-Host "Server started (node) on http://localhost:$Port . Use task manager to stop the background node process if needed."
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:$Port/lab.html"
    return
}

Write-Host "Python or Node not found. Install Python or Node, or run a static server manually. Example (PowerShell):" -ForegroundColor Yellow
Write-Host "  python -m http.server 8000" -ForegroundColor Cyan
Write-Host "Or using Node (if installed):" -ForegroundColor Cyan
Write-Host @'
  node -e "require('http').createServer((req,res)=>{/* ... */}).listen(8000)"
'@ -ForegroundColor Cyan
