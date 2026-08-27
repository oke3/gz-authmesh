/**
 * Local credential vault — stores provider API keys in a JSONL file.
 *
 * SECURITY NOTE: values are base64-obfuscated (not encrypted) and the
 * vault file is chmod 600. This protects against casual shoulder-surfing
 * and accidental exposure, not against a determined attacker with file
 * access. For production secrets, prefer the OS keychain.
 */

import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export interface Credential {
  provider: string
  keyName: string
  value: string
  addedAt: number
  updatedAt: number
}

export interface VaultMeta {
  updatedAt: number
  count: number
}

function encode(value: string): string {
  return Buffer.from(value, 'utf-8').toString('base64')
}

function decode(value: string): string {
  return Buffer.from(value, 'base64').toString('utf-8')
}

export function mask(value: string): string {
  if (value.length <= 8) return '***'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

export class Vault {
  private dir: string
  private vaultPath: string
  private metaPath: string

  constructor(dataDir?: string) {
    this.dir = dataDir ?? process.env['AUTHMESH_DATA_DIR'] ?? join(homedir(), '.authmesh')
    this.vaultPath = join(this.dir, 'vault.jsonl')
    this.metaPath = join(this.dir, 'meta.json')
  }

  private ensureDir(): void {
    mkdirSync(this.dir, { recursive: true })
  }

  private readLines(path: string): string[] {
    if (!existsSync(path)) return []
    return readFileSync(path, 'utf-8').split('\n').filter(l => l.trim().length > 0)
  }

  private writeMeta(): void {
    const meta: VaultMeta = { updatedAt: Date.now(), count: this.getAll().length }
    writeFileSync(this.metaPath, JSON.stringify(meta) + '\n')
  }

  private secureFile(): void {
    try {
      chmodSync(this.vaultPath, 0o600)
    } catch {
      // best-effort on platforms without chmod semantics
    }
  }

  /** Store or update a credential for a provider */
  add(provider: string, keyName: string, value: string): Credential {
    this.ensureDir()
    const existing = this.get(provider)
    const now = Date.now()
    const credential: Credential = {
      provider,
      keyName,
      value,
      addedAt: existing?.addedAt ?? now,
      updatedAt: now,
    }

    const all = this.getAll().filter(c => c.provider !== provider)
    all.push(credential)
    writeFileSync(this.vaultPath, all.map(c => ({ ...c, value: encode(c.value) })).map(c => JSON.stringify(c)).join('\n') + '\n')
    this.secureFile()
    this.writeMeta()
    return credential
  }

  get(provider: string): Credential | undefined {
    const raw = this.readLines(this.vaultPath)
      .map(l => JSON.parse(l) as Omit<Credential, 'value'> & { value: string })
      .find(c => c.provider === provider)
    if (!raw) return undefined
    return { ...raw, value: decode(raw.value) }
  }

  getAll(): Credential[] {
    return this.readLines(this.vaultPath).map(l => {
      const raw = JSON.parse(l) as Omit<Credential, 'value'> & { value: string }
      return { ...raw, value: decode(raw.value) }
    })
  }

  remove(provider: string): boolean {
    const existing = this.get(provider)
    if (!existing) return false
    const remaining = this.getAll().filter(c => c.provider !== provider)
    this.ensureDir()
    writeFileSync(this.vaultPath, remaining.map(c => ({ ...c, value: encode(c.value) })).map(c => JSON.stringify(c)).join('\n') + (remaining.length ? '\n' : ''))
    this.secureFile()
    this.writeMeta()
    return true
  }

  getMeta(): VaultMeta {
    if (existsSync(this.metaPath)) {
      try {
        return JSON.parse(readFileSync(this.metaPath, 'utf-8')) as VaultMeta
      } catch {
        // fall through to computed meta
      }
    }
    return { updatedAt: 0, count: this.getAll().length }
  }

  /** Reset the vault */
  reset(): void {
    this.ensureDir()
    writeFileSync(this.vaultPath, '')
    this.writeMeta()
  }
}