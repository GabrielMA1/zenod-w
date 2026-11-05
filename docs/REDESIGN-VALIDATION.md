# Redesign validation

Validated against the production Vite build with `SITE_BASE_PATH=/` and `SITE_BASE_URL=https://zenodetail.com/`.

- `npm run qa`: production build, source audit and distribution audit passed for all 46 generated routes; all four Node regression tests passed. The sitemap now contains 20 public URLs, including both delivery-information pages.
- Browser validation: 54 checks passed across English/EUR and Romanian/RON, desktop, mobile and 320-pixel layouts. Coverage includes all public pages, loading every visible image, search, the three-view gallery and zoom, bag quantity/subtotals/removal, persistence, currency switching, mobile navigation and static product content without JavaScript. No browser errors were observed.
- Accessibility: eight home/product combinations across both languages and desktop/mobile passed with zero violations for WCAG 2 A/AA, 2.1 AA and the additional visible-label/accessibility-name check. Automated scans supplement keyboard and visual review; they do not constitute complete accessibility certification.
- `git diff --check`: passed.
- Deployment verification script: shell syntax check passed. The workflow checks the served build-revision against the exact deployed commit, then checks assets, bilingual routes and the custom 404.

Lighthouse 13.6.0 mobile results using simulated throttling:

| Page | Performance | Accessibility | Best practices | SEO | Largest Contentful Paint | Layout shift |
| --- | --- | --- | --- | --- | --- | --- |
| English homepage | 99 | 100 | 100 | 100 | 2.0 seconds | 0 |
| Romanian product | 96 | 100 | 100 | 100 | 2.7 seconds | 0 |

These are local lab measurements of the production bundle, not field performance or a search-ranking guarantee.

Current screenshots, browser results and Lighthouse HTML/JSON reports are saved under `/workspace/.cloud-setup/zenod-w/evidence/refined/`; the build/audit log is `/workspace/.cloud-setup/zenod-w/refined-qa.log`. The earlier redesign evidence remains under `evidence/redesign/`. Local evidence and optional QA tools are outside the application repository.

## Publication and ordering

The existing GitHub Pages workflow publishes `main` to `https://zenodetail.com/`. Its final verification job checks the live domain; workflow status can be read from the public GitHub Actions run page. Direct requests to the domain and GitHub API from the current cloud runtime require the saved network additions to be applied. Review and save the environment settings, then publish the environment to apply that configuration. This is separate from the repository's website deployment.

Stripe is selected but not connected. Real orders still require hosted checkout and webhook integration, actual shipping quotes outside Romania, stock and seller information. Warehouse/office details are pending. See [Pricing and ordering handoff](PRICING-AND-LAUNCH.md). Competitor prices remain unverified because the runtime denied access to Flash Detail.
