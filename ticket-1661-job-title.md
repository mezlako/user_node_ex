# Ticket #1661: Optional User Job Title

## Summary

Ticket #1661 adds an optional `jobTitle` field to user records. The field is accepted when an administrator creates a user, when a user is registered, and when an existing user is updated.

## Design decisions

- `jobTitle` is optional so existing MongoDB user documents remain valid without a data migration or backfill.
- The field is stored as a trimmed string with a maximum length of 100 characters. Trimming avoids persisting accidental leading or trailing whitespace, while the length limit prevents unexpectedly large profile values.
- The same 100-character limit is enforced at both API-validation and Mongoose-schema layers. Request validation returns a client-facing 400 response before persistence; schema validation preserves the invariant for writes that bypass route validation.
- The field is public by default. The existing `toJSON` plugin only removes properties explicitly marked `private`, so `jobTitle` automatically appears in user and registration responses without plugin changes.
- Controllers and services require no changes because they already pass validated request bodies through to the generic create and update operations.

## Implementation

### Persistence

`src/models/user.model.js` defines `jobTitle` as:

```javascript
jobTitle: {
  type: String,
  trim: true,
  maxlength: 100,
},
```

No `required` constraint is included.

### Request validation

`Joi.string().max(100)` was added to:

- `createUser` and `updateUser` in `src/validations/user.validation.js`
- `register` in `src/validations/auth.validation.js`

This keeps the field optional while rejecting values longer than 100 characters on each write endpoint.

### API documentation

The OpenAPI `User` component in `src/docs/components.yml` now documents `jobTitle` as a string with `maxLength: 100` and includes `Software Engineer` in its example.

The inline Swagger request bodies for the following endpoints were updated with the matching property and example:

- `POST /users`
- `PATCH /users/{id}`
- `POST /auth/register`

### Test coverage

Tests cover:

- Model acceptance of a valid `jobTitle`
- Model rejection of values longer than 100 characters
- Administrator creation of a user with `jobTitle`
- User updates to `jobTitle`
- Registration with `jobTitle`
- 400 responses for oversized values on create, update, and registration routes

## Verification

`tests/unit/models/user.model.test.js` passed with the new model coverage.

The integration suites require a running MongoDB instance and valid `MONGODB_URL` environment setting. They were not completed locally because MongoDB was unavailable during verification.

## Out of scope

- Filtering users by `jobTitle`
- A migration or backfill for existing documents
- Frontend profile or registration UI changes
