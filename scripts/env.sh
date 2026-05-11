#!/usr/bin/env bash
# Persisté pour Sprint 32.5+33 — PATH ne survit pas entre tool calls Claude Code
export PATH="$HOME/.local/node/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# Sprint 35 — Polyfill `timeout` pour macOS sans coreutils.
# Le Gate du prompt Sprint 35 utilise `timeout N cmd` (signature GNU). Sur macOS
# vanilla, le binaire est absent → tous les appels échouaient avec command not found.
# Implémentation via `perl -e alarm` (SIGALRM kernel-level survit à exec).
# Exit code sur trigger : 142 (128 + signal 14) — non-zéro, donc `|| {…}` se déclenche.
if ! command -v timeout >/dev/null 2>&1; then
  timeout() {
    perl -e '$s=shift; alarm $s; exec @ARGV' "$@"
  }
fi
