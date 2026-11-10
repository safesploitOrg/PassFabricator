
# PassFabricator

**PassFabricator** is a client-side password generator and strength analyser built with HTML, CSS and JavaScript. It generates random passwords and memorable passphrases, processes passwords locally, and stores only generator preferences. There is no application backend or runtime npm dependency.

**Prepared version: 1.1.1.** This package adopts SFW v1.1.0 and fixes the entropy display without redesigning the website. See [CHANGELOG.md](CHANGELOG.md), [ARCHITECTURE.md](ARCHITECTURE.md), [review findings](docs/review.md) and [verification evidence](docs/verification.md).

## Features:

### Generate
-   **Random Passwords**: Choose the length and character types (lowercase, uppercase, numbers, and symbols).
-   **Memorable Passphrases**: Generate word-based passphrases from the included EFF wordlist with configurable word count, delimiter, case, and optional number substitution.
-   **Password Strength Meter**: Visual feedback on the strength of the generated password based on length and character variety.
-   **Consistent entropy estimate**: Generate and Analyse display the same character/pattern heuristic for the same password, labelled **Estimated entropy**. It is not a measurement of cryptographic randomness or resistance to a dictionary attack. See [the model and its limitations](docs/entropy.md).
-   **Clipboard Functionality**: Easily copy the generated password to your clipboard for secure use.

### Analyse
-   **Password Strength Analysis**: Evaluate the strength of any password with detailed metrics.
-   **Entropy Evaluation**: Understand the security level of existing passwords.
-   **Visual Feedback**: Clear visual indicators of password strength.

### General
-   **Responsive Design**: Fully functional on both desktop and mobile devices.
-   **Modular Architecture**: Clean separation of concerns with ES6 modules for maintainability and testing.

## Demo

![PassFabricator Demo - Password Generator](https://raw.githubusercontent.com/safesploitOrg/assets/main/repo/PassFabricator/media/PassFabricator-demo-password-generator-2160.gif)

## Why Use PassFabricator?

Generation uses `crypto.getRandomValues()` with rejection sampling and fails if Web Crypto is unavailable. The analyser supplies guidance only. A pasted string cannot reveal how it was generated, and its estimate can overstate passphrase strength. Keep passwords unique and use a trusted browser/device. The website must first load over HTTPS; cached files or a local server are needed for subsequent offline use. There is no service worker guaranteeing offline availability.

## Installation:

PassFabricator uses ES6 modules, which require a local development server to run. Simply opening `index.html` in a browser will not work.

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/safesploitOrg/PassFabricator.git
   cd PassFabricator
   ```

2. **Install development dependencies** using Node 24 or 26:
   ```bash
   npm ci --ignore-scripts
   ```

3. **Start a local development server**:
   
   **Option A: Build and serve the exact publishable files**
   ```bash
   npm run build
   npm run dev
   ```
   Then open `http://127.0.0.1:4173`. Rebuild after changing source files. The development server binds only to loopback and is not a production server.
   
   **Option B: Using Python 3**
   ```bash
   python3 -m http.server 8000 --bind 127.0.0.1 --directory public
   ```
   Then open `http://127.0.0.1:8000`. This option serves the original source directly without npm dependencies.

The application will run entirely in your browser with no backend services required.

## Architecture:

PassFabricator is built with modular ES6 modules for clean separation of concerns:

- **`generate_password.js`**: Core password generation logic, entropy calculation, and validation
- **`analyse_password.js`**: Password strength analysis and metrics
- **`storage.js`**: User preferences and local storage management
- **`ui.js`**: User interface interactions and DOM manipulation

## Development & Testing:

### Running Tests

Tests are written with Vitest:

```bash
# Lint, unit/controller tests with coverage, and static build
npm run check

# Audit the complete development dependency tree
npm run audit

# Install browser engines and system dependencies (Linux may require privileges)
npx --no-install playwright install --with-deps chromium firefox webkit

# Nine browser/viewport projects, including accessibility and privacy checks
npm run test:browser

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run coverage
```

Tests cover the original modules, the actual application controller, malformed inputs, Web Crypto failures, biased-tail rejection, preference privacy, both generator types, URL navigation and responsive browser journeys. See [docs/testing.md](docs/testing.md) for exact security-tool prerequisites, coverage scope and limitations.

## Engineering and release

- [AGENTS.md](AGENTS.md) points to the canonical [SFW v1.1.0 standard](docs/engineering/SFW_AI_ENGINEERING_STANDARD.md).
- CI enforces lint, Node 24/26 tests, per-file core coverage, Chromium/Firefox/WebKit journeys, axe checks, dependency audit, SAST and secret scanning before producing a Pages artifact.
- Dependencies are exact-pinned and locked. A temporary `minimatch` override to 11.0.5 addresses GHSA-g3hv-75wg-m249 in ESLint's tooling dependency; review it on each ESLint update and by 2026-12-06. It is not a vulnerability suppression.
- Pages now requires a manual owner-reviewed deployment of an exact main-branch SHA and reuses the complete CI workflow. There is no independent push deployment. This changes future release operations, not the currently deployed website.
- Required GitHub branch checks and `github-pages` environment reviewers remain account settings to configure and verify. See [operations](docs/operations.md) and [security policy](SECURITY.md).
- Local implementation and packaging do not constitute a GitHub release, tag or deployment.

## Contribution:

Feel free to fork this repository and contribute! We welcome issues, bug reports, and pull requests.

## License:

The existing [LICENSE](LICENSE) file is empty, so the previous README's MIT claim was unsupported. This update preserves that file and does not select or grant a new licence. The owner must clarify licensing before describing the project as MIT-licensed or redistributing it on that basis. The bundled EFF wordlist also needs its upstream attribution/licence considered separately.
