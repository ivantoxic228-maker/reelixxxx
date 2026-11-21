# Reelix

Original short-video social app for Android and iOS.

## Stack
- React Native + TypeScript
- Expo SDK 54
- Expo Router

## Run
1. Install dependencies with `npm install`.
2. Start with `npx expo start`.
3. Scan the QR code with Expo Go during early development.

## Current status
This is the initial mobile application foundation and navigation UI. Authentication, persistent profiles, video upload/streaming, comments, messaging, notifications and recommendations are not connected yet. These require a real backend and media storage.

## Product principles
- Light-first interface, white surfaces and black typography.
- Restrained violet-to-blue accents.
- Crisp geometry and minimal iconography.
- Original Reelix identity.
- No fake users, likes, messages or upload success states.

## Planned architecture
- Mobile: Expo / React Native / TypeScript.
- API: Node.js + NestJS.
- Data: PostgreSQL.
- Media: S3-compatible object storage and video processing.
- Realtime: WebSocket for messaging.

Provider selection must account for availability, pricing and access from target regions.