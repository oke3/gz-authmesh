import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { execSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const CLI = join(import.meta.dir, '..', 'src', 'cli.ts')

let dir: string
let dataDir: string

function run(args: string, stdin?: string): string {
  const opts: Record<string, unknown> = {
    env: { ...process.env, AUTHMESH_DATA_DIR: dataDir },
    encoding: 'utf-8',
    timeout: 10_000,
  }
  if (stdin !== undefined) {
    opts['input'] = stdin
  }
  return execSync(`bun run ${CLI} ${args}`, opts).trim()
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'authmesh-cli-'))
  dataDir = join(dir, 'data')
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('CLI', () => {
  it('shows usage with no args', () => {
    const output = run('')
    expect(output).toContain('authmesh')
    expect(output).toContain('Usage')
  })

  it('add stores a credential from argument', () => {
    const output = run('add openai sk-test-1234567890')
    expect(output).toContain('Stored openai → OPENAI_API_KEY')
    expect(output).toContain('sk-t...7890')
  })

  it('add reads value from stdin', () => {
    const output = run('add deepseek', 'sk-stdin-value')
    expect(output).toContain('Stored deepseek')
  })

  it('add errors on unknown provider', () => {
    expect(() => run('add nope sk-x')).toThrow('Unknown provider')
  })

  it('add errors without a value', () => {
    expect(() => run('add openai')).toThrow('No value provided')
  })

  it('list shows masked credentials', () => {
    run('add openai sk-abcdefghijkl')
    const output = run('list')
    expect(output).toContain('openai')
    expect(output).toContain('sk-a...ijkl')
    expect(output).not.toContain('sk-abcdefghijkl')
  })

  it('show masks by default and reveals with --reveal', () => {
    run('add openai sk-abcdefghijkl')
    expect(run('show openai')).toContain('sk-a...ijkl')
    expect(run('show openai --reveal')).toContain('sk-abcdefghijkl')
  })

  it('show errors for missing credential', () => {
    expect(() => run('show nope')).toThrow('No credential')
  })

  it('remove deletes a credential', () => {
    run('add openai sk-x')
    expect(run('remove openai')).toContain('Removed: openai')
    expect(() => run('remove openai')).toThrow('No credential')
  })

  it('env prints export lines', () => {
    run('add openai sk-abc123')
    const output = run('env')
    expect(output).toContain('export OPENAI_API_KEY=')
    expect(output).toContain('sk-abc123')
  })

  it('run injects credentials into the child', () => {
    run('add openai sk-injected-value')
    const output = run('run -- sh -c "echo \\$OPENAI_API_KEY"')
    expect(output).toContain('sk-injected-value')
  })

  it('run errors without --', () => {
    expect(() => run('run echo hi')).toThrow('Usage: authmesh run')
  })

  it('providers lists known providers', () => {
    const output = run('providers')
    expect(output).toContain('openai')
    expect(output).toContain('OPENAI_API_KEY')
    expect(output).toContain('anthropic')
  })

  it('health reports status', () => {
    run('add openai sk-x')
    const output = run('health')
    const body = JSON.parse(output) as { status: string; credentials: number }
    expect(body.status).toBe('ok')
    expect(body.credentials).toBe(1)
  })
})