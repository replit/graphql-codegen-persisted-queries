import type { FragmentDefinitionNode, Location, OperationDefinitionNode } from 'graphql';
import type { PluginFunction } from '@graphql-codegen/plugin-helpers';

/**
 * Configuration for the persisted query generator plugin
 */
export interface PluginConfig {
  /** 
   * Output format - 'server' generates hash->operation mapping,
   * 'client' generates operation->hash mapping
   */
  output: 'server' | 'client';
  
  /**
   * Hash algorithm to use (defaults to 'sha256')
   */
  algorithm?: string;

  /**
   * Whether to prefix the hash with the algorithm name (e.g. "sha256:abc123...")
   * Follows the GraphQL over HTTP specification when enabled
   * @see https://github.com/graphql/graphql-over-http/blob/52d56fb36d51c17e08a920510a23bdc2f6a720be/spec/Appendix%20A%20--%20Persisted%20Documents.md#sha256-hex-document-identifier
   * @default false
   */
  includeAlgorithmPrefix?: boolean;
}

/**
 * Represents a single operation in the persisted query manifest
 */
export interface PersistedQueryManifestOperation {
  /** Operation type (query, mutation, subscription) */
  type: 'query' | 'mutation' | 'subscription';
  /** Operation name */
  name: string;
  /** Full operation body text */
  body: string;
}

/**
 * Server-side persisted query manifest format
 */
export interface ServerQueryListManifest {
  format: 'apollo-persisted-query-manifest';
  version: 1;
  operations: Record<string, PersistedQueryManifestOperation>;
}

/**
 * Client-side persisted query manifest format
 */
export type ClientQueryListManifest = Record<string, string>;

/**
 * Union type for both manifest formats
 */
export type QueryListManifest = ServerQueryListManifest | ClientQueryListManifest;

/**
 * Internal type for a GraphQL definition
 */
export type Definition = FragmentDefinitionNode | OperationDefinitionNode;

/**
 * Query identifier metadata
 */
export interface QueryIdentifier {
  /**
   * The document identifier hash, optionally with algorithm prefix (e.g. "sha256:abc123...")
   * when includeAlgorithmPrefix is enabled
   */
  hash: string;
  
  /**
   * The full query string
   */
  query: string;
  
  /**
   * Whether the operation uses variables
   */
  usesVariables: boolean;
  
  /**
   * Source location information (if available)
   */
  loc?: Location;
}

/**
 * Map of query names to their identifiers
 */
export type QueryIdentifierMap = Record<string, QueryIdentifier>;

/**
 * Plugin function type
 */
export type PersistedQueryPlugin = PluginFunction<PluginConfig, string>;
