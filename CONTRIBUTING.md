# Contributing to opencode-authmesh

Thanks for your interest in contributing!

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
npx tsc --noEmit

# Build
bun run build
```

## Pull Requests

1. Fork the repo and create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass: `bun test`
4. Ensure type check passes: `npx tsc --noEmit`
5. Submit a PR with a clear description

## Adding Providers

Providers live in `src/providers.ts`. Each provider needs:

- A unique `id` (lowercase, matches the OpenCode provider id)
- A human-readable `name`
- The canonical `keyName` env var (e.g. `OPENAI_API_KEY`)
- A `hint` showing the key format

Add tests in `test/providers.test.ts` for any new entries.

## Security Considerations

- Never log or print full credential values — always use `mask()`
- `show --reveal` is the only path to full values
- Keep the vault file permissions at `0600`
- Do not add encryption dependencies — the project is zero-dependency by design

## Code Style

- TypeScript strict mode
- ES modules (`import`/`export`)
- Zero runtime dependencies
- Tests for all new features

## License

By contributing, you agree that your contributions will be licensed under the MIT License.