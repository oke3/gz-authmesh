# gz-authmesh

> Unified credential mesh for AI providers — one local vault for all your API keys.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Ground Zero LLC](https://img.shields.io/badge/Built%20by-Ground%20Zero%20LLC-purple)](https://github.com/oke3)
[![npm](https://img.shields.io/npm/v/@ground-zero-llc/gz-authmesh)](https://www.npmjs.com/package/@ground-zero-llc/gz-authmesh)
[![CI](https://github.com/oke3/gz-authmesh/actions/workflows/ci.yml/badge.svg)](https://github.com/oke3/gz-authmesh/actions)

## Why

OpenCode supports 75+ providers — OpenAI, Anthropic, Google, DeepSeek, Groq, Mistral, xAI, and dozens more. Each has its own API key, each lives in a different env var, and by the time you're juggling three or four providers, your keys are scattered across `.env` files, shell profiles, CI configs, and maybe a sticky note.

**authmesh** gives you **one local vault** for all provider credentials. Store them once, inject them into any command, list them masked, rotate them, or export them to your shell — all from a single CLI.

75+ providers. One vault. Zero scattered `.env` files.

## Install

```bash
npm install -g @ground-zero-llc/gz-authmesh
```

Requires Node 18+.

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

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   CLI / Shell                     │
│   authmesh add | list | show | run | env | ...   │
└───────────────────┬──────────────────────────────┘
                    │
           ┌────────▼────────┐
           │     Vault       │
           │  (vault.ts)     │
           │                 │
           │  ~/.authmesh/   │
           │  ├─ vault.jsonl │  ← base64-obfuscated values
           │  └─ meta.json   │  ← count + timestamp
           └────────┬────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  ┌──────────┐ ┌─────────┐ ┌──────────┐
  │ providers│ │ inject  │ │  mask()  │
  │ (known   │ │ (spawn  │ │ display  │
  │  key     │ │  child  │ │ helper   │
  │  names)  │ │  w/env) │ │          │
  └──────────┘ └─────────┘ └──────────┘
```

**Data flow:**
1. `authmesh add` stores the credential in `vault.jsonl` with base64-obfuscated values
2. `authmesh list` / `show` decode and mask values for display (`sk-...7890`)
3. `authmesh run -- <cmd>` spawns the command with all stored credentials injected into its environment
4. `authmesh env` prints `export` lines for shell sourcing via `eval`

## Feature Highlights

### One Vault, All Providers

Store credentials for OpenAI, Anthropic, Google, DeepSeek, Groq, Mistral, xAI, and any custom provider — all in one place. No more hunting through `.env` files.

```bash
authmesh add openai sk-...
authmesh add anthropic sk-ant-...
authmesh add google AIza...
authmesh add deepseek sk-...
```

### Masked by Default

`list` and `show` never reveal full keys. You see `sk-a...7890` — enough to identify which key is stored without exposing it to shoulder-surfers or screen recordings.

```bash
authmesh list
# → openai → OPENAI_API_KEY: sk-a...7890

authmesh show openai
# → openai → OPENAI_API_KEY: sk-a...7890
# → Use --reveal to print the full value.
```

### Inject Into Any Command

`authmesh run` spawns a child process with all your credentials injected as environment variables. Vault values override existing env values.

```bash
# Launch opencode with all provider keys available
authmesh run -- opencode

# Run a script that needs multiple API keys
authmesh run -- node scripts/test-providers.js

# Verify injection
authmesh run -- sh -c 'echo $OPENAI_API_KEY'
```

### Shell Integration

Export credentials to your current shell session:

```bash
eval "$(authmesh env)"
# → export OPENAI_API_KEY='sk-...'
# → export DEEPSEEK_API_KEY='sk-...'
```

Add this to your shell profile for persistence, or run it ad-hoc when you need the keys.

### Add from Stdin

Pipe a key directly — useful in scripts or when you don't want the key in your shell history:

```bash
cat ~/secrets/openai.key | authmesh add openai
echo "sk-..." | authmesh add deepseek
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

### Providers Command

```bash
authmesh providers
# → Known providers:
# →   openai     OpenAI              OPENAI_API_KEY (sk-...)
# →   anthropic  Anthropic           ANTHROPIC_API_KEY (sk-ant-...)
# →   google     Google (Gemini)     GOOGLE_API_KEY (AIza...)
# →   deepseek   DeepSeek            DEEPSEEK_API_KEY (sk-...)
# →   opencode   OpenCode            OPENCODE_API_KEY (oc-...)
# →   groq       Groq                GROQ_API_KEY (gsk_...)
# →   mistral    Mistral             MISTRAL_API_KEY (...)
# →   xai        xAI                 XAI_API_KEY (xai-...)
```

## Known Providers

| Provider | Key Name | Hint |
|----------|----------|------|
| `openai` | `OPENAI_API_KEY` | `sk-...` |
| `anthropic` | `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `google` | `GOOGLE_API_KEY` | `AIza...` |
| `deepseek` | `DEEPSEEK_API_KEY` | `sk-...` |
| `opencode` | `OPENCODE_API_KEY` | `oc-...` |
| `groq` | `GROQ_API_KEY` | `gsk_...` |
| `mistral` | `MISTRAL_API_KEY` | `...` |
| `xai` | `XAI_API_KEY` | `xai-...` |

You can also add custom providers not in this list — `authmesh add myprovider sk-...` will store it with a generic key name.

## Security Model

authmesh is designed as a **convenience layer** for local development. Here's what it does and doesn't protect against:

### What It Does

- **Base64-obfuscation** — Values are base64-encoded on disk, preventing accidental plaintext exposure (cat, grep, screen share)
- **File permissions** — The vault file is written with `chmod 600` (owner-only read/write)
- **Masked display** — `list` and `show` mask values by default; `--reveal` is required for full values
- **No network** — authmesh never makes network requests. Everything is local.

### What It Doesn't Do

- **Not encryption** — Base64 is encoding, not encryption. A determined attacker with file access can decode the values trivially.
- **Not a keychain** — For production secrets, prefer the OS keychain (macOS Keychain, Linux secret-service, Windows Credential Locker)
- **Not audit logging** — There's no log of who accessed which key when

### When to Use What

| Scenario | Use |
|----------|-----|
| Local dev, convenience | authmesh |
| Production secrets | OS keychain or vault |
| CI/CD secrets | GitHub Actions secrets / vault |
| Team-shared keys | Secret manager (1Password, Vault, etc.) |

## Library API

```typescript
import { Vault, buildEnv, mask } from '@ground-zero-llc/gz-authmesh'

// Create or open a vault
const vault = new Vault('./data')

// Store a credential
vault.add('openai', 'OPENAI_API_KEY', 'sk-...')

// Retrieve (decoded)
const cred = vault.get('openai')
// → { provider: 'openai', keyName: 'OPENAI_API_KEY', value: 'sk-...', ... }

// List all (decoded)
const all = vault.getAll()
// → [{ provider: 'openai', ... }, { provider: 'deepseek', ... }]

// Build env object for injection
const env = buildEnv(all)
// → { OPENAI_API_KEY: 'sk-...', DEEPSEEK_API_KEY: 'sk-...' }

// Mask a value for display
mask('sk-abcdef1234567890')
// → 'sk-a...7890'

// Remove a credential
vault.remove('openai')
```

### Types

```typescript
interface Credential {
  provider: string
  keyName: string
  value: string
  addedAt: number
  updatedAt: number
}

interface VaultMeta {
  updatedAt: number
  count: number
}
```

## Data Directory

Default: `~/.authmesh/`

| Variable | Default | Purpose |
|----------|---------|---------|
| `AUTHMESH_DATA_DIR` | `~/.authmesh` | Vault storage directory |

The vault directory contains:
- `vault.jsonl` — Credentials (base64-obfuscated, one per line)
- `meta.json` — Vault metadata (count, last updated timestamp)

## Related Projects

| Project | What It Does |
|---------|-------------|
| [gz-sessions](https://github.com/oke3/gz-sessions) | Persistent cross-session memory for AI agents |
| [gz-sessionrecall](https://github.com/oke3/gz-sessionrecall) | AI code archaeology — search your session history |
| [gz-codemap](https://github.com/oke3/gz-codemap) | Scan codebases → auto-generate project config |
| [gz-modelrouter](https://github.com/oke3/gz-modelrouter) | Intelligent LLM cost router — save 40-70% on bills |
| [gz-gateway](https://github.com/oke3/gz-gateway) | OpenAI-compatible AI gateway — rate limiting, caching, failover, cost tracking |
| [gz-bench](https://github.com/oke3/gz-bench) | Standardized benchmark harness for AI coding agents |
| [gz-authmesh](https://github.com/oke3/gz-authmesh) | Unified credential mesh for AI providers |
| [gz-remote](https://github.com/oke3/gz-remote) | Drive AI coding agents on remote machines over SSH |
| [gz-context-engine](https://github.com/oke3/gz-context-engine) | Production-grade RAG context engine |

---

## Enterprise Support

Need this customized for your infrastructure? We offer:

- **Integration consulting** — Wire gz-authmesh into your credential management
- **Custom configuration** — Task-specific rules, models, and workflows for your team
- **Managed deployment** — We host and maintain your instance
- **Training workshops** — Hands-on sessions for your engineering team

[Book a 30-min call](https://www.grndxero.com/brief) · [See pricing](https://www.grndxero.com/pricing)

---

## License

MIT — Ground Zero LLC

---

Built by [Ground Zero LLC](https://github.com/oke3) — AI infrastructure for the agentic age.
