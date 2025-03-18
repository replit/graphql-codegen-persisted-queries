import {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  visit,
} from 'graphql';

/**
 * Extracts all fragment definitions from an array of documents
 *
 * @param docs - Array of GraphQL document nodes to scan
 * @returns A map of fragment names to their definitions
 */
export function findFragments(
  docs: (DocumentNode | FragmentDefinitionNode)[],
): Map<string, FragmentDefinitionNode> {
  const fragments = new Map<string, FragmentDefinitionNode>();

  for (const doc of docs) {
    visit(doc, {
      FragmentDefinition: {
        enter(node) {
          fragments.set(node.name.value, node);
        },
      },
    });
  }

  return fragments;
}

/**
 * Finds all fragments used in an operation or fragment, including nested fragments
 *
 * @param operation - The operation or fragment to analyze
 * @param knownFragments - Map of all available fragments
 * @param _usedFragments - Optional accumulator for recursive calls
 * @returns Map of all fragments used by the operation
 * @throws Error if a referenced fragment cannot be found
 */
export function findUsedFragments(
  operation: OperationDefinitionNode | FragmentDefinitionNode,
  knownFragments: ReadonlyMap<string, FragmentDefinitionNode>,
  _usedFragments?: Map<string, FragmentDefinitionNode>,
): Map<string, FragmentDefinitionNode> {
  const usedFragments = _usedFragments
    ? _usedFragments
    : new Map<string, FragmentDefinitionNode>();

  visit(operation, {
    FragmentSpread: {
      enter(node) {
        const fragmentName = node.name.value;
        const fragment = knownFragments.get(fragmentName);

        if (fragment) {
          // Skip if we've already processed this fragment to avoid circular references
          if (usedFragments.has(fragmentName)) {
            return;
          }

          usedFragments.set(fragmentName, fragment);
          // Recursively find nested fragments
          findUsedFragments(fragment, knownFragments, usedFragments);
        } else {
          throw new Error(`Unknown fragment: ${fragmentName}`);
        }
      },
    },
  });

  return usedFragments;
}
