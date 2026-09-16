// Pure, framework-free search/filter logic over the status code list.
// Tool-specific.

import type { StatusClass, StatusCodeEntry } from './status-codes';

/** A filter chip: one of the five official classes, or the unofficial group. */
export type ClassFilter = StatusClass | 'unofficial';

export const CLASS_FILTERS: ClassFilter[] = ['1xx', '2xx', '3xx', '4xx', '5xx', 'unofficial'];

export const CLASS_FILTER_LABELS: Record<ClassFilter, string> = {
  '1xx': '1xx',
  '2xx': '2xx',
  '3xx': '3xx',
  '4xx': '4xx',
  '5xx': '5xx',
  unofficial: 'Unofficial',
};

/** The filter group a given entry belongs to. */
function filterGroupOf(entry: StatusCodeEntry): ClassFilter {
  return entry.official ? entry.statusClass : 'unofficial';
}

function matchesClassFilter(entry: StatusCodeEntry, active: ReadonlySet<ClassFilter>): boolean {
  if (active.size === 0) return true;
  return active.has(filterGroupOf(entry));
}

function matchesQuery(entry: StatusCodeEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  if (String(entry.code).includes(q)) return true;
  return (
    entry.reason.toLowerCase().includes(q) ||
    entry.summary.toLowerCase().includes(q) ||
    entry.causes.toLowerCase().includes(q)
  );
}

/**
 * Filters `entries` by free-text `query` (matched against code, reason
 * phrase, summary, and causes) and by the set of active class filter chips.
 * An empty `activeFilters` set matches every class.
 */
export function filterStatusCodes(
  entries: StatusCodeEntry[],
  query: string,
  activeFilters: ReadonlySet<ClassFilter>,
): StatusCodeEntry[] {
  return entries.filter((entry) => matchesQuery(entry, query) && matchesClassFilter(entry, activeFilters));
}
