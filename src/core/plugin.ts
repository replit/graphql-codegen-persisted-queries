import { DocumentNode } from 'graphql';
import { PersistedQueryPlugin } from '../types';
import { generateClientManifest, generateServerManifest } from './generator';

/**
 * GraphQL CodeGen plugin for generating persisted operation manifests
 * 
 * @param _schema - GraphQL schema (unused)
 * @param documents - GraphQL documents to process
 * @param config - Plugin configuration
 * @returns JSON string representation of the generated manifest
 * @throws Error if no documents are provided or output format is not specified
 * 
 * For GraphQL over HTTP specification compliance, set `includeAlgorithmPrefix: true`
 * to enable the "Prefixed Document Identifier" format (e.g., `sha256:abc123...`).
 */
export const plugin: PersistedQueryPlugin = (
  _schema,
  documents,
  config,
) => {
  // Validate input documents
  if (
    !documents ||
    documents.length === 0 ||
    documents.some((doc) => !doc?.document)
  ) {
    throw new Error('Found no documents to generate persisted operation ids.');
  }

  // Extract document nodes
  const documentNodes: DocumentNode[] = documents
    .map((doc) => doc.document)
    .filter((doc): doc is DocumentNode => doc !== undefined);

  // Generate appropriate manifest format based on configuration
  if (config.output === 'client') {
    return JSON.stringify(generateClientManifest(documentNodes, config), null, '   ');
  } else if (config.output === 'server') {
    return JSON.stringify(generateServerManifest(documentNodes, config), null, '   ');
  } else {
    throw new Error("Must configure output to 'server' or 'client'");
  }
};