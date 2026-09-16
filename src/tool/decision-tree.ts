// Pure, framework-free "which status should I use?" decision tree.
// Tool-specific.

export interface DecisionOption {
  label: string;
  /** Id of the next node to show, or omitted if this option is a leaf. */
  next?: string;
  /** Suggested status code, present only on leaf options. */
  result?: number;
  /** Optional one-line note shown alongside the result. */
  note?: string;
}

export interface DecisionNode {
  id: string;
  question: string;
  options: DecisionOption[];
}

export const DECISION_START = 'start';

export const DECISION_TREE: Record<string, DecisionNode> = {
  start: {
    id: 'start',
    question: 'What happened with the request?',
    options: [
      { label: 'It succeeded', next: 'success' },
      { label: "It's being rate limited", result: 429 },
      { label: 'The resource moved, or a cached copy is still valid', next: 'redirect' },
      { label: 'Something is wrong with the request itself', next: 'client-error' },
      { label: 'Something failed on the server side', next: 'server-error' },
    ],
  },

  success: {
    id: 'success',
    question: "What's the successful result?",
    options: [
      { label: 'Returning data', result: 200 },
      { label: 'Created a new resource', result: 201, note: 'Set the `Location` header to the new resource.' },
      { label: 'Accepted for async/background processing', result: 202 },
      { label: 'Nothing to return, e.g. after a DELETE or PUT', result: 204 },
      { label: 'Returning part of a resource (a range request)', result: 206 },
    ],
  },

  'client-error': {
    id: 'client-error',
    question: "What's wrong with the request?",
    options: [
      { label: 'No credentials, or they are invalid/expired', result: 401 },
      { label: "Authenticated, but not allowed to do this", result: 403 },
      { label: "The resource or endpoint doesn't exist", result: 404 },
      { label: "The HTTP method isn't supported on this resource", result: 405 },
      { label: 'The body/params fail validation', next: 'validation' },
      { label: 'It conflicts with the current state of the resource', next: 'conflict' },
      { label: "It's malformed (bad syntax, unparsable)", result: 400 },
    ],
  },

  validation: {
    id: 'validation',
    question: "Is the request well-formed but semantically invalid (as opposed to broken syntax)?",
    options: [
      {
        label: 'Yes — well-formed, but e.g. a required field is missing or a value is invalid',
        result: 422,
      },
      { label: "No — it's malformed JSON or otherwise unparsable", result: 400 },
    ],
  },

  conflict: {
    id: 'conflict',
    question: 'What kind of conflict is it?',
    options: [
      {
        label: 'Optimistic concurrency / version mismatch (a conditional header failed)',
        result: 412,
      },
      { label: 'Duplicate resource, or the current state blocks this action', result: 409 },
      { label: 'The resource used to exist but is now permanently gone', result: 410 },
    ],
  },

  redirect: {
    id: 'redirect',
    question: "What kind of redirect (or cache) situation is it?",
    options: [
      { label: "The client's cached copy is still valid — nothing changed", result: 304 },
      {
        label: 'Permanent move; the client may switch the method to GET',
        result: 301,
      },
      {
        label: 'Permanent move; the method and body must be preserved exactly',
        result: 308,
      },
      {
        label: 'Temporary move; the client may switch the method to GET',
        result: 302,
      },
      {
        label: 'Temporary move; the method and body must be preserved exactly',
        result: 307,
      },
      {
        label: 'Redirecting after a successful POST to a GET-able result page',
        result: 303,
      },
    ],
  },

  'server-error': {
    id: 'server-error',
    question: 'What kind of server-side failure is it?',
    options: [
      { label: 'Unexpected/unhandled exception in your own service', result: 500 },
      { label: 'Your service is temporarily overloaded or in maintenance', result: 503 },
      {
        label: "You're a gateway/proxy and the upstream server returned an invalid response",
        result: 502,
      },
      {
        label: "You're a gateway/proxy and the upstream server took too long to respond",
        result: 504,
      },
      { label: "This endpoint or method isn't implemented at all", result: 501 },
    ],
  },
};
