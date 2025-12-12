# Deployment Guide - Agonybeats Store

## Piattaforma Consigliata: Vercel

**Perché Vercel?**
- Creato dai creatori di Next.js (integrazione perfetta)
- Deploy automatico da GitHub
- SSL gratuito e automatico
- Edge Network globale (sito velocissimo)
- Piano gratuito generoso

---

## Passaggi per il Deploy

### 1. Push del codice su GitHub

```bash
# Inizializza git (se non già fatto)
git init
git add .
git commit -m "Ready for production"

# Crea repo su GitHub e collegalo
git remote add origin https://github.com/TUO_USERNAME/agonybeats-store.git
git push -u origin main
```

### 2. Collega Vercel a GitHub

1. Vai su [vercel.com](https://vercel.com) e registrati con GitHub
2. Clicca "Add New Project"
3. Seleziona il repository `agonybeats-store`
4. Vercel rileverà automaticamente che è un progetto Next.js

### 3. Configura le Variabili d'Ambiente

In Vercel, vai su **Settings → Environment Variables** e aggiungi:

| Variabile | Valore |
|-----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://agonybeats.com` |
| `DATABASE_URL` | `postgresql://...` (da Neon) |
| `NEXTAUTH_URL` | `https://agonybeats.com` |
| `NEXTAUTH_SECRET` | (genera con `openssl rand -base64 32`) |
| `PAYPAL_CLIENT_ID` | (credenziali LIVE) |
| `PAYPAL_CLIENT_SECRET` | (credenziali LIVE) |
| `R2_ACCESS_KEY_ID` | (da Cloudflare) |
| `R2_SECRET_ACCESS_KEY` | (da Cloudflare) |
| `R2_ENDPOINT` | (da Cloudflare) |
| `R2_BUCKET_NAME` | (nome del bucket) |
| `R2_PUBLIC_URL` | (URL pubblico R2) |
| `EMAIL_SERVER_HOST` | (SMTP host) |
| `EMAIL_SERVER_PORT` | (SMTP port) |
| `EMAIL_SERVER_USER` | (SMTP user) |
| `EMAIL_SERVER_PASSWORD` | (SMTP password) |
| `EMAIL_FROM` | `noreply@agonybeats.com` |

### 4. Configura il Dominio

1. In Vercel → Settings → Domains
2. Aggiungi `agonybeats.com`
3. Vercel ti darà i record DNS da configurare
4. Vai al tuo registrar di dominio e aggiungi i record

### 5. Deploy!

Clicca "Deploy" e attendi qualche minuto.

---

## Checklist Pre-Deploy

- [ ] Tutte le variabili d'ambiente inserite in Vercel
- [ ] Dominio configurato nel registrar
- [ ] PayPal in modalità LIVE (non sandbox)
- [ ] Database Neon pronto
- [ ] CORS configurato su R2 per `agonybeats.com`

---

## Dopo il Deploy

1. Testa il checkout con un acquisto reale (puoi rimborsare dopo)
2. Verifica che le email funzionino
3. Controlla che i beat si carichino correttamente
4. Testa login/registrazione
