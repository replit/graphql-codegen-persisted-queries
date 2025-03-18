import * as crypto from 'node:crypto';
import { PluginConfig } from '../types';

/**
 * Creates a hash for a given string using the specified algorithm
 * 
 * @param content - The content string to hash
 * @param config - Plugin configuration
 * @returns A hex string hash of the content by default, or a prefixed hash (e.g. "sha256:abc123...") 
 *          when includeAlgorithmPrefix is true for GraphQL over HTTP specification compliance
 */
export function createHash(content: string, config: PluginConfig): string {
  const algorithm = config.algorithm || 'sha256';
  
  const digest = crypto.createHash(algorithm)
    .update(content, 'utf8')
    .digest()
    .toString('hex');
    
  // Only prefix with algorithm if includeAlgorithmPrefix is true
  return config.includeAlgorithmPrefix === true ? `${algorithm}:${digest}` : digest;
}