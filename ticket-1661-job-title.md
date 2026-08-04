# Ticket #1661: Optional User Job Title

## Summary

Ticket #1661 adds an optional `jobTitle` field to user records. The field is accepted when an administrator creates a user, when a user is registered, and when an existing user is updated. It is an optional string with a maximum length of 40 characters.

## Design decisions

- `jobTitle` is optional so existing MongoDB user documents remain valid without a data migration or backfill.
- The field is stored as a trimmed string with a maximum length of 40 characters. Trimming avoids persisting accidental leading or trailing whitespace, while the length limit keeps profile values short and predictable.
- The same 40-character limit is enforced at both API-validation and Mongoose-schema layers. Request validation returns a client-facing 400 response before persistence; schema validation preserves the invariant for writes that bypass route validation.
- The field is public by default. The existing `toJSON` plugin only removes properties explicitly marked `private`, so `jobTitle` automatically appears in user and registration responses without plugin changes.
- Controllers and services require no changes because they already pass validated request bodies through to the generic create and update operations.

## Changes by file

### Persistence

`src/models/user.model.js` defines `jobTitle` as:

```javascript
jobTitle: {
  type: String,
  trim: true,
  maxlength: 40,
},
```

No `required` constraint is included.

### Request validation

`Joi.string().max(40)` was added to:

- `createUser` and `updateUser` in `src/validations/user.validation.js`
- `register` in `src/validations/auth.validation.js`

This keeps the field optional while rejecting values longer than 40 characters on each write endpoint.

### API documentation

The OpenAPI `User` component in `src/docs/components.yml` documents `jobTitle` as a string with `maxLength: 40` and includes `Software Engineer` in its example.

The inline Swagger request bodies for the following endpoints were updated with the matching property and example:

- `POST /users`
- `PATCH /users/{id}`
- `POST /auth/register`

### Tests

- `tests/unit/models/user.model.test.js` — accepts a valid `jobTitle`; rejects values longer than 40 characters
- `tests/integration/auth.test.js` — registration persists `jobTitle` when provided; returns 400 when longer than 40 characters
- `tests/integration/user.test.js` — admin create and user PATCH accept a valid `jobTitle`; return 400 when longer than 40 characters

## Files not changed (and why)

- `src/controllers/user.controller.js` and `src/controllers/auth.controller.js` — already pass `req.body` through to the user service
- `src/services/user.service.js` — generic `User.create(userBody)` / `Object.assign` update path already persists validated fields
- `tests/fixtures/user.fixture.js` — `jobTitle` is optional; leaving it unset keeps existing exact response assertions valid
- `getUsers` query validation and `pick(req.query, ['name', 'role'])` — filtering users by `jobTitle` is out of scope
- `toJSON` / paginate plugins, roles config, token fixtures, and unrelated routes — no field-specific behavior required

## Out of scope

- Filtering users by `jobTitle`
- A migration or backfill for existing documents
- Frontend profile or registration UI changes
