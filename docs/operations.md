# 🛠️ Operations and release

## Deployment prerequisites

1. Import and review the prepared source, especially `main.js`, dependencies, scanners and workflows. Read `review.md` and the current `verification.md`.
2. Confirm GitHub Pages uses Actions and the existing domain `password.git.safesploit.com`. Build output includes the unchanged root `CNAME`; no DNS change is required by this patch.
3. Configure required CI status checks for the source-quality, Node 24/26, all three browser and security jobs; restrict workflow/policy changes to reviewed contributions.
4. Configure `github-pages` environment protection with the human owner or authorised reviewer, and restrict deployment branches to `main`. A typed SHA identifies source; it does not authenticate the person approving it. Confirm the repository's plan supports the chosen environment protection.
5. Resolve release blockers, confirm private security reporting, address the hosting CSP requirement or obtain a permissible recorded owner exception, and record the T2 owner release decision against the exact reviewed source.

None of these account/DNS/hosting settings were changed while preparing the ZIP. The visible rulesets endpoint returned an empty list. Classic branch protection could not be read through the connection (403), so its status is unknown.

## Release path

Run **Reviewed Pages deployment** manually from `main`, entering the full approved 40-character source SHA. The workflow verifies the branch and SHA, reruns every required CI job for that revision, builds a public-only Pages artifact and deploys that same artifact after the protected environment permits it. No push-only production deploy remains.

The owner must create any desired `v1.1.1` tag/release separately after review and validation. The ZIP changes package/changelog versioning but does not create a Git tag. CI records the source commit, asset SHA-256 hashes and a CycloneDX development dependency SBOM as build evidence, outside `dist/`. The development SBOM is not an inventory of browser runtime npm packages, because none are shipped.

## Hosting policy

Serve only `dist/` over HTTPS with suitable MIME types. The local Node/Python servers are for development. Suggested hosting-header starting point, to test before enabling:

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```

GitHub Pages does not offer arbitrary response headers through this repository alone. If the hosting path cannot supply an effective policy, choose a supported header mechanism or separately scope an appropriate document CSP, noting that `frame-ancestors` requires a response header. This patch preserves website HTML and does not claim a header policy was deployed. Do not deploy an untested CSP or broad `unsafe-inline` workaround merely to claim compliance.

## Post-deployment verification

- Check HTTPS status, domain/certificate, JS/CSS/favicon and wordlist requests, and absence of unexpected third-party connections.
- Generate a random password and a memorable passphrase; paste each into Analyse and confirm equal estimates. Exercise keyboard navigation and mobile layout.
- Confirm password strings stay out of localStorage/sessionStorage, URLs, server logs and telemetry. Use synthetic inputs; do not capture user passwords in monitoring.
- Check effective security headers and that docs, tests, dependency manifests and CI reports are absent from the public root.

## Maintenance and monitoring

Owner: Zepher Ashe or a delegated human maintainer. Dependabot configurations propose weekly npm/Actions updates; there is no automatic merge. Check open advisories and failing gates weekly and at each release. Review the temporary minimatch override by **2026-12-06**, policy at least every 90 days, and after material incidents/toolchain changes.

Availability/asset/wordlist checks and privacy-aware external monitoring are appropriate for this static site, but no uptime service, alert destination or scheduled monitoring was provisioned. There are no application databases or user-password backups. Preserve source and known-good build evidence through normal repository/artifact retention.

## Rollback and incidents

Record the previous deployed revision and retain its safe artifact before releasing. Under explicit owner authorisation, redeploy an approved known-good artifact or revert the relevant commit, run the same gates and perform smoke checks. A source revert does not reverse passwords already copied elsewhere. Preserve the domain/CNAME and do not delete preferences or browser data unless that is an explicitly authorised incident action.

For suspected malicious JavaScript or insecure generation, suspend serving where necessary, investigate without collecting passwords, remediate, verify, and use the owner's incident communication process. Do not resume a known exploitable older build solely because it was once called stable.
