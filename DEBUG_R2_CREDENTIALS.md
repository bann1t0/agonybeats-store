# 🔍 Problema Credenziali R2

## Errore

L'upload R2 fallisce con: **"Invalid credential object"**

Questo significa che le credenziali AWS SDK (R2 usa il protocollo S3) non sono valide.

---

## ⚠️ Possibile Causa: Typo nell'Access Key ID

Nell'`R2_ACCESS_KEY_ID` c'è questo:
```
964da31715Odff1c65d933d44de44a33
           ↑
         Lettera O o numero 0?
```

**Domanda**: Quando hai copiato l'Access Key ID da Cloudflare, era:
- `964da31715**O**dff...` (lettera O maiuscola)
- `964da31715**0**dff...` (numero zero)

---

## 🔧 Come Verificare

1. **Vai su Cloudflare Dashboard** → R2 → API Tokens
2. **Trova il token** `R2 Account Token` (o simile)
3. **Clicca per vedere i dettagli** (o ricreane uno se non puoi vedere l'Access Key)
4. **Copia di nuovo** l'Access Key ID con attenzione

---

## Come Rigenerare il Token (se necessario)

Se non riesci a vedere l'Access Key originale:

1. Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. **Elimina** il vecchio token
3. **Crea nuovo** token:
   - Permissions: **Lettura e scrittura di oggetti**
   - Applica a: `agonybeats-media`
4. **Copia** Access Key ID e Secret Access Key
5. **Aggiorna** il file `.env`

---

Fammi sapere se riesci a verificare la chiave o se preferisci rigenerare il token!
