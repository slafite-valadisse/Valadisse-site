# Valadisse marketing site

Static site, deployed by Netlify when `main` changes. `site-src/index.html` is the
one source for Home, Services, How It Works and Contact. `node scripts/build-blog.mjs`
generates the blog and, through `scripts/build-pages.mjs`, the served pages:
`index.html`, `services/`, `how-it-works/` and `contact/`, each with its own title,
description, canonical URL and JSON-LD (Organization on Home, FAQPage on Services,
built from the FAQ in the source). Output is committed; never edit the generated
pages by hand. The Google Search Console verification value goes in
`GOOGLE_SITE_VERIFICATION` in `scripts/build-pages.mjs`.

The canonical definition (`CANONICAL_DEFINITION` in `scripts/build-pages.mjs`) is
used verbatim on Home, on Services and in the Organization JSON-LD; check-claims
pins it. The product lives in a
separate repo (app.valadisse.com); the claims here have to stay true to it.

## Claims

One status vocabulary, the same as the pricing cards in the app: **Coming soon**.
("Rolling out" is retired in both repos.)

- A claim may be stated as live only if it has shipped and a customer can use
  it today (a service delivered by hand counts, if it is being delivered).
- Anything not live carries a **Coming soon** pill, and only the part that is
  not live is marked. A feature that is partly live is split: the live part is
  stated plainly, the not-live part gets its own sentence and the pill. Never
  mark a live thing as coming soon.
- The pill is `<span class="meta-pill status-pill" title="...">Coming soon</span>`.
  It is always the last pill in its row and sits at the end of its block, as the
  only content of its own line or the last child of a pill row. Never inside a
  paragraph, and never in a title.
- Every sentence describing a coming-soon feature is in the future tense ("will
  flag", "will add"). The status itself is carried by the pill only: the words
  "coming soon" and "rolling out" do not appear in prose.
- The app code decides the label. If a label here or on a pricing card
  contradicts what the app code does, the code wins: check `origin/main` of the
  app repo (search for the feature) before choosing or changing a label.
- When a feature ships, update its row below and drop the pill in the same
  change. When a claim is removed, move it to "Removed" so it is not reinstated.
- A revenue range is stated as one conditional range per scan, never per
  finding or per gap. It is conditional on correcting the issues the scan
  found, and it is a CPM rate range: no dollar total is claimed from a domain
  scan alone.
- Pro's call to action is "Apply for Founding Access" until every Coming soon
  feature ships. Pro is not offered as a self-serve purchase here or in the
  app before then. Every Founding Cohort or Founding Access button and label
  reads exactly "Apply for Founding Access"; there is no "Apply Now" variant.
- Scope: Valadisse works from the ads.txt file a site publishes and, for
  Starter, the ad server reports a customer uploads. No claim about ad formats,
  devices or "integrated strategy"; check-claims bans them.
- Copy is in the third person, with no em dashes, no scoring formulas and no
  vendor names. Never "continuous", "around the clock", "unlimited" or "beta".
- `node scripts/check-claims.mjs` fails if a removed claim comes back, if the
  vocabulary, pill placement or future-tense rules are broken, or if the pill
  count drifts from the table below.

### Live

| Claim | Where | Basis |
|---|---|---|
| The free scan reads a site's declared supply-chain files (ads.txt) and returns a Supply Chain Health Score, a floor signal and how many premium exchanges are missing | Home, How It Works | App `/scan`, no signup |
| Starter names the missing exchanges and shows the same top findings as the free scan | Home, Services, How It Works | App, Starter plan |
| Change detection: each rescan is compared against the last, so a change to declared sellers is flagged when the publisher scans (on demand, in Starter) | Home, Services, How It Works | App scan comparison; listed under Starter in the app's pricing claims |
| Upload a Google Ad Manager export and chart revenue, eCPM and fill | How It Works | App `/reports` and dashboard upload |
| Onboarding session to map priorities (Pro, set up by hand) | Services, How It Works | Manual service |
| Advisory engagements are scoped individually and priced by engagement: vendor stack review, contract and revenue-share review, identity and addressability strategy, a neutral second opinion | Services, How It Works | Manual service; matches the app's Advisory card and lead form |
| Identity and addressability, and market intelligence (advisory work) | Home, Services | Manual service. Market intelligence is not on the app's Advisory card; confirm before expanding |
| Community-driven publishers are the primary audience | Home (Who this is for) | Positioning decision (Stephan, 2026-10-21). The scan and the report upload work from any site's ads.txt and a Google Ad Manager export; nothing is built for a specific publisher type |
| Customers run programmatic inventory declared in an ads.txt file | Home (Who this is for) | The free scan reads ads.txt |
| Scheduled monitoring on a daily, weekly or monthly cadence, with a change alert emailed the day ads.txt or the supply chain changes (Pro) | Home, Services, How It Works | App PR 17: daily scheduled job; Pro card lists both as live |
| Weekly report by email with the latest scan and what changed (Starter) | How It Works, Services FAQ | App PR 17; Starter card |
| The Floor Optimization Index and the report-based Demand Diversity scores are calculated from the uploaded ad server report (Starter) | How It Works, Services FAQ | App PR 27, live on /reports |
| Data is encrypted in transit and at rest | Services | Supabase documents "all customer data is encrypted at rest with AES-256 and in transit via TLS" (supabase.com/security) and "data is encrypted at rest and in transit by Supabase" (docs, shared responsibility model). Scope: the app's HTTPS traffic and the hosted database; direct database connections do not enforce SSL unless switched on |
| Uploaded data is never used to train any model | Services | Privacy page: no model processes uploaded data today |

### Coming soon (the part that is not live; "Coming soon" pill)

| Claim (future tense) | Where | Basis in the app code |
|---|---|---|
| Same-day anomaly alerts and detection will flag anomalies the day they appear | Home (differentiation) | None for anomalies (a partner underdelivering, a floor misconfiguration, timeouts). Change alerts on ads.txt and the supply chain are live and are a separate claim |
| Publisher-controlled curation: deal packages will be built through the publisher's supply partners | Home tile, Services (Act stage) | None; the scan only reports whether curation-ready sellers are declared |
| Yield Assistant will answer yield questions in plain English and suggest next steps | Services (hero flow, Act stage, legend, example step 4) | App pricing card marks it Coming soon; v1 not built |

### Removed (do not reinstate without a shipped feature behind it)

AI agents that continuously monitor news, releases and transcripts; engines that
are swapped as better ones appear; scan history that feeds predictions and
makes the system more accurate over time; "AI-native" and "AI-assisted
tooling"; responding the same day; "sees across every exchange" (the scan reads
declared files only); "evolving AI infrastructure"; Priority support; change
detection listed under Pro; the structured intake (retired); "advisory add-on
on top of any tier" and "not standalone retainers"; "the only practice" and
"no display-first practice can match"; "ad ops function, without the
overhead"; "continuous" monitoring; acting on developments faster than
enterprise vendors; indexes built on IAB standards (unverifiable as worded);
"the same monitoring that keeps the platform current"; "US-based" as a requirement or description of the audience (anywhere: copy, meta, footer); any revenue floor, band or "secondary pool" for the audience ("$500K+", "$250K to $5M+"; Stephan, 2026-11-10: the audience is stated without a dollar figure); the claim that all four ICPs qualify ("audio/podcast, app-first, newsletter-led, or community-driven publishers all qualify", "any distribution model"); every audio, podcast, streaming, DAI and app-first statement (the Audio & Podcast Yield service and tile, "including audio", "audio sellers included", "tell us you're audio-first", the DAI and podcast experience sentence, "display, native, audio, or video"); newsletter-led as a named audience; "how much premium demand" (the free scan counts exchanges, it does not size demand); "revenue-impact ranges", "revenue range on every finding", "revenue range to your results" and "complete findings" with "every gap named" (Starter shows the same top findings and the same single CPM opportunity card as free, and adds the exchange names); "annualised figure". None of these come back until the tooling for that publisher type exists; `scripts/check-claims.mjs` enforces it.
