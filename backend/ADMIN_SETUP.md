# Reelix administrator setup

The admin API is protected by a database role check. A normal account cannot grant itself administrator permissions through the app.

## Promote the owner account

1. Register your own account in Reelix first.
2. Open the Neon SQL Editor for the project's database.
3. Run this statement, replacing the email with the exact email used for your account:

```sql
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "email" = 'YOUR_ACCOUNT_EMAIL';
```

4. Sign out and sign back in, then open Settings → Admin panel.

## Admin capabilities

- View moderation queue and basic counters.
- Feature a post in the recommendation ranking.
- Hide or restore a post.
- Permanently delete a post.
- Grant or revoke the verified badge.
- Add licensed audio tracks to the sound library and hide/unhide them.

Only upload audio that Reelix has permission to distribute and use. Do not add commercial songs without the appropriate rights.

## Important

Admin access is checked against the database on each request. Do not make the role editable in public profile settings. Keep database credentials private.
