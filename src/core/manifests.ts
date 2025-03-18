import {
  ClientQueryListManifest,
  PersistedQueryManifestOperation,
  QueryIdentifierMap,
  ServerQueryListManifest
} from '../types';

/**
 * Generates a client-side persisted query manifest
 * Client manifests map operation names to their hash
 * 
 * @param queries - Map of queries with their identifiers
 * @returns Client-side manifest object
 */
export function generateClientManifest(
  queries: QueryIdentifierMap,
): ClientQueryListManifest {
  const manifest: ClientQueryListManifest = {};
  
  for (const queryName of Object.keys(queries)) {
    manifest[queryName] = queries[queryName].hash;
  }

  return manifest;
}

/**
 * Generates a server-side persisted query manifest
 * Server manifests map query hashes to operation details
 * 
 * @param queries - Map of queries with their identifiers
 * @returns Server-side manifest object
 * @throws Error if an operation type cannot be determined
 */
export function generateServerManifest(
  queries: QueryIdentifierMap,
): ServerQueryListManifest {
  const manifest: ServerQueryListManifest = {
    format: 'apollo-persisted-query-manifest',
    version: 1,
    operations: {},
  };

  const operations: Record<string, PersistedQueryManifestOperation> = {};
  
  for (const queryName of Object.keys(queries)) {
    const query = queries[queryName].query;
    let type: 'query' | 'mutation' | 'subscription';
    
    // Determine operation type from the query content
    if (query.startsWith('query ')) {
      type = 'query';
    } else if (query.startsWith('mutation ')) {
      type = 'mutation';
    } else if (query.startsWith('subscription ')) {
      type = 'subscription';
    } else {
      throw new Error('Unknown operation type');
    }

    operations[queries[queryName].hash] = {
      type,
      name: queryName,
      body: query,
    };
  }

  manifest.operations = operations;
  return manifest;
}