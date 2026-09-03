# Deploying MediKiosk so no one needs to enter an API key

This makes the app work on any phone, laptop, or browser (Chrome, Safari,
Firefox, Edge) without anyone ever seeing or entering a key.

## How it fits together

```
Patient's phone/laptop (medikiosk.html)
        │  sends {system, messages} — no key attached
        ▼
Your backend (api/chat.js, deployed on Vercel)
        │  attaches your real ANTHROPIC_API_KEY, forwards to Anthropic
        ▼
Anthropic API
```

## Steps (using Vercel — free, no server management)

1. **Get an API key** (skip if you already have one): go to
   console.anthropic.com → Settings → API Keys → Create Key. Copy it —
   you won't be able to see it again after leaving the page.

2. **Create a Vercel account** at vercel.com (free tier is enough).

3. **Put the backend online.** The easiest way:
   - Create a new GitHub repository and upload just the `api/chat.js`
     file into it (keep the `api/` folder name — Vercel uses that folder
     to know it's a serverless function).
   - In Vercel, click "Add New Project" → import that GitHub repo →
     Deploy. Vercel will auto-detect the function, no configuration
     needed.

4. **Add your key as an environment variable** (this is the step that
   keeps it private): in your Vercel project → Settings → Environment
   Variables → add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key you copied in step 1
   Then redeploy the project (Vercel prompts you to after adding a
   variable) so the function can see it.

5. **Copy your live URL.** Vercel gives you something like
   `https://medikiosk-yourname.vercel.app`. Your working endpoint is
   that plus `/api/chat`, e.g.
   `https://medikiosk-yourname.vercel.app/api/chat`.

6. **Point the app at it.** Open `medikiosk.html`, find this line near
   the top of the `<script>`:
   ```js
   const BACKEND_URL = "https://YOUR-PROJECT-NAME.vercel.app/api/chat";
   ```
   Replace it with your real URL from step 5, save the file.

7. **Done.** Re-open `medikiosk.html` on any device/browser — it will
   call your backend, which calls Anthropic with your key behind the
   scenes. No one else ever sees the key, and it works identically on
   phones and browsers other than Chrome.

## Alternatives to Vercel

Render.com, Railway.app, and Netlify Functions all work the same way —
a tiny function holds the key, your static HTML calls it. The
`api/chat.js` code is plain Node and needs only minor tweaks (mainly
the export syntax) to run on any of them.

## About cross-browser voice input

Typing answers now works identically everywhere. The microphone button
uses each browser's built-in speech recognition, which Chrome and
Edge support well, but Safari (iPhone/iPad) and Firefox largely don't —
that's a limitation of those browsers, not this app, and there's no
client-side fix for it. The app already detects this and simply
disables the mic with a message rather than breaking. A future
upgrade path is routing voice through a server-side speech-to-text
service (e.g. Bhashini or Whisper) via the same backend, so recording
works the same everywhere — happy to build that next if useful for
your submission.


## What was fixed in this version

- The frontend and backend now use the same Anthropic Messages API format.
- The frontend reads Anthropic `content[]` responses instead of expecting an OpenAI `choices[]` response.
- Document images are sent as Anthropic base64 image blocks.
- The language selector now translates the visible interface labels and, when AI content already exists, asks the backend to translate the existing conversation/summary too. Future interview questions use the selected language.
- Speech recognition language follows the selected language.
- Added safer HTML escaping for AI/user-generated text and removed dynamic summary text from inline JavaScript.
- Fixed reset behavior so a new patient starts with a clean language/AYUSH/session state.
- Document processing now blocks summary generation until uploads finish.
- Backend now validates the API key and request shape and allows a little more response space for structured JSON.

### Important prototype limitation
The current physician queue still uses browser/local storage, so it is suitable for an SIH prototype/demo but is not a real hospital-grade cross-device record system. The README's original note about needing a real database for cross-device sync still applies.
