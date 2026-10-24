# BlogSpace — Full-Stack Blog Application

A full-stack blog application built with **Next.js, TypeScript, PostgreSQL, and Prisma**. BlogSpace enables users to register, authenticate, publish blog posts, browse articles, and manage their own content through a responsive interface and REST APIs.

## Features

### Core Features

- **User Authentication:** Register, log in, and log out securely.
- **Password Security:** Passwords are hashed using bcrypt.
- **Session Management:** Authentication uses signed session tokens stored in HTTP-only cookies.
- **Blog Management:** Create, view, edit, and delete blog posts.
- **Ownership-Based Authorization:** Only the author of a post can edit or delete it.
- **Post Metadata:** Each post includes a title, content, author, creation date, and updated date.
- **Responsive Interface:** Layouts for browsing articles, reading posts, and managing content across desktop and mobile screens.
- **Input Validation:** Validates user credentials and blog post fields.
- **Error Handling:** Handles invalid input, authentication failures, duplicate accounts, missing posts, and unauthorized operations.
- **PostgreSQL Persistence:** Stores users and blog posts in a relational database.

### Additional Features

- **Search:** Search blog posts by title or content.
- **Pagination:** Browse posts in manageable pages rather than loading every result at once.
- **Reading Experience:** Article detail pages, excerpts, estimated reading time, and related posts where available.


## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Full-stack framework and routing |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Responsive styling |
| PostgreSQL | Relational database |
| Prisma ORM | Database access and schema management |
| bcryptjs | Password hashing |
| jose | Signed session tokens |
| REST APIs | Client-server communication |

## Prerequisites

Install the following before running the application:

- Node.js compatible with your installed Next.js version
- npm
- PostgreSQL
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd BlogSpace
```

Replace the placeholder with your actual repository URL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file in the project root. You can copy `.env.example` if it contains the required placeholders.

```env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/blogspace?schema=public"
AUTH_SECRET="YOUR_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS"
```

Replace the database username and password with your local PostgreSQL credentials.

Generate a strong authentication secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Copy the generated value into `AUTH_SECRET`.

**Security:** Never commit `.env` or expose database credentials or authentication secrets. The `.env.example` file should contain placeholders only.

### 4. Create the PostgreSQL database

Create a PostgreSQL database named `blogspace`.

For example, using `psql`:

```sql
CREATE DATABASE blogspace;
```

Make sure the `DATABASE_URL` in `.env` matches your local PostgreSQL configuration.

### 5. Apply database migrations

If the repository includes Prisma migration files, run:

```bash
npx prisma migrate deploy
```

If the project contains a Prisma schema but no migration history yet, create the initial migration during development:

```bash
npx prisma migrate dev --name init
```

Use the migration workflow appropriate to the files included in the repository. Do not run both commands blindly against an existing database.

Generate the Prisma Client if needed:

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Application Routes

| Route | Description |
|---|---|
| `/` | Browse blog posts |
| `/register` | Create an account |
| `/login` | Sign in |
| `/create` | Create a blog post |
| `/blog/[slug]` | Read a blog post |
| `/edit/[id]` | Edit an existing post |

Access to create and edit functionality depends on authentication and post ownership.

## REST API Documentation

All endpoints use JSON where applicable. Authentication is maintained using the session cookie issued during login.

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate a user |
| `POST` | `/api/auth/logout` | End the current session |
| `GET` | `/api/auth/me` | Retrieve the current authenticated user |

#### Register

`POST /api/auth/register`

Example request:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

The server validates the submitted fields, hashes the password, checks for an existing account, and creates the user.

#### Login

`POST /api/auth/login`

Example request:

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

On successful authentication, the server issues a signed session cookie.

### Blog APIs

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/posts` | List blog posts | Public |
| `POST` | `/api/posts` | Create a post | Authenticated |
| `GET` | `/api/posts/:id` | Retrieve a post | Public |
| `PUT` | `/api/posts/:id` | Update a post | Owner only |
| `DELETE` | `/api/posts/:id` | Delete a post | Owner only |

#### List posts, search, and pagination

`GET /api/posts`

Supported query parameters:

| Parameter | Description |
|---|---|
| `page` | Page number |
| `limit` | Number of posts per page, subject to the API maximum |
| `search` | Search term for post titles and content |
| `authorId` | Filter posts by author ID |

Example:

```http
GET /api/posts?page=1&limit=10&search=technology
```

Example with an author filter:

```http
GET /api/posts?page=1&limit=10&authorId=USER_ID
```

#### Create a post

`POST /api/posts`

Example request:

```json
{
  "title": "Getting Started with Next.js",
  "content": "This article explores the fundamentals of building web applications with Next.js."
}
```

The authenticated user's identity is determined by the server. Clients cannot choose another user's ID to become the author of a post.

#### Retrieve a post

`GET /api/posts/POST_ID`

Returns the requested post and its author information when the post exists.

#### Update a post

`PUT /api/posts/POST_ID`

Example request:

```json
{
  "title": "Updated Article Title",
  "content": "Updated article content with additional information."
}
```

Only the authenticated author can update the post.

#### Delete a post

`DELETE /api/posts/POST_ID`

Only the authenticated author can delete the post.

### Error Handling

The API uses appropriate HTTP status codes, including:

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Resource created |
| `400 Bad Request` | Invalid input or request parameters |
| `401 Unauthorized` | Authentication required or invalid credentials |
| `403 Forbidden` | Authenticated user lacks permission |
| `404 Not Found` | Requested resource does not exist |
| `409 Conflict` | Duplicate resource, where applicable |
| `500 Internal Server Error` | Unexpected server error |

Exact responses depend on the endpoint and the specific error condition.

## Database Design

### User

| Field | Description |
|---|---|
| `id` | Unique user identifier |
| `name` | User's name |
| `email` | Unique email address |
| `passwordHash` | Hashed password |
| `createdAt` | Account creation timestamp |
| `updatedAt` | Account update timestamp |

### Post

| Field | Description |
|---|---|
| `id` | Unique post identifier |
| `title` | Post title |
| `content` | Full article content |
| `authorId` | Reference to the author |
| `createdAt` | Post creation timestamp |
| `updatedAt` | Last update timestamp |

Each post belongs to one user. The database relationship enforces referential integrity, and deleting a user cascades to their posts under the current schema.

## Security Considerations

- Passwords are hashed rather than stored as plain text.
- Session tokens are signed and stored in HTTP-only cookies.
- Cookies use appropriate security settings, including `Secure` in production and `SameSite=Lax`.
- Protected API routes verify the authenticated user.
- Post ownership is checked on the server before update or delete operations.
- Input validation helps prevent malformed requests.
- Environment secrets are kept outside version control.

## Development and Build Commands

Run the following commands from the project root:

```bash
# Start the development server
npm run dev

# Run lint checks
npm run lint

# Type-check the project
npx tsc --noEmit

# Create a production build
npm run build

# Start the production server after building
npm run start
```

The available npm scripts depend on `package.json`. If `npm run lint` is not configured, use the lint command supported by the project configuration.

## Project Structure

```text
BlogSpace/
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   └── posts/
│   │   ├── blog/
│   │   ├── create/
│   │   ├── edit/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx
│   ├── components/
│   └── lib/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Assessment Scope

This project demonstrates:

- Full-stack application development using Next.js.
- Authentication and authorization.
- Relational database design and ORM usage.
- REST API development.
- CRUD operations and ownership enforcement.
- Input validation and error handling.
- Responsive frontend development.
- Search and pagination for browsing blog posts.

## Future Improvements

Possible enhancements include:

- Bookmarks and saved articles.
- Richer Markdown previews.
- Categories and tags persisted in the database.
- Comments and likes backed by persistent storage.
- Automated integration tests.
- Production deployment and monitoring.

## Deployment

Deployment is optional for the assessment. A production deployment requires a compatible hosting platform, a reachable PostgreSQL database, and correctly configured environment variables.

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for deployment options.

---

**Built with Next.js, TypeScript, PostgreSQL, and Prisma.**