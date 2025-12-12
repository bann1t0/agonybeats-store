# 🚀 Migration Setup Instructions

## ⚠️ IMPORTANT: Update .env file FIRST

Before running any migrations, you need to update your `.env` file:

1. **Open** `c:\Users\Andrea\Desktop\Agonybeats store\agonybeats-store\.env`

2. **ADD** these new lines (copy-paste all of them):

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

3. **KEEP** all your existing variables (NEXTAUTH_SECRET, EMAIL_PASSWORD, PAYPAL_CLIENT_ID, etc.)

4. **SAVE** the file

---

## 📝 Migration Steps

After updating .env, run these commands IN ORDER:

### Step 1: Generate Prisma Client for PostgreSQL
```bash
npx prisma generate
```

### Step 2: Create PostgreSQL schema
```bash
npx prisma db push
```
This creates all tables in your new PostgreSQL database.

### Step 3: Migrate existing data from SQLite
```bash
node scripts/migrate-database.js
```
This copies all users, beats, soundkits, licenses, etc. from SQLite to PostgreSQL.

### Step 4: Migrate files to Cloudflare R2
```bash
node scripts/migrate-to-r2.js
```
This uploads all files from `public/uploads` to R2 and updates database paths.

---

## ✅ After Migration

1. **Restart the dev server**:
   - Stop the current `npm run dev` (Ctrl+C)
   - Run: `npm run dev`

2. **Test the application**:
   - Open localhost:3000
   - Check if beats are visible
   - Try uploading a new beat
   - Test audio playback
   - Test downloads

3. **Verify R2 public access** (if downloads don't work):
   - Go to Cloudflare dashboard
   - Open your `agonybeats-media` bucket
   - Settings → "URL pubblico di sviluppo" → Click "Abilita" if not already enabled

---

## 🔄 Rollback (if needed)

If something goes wrong:

1. **Restore old .env**:
   ```env
   DATABASE_URL="file:./dev.db"
   ```
   (Remove all R2 variables)

2. **Restore Prisma schema**:
   ```bash
   git checkout prisma/schema.prisma
   ```

3. **Restart**: `npm run dev`

Your original SQLite database (`dev.db`) is not deleted, so all data is safe!
