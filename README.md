# Valadisse site

Static marketing site for valadisse.com, deployed by Netlify when `main`
changes. See `CLAUDE.md` for the claims rules and `scripts/build-blog.mjs` for
the blog generator.

## DNS and certificates

DNS is at Squarespace. Never add a wildcard domain alias in Netlify. Never
activate a Netlify DNS zone for valadisse.com. Certificates are standard HTTP-01
for valadisse.com and www only. If the certificate fails, do not click Renew
repeatedly, as it triggers Let's Encrypt rate limits.
