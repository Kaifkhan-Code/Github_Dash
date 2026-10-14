import assert from 'node:assert/strict';
import test from 'node:test';
import { toApiError } from './github.js';

test('maps a headerless secondary rate limit to 429', () => {
  const error = toApiError({
    response: {
      status: 403,
      headers: {},
      data: { message: 'You have exceeded a secondary rate limit.' },
    },
  });

  assert.equal(error.status, 429);
  assert.match(error.message, /rate limit/i);
});

test('maps exhausted primary quota to 429 with a retry time', () => {
  const reset = Math.floor(Date.now() / 1000) + 60;
  const error = toApiError({
    response: {
      status: 403,
      headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) },
      data: { message: 'API rate limit exceeded.' },
    },
  });

  assert.equal(error.status, 429);
  assert.equal(error.extra.retryAt, new Date(reset * 1000).toISOString());
});

test('maps Retry-After seconds to a retry time', () => {
  const startedAt = Date.now();
  const error = toApiError({
    response: {
      status: 429,
      headers: { 'retry-after': '30' },
      data: { message: 'You have been rate limited.' },
    },
  });
  const retryAt = Date.parse(error.extra.retryAt);

  assert.ok(retryAt >= startedAt + 30_000);
  assert.ok(retryAt <= Date.now() + 31_000);
});

test('does not misclassify unrelated forbidden responses as rate limits', () => {
  const error = toApiError({
    response: { status: 403, headers: {}, data: { message: 'Resource is forbidden.' } },
  });

  assert.equal(error.status, 502);
});

test('maps missing repositories and unavailable GitHub separately', () => {
  const missing = toApiError({ response: { status: 404, headers: {}, data: {} } });
  const unavailable = toApiError({ request: {} });

  assert.equal(missing.status, 404);
  assert.equal(unavailable.status, 503);
});