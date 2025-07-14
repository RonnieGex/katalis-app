# Katalis App - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Katalis App to DigitalOcean using Docker containers.

## Prerequisites
- DigitalOcean account with App Platform access
- GitHub repository with the Katalis App code
- Docker installed locally (for testing)

## Current Status
✅ **Docker Configuration Updated**: The application is now properly configured for containerized deployment
✅ **Local Testing Complete**: All services run correctly with `docker-compose up`
✅ **Git Repository Ready**: Local commits are ready for GitHub push
✅ **DigitalOcean Cleanup**: Previous katalis-cfo project has been deleted

## Step 1: Push to GitHub

Since the GitHub credentials weren't accessible during setup, you'll need to:

1. **Create a GitHub repository** (if not exists):
   ```bash
   # Go to GitHub.com and create a new repository named "katalis-app"
   ```

2. **Push the code**:
   ```bash
   cd /home/ronniegex/katalis-app
   git remote set-url origin https://github.com/YOUR_USERNAME/katalis-app.git
   git push -u origin feature/ai-agents-diana-multiagent
   ```

## Step 2: DigitalOcean Deployment Options

### Option A: Manual Deployment via DO CLI

1. **Install doctl** (if not already installed):
   ```bash
   sudo snap install doctl
   doctl auth init
   ```

2. **Create app specification file**:
   ```yaml
   # Save as katalis-app-spec.yaml
   spec:
     name: katalis-app
     region: nyc
     services:
       - name: backend
         github:
           repo: YOUR_USERNAME/katalis-app
           branch: feature/ai-agents-diana-multiagent
           deploy_on_push: true
         dockerfile_path: /backend/Dockerfile
         source_dir: /backend
         envs:
           - key: ENVIRONMENT
             value: production
             scope: RUN_AND_BUILD_TIME
           - key: SECRET_KEY
             value: katalis-production-secret-key-2024
             scope: RUN_TIME
           - key: JWT_SECRET_KEY
             value: katalis-jwt-production-secret-2024
             scope: RUN_TIME
           - key: OPENAI_API_KEY
             value: YOUR_OPENAI_API_KEY
             scope: RUN_TIME
           - key: SUPABASE_URL
             value: https://zwrcdbbijugpewjecyhlc.supabase.co
             scope: RUN_TIME
           - key: SUPABASE_ANON_KEY
             value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cmNkYmJqdWdwZXdqZWN5aGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDg1NzEsImV4cCI6MjA2NjI4NDU3MX0.ItnhY3KaFyzAGpx9QWcmJxMLBxXHqmCGZNppDErMQws
             scope: RUN_TIME
           - key: SUPABASE_SERVICE_KEY
             value: YOUR_SUPABASE_SERVICE_KEY
             scope: RUN_TIME
           - key: REDIS_URL
             value: redis://default:AXi-AAIjcDFiOGZlNjNhNTcwYTk0YzQwOTUxNWY4MWJhNzJlNTU3ZHAxMA@viable-mackerel-30910.upstash.io:6379
             scope: RUN_TIME
           - key: REDIS_REST_URL
             value: https://viable-mackerel-30910.upstash.io
             scope: RUN_TIME
           - key: REDIS_REST_TOKEN
             value: AXi-AAIjcDFiOGZlNjNhNTcwYTk0YzQwOTUxNWY4MWJhNzJlNTU3ZHAxMA
             scope: RUN_TIME
         instance_size_slug: apps-s-1vcpu-1gb
         instance_count: 1
         http_port: 8000
         health_check:
           initial_delay_seconds: 60
           period_seconds: 10
           timeout_seconds: 5
           success_threshold: 1
           failure_threshold: 3
           http_path: /health
       - name: frontend
         github:
           repo: YOUR_USERNAME/katalis-app
           branch: feature/ai-agents-diana-multiagent
           deploy_on_push: true
         dockerfile_path: /frontend/Dockerfile
         source_dir: /frontend
         envs:
           - key: VITE_API_URL
             value: https://YOUR_APP_NAME.ondigitalocean.app
             scope: BUILD_TIME
         instance_size_slug: apps-s-1vcpu-0.5gb
         instance_count: 1
         http_port: 80
         health_check:
           initial_delay_seconds: 30
           period_seconds: 10
           timeout_seconds: 5
           success_threshold: 1
           failure_threshold: 3
           http_path: /
     alerts:
       - rule: DEPLOYMENT_FAILED
       - rule: DOMAIN_FAILED
     ingress:
       rules:
         - match:
             path:
               prefix: /api
           component:
             name: backend
         - match:
             path:
               prefix: /
           component:
             name: frontend
   ```

3. **Deploy the app**:
   ```bash
   doctl apps create --spec katalis-app-spec.yaml
   ```

### Option B: Manual Deployment via DigitalOcean Web Console

1. **Go to DigitalOcean App Platform**:
   - Visit: https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Choose GitHub Source**:
   - Select GitHub as source
   - Choose your katalis-app repository
   - Select branch: `feature/ai-agents-diana-multiagent`
   - Enable "Autodeploy"

3. **Configure Backend Service**:
   - Name: `backend`
   - Source Directory: `/backend`
   - Dockerfile Path: `/backend/Dockerfile`
   - HTTP Port: `8000`
   - Health Check Path: `/health`
   - Instance Size: `Basic (1 vCPU, 1GB RAM)`

4. **Configure Frontend Service**:
   - Name: `frontend`
   - Source Directory: `/frontend`
   - Dockerfile Path: `/frontend/Dockerfile`
   - HTTP Port: `80`
   - Health Check Path: `/`
   - Instance Size: `Basic (1 vCPU, 0.5GB RAM)`

5. **Set Environment Variables**:
   - Add all environment variables from the YAML spec above
   - **Important**: Update `VITE_API_URL` to match your app's URL after deployment

6. **Configure Routing**:
   - `/api/*` → backend service
   - `/*` → frontend service

## Step 3: Post-Deployment Configuration

1. **Update Frontend API URL**:
   After deployment, update the `VITE_API_URL` environment variable in the frontend service to point to your actual app URL.

2. **Test the Deployment**:
   ```bash
   # Test backend health
   curl https://YOUR_APP_URL/health
   
   # Test frontend
   curl https://YOUR_APP_URL/
   ```

3. **Monitor Deployment**:
   - Check logs in DigitalOcean dashboard
   - Monitor deployment status
   - Verify all services are running

## Architecture Overview

The deployment consists of:
- **Backend**: FastAPI application with AI agents
- **Frontend**: React/Vite application with TailwindCSS
- **External Services**: 
  - Supabase (Database)
  - Upstash Redis (Caching)
  - OpenAI API (AI functionality)

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Dockerfile paths are correct
   - Verify all dependencies are in requirements.txt/package.json

2. **Health Check Failures**:
   - Ensure `/health` endpoint is accessible
   - Check port configurations

3. **Environment Variables**:
   - Verify all required environment variables are set
   - Check API keys are valid

4. **Service Communication**:
   - Ensure frontend VITE_API_URL points to backend
   - Verify CORS settings in backend

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerting
4. Configure CI/CD pipeline for automatic deployments
5. Set up database backups
6. Configure logging and monitoring

## Support

For issues with:
- **Application**: Check the application logs in DigitalOcean dashboard
- **Docker**: Verify local Docker setup with `docker-compose up`
- **DigitalOcean**: Check DigitalOcean App Platform documentation
- **GitHub**: Ensure repository is accessible and contains all necessary files

---

**Last Updated**: July 14, 2025  
**Status**: Ready for deployment