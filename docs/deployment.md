# Deployment Guide

This guide provides instructions for deploying the Open Food Facts Explorer to a self-hosted or official Open Food Facts infrastructure environment.

## Prerequisites

- **Docker & Docker Compose**: The recommended way to deploy the application.
- **Node.js 18+ & pnpm**: Required if you plan to build and run the application without Docker.

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Required Variables

- `ORIGIN`: The public-facing URL of your application (e.g., `https://world.openfoodfacts.org`). This is **critical** for SvelteKit's CSRF validation on POST requests (edits, logins).
- `WORKERS`: The number of Node.js worker processes to spawn. Recommended value is `4` or based on your server's CPU cores.

### Service Base URLs (PUBLIC\_\*)

Most of these are pre-configured in `.env.example` to point to the production OFF infrastructure. You may need to change them if you are using a testing or local environment.

- `PUBLIC_FOLKSONOMY_API_URL`: URL for the Folksonomy API.
- `PUBLIC_OFF_BASE_URL`: Base URL for the Open Food Facts website.
- `PUBLIC_SEARCH_BASE_URL`: Base URL for the Product Search API.
- `PUBLIC_AUTH_BASE_URL`: URL for the authentication service (Keycloak).
- `PUBLIC_PRICES_API_URL`: URL for the Open Prices API.
- `PUBLIC_ROBOTOFF_URL`: URL for the Robotoff analysis service.
- `PUBLIC_IMAGES_URL`: URL for the product images server.
- `PUBLIC_NUTRIPATROL_URL`: URL for the Nutri-Patrol service.

## Deploying with Docker Compose

The simplest way to deploy is using the provided `compose.yml` file.

1.  **Configure `.env`**: Ensure all required variables are set.
2.  **Start the container**:
    ```bash
    docker compose up -d
    ```

The application will be available on the port specified in the `compose.yml` (defaulting to 3000).

### Health Checks

The application exposes a health check endpoint:

- `GET /health`

This can be used by load balancers or orchestrators (like Kubernetes or Docker Swarm) to verify the application's status.

## Reverse Proxy (Nginx)

When running behind Nginx, you must ensure that headers are correctly forwarded so SvelteKit can handle CSRF and URLs properly.

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name world.openfoodfacts.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SvelteKit requires the Host header to match the ORIGIN variable
        # for CSRF protection to work correctly.
    }
}
```

## Adapter Configuration

- **Node Adapter**: Used for self-hosted and official infrastructure deployments. It provides a standalone Node.js server.
- **Vercel Adapter**: Used automatically for PR previews and Vercel deployments.
