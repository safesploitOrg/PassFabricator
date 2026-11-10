#!/usr/bin/env bash
set -euo pipefail

GITLEAKS_VERSION='8.30.1'
GITLEAKS_SHA256='551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb'
INSTALL_DIRECTORY="${1:?Usage: bash scripts/install-gitleaks.sh OUTPUT_DIRECTORY (Linux x64)}"
TEMP_DIRECTORY="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIRECTORY"' EXIT

main() {
  if [[ "$(uname -s)" != Linux || "$(uname -m)" != x86_64 ]]; then
    printf '%s\n' 'This CI installer supports Linux x64 only. Use the upstream release for other platforms.' >&2
    exit 1
  fi
  curl --fail --location --proto '=https' --tlsv1.2 \
    "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" \
    --output "$TEMP_DIRECTORY/gitleaks.tar.gz"
  printf '%s  %s\n' "$GITLEAKS_SHA256" "$TEMP_DIRECTORY/gitleaks.tar.gz" | sha256sum --check --strict
  mkdir -p "$INSTALL_DIRECTORY"
  tar -xzf "$TEMP_DIRECTORY/gitleaks.tar.gz" -C "$INSTALL_DIRECTORY" gitleaks
  "$INSTALL_DIRECTORY/gitleaks" version
}

main
