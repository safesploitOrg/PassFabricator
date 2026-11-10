# 🗂️ Version and commit provenance

Source reviewed: `64dafd372bc20cb5ebfe73beb4cdcc5f7a641524`, default branch `main`. Full history was cloned; all 18 commits below were inspected. Dates are author dates converted to Europe/London, not invented release dates.

| Recorded version | Evidence | Treatment |
| --- | --- | --- |
| `v1.0.0-local-standalone` | Actual tag at `d4651f27d762d736d4376efbf561f78a8e426e28`, 2024-12-02 | Keep literal historical version |
| `v1.1` | Actual tag at `64dafd372bc20cb5ebfe73beb4cdcc5f7a641524`, 2026-06-23 | Normalise to `1.1.0` in changelog; retain original tag |
| Commit titled `v1.1` | `7354f23e5f78e4c613dfc375ec911610d0a34d7f`, 2026-05-28 | Implementation milestone; not the final tag target |
| Upstream package `1.0.0` | Package and lockfile at baseline | Stale metadata, not evidence of a later release |
| Prepared `1.1.1` | This ZIP, 2026-11-06 | Patch version; no tag, push, GitHub release or deployment performed |

## Complete source history

| London date | Commit | Subject |
| --- | --- | --- |
| 2024-11-12 | [`9afb0d2`](https://github.com/safesploitOrg/PassFabricator/commit/9afb0d2e507d6904613dcbd2388dab0deec9b123) | initial |
| 2024-11-12 | [`32175fe`](https://github.com/safesploitOrg/PassFabricator/commit/32175fe3ba4438561413e5f92ddd17c15ca3eb0f) | feature |
| 2024-11-12 | [`990a83d`](https://github.com/safesploitOrg/PassFabricator/commit/990a83d40406eb36fa259352dea9a64b64cd295e) | entropy |
| 2024-11-12 | [`44671b4`](https://github.com/safesploitOrg/PassFabricator/commit/44671b45844228a363458c4b8689537d62cb3483) | Style |
| 2024-11-12 | [`c329ae2`](https://github.com/safesploitOrg/PassFabricator/commit/c329ae2b6ed0633b16f80152e3df35c822e76892) | Create CNAME |
| 2024-11-12 | [`7b2bcf1`](https://github.com/safesploitOrg/PassFabricator/commit/7b2bcf1941066fe9c7a0b4db16cd9171a574600d) | Delete CNAME |
| 2024-11-12 | [`4aa57f5`](https://github.com/safesploitOrg/PassFabricator/commit/4aa57f5217be194cfef3ea6e569811440326b490) | Create CNAME |
| 2024-12-02 | [`5505706`](https://github.com/safesploitOrg/PassFabricator/commit/5505706aa4764008821dacf25b4b5543b8ff54f7) | Create .gitignore |
| 2024-12-02 | [`d4651f2`](https://github.com/safesploitOrg/PassFabricator/commit/d4651f27d762d736d4376efbf561f78a8e426e28) | Create eff_large_wordlist.txt |
| 2026-05-28 | [`7354f23`](https://github.com/safesploitOrg/PassFabricator/commit/7354f23e5f78e4c613dfc375ec911610d0a34d7f) | v1.1 |
| 2026-05-28 | [`c8e153c`](https://github.com/safesploitOrg/PassFabricator/commit/c8e153c436c03322f2feec804e7538bee999d655) | Create package-lock.json |
| 2026-05-28 | [`96582b1`](https://github.com/safesploitOrg/PassFabricator/commit/96582b1593b61864ec42adfca3310e941f742519) | Update test imports to public assets path |
| 2026-05-28 | [`59318aa`](https://github.com/safesploitOrg/PassFabricator/commit/59318aaf18e66d81d06fc9f43ab8263945c70b0d) | Use global crypto with availability check |
| 2026-05-28 | [`9d62767`](https://github.com/safesploitOrg/PassFabricator/commit/9d62767d6861e3628c1ab9149cc3f3513aadd1a5) | Change artifact upload path to './public' |
| 2026-05-28 | [`8bc4d88`](https://github.com/safesploitOrg/PassFabricator/commit/8bc4d88087985e9a90ade787b93be43c4c7fa8c7) | Add responsive layout for desktop |
| 2026-05-28 | [`35be76c`](https://github.com/safesploitOrg/PassFabricator/commit/35be76cafaf1f8a7104617582548cb569c684ea7) | URL hash |
| 2026-05-28 | [`f6ada64`](https://github.com/safesploitOrg/PassFabricator/commit/f6ada64ede0f449c715bd8cdfdc8cf828e2d241d) | Add demo section to README with password generator GIF |
| 2026-06-23 | [`64dafd3`](https://github.com/safesploitOrg/PassFabricator/commit/64dafd372bc20cb5ebfe73beb4cdcc5f7a641524) | Add memorable passphrase generator |

Historical release notes were based on these commits and their actual diffs. Generic subjects such as `feature`, `Style` and `entropy` were not treated as version numbers. No synthetic `1.0.1`/`1.0.2` releases were assigned to minor commits.
