# Reelix API

NestJS API service for Reelix. This is an initial server foundation, not a production-ready backend yet.

## Security
- Never commit `.env` or real credentials.
- Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, and Cloudinary credentials in the hosting provider's private environment settings.
- The Cloudinary API secret stays on the server. The client receives only a short-lived upload signature.
- Before public launch, protect `POST /api/media/signature` with authentication, add per-user rate limits and upload limits, and verify ownership of uploaded assets.

## Current endpoints
- `GET /api/health`
- `POST /api/media/signature` (development foundation; authentication guard is not wired yet)

## Next implementation steps
1. PostgreSQL schema and migrations.
2. Registration/login with password hashing and access/refresh token rotation.
3. Auth guard and user-scoped upload signing.
4. Posts, follows, likes, comments, messaging, moderation and notifications.
5. Deployment and secret configuration.

Copy `.env.example` to `.env` locally and fill it only on a trusted machine or configure values in the hosting provider. Never put real values in GitHub.
