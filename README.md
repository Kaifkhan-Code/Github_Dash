# GitHub Repository Analytics Dashboard

A full-stack app to search public GitHub repositories, look at their details
(latest commits, top contributors, open issues) and save favourites.

**Stack:** React (Vite) + Tailwind CSS, Node.js + Express, MongoDB (Mongoose), GitHub REST API.

## Setup

You need Node 18+ and a MongoDB instance (local or Atlas).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env     # then fill in MONGO_URI (and GITHUB_TOKEN if you have one)
npm run dev              # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so no extra frontend config is needed.

### Environment variables (`server/.env`)

| Name           | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `PORT`         | Port for the Express server (default 5000)                              |
| `MONGO_URI`    | MongoDB connection string                                               |
| `GITHUB_TOKEN` | Optional GitHub token. Raises the rate limit from 60 to 5000 requests/hour |
| `CLIENT_URL`   | Allowed CORS origin for the frontend                                    |

## API

| Method | Route                              | Description                                   |
| ------ | ---------------------------------- | --------------------------------------------- |
| GET    | `/api/repos/search?q=&sort=&page=` | Search repos. `sort` is `stars` or `updated`  |
| GET    | `/api/repos/:owner/:name`          | Repo info, latest 5 commits, top 5 contributors |
| GET    | `/api/favourites`                  | List saved repos                              |
| POST   | `/api/favourites`                  | Save a repo (409 if already saved)            |
| DELETE | `/api/favourites/:repoId`          | Remove a saved repo                           |

## How the required edge cases are handled

1. **GitHub error / unavailable** - the GitHub service maps axios errors to clean API errors (502/503), and the UI shows a message with a retry button.
2. **Invalid or deleted repository** - GitHub's 404 becomes a 404 from our API, and the details page shows a friendly message. Repo names are also validated before any request is made.
3. **Empty search results** - the UI shows a "no repositories found" state instead of a blank page.
4. **Duplicate saves** - a unique index on `repoId` in MongoDB guarantees no duplicates; the API returns 409 and the frontend re-syncs.
5. **Rate limits** - 403/429 responses with an exhausted quota become a 429 with a readable message (and the reset time), so the server never crashes.

Other notes:

- Search results are cached in memory for 5 minutes (`server/src/utils/cache.js`).
- The GitHub token only lives in the server environment, and all GitHub calls go through the backend.
- Search state (query, sort, page) is kept in the URL, so refreshing keeps your results.
- GitHub only returns the first 1000 search results, so pagination stops there.
- GitHub's "open issues" number includes open pull requests.

## Known limitations / what I would do next

- There is no user login, so saved repositories are shared by everyone using the app. Adding auth would mean a `userId` on the favourite and a compound unique index.
- The cache is in memory, so it resets on restart. Redis would be the next step for multiple instances.
- No automated tests yet. I would start with the error mapping in `services/github.js` and the favourites routes.
