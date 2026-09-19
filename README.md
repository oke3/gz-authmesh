# gz-authmesh

> Built by [Ground Zero LLC](https://github.com/oke3) — AI infrastructure for the agentic age.

Unified credential mesh for OpenCode providers — store, inject, and rotate API keys.

[![CI](https://github.com/oke3/gz-authmesh/actions/workflows/ci.yml/badge.svg)](https://github.com/oke3/gz-authmesh/actions)
[![npm](https://img.shields.io/npm/v/@ground-zero-llc/gz-authmesh)](https://www.npmjs.com/package/@ground-zero-llc/gz-authmesh)
[![license](https://img.shields.io/npm/l/@ground-zero-llc/gz-authmesh)](https://github.com/oke3/gz-authmesh/blob/main/LICENSE)

## Why

OpenCode supports 75+ providers, each with its own API key scattered across env vars, shell profiles, and config files. **authmesh** gives you one local vault for all provider credentials, with masked listing, shell export, and env injection for any command.

## Install

```bash
npm install -g @ground-zero-llc/gz-authmesh
```

## Quick Start

```bash
# Store a credential (argument or stdin)
authmesh add openai sk-...
echo "sk-..." | authmesh add deepseek

# List stored providers (masked)
authmesh list
# → AuthMesh — 2 credential(s)
# →   openai (OpenAI) → OPENAI_API_KEY: sk-a...7890
# →   deepseek (DeepSeek) → DEEPSEEK_API_KEY: sk-d...deep

# Run a command with credentials injected
authmesh run -- opencode
# → Injected: OPENAI_API_KEY, DEEPSEEK_API_KEY

# Export to your shell
eval "$(authmesh env)"

# See a full value (use sparingly)
authmesh show openai --reveal
```

## CLI Reference

| Command | Description |
|---------|-------------|
| `add <provider> [value]` | Store/update a credential (value from arg or stdin) |
| `list` | List stored providers (masked) |
| `show <provider> [--reveal]` | Show a credential (masked by default) |
| `remove <provider>` | Remove a credential |
| `env` | Print `export` lines for shell sourcing |
| `run -- <cmd...>` | Run a command with credentials injected |
| `providers` | List known providers and their key names |
| `health` | Check vault status |

## Known Providers

| Provider | Key Name |
|----------|----------|
| `openai` | `OPENAI_API_KEY` |
| `anthropic` | `ANTHROPIC_API_KEY` |
| `google` | `GOOGLE_API_KEY` |
| `deepseek` | `DEEPSEEK_API_KEY` |
| `opencode` | `OPENCODE_API_KEY` |
| `groq` | `GROQ_API_KEY` |
| `mistral` | `MISTRAL_API_KEY` |
| `xai` | `XAI_API_KEY` |

## Env Injection

`authmesh run -- <cmd>` spawns the command with all stored credentials injected into its environment. Vault values override existing environment values. `authmesh env` prints shell `export` lines for sourcing.

```bash
# Launch opencode with all provider keys available
authmesh run -- opencode

# Verify injection
authmesh run -- sh -c 'echo $OPENAI_API_KEY'
```

## Security Model

- Values are **base64-obfuscated** on disk (not encrypted) — this protects against casual exposure, not a determined attacker with file access
- The vault file is written with `chmod 600` (owner-only)
- `list` and `show` mask values by default; `--reveal` is required for full values
- For production secrets, prefer the OS keychain; treat authmesh as a convenience layer

## Library API

```typescript
import { Vault, buildEnv } from '@ground-zero-llc/gz-authmesh'

const vault = new Vault('./data')
vault.add('openai', 'OPENAI_API_KEY', 'sk-...')

const env = buildEnv(vault.getAll())
// env.OPENAI_API_KEY === 'sk-...'
```

## Data Directory

Default: `~/.authmesh/`

Override with `AUTHMESH_DATA_DIR` environment variable.

## Related Projects

- [gz-sessions](https://github.com/oke3/gz-sessions) — Persistent cross-session memory for OpenCode agents
- [gz-codemap](https://github.com/oke3/gz-codemap) — Codebase mapping for OpenCode
- [gz-bench](https://github.com/oke3/gz-bench) — Benchmarking suite for OpenCode
- [gz-remote](https://github.com/oke3/gz-remote) — Drive OpenCode over SSH
- [gz-modelrouter](https://github.com/oke3/gz-modelrouter) — Intelligent LLM cost router for OpenCode
- [gz-sessionrecall](https://github.com/oke3/gz-sessionrecall) — AI code archaeology for OpenCode sessions
- [gz-learn](https://github.com/oke3/gz-learn) — Skill-building curriculum for OpenCode agents
- [gz-terminalforge](https://github.com/oke3/gz-terminalforge) — Terminal workspace for OpenCode projects

## License

MIT © oke3