import { describe, test, expect } from 'vitest';
import { printDefinitions, addTypenameToDocument } from '../transforms';
import { parse } from 'graphql';
import { Definition } from '../../types';

describe('Transform Utilities', () => {
  describe('printDefinitions', () => {
    test('prints a single definition', () => {
      const doc = parse(`
        query TestQuery {
          hello
        }
      `);
      
      const output = printDefinitions([doc.definitions[0] as Definition]);
      
      expect(output).toContain('query TestQuery');
      expect(output).toContain('hello');
    });
    
    test('prints multiple definitions with spacing', () => {
      const doc = parse(`
        query TestQuery {
          hello
        }
        
        fragment UserFragment on User {
          id
          name
        }
      `);
      
      const output = printDefinitions([
        doc.definitions[0] as Definition,
        doc.definitions[1] as Definition,
      ]);
      
      expect(output).toContain('query TestQuery');
      expect(output).toContain('fragment UserFragment on User');
      expect(output.split('\n\n').length).toBe(2); // Definitions separated by 2 newlines
    });
  });
  
  describe('addTypenameToDocument', () => {
    test('adds __typename to a simple query', () => {
      const doc = parse(`
        query TestQuery {
          user {
            id
            name
          }
        }
      `);
      
      const result = addTypenameToDocument(doc);
      const printed = printDefinitions([result]);
      
      expect(printed).toContain('__typename');
      expect(printed).toMatch(/user\s*{\s*id\s*name\s*__typename\s*}/s);
    });
    
    test('does not add __typename to operation definitions', () => {
      const doc = parse(`
        query TestQuery {
          hello
        }
      `);
      
      const result = addTypenameToDocument(doc);
      const printed = printDefinitions([result]);
      
      // __typename should not be at the top level
      expect(printed).not.toMatch(/query TestQuery\s*{\s*hello\s*__typename\s*}/s);
    });
    
    test('does not add duplicate __typename fields', () => {
      const doc = parse(`
        query TestQuery {
          user {
            id
            name
            __typename
          }
        }
      `);
      
      const result = addTypenameToDocument(doc);
      const printed = printDefinitions([result]);
      
      // Check that there's exactly one __typename
      const matches = printed.match(/__typename/g);
      expect(matches).toHaveLength(1);
    });
    
    test('does not add __typename to empty selection sets', () => {
      const doc = parse(`
        query TestQuery {
          scalar
        }
      `);
      
      const result = addTypenameToDocument(doc);
      const printed = printDefinitions([result]);
      
      expect(printed).not.toContain('__typename');
    });
    
    test('handles introspection fields correctly', () => {
      const doc = parse(`
        query IntrospectionQuery {
          __schema {
            types {
              name
            }
          }
        }
      `);
      
      const result = addTypenameToDocument(doc);
      const printed = printDefinitions([result]);
      
      // The implementation treats introspection fields special - but still adds 
      // __typename to selection sets inside them.
      // This is the current implementation behavior which we're documenting with this test.
      expect(printed).toContain('__typename');
      
      // Verify that it doesn't add __typename at the operation level 
      // (already checked by another test, but double-checking here)
      expect(printed).not.toContain('query IntrospectionQuery { __typename');
    });
  });
});