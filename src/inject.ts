// Copyright (c) 2026 Ground Zero LLC. All rights reserved.

/**
 * Environment injection — build an env object from stored credentials
 * and spawn commands with the mesh's keys.
 */

import { spawn, type SpawnOptions } from 'node:child_process'
import type { Credential } from './vault.js'

/**
 * Build an environment object with credential keys injected.
 * Vault values override existing environment values.
 */
export function buildEnv(credentials: Credential[], base: Record<string, string> = process.env as Record<string, string>): Record<string, string> {
  const env: Record<string, string> = { ...base }
  for (const c of credentials) {
    env[c.keyName] = c.value
  }
  return env
}

/** Which key names did the credentials set or override? */
export function injectedKeys(credentials: Credential[], base: Record<string, string> = process.env as Record<string, string>): string[] {
  return credentials
    .filter(c => base[c.keyName] !== c.value)
    .map(c => c.keyName)
}

/**
 * Spawn a command with credential env injected.
 * Returns the child process (caller decides how to wait).
 */
export function spawnWithEnv(command: string, args: string[], credentials: Credential[], cwd?: string) {
  const env = buildEnv(credentials)
  const options: SpawnOptions = { env, stdio: 'inherit' }
  if (cwd) options.cwd = cwd
  return spawn(command, args, options)
}