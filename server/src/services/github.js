import axios from 'axios';
import ApiError from '../utils/ApiError.js';

const client = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});


client.interceptors.request.use((config) => {
  if (process.env.GITHUB_TOKEN) {
    config.headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return config;
});


export function toApiError(err) {
  if (err.response) {
    const { status, headers } = err.response;
    const message = String(err.response.data?.message || '');
    const rateLimited =
      status === 429 ||
      (status === 403 && (
        headers['x-ratelimit-remaining'] === '0' ||
        headers['retry-after'] ||
        /rate limit/i.test(message)
      ));

    if (rateLimited) {
      const reset = Number(headers['x-ratelimit-reset']);
      let retryAt;
      if (Number.isFinite(reset) && reset > 0) {
        retryAt = new Date(reset * 1000).toISOString();
      } else if (headers['retry-after']) {
        const delay = Number(headers['retry-after']);
        const retryTime = Number.isFinite(delay)
          ? Date.now() + delay * 1000
          : Date.parse(headers['retry-after']);
        if (Number.isFinite(retryTime)) retryAt = new Date(retryTime).toISOString();
      }
      return new ApiError(
        429,
        'GitHub rate limit reached. Please wait a bit and try again.',
        retryAt ? { retryAt } : {}
      );
    }
    if (status === 404 || status === 451) {
      return new ApiError(404, 'Repository not found. It may have been deleted or made private.');
    }
    if (status === 422) {
      return new ApiError(400, 'GitHub could not process this search. Try a different keyword or an earlier page.');
    }
    if (status === 401) {
      return new ApiError(502, 'The GitHub token on the server is invalid.');
    }
    return new ApiError(502, 'GitHub returned an unexpected error. Please try again later.');
  }

 
  return new ApiError(503, 'Could not reach GitHub right now. Please try again later.');
}

async function get(url, params) {
  try {
    const { data } = await client.get(url, { params });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}


async function getList(url, params) {
  try {
    const { data, status } = await client.get(url, { params });
    return status === 200 && Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.response?.status === 409) return [];
    throw toApiError(err);
  }
}

async function getOpenIssueCount(owner, name) {
  const data = await get('/search/issues', {
    q: `repo:${owner}/${name} is:issue is:open`,
    per_page: 1,
  });
  return data.total_count;
}

function formatRepo(r) {
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner.login,
    ownerAvatar: r.owner.avatar_url,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    url: r.html_url,
    updatedAt: r.updated_at,
  };
}

export async function searchRepositories({ q, sort, page, perPage }) {
  const data = await get('/search/repositories', {
    q,
    sort,
    order: 'desc',
    page,
    per_page: perPage,
  });

  return {
    totalCount: data.total_count,
    items: data.items.map(formatRepo),
  };
}

export async function getRepositoryDetails(owner, name) {

  const repo = await get(`/repos/${owner}/${name}`);
  const repositoryPath = `/repos/${repo.owner.login}/${repo.name}`;

  const [commits, contributors, openIssues] = await Promise.all([
    getList(`${repositoryPath}/commits`, { per_page: 5 }),
    getList(`${repositoryPath}/contributors`, { per_page: 5 }),
    getOpenIssueCount(repo.owner.login, repo.name),
  ]);

  return {
    repo: {
      ...formatRepo(repo),
      watchers: repo.subscribers_count ?? repo.watchers_count,
      homepage: repo.homepage,
      topics: repo.topics || [],
      license: repo.license?.name || null,
      defaultBranch: repo.default_branch,
      createdAt: repo.created_at,
      openIssues,
    },
    commits: commits.map((c) => ({
      sha: c.sha,
      message: c.commit.message.split('\n')[0],
      author: c.commit.author?.name || c.author?.login || 'Unknown',
      date: c.commit.author?.date,
      url: c.html_url,
    })),
    contributors: contributors.map((c) => ({
      login: c.login,
      avatar: c.avatar_url,
      contributions: c.contributions,
      url: c.html_url,
    })),
  };
}
