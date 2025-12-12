# Environment Variables Configuration for Migration

## Add these variables to your .env file:

```env
# PostgreSQL Database (Neon)
DATABASE_URL="postgresql://neondb_owner:npg_rp7LB2dCZvNS@ep-dawn-moon-agzvb48m-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Cloudflare R2 Storage
R2_ACCOUNT_ID="7f7f591728479f321413f430b84d3af4"
R2_ACCESS_KEY_ID="964da31715Odff1c65d933d44de44a33"
R2_SECRET_ACCESS_KEY="56c16cbe324f178193775ab5f3091caae6917dc777edaea178f0eb6ca13797fa"
R2_BUCKET_NAME="agonybeats-media"
R2_ENDPOINT="https://7f7f591728479f321413f430b84d3af4.r2.cloudflarestorage.com"
```

## Instructions:

1. Open your `.env` file
2. **REPLACE** the old `DATABASE_URL` line with the new PostgreSQL one above
3. **ADD** all the R2 variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, etc.)
4. Keep all your existing variables (NEXTAUTH_SECRET, EMAIL_PASSWORD, PAYPAL_CLIENT_ID, etc.)

## What changed:
- ❌ OLD: `DATABASE_URL="file:./dev.db"` (SQLite)
- ✅ NEW: `DATABASE_URL="postgresql://..."` (PostgreSQL)
- ✅ NEW: R2 configuration for cloud storage
