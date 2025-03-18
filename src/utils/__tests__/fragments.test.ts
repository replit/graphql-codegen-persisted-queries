import { describe, test, expect } from 'vitest';
import { findFragments, findUsedFragments } from '../fragments';
import { parse } from 'graphql';

describe('Fragment Utilities', () => {
  describe('findFragments', () => {
    test('finds all fragments in documents', () => {
      const doc = parse(`
        fragment UserFragment on User {
          id
          name
        }
        
        fragment PostFragment on Post {
          id
          title
        }
        
        query GetUser {
          user {
            ...UserFragment
          }
        }
      `);

      const fragments = findFragments([doc]);

      expect(fragments.size).toBe(2);
      expect(fragments.has('UserFragment')).toBe(true);
      expect(fragments.has('PostFragment')).toBe(true);
      expect(fragments.has('NonExistentFragment')).toBe(false);
    });

    test('returns empty map when no fragments are found', () => {
      const doc = parse(`
        query SimpleQuery {
          hello
        }
      `);

      const fragments = findFragments([doc]);

      expect(fragments.size).toBe(0);
    });

    test('finds fragments across multiple documents', () => {
      const doc1 = parse(`
        fragment UserFragment on User {
          id
          name
        }
      `);

      const doc2 = parse(`
        fragment PostFragment on Post {
          id
          title
        }
      `);

      const fragments = findFragments([doc1, doc2]);

      expect(fragments.size).toBe(2);
      expect(fragments.has('UserFragment')).toBe(true);
      expect(fragments.has('PostFragment')).toBe(true);
    });
  });

  describe('findUsedFragments', () => {
    test('finds directly used fragments', () => {
      const doc = parse(`
        fragment UserFragment on User {
          id
          name
        }
        
        fragment PostFragment on Post {
          id
          title
        }
        
        query GetUser {
          user {
            ...UserFragment
          }
        }
      `);

      const fragments = findFragments([doc]);
      const operation = doc.definitions.find(
        (def) => def.kind === 'OperationDefinition',
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usedFragments = findUsedFragments(operation as any, fragments);

      expect(usedFragments.size).toBe(1);
      expect(usedFragments.has('UserFragment')).toBe(true);
      expect(usedFragments.has('PostFragment')).toBe(false);
    });

    test('finds nested fragments', () => {
      const doc = parse(`
        fragment NameFragment on User {
          firstName
          lastName
        }
        
        fragment UserFragment on User {
          id
          ...NameFragment
        }
        
        query GetUser {
          user {
            ...UserFragment
          }
        }
      `);

      const fragments = findFragments([doc]);
      const operation = doc.definitions.find(
        (def) => def.kind === 'OperationDefinition',
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usedFragments = findUsedFragments(operation as any, fragments);

      expect(usedFragments.size).toBe(2);
      expect(usedFragments.has('UserFragment')).toBe(true);
      expect(usedFragments.has('NameFragment')).toBe(true);
    });

    test('throws error on unknown fragment', () => {
      const doc = parse(`
        query GetUser {
          user {
            ...UnknownFragment
          }
        }
      `);

      const fragments = new Map();
      const operation = doc.definitions.find(
        (def) => def.kind === 'OperationDefinition',
      );

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        findUsedFragments(operation as any, fragments),
      ).toThrow('Unknown fragment: UnknownFragment');
    });

    test('handles circular fragment references', () => {
      const doc = parse(`
        fragment Fragment1 on Type {
          field1
          ...Fragment2
        }
        
        fragment Fragment2 on Type {
          field2
          ...Fragment1
        }
        
        query Test {
          ...Fragment1
        }
      `);

      const fragments = findFragments([doc]);
      const operation = doc.definitions.find(
        (def) => def.kind === 'OperationDefinition',
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usedFragments = findUsedFragments(operation as any, fragments);

      expect(usedFragments.size).toBe(2);
      expect(usedFragments.has('Fragment1')).toBe(true);
      expect(usedFragments.has('Fragment2')).toBe(true);
    });
  });
});
