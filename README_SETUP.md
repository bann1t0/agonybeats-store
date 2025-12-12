# AgonyBeats Store - Setup Guide

Ciao Andrea! Ecco come configurare le chiavi per far funzionare tutto.

## 1. File .env
Ho creato per te il file `.env` nella cartella principale. Aprilo con un editor di testo (o VS Code).
Dovrai sostituire i valori `INSERISCI_QUI...` con i dati reali.

## 2. Google Login (Client ID & Secret)
Per far funzionare il tasto "Google Login":

1.  Vai su [Google Cloud Console](https://console.cloud.google.com/).
2.  Crea un nuovo progetto (chiamalo es. "AgonyBeats Store").
3.  Vai nel menu **APIs & Services** > **Credentials**.
4.  Clicca su **+ CREATE CREDENTIALS** > **OAuth client ID**.
5.  Se ti chiede di configurare la "Consent Screen":
    *   User Type: **External**.
    *   App Name: "AgonyBeats".
    *   Email: la tua mail.
    *   Salva e continua.
6.  Tornato a "Create OAuth client ID":
    *   Application type: **Web application**.
    *   **Authorized JavaScript origins**: `http://localhost:3000`
    *   **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7.  Clicca su **CREATE**.
8.  Copia il **Client ID** e il **Client Secret**.
9.  Incollali nel file `.env` al posto delle scritte segnaposto.

## 3. Email (App Password)
Per ricevere le mail quando qualcuno scarica un beat:

1.  Vai sul tuo Account Google: [Security Settings](https://myaccount.google.com/security).
2.  Attiva la **2-Step Verification** (se non è già attiva).
3.  Cerca "App passwords" nella barra di ricerca delle impostazioni.
4.  Crea una nuova password:
    *   App name: "AgonyBeats Website".
5.  Google ti darà una password di 16 lettere (es. `abcd efgh ijkl mnop`).
6.  Copia questa password e incollala in `.env` alla voce `EMAIL_PASSWORD` (senza spazi se possibile, o tra virgolette).

## 4. Riavvia
Una volta salvato il file `.env`:
1.  Torna nel terminale dove gira il sito.
2.  Premi `Ctrl + C` per fermarlo.
3.  Scrivi `npm run dev` per riavviarlo.

Ora il Login Google e le email funzioneranno! 🚀
