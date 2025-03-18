import { DocumentNode, visit } from 'graphql';
import { 
  PluginConfig,
  ClientOperationListManifest,
  ServerOperationListManifest,
  PersistedQueryManifestOperation,
  ProcessedOperation
} from '../types';
import { createHash } from '../utils/hashing';
import { addTypenameToDocument } from '../utils/transforms';
import { findFragments, findUsedFragments } from '../utils/fragments';
import { printDefinitions } from '../utils/transforms';

/**
 * Process documents and generate operation hashes with their details
 * 
 * @param docs - Array of GraphQL document nodes
 * @param config - Plugin configuration
 * @returns Array of processed operations with their details
 * @throws Error if an operation is missing a name
 */
function processOperations(docs: DocumentNode[], config: PluginConfig): ProcessedOperation[] {
  // Add __typename to all selection sets
  const processedDocs = docs.map(addTypenameToDocument);
  const operations: ProcessedOperation[] = [];
  
  const knownFragments = findFragments(processedDocs);

  for (const doc of processedDocs) {
    visit(doc, {
      OperationDefinition: {
        enter(def) {
          if (!def.name) {
            throw new Error('OperationDefinition missing name');
          }

          const operationName = def.name.value;
          const usedFragments = findUsedFragments(def, knownFragments);

          // The order is important here. We want to have the operation definition first,
          // then the fragments as they are included.
          // Otherwise, the generated hashes won't match with the one generated on the server.
          const query = printDefinitions([def, ...usedFragments.values()]);

          const hash = createHash(query, config);
          
          operations.push({
            name: operationName,
            hash,
            type: def.operation,
            query,
            definition: def,
            fragments: Array.from(usedFragments.values())
          });
        },
      },
    });
  }

  return operations;
}

/**
 * Generates a client-side persisted query manifest
 * Client manifests map operation names to their hash
 * 
 * @param docs - Array of GraphQL document nodes
 * @param config - Plugin configuration
 * @returns Client-side manifest object
 * @throws Error if an operation is missing a name
 */
export function generateClientManifest(
  docs: DocumentNode[],
  config: PluginConfig,
): ClientOperationListManifest {
  const operations = processOperations(docs, config);
  const manifest: ClientOperationListManifest = {};
  
  for (const operation of operations) {
    manifest[operation.name] = operation.hash;
  }

  return manifest;
}

/**
 * Generates a server-side persisted query manifest
 * Server manifests map query hashes to operation details
 * 
 * @param docs - Array of GraphQL document nodes
 * @param config - Plugin configuration
 * @returns Server-side manifest object
 * @throws Error if an operation is missing a name
 */
export function generateServerManifest(
  docs: DocumentNode[],
  config: PluginConfig,
): ServerOperationListManifest {
  const operations = processOperations(docs, config);
  
  const manifest: ServerOperationListManifest = {
    format: 'apollo-persisted-query-manifest',
    version: 1,
    operations: {},
  };
  
  for (const operation of operations) {
    const operationDetails: PersistedQueryManifestOperation = {
      type: operation.type,
      name: operation.name,
      body: operation.query,
    };
    
    manifest.operations[operation.hash] = operationDetails;
  }

  return manifest;
}