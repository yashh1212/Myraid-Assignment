# TaskFlow – Task Management Application

## 🔗 Live Links

| | URL |
|---|---|
| **Frontend** | *(Update after deployment)* |
| **Backend API** | *(Update after deployment)* |
| **GitHub** | *(Update after deployment)* |

---

## 🏗️ Architecture Overview

```
assignment/
├── Client/          # React + Vite
│   └── src/
│       ├── api/         # Axios instance (withCredentials + decrypt interceptor)
│       ├── components/  # TaskModal
│       ├── context/     # AuthContext (user state, login/logout/register)
│       ├── pages/       # LoginPage, RegisterPage, DashboardPage
│       ├── routes/      # ProtectedRoute
│       └── utils/       # crypto.js (AES Web Crypto API)
└── Server/          # Node.js + Express REST API
    └── src/
        ├── config/      # MongoDB connection (Mongoose)
        ├── controllers/ # authController, taskController
        ├── middleware/  # auth (JWT), encrypt (AES), validate, errorHandler
        ├── models/      # User, Task (Mongoose schemas)
        └── routes/      # authRoutes, taskRoutes
```

### Key Design Decisions
- **JWT in HTTP-only cookies** – prevents XSS token theft
- **AES-256-CBC middleware** – encrypts all request/response payloads
- **Mongoose compound indexes** – `{ userId, createdAt }` and `{ userId, status }` for fast scoped queries
- **Auth check per task operation** – every task query includes `userId: req.user.id`, preventing horizontal privilege escalation

---


## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs, 12 salt rounds |
| Token storage | HTTP-only cookie (`Secure` + `SameSite=strict` in production) |
| Payload encryption | AES-256-CBC on all API responses/requests |
| NoSQL injection | `express-mongo-sanitize` middleware |
| Input validation | `express-validator` on all routes |
| Rate limiting | 10 req/15min on auth routes, 100 req/15min globally |
| HTTP headers | `helmet` |
| CORS | Whitelist `CLIENT_URL` only |

---

## 📡 API Documentation

### Base URL: `https:domain/api`

> **Note**: All responses are AES-encrypted as `{ payload: "<encrypted>" }`.  
> The client automatically decrypts these via the Axios interceptor.

---

### Auth Endpoints

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registered successfully.",
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com" }
}
```
Sets `token` HTTP-only cookie.

---

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{ "email": "john@example.com", "password": "Password123" }
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com" }
}
```

---

#### POST `/auth/logout` *(requires auth)*
Clears the auth cookie.

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

#### GET `/auth/me` *(requires auth)*
Returns the current authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "user": { "id": "...", "username": "johndoe", "email": "john@example.com" }
}
```

---

### Task Endpoints *(all require auth)*

#### GET `/tasks`
List tasks with pagination, filtering, and search.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `status` | string | Filter: `todo`, `in-progress`, `done` |
| `search` | string | Partial title match (case-insensitive) |

**Response `200`:**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "...",
      "title": "Fix login bug",
      "description": "Priority issue",
      "status": "in-progress",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-02T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### POST `/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Fix login bug",
  "description": "Users can't log in on mobile",
  "status": "todo"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Task created.",
  "task": { "_id": "...", "title": "Fix login bug", "status": "todo", ... }
}
```

---

#### GET `/tasks/:id`
Get a single task by ID.

**Response `200`:** `{ "success": true, "task": { ... } }`

**Response `404`:** `{ "success": false, "message": "Task not found." }`

---

#### PUT `/tasks/:id`
Update a task.

**Request Body:** Same as POST (all fields optional)

**Response `200`:** `{ "success": true, "message": "Task updated.", "task": { ... } }`

---

#### DELETE `/tasks/:id`
Delete a task.

**Response `200`:** `{ "success": true, "message": "Task deleted." }`

---

### Error Responses

| Status | When |
|---|---|
| `400` | Bad request / invalid ID |
| `401` | Not authenticated |
| `403` | Forbidden |
| `404` | Resource not found |
| `409` | Conflict (email already exists) |
| `422` | Validation errors |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

**Validation Error Example:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Valid email required" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---


