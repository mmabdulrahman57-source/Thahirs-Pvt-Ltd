/** Normalize DATABASE_URL for Clever Cloud / serverless MySQL */

export function getDatabaseUrl() {
  let url = process.env.DATABASE_URL?.trim();
  if (!url) return undefined;

  url = url.replace(/^["']|["']$/g, '');

  const cleverCloud = /clever-cloud\.com/i.test(url);

  if (cleverCloud) {
    if (/sslaccept=/i.test(url)) {
      url = url.replace(/sslaccept=[^&]*/i, 'sslaccept=accept_invalid_certs');
    } else {
      url += url.includes('?') ? '&' : '?';
      url += 'sslaccept=accept_invalid_certs';
    }
    // Clever Cloud free tier allows max 5 connections — keep pool small
    if (!/connection_limit=/i.test(url)) {
      url += url.includes('?') ? '&' : '?';
      url += process.env.VERCEL ? 'connection_limit=1' : 'connection_limit=2';
    }
    if (!/pool_timeout=/i.test(url)) {
      url += '&pool_timeout=20';
    }
  } else if (/planetscale|aiven|railway|aws\.com|tidbcloud/i.test(url) && !/sslaccept=/i.test(url)) {
    url += url.includes('?') ? '&' : '?';
    url += 'sslaccept=strict';
  }

  return url;
}

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}
