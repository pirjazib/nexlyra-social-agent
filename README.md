# NEXLYRA SOCIAL AGENT 2.1 — Netlify Serverless

A deployable Netlify application for **personal** LinkedIn and X accounts. Fully redesigned in Node.js; **not** the older Python/Streamlit program uploaded unchanged.

## What's included

- Modern private web dashboard with post editing, approval, manual publishing, emergency pause, run logs, and account readiness indicators.
- UTC-based Netlify Scheduled Functions for **09:00 IST (03:30 UTC)** and **18:00 IST (12:30 UTC)**, routed to a Background Function to avoid scheduled-function 30-second runtime limit.
- Netlify Blobs site-wide store for drafts, publication history, and settings across deploys.
- Editorial AI integration using OpenAI API (optional fallback writing library if unset).
- Current headline discovery via Google News RSS (headlines only; not verified reporting), with cautious prompt rules.
- Original, programmatically designed PNG editorial graphics using SVG + sharp. Some posts automatically text-only; dashboard can override.
- Official LinkedIn REST posts/images endpoints and X v2 posts/media endpoints with OAuth 1.0a.
- Separate success/error records per destination; no silent downgrade from image to text.

## Quick deployment (no Linux, SSH, VPS, or Docker)

1. Unzip this project. Create a **private** GitHub repository and upload the *contents* (root should contain `package.json`, `netlify.toml`, `public/`, `netlify/`, `lib/`). Never upload your `.env` file.
2. Log into [Netlify](https://app.netlify.com/) → **Add new project** → **Import an existing project** → GitHub → choose the repository.
3. Build settings: **build command empty**, **publish directory `public`**. Netlify should detect `netlify.toml` and install NPM dependencies.
4. Under **Project configuration → Environment variables**, add these values (`.env.example` has the names):
   - `DASHBOARD_PASSWORD`: a long, unique admin password.
   - `SESSION_SECRET`: a separate 32+ character random secret for signed login cookies.
   - `CRON_SECRET`: a separate 32+ character random secret for dispatching background jobs.
   - `OPENAI_API_KEY` and optional `OPENAI_MODEL` for non-template writing.
   - `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_AUTHOR_URN` (`urn:li:person:...`) for personal LinkedIn.
   - `LINKEDIN_VERSION` e.g. `202610` (update when no longer supported).
   - `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` with write permissions for X.
5. **Deploy**. If you edit variables later, trigger a new production deploy so functions receive them.
6. Visit the `.netlify.app` address, log in, create a draft, inspect the content and graphic, approve it, and manually publish to each account as a **test**.
7. Open **Netlify → Logs / Functions** to view `morning`, `evening`, and `worker-background`. The schedule only triggers on the production deploy. You can test each scheduled function with **Run now** from Netlify's function page.
8. In the dashboard, enable **Auto publish** and choose **Approval required** on/off. Recommended: leave approval enabled for developing news and crisis topics. The emergency pause prevents publishing.

## Scheduling

- `morning` → `30 3 * * *` = **09:00 IST** every day.
- `evening` → `30 12 * * *` = **18:00 IST** every day.

All Netlify cron times are UTC. Netlify may delay scheduled execution; this is not a hard real-time guarantee.

## Critical operational notes

- Your site and agent are **not running yet** simply because this ZIP exists. Deploy and provide secrets first.
- AI API, LinkedIn API access, and X API usage may have separate charges/permissions even if Netlify stays in free-tier allowance. Netlify's free plan has usage quotas; verify current limits in Billing.
- All posts are personal-profile posts, not Nexlyra company-page announcements. Nexlyra Studio is described as a planned/early-stage project, never an invented established success.
- Headlines are unverified RSS candidates. Use approval for geopolitical crises, emergencies, health, law and similar high-stakes claims. Review links independently.
- Graphics are original **branded designs**, not photographs. No AI-detector evasion or guarantee is claimed.
- The dashboard is protected by a password + signed HttpOnly cookie. For sensitive business deployment, use additional access controls. Public production login endpoints can be brute-forced; Netlify edge/WAF or another identity layer is recommended.
- Netlify Blobs is a key/value store, not a transactional database. This personal, low-volume implementation uses object-per-post storage and a read-before-run check. In rare overlaps or retries, duplicate publishing is possible; 'publishing' and 'review_required' states block automatic retries, but external API errors after acceptance can be ambiguous. Inspect platform before any manual retry.
- To retry a post whose platform status shows `review_required`, create a *new* draft **only after** confirming no live post was created. The dashboard intentionally doesn't blindly retry uncertain requests.
- Scheduled function delegates to background function, because scheduled functions have a 30-second limit. Background functions support longer processing but count against usage and have eventual execution/retry semantics.
- Media uploads, especially X media processing, can take time. If an X image finalize request reports processing, the app conservatively marks the network as needing review rather than publishing media prematurely.
- There is no real-time social analytics endpoint or automated follower interactions in this version; run logs show publishing outcomes, not impressions.
- Auto publisher reuses the day's existing morning/evening draft, if present; it doesn't post a new duplicate automatically if previously published.

## Local development and tests

Requires Node.js 22+.

```bash
npm install
npm run check
npx netlify dev
```

Set local `.env` values only on your computer and never commit them. For hosted Netlify Blobs you need the Netlify context credentials supplied by Netlify runtime/CLI.

## Troubleshooting

- **Dashboard unauthorized:** verify `DASHBOARD_PASSWORD`, `SESSION_SECRET`; redeploy after editing environment variables.
- **Background fails / no draft:** check Netlify Functions logs, `CRON_SECRET`, background function availability and Netlify Blobs usage.
- **LinkedIn 401/403:** token expired, missing `w_member_social`, incorrect personal author URN, or unsupported LinkedIn-Version.
- **X 401/402/403:** account API plan, OAuth 1.0a write scopes, token, and product permissions.
- **X image error:** media upload endpoint/permission/processing restrictions vary by developer tier; test your account and consider text-only posts until verified.
- **More than free-tier quota:** check Netlify plan and account usage; this project is designed to be low-usage but cannot guarantee zero cost.
