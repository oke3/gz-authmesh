// Copyright (c) 2026 Ground Zero LLC. All rights reserved.

import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { PROVIDERS, getProvider, getKeyName } from '../src/providers.js'

describe('PROVIDERS', () => {
  it('has the expected providers', () => {
    const ids = PROVIDERS.map(p => p.id)
    expect(ids).toContain('openai')
    expect(ids).toContain('anthropic')
    expect(ids).toContain('google')
    expect(ids).toContain('deepseek')
    expect(ids).toContain('opencode')
  })

  it('has unique ids and key names', () => {
    const ids = PROVIDERS.map(p => p.id)
    const keyNames = PROVIDERS.map(p => p.keyName)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(keyNames).size).toBe(keyNames.length)
  })

  it('every provider has a keyName and hint', () => {
    for (const p of PROVIDERS) {
      expect(p.keyName.length).toBeGreaterThan(3)
      expect(p.hint.length).toBeGreaterThan(0)
    }
  })

  it('uses canonical env var names', () => {
    expect(getKeyName('openai')).toBe('OPENAI_API_KEY')
    expect(getKeyName('anthropic')).toBe('ANTHROPIC_API_KEY')
    expect(getKeyName('deepseek')).toBe('DEEPSEEK_API_KEY')
  })
})

describe('getProvider', () => {
  it('finds a provider by id', () => {
    expect(getProvider('openai')?.name).toBe('OpenAI')
  })

  it('returns undefined for unknown', () => {
    expect(getProvider('nope')).toBeUndefined()
  })
})