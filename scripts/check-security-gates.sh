#!/usr/bin/env bash
set -euo pipefail

ROOT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIRECTORY="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIRECTORY"' EXIT

expect_blocked() {
  local SCANNER_NAME="$1"
  shift
  local SCANNER_STATUS=0
  "$@" > "$TEMP_DIRECTORY/${SCANNER_NAME}.log" 2>&1 || SCANNER_STATUS=$?
  if [[ "$SCANNER_STATUS" != 1 ]]; then
    cat "$TEMP_DIRECTORY/${SCANNER_NAME}.log" >&2
    printf '%s\n' "$SCANNER_NAME must exit 1 for a synthetic finding; got $SCANNER_STATUS." >&2
    exit 1
  fi
}

main() {
  mkdir -p "$TEMP_DIRECTORY/sast" "$TEMP_DIRECTORY/secrets"
  # Synthetic negative fixtures, never executed or published to the website.
  cat > "$TEMP_DIRECTORY/sast/unsafe.js" <<'JAVASCRIPT'
Math.random();
eval(input);
element.innerHTML = input;
element.insertAdjacentHTML('beforeend', input);
fetch('/example', {method: 'POST', body: input});
JAVASCRIPT
  expect_blocked semgrep semgrep scan --config "$ROOT_DIRECTORY/.semgrep.yml" --error --strict \
    --no-git-ignore --metrics=off --disable-version-check --json \
    --output "$TEMP_DIRECTORY/sast-results.json" "$TEMP_DIRECTORY/sast"
  python3 - "$TEMP_DIRECTORY/sast-results.json" <<'PYTHON'
import json, sys
result = json.load(open(sys.argv[1]))
expected = {'password-insecure-random', 'dynamic-code-execution', 'dynamic-html-insertion', 'html-adjacent-insertion', 'password-network-body'}
actual = {item['check_id'].split('.')[-1] for item in result['results']}
assert expected <= actual, (expected, actual)
PYTHON
  # Construct an unmistakably fake token solely to verify the secret gate fails.
  printf 'token = "ghp_%s%s"\n' 'aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV' '3wX4' > "$TEMP_DIRECTORY/secrets/example.txt"
  expect_blocked gitleaks gitleaks dir --config "$ROOT_DIRECTORY/.gitleaks.toml" --redact --exit-code 1 "$TEMP_DIRECTORY/secrets"
  printf '%s\n' 'PASS: all five SAST rules and the secret scanner blocked synthetic findings.'
}

main
