# Health Module

## Overview

The Health module provides health check endpoints for the application. Includes a simple health check, a readiness check, and a liveness check.
Checks the database, redis, and memory usage.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Returns the health of the application. |
| `/health/simple` | GET | Returns a simple health check response. |
| `/health/ready` | GET | Returns a readiness check response. |
| `/health/live` | GET | Returns a liveness check response. |
