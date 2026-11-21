# Deploy Reelix API with Render + Neon (Android-only)

## 1. Create the Neon database
1. Open https://console.neon.tech/ in Chrome on Android and sign in.
2. Create a project named `reelix`.
3. Choose a region close to the Render service (Frankfurt is selected in render.yaml where available).
4. Open **Connect** and select the project branch, database, and role.
5. Copy the connection string with **Connection pooling ON**. This is the runtime URL for `DATABASE_URL` (hostname contains `-pooler`).
6. Copy it again with **Connection pooling OFF**. This is the direct URL for `DIRECT_URL` (hostname does not contain `-pooler`).
7. Keep both strings private. Do not paste them into GitHub files, chat, or the mobile app.

## 2. Create the Render service from GitHub
1. Open https://dashboard.render.com/ and sign in.
2. Choose **New +** -> **Blueprint**.
3. Connect the GitHub repository `ivantoxic228-maker/reelixxxx`.
4. Select branch `main`. Render should detect the root `render.yaml`.
5. Review the service `reelix-api` and approve creation.
6. In the service environment settings, add the two Neon values:
   - `DATABASE_URL` = pooled Neon connection string.
   - `DIRECT_URL` = direct Neon connection string.
7. Save changes and wait for the first deploy. The configured start command runs `prisma migrate deploy` before starting NestJS.

## 3. Check the API
Open `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.
Expected response:
`{"status":"ok","service":"reelix-api"}`

The service URL is shown in the Render dashboard. Replace the example hostname with that exact URL.

## 4. Important environment variables
Render Blueprint creates `JWT_ACCESS_SECRET` automatically. Cloudinary variables are optional until media uploads are configured:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Never add these secrets to repository files. Enter them only in Render's Environment settings.

## 5. Before connecting the app
The current API is a development foundation, not production-ready. It still needs automated build/runtime tests, stricter authorization for private profiles and messages, upload ownership and file constraints, rate limits, password recovery/email verification, moderation, and backups. The initial CORS setting is permissive for setup; restrict it to the exact frontend origins before hosting a browser frontend. Native mobile requests do not rely on browser CORS.
