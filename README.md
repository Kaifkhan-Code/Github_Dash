# GitHub Repository Dashboard

Search public GitHub repositories, inspect repository activity, and save repositories to a favourites list.

## Features

- Search repositories by keyword and sort by stars or recent updates.
- Browse paginated results; search, sort, and page are reflected in the URL.
- View repository statistics, open issues, recent commits, and top contributors.
- Save and remove favourites, persisted in MongoDB.
- Handle empty results, GitHub API errors, and rate limits with clear UI states.

## Tech Stack

- Frontend: React, React Router, Vite, and Tailwind CSS
- Backend: Node.js and Express
- Database: MongoDB with Mongoose
- Repository data: GitHub REST API

## Requirements

- Node.js 18 or newer
- MongoDB running locally or a MongoDB Atlas connection string

## Run Locally

### 1. Configure the server

In a terminal at the project root:

```bash
cd server
npm install
```

Create `server/.env` with your MongoDB connection string:

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/github_dashboard
GITHUB_TOKEN=
CLIENT_URL=http://localhost:5173
```

`MONGO_URI` is required. `GITHUB_TOKEN` is optional; setting a GitHub personal access token increases the API rate limit available to the server. Keep the token private and do not commit `.env`.

Start the backend:

```bash
npm run dev
```

The API listens on `http://localhost:5000` after it connects to MongoDB.

### 2. Start the client

Open a second terminal at the project root:

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Vite forwards `/api` requests to the backend at `http://localhost:5000`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `PORT` | No | Backend port; defaults to `5000`. |
| `GITHUB_TOKEN` | No | GitHub token used by the backend for authenticated API requests. |
| `CLIENT_URL` | No | Frontend origin allowed by CORS; defaults to `http://localhost:5173`. |

## API

All endpoints are served by the backend under `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check; returns `{ "status": "ok" }`. |
| `GET` | `/api/repos/search?q=react&sort=stars&page=1` | Search repositories. `q` is required; `sort` can be `stars` or `updated`; `page` defaults to `1`. |
| `GET` | `/api/repos/:owner/:name` | Repository details, including recent commits and top contributors. |
| `GET` | `/api/favourites` | List saved repositories. |
| `POST` | `/api/favourites` | Save a repository; returns `409` if it is already saved. |
| `DELETE` | `/api/favourites/:repoId` | Remove a saved repository. |

Search returns 10 repositories per page. GitHub search only exposes up to 1,000 results per query. Search results are cached in memory for five minutes.

## Tests and Build

Run the backend tests:

```bash
cd server
npm test
```

Build the frontend for production:

```bash
cd client
npm run build
```

## Notes and Limitations

- There is no user authentication; favourites are shared by all users of the same deployment.
- The search cache is in memory and is cleared when the server restarts.
- GitHub API rate limits apply. Authenticated limits depend on the token and GitHub's current policy.
- Backend tests currently focus on GitHub API error and rate-limit handling.
