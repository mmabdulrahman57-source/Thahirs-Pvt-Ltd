/** Normalize DATABASE_URL for Clever Cloud / serverless MySQL */

export function getDatabaseUrl() {
  let url = process.env.DATABASE_URL?.trim();
  if (!url) return undefined;

  const cleverCloud = /clever-cloud\.com/i.test(url);
  const cloudHost = cleverCloud || /planetscale|aiven|railway|aws\.com|tidbcloud/i.test(url);
  if (cloudHost && !/sslaccept=|ssl-mode=|sslmode=/i.test(url)) {
    url += url.includes('?') ? '&' : '?';
    // Clever Cloud uses a cert chain that fails strict verification on Vercel/Node
    url += cleverCloud ? 'sslaccept=accept_invalid_certs' : 'sslaccept=strict';
  }

  if (process.env.VERCEL && !/connection_limit=/i.test(url)) {
    url += url.includes('?') ? '&' : '?';
    url += 'connection_limit=5&pool_timeout=20';
  }

  return url;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}
