# Visor MVP Implementation Matrix

Generated during Phase 5 acceptance work.

## Functional Requirements

| ID | Status | Implementation / Test Evidence |
| --- | --- | --- |
| FR-001 | Implemented | `src/popup/index.tsx`, `src/background/service-worker.ts` user-triggered compile flow |
| FR-002 | Implemented | `src/content/extractor.ts`; `src/testing/acceptance.test.ts` validates all fixture `PageSnapshot.source` values |
| FR-003 | Implemented | `src/content/extractor.ts`; fixture snapshots validate ordered text blocks with selector hints |
| FR-004 | Implemented | `buildHeadingHierarchy` in `src/compiler/compiler.ts`; fixture schema validation |
| FR-005 | Implemented | Link extraction and redaction in compiler; article fixture asserts links survive compile |
| FR-006 | Implemented | Action extraction and action purpose mapping; product fixture asserts buy action |
| FR-007 | Implemented | Form extraction/types; form-heavy fixture asserts fields and password omission |
| FR-008 | Implemented | Table model; table-heavy fixture asserts structured rows |
| FR-009 | Implemented | Code blocks compile as `kind: "code"`; docs fixture asserts code output |
| FR-010 | Implemented | Visibility/noise filters; noisy fixture asserts normal output removes noisy blocks |
| FR-011 | Implemented | `deduplicateTextBlocks`; compiler mode tests assert duplicate handling |
| FR-012 | Implemented | `src/compiler/classifier.ts`; fixture outputs validate `pageClassification` |
| FR-013 | Implemented | `src/compiler/tokenBudget.ts`; acceptance suite asserts token profiles |
| FR-014 | Implemented | Runtime `AgentContextSchema` validation plus fixture acceptance schema tests |
| FR-015 | Implemented | JSON, Markdown, prompt-block exports; acceptance suite parses/checks exports |
| FR-016 | Implemented | `src/privacy/redactor.ts`; secrets and structured-field tests |
| FR-017 | Implemented | `src/storage/settings.ts`; settings/profile/recent compile helpers |
| FR-018 | Implemented | Debug mode retains noisy/duplicate blocks and emits compiler notes |

## Non-Functional Requirements

| ID | Status | Implementation / Test Evidence |
| --- | --- | --- |
| NFR-001 | Partially verified | Unit/fixture compiles run well under test timeout; manual browser performance still recommended |
| NFR-002 | Implemented | Extractor node cap and large-page fixture warning/token-budget acceptance test |
| NFR-003 | Implemented | No backend calls in compile path; CSS external import guardrail test |
| NFR-004 | Implemented | Manifest guardrail test asserts minimal permissions and no host permissions |
| NFR-005 | Implemented | Acceptance test asserts deterministic repeated compile output |
| NFR-006 | Implemented | Restricted-page checks in service worker; manual extension QA still recommended |
| NFR-007 | Implemented | `npm run typecheck` and `npm test` pass |
| NFR-008 | Implemented | UI guardrail test rejects `dangerouslySetInnerHTML` / `innerHTML` usage |

## QA Fixture Coverage

| Fixture | Coverage |
| --- | --- |
| simple-article | Schema-valid compile, headings, text, links |
| docs-with-code | Code block preservation |
| product-page | Product action/table compilation |
| dashboard | Dashboard classification/risk input coverage |
| form-heavy | Form fields and password omission |
| table-heavy | Large table rows |
| noisy-blog | Noise removal vs debug retention |
| hidden-elements | Already-extracted visible-only snapshot with ignored-node stats |
| secrets | Strict redaction for email, phone, JWT, API-key-like strings |
| large-page | Token trimming and node-limit warning |
