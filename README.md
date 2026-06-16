# Visor DOM Context Compiler

Visor is a Chrome MV3 extension that compiles the current webpage into structured, privacy-aware context for AI agents.

## Features

- DOM snapshot extraction with headings, text, links, actions, forms, tables, media, and selector traceability
- Semantic regions for Wikipedia-style article pages, including lead, TOC, infobox, sections, references, and media
- Agent-ready JSON, Markdown, and delimited prompt-block exports
- Export buttons for ChatGPT, Grok, Gemini, and Claude with automatic prompt injection
- Always-on active-tab monitoring that refreshes context while you browse
- Floating in-page Visor logo widget with circular LLM export buttons
- Agent Mode, RAG chunks, detailed mode, compact mode, and debug mode
- Local privacy redaction and blocked-domain settings
- Clean black and green extension UI

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

For extension development, run the watch build once and reload the extension after source changes:

```bash
npm run dev:extension
```

## Load In Chrome

For normal use, no npm command is required. The repository includes a ready-to-load `dist` build.

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `dist` folder.

After the extension is loaded, Visor stays active while browsing and keeps the current tab context updated automatically. A circular Visor logo widget floats on supported pages; click it to choose an LLM and dump the current page context directly. Use the popup when you want to inspect, copy, export, refresh manually, or relaunch the widget.

## Repository Notes

`node_modules/` is intentionally ignored. `dist/` is committed so non-developer users can load the extension directly from GitHub.
