# Docker Setup for Abyrgi.is

This project includes Docker configuration for easy deployment and development.

## Quick Start

### Option 1: Using the Helper Script (Recommended)

```powershell
# Development mode
.\docker-helper.ps1 dev

# Production mode
.\docker-helper.ps1 prod

# View logs
.\docker-helper.ps1 logs

# Stop containers
.\docker-helper.ps1 down

# Clean up everything
.\docker-helper.ps1 clean
```

### Option 2: Manual Docker Commands

#### Development

```powershell
# Set environment variables
$env:NEXT_PUBLIC_SUPABASE_URL="https://supabase.afd.is/"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Build and run
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Production

```powershell
# Set environment variables
$env:NEXT_PUBLIC_SUPABASE_URL="https://supabase.afd.is/"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Build and run
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## Files Overview

- **`Dockerfile`** - Multi-stage build configuration
- **`docker-compose.yml`** - Development environment setup
- **`docker-compose.prod.yml`** - Production environment setup
- **`.dockerignore`** - Files excluded from Docker build
- **`docker-helper.ps1`** - PowerShell helper script for common tasks

## Environment Variables

Required environment variables (defined in `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Port Mapping

- The application runs on port **3000** inside the container
- Mapped to port **3000** on your host machine
- Access at: http://localhost:3000

## Docker Helper Commands

```powershell
.\docker-helper.ps1 dev       # Build and run development
.\docker-helper.ps1 prod      # Build and run production
.\docker-helper.ps1 build     # Build image only
.\docker-helper.ps1 up        # Start containers
.\docker-helper.ps1 down      # Stop containers
.\docker-helper.ps1 logs      # Follow logs
.\docker-helper.ps1 restart   # Restart containers
.\docker-helper.ps1 clean     # Clean up all resources
```

## Troubleshooting

### Build fails with environment variable errors
Make sure to set the environment variables before building:
```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://supabase.afd.is/"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key-here"
```

### Container won't start
Check logs:
```powershell
docker logs abyrgi-dev
# or
docker logs abyrgi-prod
```

### Port already in use
Stop any other services running on port 3000, or change the port mapping in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

## Production Deployment

For production deployment:

1. Use the production compose file
2. Set appropriate environment variables
3. Consider using Docker Swarm or Kubernetes for orchestration
4. Set up proper monitoring and logging
5. Use a reverse proxy (nginx) for SSL/TLS termination

## Notes

- The Dockerfile uses Node.js 20 Alpine for a smaller image size
- Multi-stage build reduces final image size
- Runs as non-root user (nextjs) for security
- Includes health checks in production setup
