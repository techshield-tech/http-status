import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, CopyButton, Panel, Toolbar } from '@mmoall/tool-kit';
import {
  STATUS_BY_CODE,
  STATUS_CODES,
  type Retryable,
  type StatusCodeEntry,
} from './status-codes';
import { CLASS_FILTERS, CLASS_FILTER_LABELS, filterStatusCodes, type ClassFilter } from './search';
import { hashForCode, parseCodeFromHash } from './hash';
import { DECISION_START, DECISION_TREE, type DecisionOption } from './decision-tree';

function retryLabel(retryable: Retryable): string {
  if (retryable === 'yes') return 'Retryable';
  if (retryable === 'no') return 'Not retryable';
  return 'Retryable — it depends';
}

type BadgeTone = 'neutral' | 'accent';

function InfoBadge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const toneClass =
    tone === 'accent'
      ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
      : 'border-[var(--color-border)] text-[var(--color-muted)]';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {label}
    </span>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-fg)]'
          : 'border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-fg)] hover:bg-[var(--color-border)]'
      }`}
    >
      {label}
    </button>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </span>
      <div className="text-sm text-[var(--color-fg)]">{children}</div>
    </div>
  );
}

function StatusDetail({ entry }: { entry: StatusCodeEntry }) {
  const deepLink = useCallback(
    () => `${window.location.origin}${window.location.pathname}${hashForCode(entry.code)}`,
    [entry.code],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-mono text-2xl font-semibold text-[var(--color-fg)]">
            {entry.code} <span className="font-sans text-lg font-medium">{entry.reason}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <InfoBadge label={entry.statusClass} />
            {!entry.official && <InfoBadge label="Unofficial" />}
            <InfoBadge label={retryLabel(entry.retryable)} tone={entry.retryable === 'yes' ? 'accent' : 'neutral'} />
            <InfoBadge
              label={entry.cacheableByDefault ? 'Cacheable by default' : 'Not cacheable by default'}
              tone={entry.cacheableByDefault ? 'accent' : 'neutral'}
            />
          </div>
        </div>
        <CopyButton getText={deepLink} label="Copy link" copiedLabel="Copied!" />
      </div>

      <DetailRow label="Summary">{entry.summary}</DetailRow>
      <DetailRow label="When to use / common causes">{entry.causes}</DetailRow>

      {entry.retryNote && <DetailRow label="Retry notes">{entry.retryNote}</DetailRow>}

      <DetailRow label="Spec reference">
        <span className="font-mono text-sm">{entry.spec}</span>
      </DetailRow>

      <DetailRow label="Related headers">
        {entry.relatedHeaders.length === 0 ? (
          <span className="text-[var(--color-muted)]">None specific to this status.</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {entry.relatedHeaders.map((header) => (
              <code
                key={header}
                className="rounded border border-[var(--color-border)] bg-[var(--color-panel)] px-1.5 py-0.5 font-mono text-xs"
              >
                {header}
              </code>
            ))}
          </div>
        )}
      </DetailRow>
    </div>
  );
}

function DecisionHelper({ onSelectCode, onClose }: { onSelectCode: (code: number) => void; onClose: () => void }) {
  const [nodeId, setNodeId] = useState(DECISION_START);
  const [history, setHistory] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);

  const node = DECISION_TREE[nodeId];

  const handleOption = useCallback(
    (option: DecisionOption) => {
      if (option.result !== undefined) {
        setResult(option.result);
        return;
      }
      if (option.next) {
        setHistory((prev) => [...prev, nodeId]);
        setNodeId(option.next);
      }
    },
    [nodeId],
  );

  const handleBack = useCallback(() => {
    setResult(null);
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      setNodeId(prev[prev.length - 1]);
      return prev.slice(0, -1);
    });
  }, []);

  const handleReset = useCallback(() => {
    setNodeId(DECISION_START);
    setHistory([]);
    setResult(null);
  }, []);

  const resultEntry = result !== null ? STATUS_BY_CODE.get(result) ?? null : null;

  return (
    <Panel
      title="Which status should I use?"
      actions={
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      }
    >
      {resultEntry ? (
        <div className="flex flex-col gap-3">
          <div className="text-sm text-[var(--color-muted)]">Suggested status code:</div>
          <div className="font-mono text-2xl font-semibold text-[var(--color-fg)]">
            {resultEntry.code} <span className="font-sans text-lg font-medium">{resultEntry.reason}</span>
          </div>
          <p className="text-sm text-[var(--color-fg)]">{resultEntry.summary}</p>
          <Toolbar>
            <Button
              variant="primary"
              onClick={() => {
                onSelectCode(resultEntry.code);
                onClose();
              }}
            >
              View full details
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Start over
            </Button>
          </Toolbar>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--color-fg)]">{node.question}</p>
          <div className="flex flex-col gap-1.5">
            {node.options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleOption(option)}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-left text-sm text-[var(--color-fg)] transition-colors hover:border-[var(--color-accent)]"
              >
                {option.label}
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <div>
              <Button variant="ghost" onClick={handleBack}>
                ← Back
              </Button>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

export function Tool() {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<ClassFilter>>(() => new Set());
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [helperOpen, setHelperOpen] = useState(false);

  useEffect(() => {
    const applyHash = () => {
      const code = parseCodeFromHash(window.location.hash);
      setSelectedCode(code !== null && STATUS_BY_CODE.has(code) ? code : null);
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const selectCode = useCallback((code: number | null) => {
    setSelectedCode(code);
    if (code === null) {
      if (window.location.hash !== '') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      return;
    }
    window.location.hash = hashForCode(code);
  }, []);

  const toggleFilter = useCallback((filter: ClassFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
  }, []);

  const filtered = useMemo(
    () => filterStatusCodes(STATUS_CODES, query, activeFilters),
    [query, activeFilters],
  );

  const selected = selectedCode !== null ? STATUS_BY_CODE.get(selectedCode) ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      <Toolbar>
        <input
          type="search"
          aria-label="Search status codes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by code or text (e.g. 404, rate limit)…"
          className="min-w-[200px] flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-1.5 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-accent)]"
        />
        <Button variant={helperOpen ? 'primary' : 'secondary'} onClick={() => setHelperOpen((prev) => !prev)}>
          Which status should I use?
        </Button>
      </Toolbar>

      <Toolbar>
        {CLASS_FILTERS.map((filter) => (
          <FilterChip
            key={filter}
            label={CLASS_FILTER_LABELS[filter]}
            active={activeFilters.has(filter)}
            onClick={() => toggleFilter(filter)}
          />
        ))}
      </Toolbar>

      {helperOpen && (
        <DecisionHelper onSelectCode={selectCode} onClose={() => setHelperOpen(false)} />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr] md:items-start">
        <Panel title={`Status Codes (${filtered.length})`} className="md:sticky md:top-4">
          <div className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto md:max-h-[65vh]">
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-sm text-[var(--color-muted)]">No status codes match your search.</p>
            ) : (
              filtered.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  onClick={() => selectCode(entry.code)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                    selectedCode === entry.code
                      ? 'border-[var(--color-accent)] bg-[var(--color-panel)]'
                      : 'border-transparent hover:bg-[var(--color-panel)]'
                  }`}
                >
                  <span className="flex items-center gap-2 overflow-hidden">
                    <span className="font-mono font-semibold text-[var(--color-fg)]">{entry.code}</span>
                    <span className="truncate text-[var(--color-muted)]">{entry.reason}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[var(--color-muted)]">
                    {entry.official ? entry.statusClass : 'Unofficial'}
                  </span>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel title={selected ? undefined : 'Details'}>
          {selected ? (
            <StatusDetail entry={selected} />
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              Select a status code from the list, search for one, or use the decision helper to see full
              details here.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
