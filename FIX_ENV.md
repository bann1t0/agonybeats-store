# ⚠️ ERRORE NEL FILE .env - FIX IMMEDIATO RICHIESTO

## Problema

Il tuo file `.env` ha **DUE** variabili `DATABASE_URL`:
1. `DATABASE_URL="file:./dev.db"` ← VECCHIA (SQLite)
2. `DATABASE_URL="postgresql://..."` ← NUOVA (PostgreSQL)

Prisma non può funzionare con due valori per la stessa variabile!

---

## Soluzione (2 minuti)

### 1. Apri il file `.env`

### 2. Trova questa riga e **CANCELLALA**:
```env
DATABASE_URL="file:./dev.db"
```

### 3. Assicurati di avere SOLO questa riga per DATABASE_URL:
```env
DATABASE_URL="postgresql://neondb_owner:npg_rp7LB2dCZvNS@ep-dawn-moon-agzvb48m-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 4. Salva il file

---

## Dopo il fix

Quando hai fatto, dimmi "fatto" e riprovo i comandi di migrazione!

---

## Nota

Il file .env dovrebbe avere questa struttura:

```env
# PostgreSQL Database (SOLO QUESTA DATABASE_URL!)
DATABASE_URL="postgresql://neondb_owner:npg_rp7LB2dCZvNS@ep-dawn-moon-agzvb48m-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Cloudflare R2
R2_ACCOUNT_ID="7f7f591728479f321413f430b84d3af4"
R2_ACCESS_KEY_ID="964da31715Odff1c65d933d44de44a33"
R2_SECRET_ACCESS_KEY="56c16cbe324f178193775ab5f3091caae6917dc777edaea178f0eb6ca13797fa"
R2_BUCKET_NAME="agonybeats-media"
R2_ENDPOINT="https://7f7f591728479f321413f430b84d3af4.r2.cloudflarestorage.com"

# Le tue altre variabili (NextAuth, Email, PayPal, etc.)
NEXTAUTH_SECRET="..."
EMAIL_PASSWORD="..."
# etc...
```
