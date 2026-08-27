/**
 * @oke3/opencode-authmesh — unified credential mesh for OpenCode providers.
 *
 * @example
 * ```typescript
 * import { Vault, buildEnv } from '@oke3/opencode-authmesh'
 *
 * const vault = new Vault('./data')
 * vault.add('openai', 'OPENAI_API_KEY', 'sk-...')
 *
 * const env = buildEnv(vault.getAll())
 * // env.OPENAI_API_KEY === 'sk-...'
 * ```
 */

export { PROVIDERS, getProvider, getKeyName, type ProviderDef } from './providers.js'
export { Vault, mask, type Credential, type VaultMeta } from './vault.js'
export { buildEnv, injectedKeys, spawnWithEnv } from './inject.js'