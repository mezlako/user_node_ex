# ship-feature report — rename createBookmark to CreateBookmarkInput

## Tests generated

No new tests required. The rename is purely cosmetic — no logic or observable
behaviour changed. The existing 18 integration tests in
`tests/integration/bookmark.test.js` exercise the POST endpoint via HTTP and
hold no references to the internal function names. All 25 unit tests pass.

## Code review

Verdict: approve-with-nits

| Severity | File:Line | Category | Issue | Suggested fix |
|---|---|---|---|---|
| medium | src/controllers/bookmark.controller.js:6, src/services/bookmark.service.js:11 | maintainability | `CreateBookmarkInput` as a function name violates JS naming conventions — PascalCase is reserved for constructors/classes. Every other function in this codebase is camelCase (`createUser`, `getBookmarks`, `deleteBookmark`). | Rename to `createBookmark` |
| low | src/validations/bookmark.validation.js:4 | maintainability | Validation schema named `CreateBookmarkInput` — all sibling schemas are camelCase (`createUser`, `login`, `getUsers`). | Rename to `createBookmark` |

- Security: n/a — pure rename, no logic change
- Correctness: rename is consistent across all 4 files, no broken references
- Performance: n/a
- Testing: HTTP-level integration tests unaffected by internal function names
- Observability: n/a

## Proposed commit message

```
Rename createBookmark to CreateBookmarkInput across bookmark module

Updates the validation schema, service function, controller handler, and
route reference to use the new name consistently.
```

Status: ready-to-commit
