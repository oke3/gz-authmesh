# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-27

### Added
- JSONL credential vault with base64 obfuscation and chmod 600 file permissions
- 8 known OpenCode providers with canonical API key env var names
- Masked listing and reveal-on-demand credential display
- Environment injection (`authmesh run -- <cmd>`) with vault-overrides-env semantics
- Shell export lines (`authmesh env`) for sourcing
- CLI with add, list, show, remove, env, run, providers, and health commands
- 38 tests covering providers, vault, inject, and CLI