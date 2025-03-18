import { DocumentNode, visit } from 'graphql';
import { 
  PluginConfig, 
  QueryIdentifierMap 
} from '../types';
import { createHash } from '../utils/hashing';
import { addTypenameToDocument } from '../utils/transforms';
import { findFragments, findUsedFragments } from '../utils/fragments';
import { printDefinitions } from '../utils/transforms';

/**
 * Generates query identifiers for all operations in the provided documents
 * 
 * @param docs - Array of GraphQL document nodes
 * @param config - Plugin configuration
 * @returns Map of operation names to their identifiers
 * @throws Error if an operation is missing a name
 */
export function generateQueryIds(
  docs: DocumentNode[],
  config: PluginConfig,
): QueryIdentifierMap {
  // Add __typename to all selection sets
  const processedDocs = docs.map(addTypenameToDocument);

  const result: QueryIdentifierMap = {};
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

          // The order is important here. We want to print the operation definition first,
          // then the fragments as they are included.
          // Otherwise, the generated hashes won't match with the one generated on the server.
          const query = printDefinitions([
            def,
            ...Array.from(usedFragments.values()),
          ]);

          const hash = createHash(query, config);
          const usesVariables = Boolean(
            def.variableDefinitions && def.variableDefinitions.length > 0,
          );

          result[operationName] = {
            hash,
            query,
            usesVariables,
            loc: doc.loc,
          };
        },
      },
    });
  }

  return result;
}