# jobProfile Field — Change Summary

This document describes the changes made to add an optional `jobProfile` field to the User model, along with the key decision points behind each choice.

## Overview

A new optional string field, `jobProfile`, was added to user accounts. It accepts up to 50 characters and can be set when an admin creates a user or when a user (or admin) updates a profile via the user management API.

---

## Changes Performed

### 1. User Model — `src/models/user.model.js`

Added the schema field:

```javascript
jobProfile: {
  type: String,
  trim: true,
  maxlength: 50,
},
```

This is the source of truth for persistence and Mongoose-level validation.

### 2. Request Validation — `src/validations/user.validation.js`

Added optional `jobProfile` to two endpoints:

| Endpoint schema | Change |
|-----------------|--------|
| `createUser.body` | `jobProfile: Joi.string().max(50)` |
| `updateUser.body` | `jobProfile: Joi.string().max(50)` |

Joi validates incoming request bodies before they reach the controller. Without this, unknown keys are stripped and `jobProfile` would never reach the model.

### 3. Swagger / API Documentation

| File | Change |
|------|--------|
| `src/docs/components.yml` | Added `jobProfile` to the shared `User` schema component |
| `src/routes/v1/user.route.js` | Documented `jobProfile` on `POST /users` and `PATCH /users/{id}` request bodies |

The field is included in API docs with `maxLength: 50` and example value `"Software Engineer"`.

### 4. Tests

| File | Tests added |
|------|-------------|
| `tests/unit/models/user.model.test.js` | Valid `jobProfile` passes validation; values over 50 chars are rejected |
| `tests/integration/user.test.js` | Create user with `jobProfile`; reject create when > 50 chars; update `jobProfile`; reject update when > 50 chars |

---

## Files Intentionally Left Unchanged

| File | Reason |
|------|--------|
| `src/services/user.service.js` | Already passes `userBody` / `updateBody` generically to `User.create()` and `user.save()` |
| `src/controllers/user.controller.js` | Sends `req.body` and model instances as-is; no field-specific logic needed |
| `src/models/index.js` | Re-exports the User model without modification |
| `tests/fixtures/user.fixture.js` | Fixtures work without `jobProfile`; the field is optional and omitted by default |

---

## Decision Points

### 1. Optional vs required

**Decision:** `jobProfile` is optional.

**Rationale:** Existing users and API flows should keep working without providing a job profile. No migration or backfill is required; documents without the field simply omit it from responses.

### 2. Max length of 50 characters

**Decision:** Enforced at both Mongoose (`maxlength: 50`) and Joi (`max(50)`) layers.

**Rationale:** Dual validation ensures:
- Direct database writes via Mongoose are constrained
- API requests are rejected with `400 Bad Request` before hitting the database

This matches the requirement and follows the pattern used for other constrained fields (e.g. password `minlength` in the model + custom Joi validator).

### 3. Validation in Joi, not only in Mongoose

**Decision:** Add `jobProfile` to `user.validation.js` for create and update routes.

**Rationale:** The boilerplate strips unknown request keys at the Joi layer. Schema-only changes would not expose the field through `POST /v1/users` or `PATCH /v1/users/:userId` unless validation explicitly allows it.

### 4. No service or controller changes

**Decision:** Leave `user.service.js` and `user.controller.js` unchanged.

**Rationale:** Both layers delegate to the model with the full request body. Adding a schema field and Joi rule is sufficient for create, read, update, and list responses.

### 5. No changes to auth registration flow

**Decision:** `jobProfile` was **not** added to `src/validations/auth.validation.js` or the register route.

**Rationale:** The plan treated registration as optional scope. Users can set `jobProfile` later via `PATCH /v1/users/:userId`. To support it at signup, add the same optional Joi rule to `auth.validation.js` and update the register Swagger docs in `auth.route.js`.

### 6. No filter/sort support on GET /users

**Decision:** `jobProfile` was not added to `getUsers` query validation or controller `pick()` filters.

**Rationale:** Out of scope for this change. Listing currently supports filtering by `name` and `role` only. Search or filter by `jobProfile` would require updates to `user.validation.js`, `user.controller.js`, and related tests.

### 7. Public API exposure via toJSON

**Decision:** `jobProfile` is returned in API responses; it is not marked `private`.

**Rationale:** Unlike `password`, `jobProfile` is non-sensitive profile data. The existing `toJSON` plugin strips only fields marked `private: true`, so `jobProfile` appears automatically in create, get, update, and list responses when set.

### 8. String trimming

**Decision:** `trim: true` on the Mongoose field.

**Rationale:** Consistent with `name` and `email`. Leading/trailing whitespace is removed before save.

### 9. Test fixtures unchanged

**Decision:** Existing fixtures in `user.fixture.js` do not include `jobProfile`.

**Rationale:** Optional fields that are unset are not serialized in JSON responses, so existing integration tests with strict `.toEqual` assertions continue to pass. New tests explicitly cover the field when present.

---

## Data Flow

```
Client
  → user.validation.js   (Joi: optional, max 50)
  → user.controller.js   (passes req.body)
  → user.service.js      (User.create / user.save)
  → user.model.js        (Mongoose: trim, maxlength 50)
  → toJSON plugin        (includes jobProfile in response)
  → Client
```

---

## Verification

Unit tests (model validation):

```bash
npm test -- tests/unit/models/user.model.test.js
```

Full user route coverage (requires MongoDB and env vars from `.env.example`):

```bash
npm test -- tests/unit/models/user.model.test.js tests/integration/user.test.js
```

---

## Possible Follow-ups

If product requirements expand, consider:

1. **Registration** — Allow `jobProfile` on `POST /v1/auth/register`
2. **Filtering** — Add `jobProfile` to `GET /v1/users` query params
3. **Fixtures** — Add sample `jobProfile` values to test fixtures for richer list/get scenarios
