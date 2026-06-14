# Visor DOM Context Compiler

Visor is a Chrome MV3 extension that compiles the current webpage into structured, privacy-aware context for AI agents.

## Features

- DOM snapshot extraction with headings, text, links, actions, forms, tables, media, and selector traceability
- Semantic regions for Wikipedia-style article pages, including lead, TOC, infobox, sections, references, and media
- Agent-ready JSON, Markdown, and delimited prompt-block exports
- Export buttons for ChatGPT, Grok, Gemini, and Claude with automatic prompt injection
- Agent Mode, RAG chunks, detailed mode, compact mode, and debug mode
- Local privacy redaction and blocked-domain settings
- Google OAuth sign-in through Chrome Identity
- Spotify-inspired black and green extension UI

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Load In Chrome

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the `dist` folder.

## Google OAuth Setup

The manifest contains a placeholder OAuth client ID:

```json
"client_id": "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com"
```

Replace it with a Chrome Extension OAuth client ID from Google Cloud before testing Google sign-in.

## Repository Notes

`dist/` and `node_modules/` are intentionally ignored. Rebuild the extension locally with `npm run build`.
