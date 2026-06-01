import { Email } from '../types';

// ── types ─────────────────────────────────────────────────────────────────────

interface Condition {
  from?: string;
  to?: string;
  has?: string;
  category?: string;
  olderThan?: number;   // days
  newerThan?: number;   // days
  largerThan?: number;  // bytes
  smallerThan?: number; // bytes
  label?: string;
  subject?: string;
  filename?: string;
  text?: string;
  is?: string;
  negate?: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function parseDate(str: string): Date | null {
  const d = new Date(str.replace(/\//g, '-'));
  return isNaN(d.getTime()) ? null : d;
}

function parseSize(value: string, unit: string): number {
  let bytes = parseFloat(value);
  switch (unit.toLowerCase()) {
    case 'k': bytes *= 1024; break;
    case 'm': bytes *= 1024 * 1024; break;
    case 'g': bytes *= 1024 * 1024 * 1024; break;
  }
  return bytes;
}

function parseDays(amount: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'w': return amount * 7;
    case 'm': return amount * 30;
    case 'y': return amount * 365;
    default:  return amount;
  }
}

// ── token parser ──────────────────────────────────────────────────────────────

function parseCondition(token: string): Condition | null {
  const negate = token.startsWith('-');
  const t = negate ? token.slice(1) : token;

  const match = (re: RegExp) => t.match(re);

  let m: RegExpMatchArray | null;

  if ((m = match(/^from:(.+)/i)))      return { from: m[1].toLowerCase(), negate };
  if ((m = match(/^to:(.+)/i)))        return { to: m[1].toLowerCase(), negate };
  if ((m = match(/^has:(.+)/i)))       return { has: m[1].toLowerCase(), negate };
  if ((m = match(/^category:(.+)/i)))  return { category: m[1].toLowerCase(), negate };
  if ((m = match(/^subject:(.+)/i)))   return { subject: m[1].toLowerCase(), negate };
  if ((m = match(/^filename:(.+)/i)))  return { filename: m[1].toLowerCase(), negate };
  if ((m = match(/^label:(.+)/i)))     return { label: m[1].toLowerCase(), negate };
  if ((m = match(/^is:(.+)/i)))        return { is: m[1].toLowerCase(), negate };

  if ((m = match(/^older_than:(\d+)([dwmy])/i)))
    return { olderThan: parseDays(+m[1], m[2]), negate };
  if ((m = match(/^newer_than:(\d+)([dwmy])/i)))
    return { newerThan: parseDays(+m[1], m[2]), negate };

  if ((m = match(/^larger:(\d+(?:\.\d+)?)([kmg]?)/i)))
    return { largerThan: parseSize(m[1], m[2]), negate };
  if ((m = match(/^smaller:(\d+(?:\.\d+)?)([kmg]?)/i)))
    return { smallerThan: parseSize(m[1], m[2]), negate };

  // after: / before: handled separately → return as olderThan/newerThan equivalent
  if ((m = match(/^after:([\d\/\-]+)/i))) {
    const d = parseDate(m[1]);
    if (d) return { newerThan: -1, _afterDate: d } as Condition & { _afterDate: Date };
    return null;
  }
  if ((m = match(/^before:([\d\/\-]+)/i))) {
    const d = parseDate(m[1]);
    if (d) return { olderThan: -1, _beforeDate: d } as Condition & { _beforeDate: Date };
    return null;
  }

  // Quoted phrase
  if ((m = t.match(/^"(.+)"$/))) return { text: m[1].toLowerCase(), negate };

  // Plain text
  if (t.length > 0) return { text: t.toLowerCase(), negate };

  return null;
}

// ── tokenizer — splits on spaces but respects quotes ─────────────────────────

function tokenize(query: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote = false;

  for (const char of query) {
    if (char === '"') { inQuote = !inQuote; current += char; }
    else if (char === ' ' && !inQuote) {
      if (current) { tokens.push(current); current = ''; }
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

// ── condition matcher ─────────────────────────────────────────────────────────

type ExtCondition = Condition & { _afterDate?: Date; _beforeDate?: Date };

function emailMatchesCondition(email: Email, cond: ExtCondition): boolean {
  let result = true;

  if (cond.from !== undefined) {
    // Support domain wildcard: @firma.pl
    if (cond.from.startsWith('@')) {
      result = email.sender.toLowerCase().includes(cond.from);
    } else {
      result = email.sender.toLowerCase().includes(cond.from) ||
               email.senderName.toLowerCase().includes(cond.from);
    }
  }

  if (result && cond.to !== undefined) {
    // In simulator we fake "to" as always matching "me"
    result = cond.to === 'me' || cond.to === 'mnie';
  }

  if (result && cond.has === 'attachment') result = email.hasAttachment;

  if (result && cond.category !== undefined) result = email.category === cond.category;

  if (result && cond.subject !== undefined)
    result = email.subject.toLowerCase().includes(cond.subject);

  if (result && cond.filename !== undefined) {
    result = !!email.attachmentName &&
      email.attachmentName.toLowerCase().includes(cond.filename);
  }

  if (result && cond.label !== undefined)
    result = email.labels.some(l => l.toLowerCase().includes(cond.label!));

  if (result && cond.is !== undefined) {
    if (cond.is === 'unread')     result = !email.isRead;
    else if (cond.is === 'read')  result = email.isRead;
    else if (cond.is === 'starred') result = email.starColor !== 'none';
    else if (cond.is === 'important') result = email.starColor !== 'none';
    else if (cond.is === 'muted') result = !!email.isMuted;
  }

  if (result && cond.olderThan !== undefined && cond.olderThan >= 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - cond.olderThan);
    result = new Date(email.date) < cutoff;
  }
  if (result && cond._beforeDate) {
    result = new Date(email.date) < cond._beforeDate;
  }

  if (result && cond.newerThan !== undefined && cond.newerThan >= 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - cond.newerThan);
    result = new Date(email.date) >= cutoff;
  }
  if (result && cond._afterDate) {
    result = new Date(email.date) >= cond._afterDate;
  }

  if (result && cond.largerThan !== undefined) {
    result = email.hasAttachment && (email.attachmentSize ?? 0) >= cond.largerThan;
  }
  if (result && cond.smallerThan !== undefined) {
    result = email.hasAttachment && (email.attachmentSize ?? 0) <= cond.smallerThan;
  }

  if (result && cond.text !== undefined) {
    result = email.subject.toLowerCase().includes(cond.text) ||
             email.body.toLowerCase().includes(cond.text) ||
             email.sender.toLowerCase().includes(cond.text) ||
             email.senderName.toLowerCase().includes(cond.text);
  }

  return cond.negate ? !result : result;
}

// ── main filter ───────────────────────────────────────────────────────────────

export function filterEmails(emails: Email[], query: string): Email[] {
  const trimmed = query.trim();
  if (!trimmed) return emails;

  // Split on " OR " (case-insensitive) for top-level OR
  const orParts = trimmed.split(/\s+OR\s+/i);

  if (orParts.length > 1) {
    // Union of all OR branches
    const sets = orParts.map(part => filterEmails(emails, part));
    const seen = new Set<string>();
    const result: Email[] = [];
    for (const set of sets) {
      for (const e of set) {
        if (!seen.has(e.id)) { seen.add(e.id); result.push(e); }
      }
    }
    return result;
  }

  // Handle {term1 term2} — curly-brace OR grouping
  const curlyMatch = trimmed.match(/\{([^}]+)\}/);
  if (curlyMatch) {
    const terms = curlyMatch[1].trim().split(/\s+/);
    const outside = trimmed.replace(curlyMatch[0], '').trim();
    const baseEmails = outside ? filterEmails(emails, outside) : emails;
    return baseEmails.filter(email =>
      terms.some(term =>
        email.subject.toLowerCase().includes(term.toLowerCase()) ||
        email.body.toLowerCase().includes(term.toLowerCase())
      )
    );
  }

  const tokens = tokenize(trimmed);
  const conditions = tokens
    .map(t => parseCondition(t))
    .filter((c): c is ExtCondition => c !== null);

  return emails.filter(email =>
    conditions.every(cond => emailMatchesCondition(email, cond))
  );
}

// ── legacy parse export (used by task validators) ─────────────────────────────

export function parseSearchQuery(query: string) {
  // Thin wrapper returning raw query for validators that check query strings directly
  return { raw: query.toLowerCase() };
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
