# 🔧 FIX: Configurare CORS su R2

## Problema

I file sono caricati correttamente su R2 ✅  
Gli URL sono corretti ✅  
**MA** il browser non può caricarli per via di **CORS (Cross-Origin Resource Sharing)** ❌

## Soluzione: Configurare CORS su Cloudflare R2

### Passo 1: Vai alle Impostazioni del Bucket

1. **Cloudflare Dashboard** → **R2**
2. **Clicca sul bucket** `agonybeats-media`
3. **Tab "Impostazioni"** (Settings)

### Passo 2: Trova la Sezione CORS

Scorri fino a trovare **"Criterio CORS"** o **"CORS Policy"**

### Passo 3: Aggiungi Regola CORS

Clicca **"Aggiungi regola CORS"** o **"Add CORS rule"**

Inserisci questa configurazione:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

**Oppure** se c'è un'interfaccia form:
- **Allowed Origins**: `*` (asterisco = tutti i domini)
- **Allowed Methods**: `GET`, `HEAD`
- **Allowed Headers**: `*`
- **Max Age**: `3600`

### Passo 4: Salva

Clicca **"Salva"** o **"Save"**

---

## Configurazione Più Sicura (Opzionale)

Per production, invece di `*` usa il dominio specifico:

```json
{
  "AllowedOrigins": ["http://localhost:3000", "https://tuodominio.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"]
}
```

---

## Test

Dopo aver configurato CORS:
1. **Ricarica** la pagina del sito (F5)
2. Verifica che:
   - ✅ Le immagini si vedono
   - ✅ L'audio si riproduce
   - ✅ I download funzionano

---

## Note

CORS è necessario perché:
- Il tuo sito è su `http://localhost:3000`
- I file sono su `https://pub-xxx.r2.dev`
- Il browser blocca richieste cross-origin per sicurezza
- CORS dice al browser: "è ok, puoi caricare questi file"

---

Quando hai configurato CORS, dimmi "fatto" e verifichiamo!
