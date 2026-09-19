// Copyright (c) 2026 Ground Zero LLC. All rights reserved.

import { describe, it, expect } from 'bun:test'
import { buildEnv, injectedKeys } from '../src/inject.js'
import type { Credential } from '../src/vault.js'

function cred(provider: string, keyName: string, value: string): Credential {
  return { provider, keyName, value, addedAt: 1, updatedAt: 1 }
}

describe('buildEnv', () => {
  it('injects credential keys into the environment', () => {
    const env = buildEnv([cred('openai', 'OPENAI_API_KEY', 'sk-1')], {})
    expect(env['OPENAI_API_KEY']).toBe('sk-1')
  })

  it('preserves base environment values', () => {
    const env = buildEnv([cred('openai', 'OPENAI_API_KEY', 'sk-1')], { PATH: '/usr/bin' })
    expect(env['PATH']).toBe('/usr/bin')
  })

  it('vault values override existing environment values', () => {
    const env = buildEnv([cred('openai', 'OPENAI_API_KEY', 'sk-vault')], { OPENAI_API_KEY: 'sk-env' })
    expect(env['OPENAI_API_KEY']).toBe('sk-vault')
  })

  it('handles empty credentials', () => {
    const env = buildEnv([], { PATH: '/usr/bin' })
    expect(env['PATH']).toBe('/usr/bin')
  })
})

describe('injectedKeys', () => {
  it('lists keys that differ from the base env', () => {
    const keys = injectedKeys(
      [cred('openai', 'OPENAI_API_KEY', 'sk-vault')],
      { OPENAI_API_KEY: 'sk-env' },
    )
    expect(keys).toEqual(['OPENAI_API_KEY'])
  })

  it('omits keys already matching the base env', () => {
    const keys = injectedKeys(
      [cred('openai', 'OPENAI_API_KEY', 'sk-same')],
      { OPENAI_API_KEY: 'sk-same' },
    )
    expect(keys).toEqual([])
  })
})