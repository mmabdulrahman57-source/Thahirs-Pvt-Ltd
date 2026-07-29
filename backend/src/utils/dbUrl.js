/** Normalize DATABASE_URL for Clever Cloud / serverless MySQL */

export function getDatabaseUrl() {
  let url = process.env.DATABASE_URL?.trim();
  if (!url) return undefined;

  // Remove wrapping quotes from pasted values
  url = url.replace(/^["']|["']$/g, '');

  const cleverCloud = /clever-cloud\.com/i.test(url);

  if (cleverCloud) {
    // Always force accept_invalid_certs — Clever Cloud cert chain fails on Vercel/Node
    if (/sslaccept=/i.test(url)) {
      url = url.replace(/sslaccept=[^&]*/i, 'sslaccept=accept_invalid_certs');
    } else {
      url += url.includes('?') ? '&' : '?';
      url += 'sslaccept=accept_invalid_certs';
    }
  } else if (/planetscale|aiven|railway|aws\.com|tidbcloud/i.test(url) && !/sslaccept=/i.test(url)) {
    url += url.includes('?') ? '&' : '?';
    url += 'sslaccept=strict';
  }

  if (process.env.VERCEL && !/connection_limit=/i.test(url)) {
    url += url.includes('?') ? '&' : '?';
    url += 'connection_limit=5&pool_timeout=20';
  }

  return url;
}

export function hasDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(url);
}
