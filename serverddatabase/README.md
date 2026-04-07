# serverddatabase

Simple API to store form details in a SQLite database.

## Run

```bash
npm install
npm run dev
```

Server starts on `http://localhost:3001`.

## Endpoints

### GET `/health`

Returns `{ ok: true }`.

### POST `/register`

Body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "StrongP@ssw0rd!"
}
```

Responses:

- **201** (saved):

```json
{
  "status": "success",
  "message": "Saved successfully!",
  "user": { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com" }
}
```

- **409** (email already exists):

```json
{
  "status": "error",
  "code": "EMAIL_TAKEN",
  "message": "This email is already in use."
}
```

- **400** (validation errors):

```json
{
  "status": "error",
  "message": "Validation failed.",
  "errors": {
    "email": ["Please enter a valid email address."]
  }
}
```

