# 🛡️ Threat model

Scope: browser password generation/analysis, the entropy display fix and its build/release pipeline. Assets: plaintext passwords, generation randomness, correct security guidance, preference integrity and deployment authority. Actors: legitimate users, malicious pasted inputs, browser extensions, compromised dependencies/hosting, untrusted PR contributors and maintainers.

| Entry / trust boundary | Abuse or failure | Control and verification | Residual risk |
| --- | --- | --- | --- |
| Password input → analyser → DOM | Script execution or leaking pasted data | Numeric results and fixed feedback; safe `textContent` rendering; hostile-input unit/browser tests; no outgoing request bodies | Hostile extensions/compromised page code remain outside the guarantee |
| CSPRNG → index/pool/shuffle | Weak random fallback, modulo bias, provider failure | Web Crypto only, 32-bit rejection sampling; failure/biased-tail tests and SAST ban on `Math.random` | Tests do not certify the browser's random implementation or exact output distribution |
| Generated/pasted string → bit estimate | Different values between modes, stale result, false confidence | One analyser for both displays; controller/browser round-trips; pending-generation isolation; shared **Estimated entropy** label | Existing character heuristic substantially overstates many passphrases; see review PF-005 |
| Same-origin wordlist → parser/generator | Invalid entries, substitution collisions, failed fetch | Existing ASCII parser and deduplication, usable-count tests, fetch error/retry browser test | Four hyphenated EFF entries skipped; library callers can supply large inputs |
| localStorage → preference sanitiser | Corrupt JSON, expired data, injected extra password fields | Allowlisted fields, expiry and fallback paths tested; real browser privacy check | Delimiter is intentionally stored as a preference; no secure-memory erase guarantee |
| Copy button → system clipboard | Unintended disclosure to clipboard readers | Explicit user action; no automatic clipboard writes in reviewed source | Clipboard managers and device compromise |
| Mode events → asynchronous generation | Generator writes over active Analyse result | Active-mode checks before metrics and error-feedback updates; failing-before/fixed-after controller test | Generation requests within Generate can still finish out of order during slow wordlist loading; tracked PF-012 |
| PR/source/dependencies → CI | Untrusted code uses privileged token, skipped checks, supply-chain changes | Read-only defaults, no secrets inheritance, no `pull_request_target`, pinned actions, locked npm deps, blocking scans | Workflow changes need human review; scanner Python dependencies are not fully hash-locked |
| Build → Pages artifact → production | Publish untested source, docs/secrets, different revision | Public-only byte-preserving build, hashes, manual exact-SHA check, full reusable CI, isolated deployment job | Environment reviewers/branch protections and hosted run must be confirmed before release |
| Hosting → browser | Script injection, framing or insecure delivery | Existing HTTPS observed; same-origin static assets | No CSP observed; hosting/header configuration remains outstanding |

## Failure and containment

No weak-random fallback or remote analysis fallback is permitted. Generation errors are shown locally and do not submit inputs. Wordlist errors reset the cached promise to permit retry. Pending generation while Analyse is active must leave its displayed metrics/feedback alone.

If hosting or a runtime dependency is compromised, suspend public serving, preserve only safe metadata, patch the code, and advise affected users through the owner's incident process; never request that users submit passwords for investigation. Roll back a known-good site artifact/source under explicit owner authorisation, revalidate and smoke test. An old artifact with a known exploitable defect is not an acceptable security rollback.

Human owner approval is pending for any public release of this T2 package. No exception or approval is implied by a local successful test or by receipt of the ZIP.
