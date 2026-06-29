![Visor DOM-to-Agent Context Compiler](docs/assets/visor.banner.png)

# Visor DOM Context Compiler

Visor is a Chrome MV3 extension that compiles the current webpage into structured, privacy-aware context for AI agents

## Problem Statement

AI agents usually see web pages as copied text, URLs, screenshots, or brittle selectors. That loses the real page structure: headings, forms, actions, tables, media, semantic regions, and the relationships between visible text and interactive elements.

Visor turns a live browser tab into an agent-ready context package. It keeps useful DOM structure, applies local redaction, scores importance, traces selectors, and exports mode-specific schemas for reading, retrieval, debugging, and agent operation.

## Features

- DOM snapshot extraction with headings, text, links, actions, forms, tables, media, and selector traceability
- Semantic regions for Wikipedia-style article pages, including lead, TOC, infobox, sections, references, and media
- Agent-ready JSON, Markdown, and delimited prompt-block exports
- Export buttons for ChatGPT, Grok, Gemini, and Claude with automatic prompt injection
- Always-on active-tab monitoring that refreshes context while you browse
- Floating in-page Visor logo widget with circular LLM export buttons
- Agent Mode, RAG chunks, detailed mode, compact mode, and debug mode
- Local privacy redaction and blocked-domain settings
- Session preferences for compile mode, privacy level, token budget, and widget state
- Mode-specific JSON schemas with token targeting

## Install For Users

No build command is required for normal use. The repository includes a ready-to-load `dist` build.

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the `dist` folder from this repository.
6. Pin Visor from the Chrome extensions menu.

After loading it, Visor stays active while browsing and refreshes the active tab context automatically. The floating Visor widget appears on supported pages; click it to export the current page context directly into ChatGPT, Grok, Gemini, or Claude.

## Compile Modes

Visor exports a distinct schema for each mode:

| Mode | Schema | Best for |
| --- | --- | --- |
| Compact Context | `agent_context.compact.v1` | Fast high-signal summaries and lightweight grounding |
| Detailed Context | `agent_context.detailed.v1` | Full page reading with semantic regions, tables, media, links, and forms |
| Agent Mode | `agent_context.agent_action.v1` | Agents that need controls, forms, status text, selectors, and next actions |
| RAG Chunks | `agent_context.rag.v1` | Retrieval pipelines, chunk storage, vector ingestion, and citation-friendly context |
| Compiler Debug | `agent_context.debug.v1` | Inspecting scoring, filtering, deduplication, noise, selectors, and compiler decisions |

Token budgets are estimated locally. When there is enough extracted content, Visor trims and clips toward the requested token budget within roughly `+/-100` estimated tokens.

## Export Targets

- Copy JSON
- Copy Markdown
- Copy prompt block
- Export directly to ChatGPT
- Export directly to Grok
- Export directly to Gemini
- Export directly to Claude

Direct exports open the selected agent and inject the compiled context into its prompt box. Clipboard copy is kept as a fallback.

## Privacy And Safety

- Redaction runs locally before export.
- Password and one-time-code values are omitted.
- Email, phone, token, API key, JWT, and credit-card-like patterns are masked according to privacy level.
- Blocked domains can be configured from the extension options page.
- Settings are stored locally/session-locally by Chrome storage APIs.

## Development Setup

```bash
npm install
npm run typecheck
npm test
npm run build
```

For extension development, run the watch build and reload the extension after source changes:

```bash
npm run dev:extension
```

## Developer Tools

- `npm run typecheck` validates TypeScript.
- `npm test` runs Vitest coverage for extraction, compiler modes, schemas, privacy, and extension guardrails.
- `npm run build` creates the loadable extension in `dist`.
- `npm run dev:extension` watches and rebuilds during extension development.
- `preview.html` opens the full preview dashboard from the extension popup.

## Project Structure

```txt
src/
  background/   service worker, active-tab compile flow, export routing
  compiler/     classification, scoring, normalization, mode shaping, token budget
  content/      DOM extractor, in-page widget, agent prompt injection
  popup/        extension popup UI
  options/      settings and site profile UI
  privacy/      local redaction rules
  shared/       schemas and TypeScript types
dist/           committed Chrome extension build
public/         icons, logos, and web-accessible assets
```

## Repository Notes

`node_modules/` is intentionally ignored. `dist/` is committed so non-developer users can load the extension directly from GitHub.

