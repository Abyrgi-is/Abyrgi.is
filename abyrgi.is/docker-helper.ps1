# Docker Build and Run Helper Script for Abyrgi.is
# Usage: .\docker-helper.ps1 [dev|prod|build|up|down|logs|clean]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'prod', 'build', 'up', 'down', 'logs', 'restart', 'clean')]
    [string]$Command = 'dev'
)

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
    Write-Host "✓ Loaded environment variables from .env.local" -ForegroundColor Green
}

switch ($Command) {
    'dev' {
        Write-Host "Building and starting development environment..." -ForegroundColor Cyan
        docker-compose build
        docker-compose up -d
        Write-Host "`n✓ Development server running at http://localhost:3000" -ForegroundColor Green
        docker-compose logs -f
    }
    'prod' {
        Write-Host "Building and starting production environment..." -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml build
        docker-compose -f docker-compose.prod.yml up -d
        Write-Host "`n✓ Production server running at http://localhost:3000" -ForegroundColor Green
        docker-compose -f docker-compose.prod.yml logs -f
    }
    'build' {
        Write-Host "Building Docker image..." -ForegroundColor Cyan
        docker-compose build
        Write-Host "`n✓ Build complete" -ForegroundColor Green
    }
    'up' {
        Write-Host "Starting containers..." -ForegroundColor Cyan
        docker-compose up -d
        Write-Host "`n✓ Containers started" -ForegroundColor Green
    }
    'down' {
        Write-Host "Stopping containers..." -ForegroundColor Cyan
        docker-compose down
        docker-compose -f docker-compose.prod.yml down
        Write-Host "`n✓ Containers stopped" -ForegroundColor Green
    }
    'logs' {
        docker-compose logs -f
    }
    'restart' {
        Write-Host "Restarting containers..." -ForegroundColor Cyan
        docker-compose restart
        Write-Host "`n✓ Containers restarted" -ForegroundColor Green
    }
    'clean' {
        Write-Host "Cleaning up Docker resources..." -ForegroundColor Yellow
        docker-compose down -v
        docker-compose -f docker-compose.prod.yml down -v
        docker system prune -f
        Write-Host "`n✓ Cleanup complete" -ForegroundColor Green
    }
}
