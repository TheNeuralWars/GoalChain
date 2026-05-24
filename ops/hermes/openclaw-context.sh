#!/usr/bin/env bash
# Deprecated alias — use hermes-context.sh
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hermes-context.sh" "$@"
