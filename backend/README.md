# Reelix API

NestJS + Prisma + PostgreSQL backend foundation.

## Implemented API
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/users/me (Bearer token)
- GET /api/users/search?q=...
- GET /api/users/:username
- POST /api/users/:username/follow (Bearer token)
- GET /api/posts/feed
- POST /api/posts (Bearer token)
- DELETE /api/posts/:id (owner only)
- POST /api/posts/:id/like (Bearer token)
- GET /api/posts/:id/comments
- POST /api/posts/:id/comments (Bearer token)
- GET /api/messages/:username (Bearer token)
- POST /api/messages/:username (Bearer token)
- POST /api/media/signature (Bearer token)

## Setup
1. Use Node.js 20 or newer.
2. In this folder run npm install.
3. Copy .env.example to .env and set private environment values.
4. Run npx prisma generate.
5. Run npx prisma migrate dev --name init.
6. Run npm run start:dev.

Never commit .env or put API secrets in the mobile app. Set DATABASE_URL, JWT_ACCESS_SECRET, and Cloudinary credentials in the hosting provider's private environment settings.

## Security and production status
Passwords are hashed with bcrypt. API endpoints that modify user data require a signed access token. Upload signing is performed on the server and the endpoint requires authentication. Before production launch, add refresh-token rotation, email verification and recovery, rate limiting, upload ownership/limits, private-account follow requests, message privacy controls, moderation/reporting, audit logging, backups, and automated tests. The current follow toggle does not yet implement approval queues for private profiles. Messaging currently uses REST polling; real-time WebSocket delivery is not wired yet.

This is a development foundation and has not yet been deployed or load/security tested.
