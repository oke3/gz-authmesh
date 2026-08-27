import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { Vault, mask } from '../src/vault.js'
import { mkdtempSync, rmSync, statSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

let dir: string
let vault: Vault

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'authmesh-vault-'))
  vault = new Vault(dir)
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

describe('Vault', () => {
  it('starts empty', () => {
    expect(vault.getAll()).toHaveLength(0)
    expect(vault.getMeta().count).toBe(0)
  })

  it('stores a credential', () => {
    const c = vault.add('openai', 'OPENAI_API_KEY', 'sk-test-1234567890')
    expect(c.provider).toBe('openai')
    expect(c.value).toBe('sk-test-1234567890')
    expect(vault.get('openai')?.value).toBe('sk-test-1234567890')
  })

  it('upserts by provider', () => {
    vault.add('openai', 'OPENAI_API_KEY', 'sk-old')
    vault.add('openai', 'OPENAI_API_KEY', 'sk-new')
    expect(vault.getAll()).toHaveLength(1)
    expect(vault.get('openai')?.value).toBe('sk-new')
    expect(vault.get('openai')?.addedAt).toBeDefined()
  })

  it('stores multiple providers', () => {
    vault.add('openai', 'OPENAI_API_KEY', 'sk-a')
    vault.add('anthropic', 'ANTHROPIC_API_KEY', 'sk-ant-b')
    expect(vault.getAll()).toHaveLength(2)
  })

  it('removes a credential', () => {
    vault.add('openai', 'OPENAI_API_KEY', 'sk-a')
    expect(vault.remove('openai')).toBe(true)
    expect(vault.getAll()).toHaveLength(0)
  })

  it('remove returns false for missing', () => {
    expect(vault.remove('nope')).toBe(false)
  })

  it('persists across instances', () => {
    vault.add('deepseek', 'DEEPSEEK_API_KEY', 'sk-deep')
    const vault2 = new Vault(dir)
    expect(vault2.get('deepseek')?.value).toBe('sk-deep')
  })

  it('does not store plaintext on disk', () => {
    vault.add('openai', 'OPENAI_API_KEY', 'sk-super-secret-value')
    const raw = readFileSync(join(dir, 'vault.jsonl'), 'utf-8')
    expect(raw).not.toContain('sk-super-secret-value')
  })

  it('sets restrictive file permissions', () => {
    vault.add('openai', 'OPENAI_API_KEY', 'sk-a')
    const mode = statSync(join(dir, 'vault.jsonl')).mode & 0o777
    expect(mode).toBe(0o600)
  })

  it('reset clears the vault', () => {
    vault.add('openai', 'OPENAI_API_KEY', 'sk-a')
    vault.reset()
    expect(vault.getAll()).toHaveLength(0)
    expect(vault.getMeta().count).toBe(0)
  })
})

describe('mask', () => {
  it('masks long values', () => {
    expect(mask('sk-abcdefghijklmnop')).toBe('sk-a...mnop')
  })

  it('masks short values entirely', () => {
    expect(mask('short')).toBe('***')
  })
})