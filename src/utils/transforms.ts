import { 
  DocumentNode, 
  FieldNode, 
  Kind, 
  OperationDefinitionNode, 
  print, 
  visit 
} from 'graphql';
import { Definition } from '../types';

/**
 * Typename field definition to add to selection sets
 */
const TYPENAME_FIELD: FieldNode = {
  kind: Kind.FIELD,
  name: {
    kind: Kind.NAME,
    value: '__typename',
  },
};

/**
 * Prints an array of definitions as a single string
 * 
 * @param definitions - Array of GraphQL definitions to print
 * @returns Printed string representation
 */
export function printDefinitions(definitions: (Definition | DocumentNode)[]): string {
  return definitions.map(print).join('\n\n');
}

/**
 * Adds __typename to all selection sets in a document
 * Adapted from Apollo Client
 * 
 * @param doc - GraphQL document node
 * @returns Document with __typename fields added
 */
export function addTypenameToDocument(doc: DocumentNode): DocumentNode {
  return visit(doc, {
    SelectionSet: {
      enter(node, _key, parent) {
        // Don't add __typename to OperationDefinitions
        if (
          parent &&
          (parent as OperationDefinitionNode).kind === 'OperationDefinition'
        ) {
          return;
        }

        // No changes if no selections
        const { selections } = node;
        if (!selections) {
          return;
        }

        // Skip if selection already has __typename
        const hasTypename = selections.some((selection) => {
          return (
            selection.kind === 'Field' &&
            (selection as FieldNode).name.value === '__typename'
          );
        });
        
        // Skip if this is an introspection query
        const isIntrospection = selections.some((selection) => {
          return (
            selection.kind === 'Field' &&
            (selection as FieldNode).name.value.startsWith('__')
          );
        });
        
        if (hasTypename || isIntrospection) {
          return;
        }

        // Create and return a new SelectionSet with a __typename Field
        return {
          ...node,
          selections: [...selections, TYPENAME_FIELD],
        };
      },
    },
  });
}