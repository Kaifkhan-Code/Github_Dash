// Every call to the backend goes through this one helper so errors
// are handled the same way everywhere.
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Cannot reach the server. Please check that it is running.');
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(body?.message || 'Something went wrong.');
    error.status = res.status;
    error.retryAt = body?.retryAt;
    throw error;
  }
  return body;
}

export function searchRepos({ q, sort, page }, signal) {
  const params = new URLSearchParams({ q, sort, page });
  return request(`/repos/search?${params}`, { signal });
}

export function getRepo(owner, name, signal) {
  return request(`/repos/${owner}/${name}`, { signal });
}

export function getFavourites() {
  return request('/favourites');
}

export function saveFavourite(repo) {
  return request('/favourites', {
    method: 'POST',
    body: JSON.stringify({
      repoId: repo.id,
      fullName: repo.fullName,
      owner: repo.owner,
      name: repo.name,
      description: repo.description || '',
      stars: repo.stars,
      forks: repo.forks,
      language: repo.language || '',
      htmlUrl: repo.url,
    }),
  });
}

export function removeFavourite(repoId) {
  return request(`/favourites/${repoId}`, { method: 'DELETE' });
}
