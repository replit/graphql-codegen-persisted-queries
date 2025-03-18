import { describe, test, expect } from 'vitest';
import { plugin } from '../core/plugin';
import { parse, buildSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Persisted Query Plugin Integration Tests', () => {
  // Load test schema and documents
  const schemaPath = join(__dirname, 'fixtures/test-schema.graphql');
  const documentsPath = join(__dirname, 'fixtures/test-documents.graphql');

  const schemaDoc = readFileSync(schemaPath, 'utf8');
  const documentsDoc = readFileSync(documentsPath, 'utf8');

  const schema = buildSchema(schemaDoc);
  const documentNode = parse(documentsDoc);

  const documents: Types.DocumentFile[] = [
    {
      document: documentNode,
      location: documentsPath,
    },
  ];

  describe('Client Manifest Generation', () => {
    test('generates valid client manifest with default options', () => {
      const result = plugin(schema, documents, { output: 'client' });
      // We know result is a string, but TypeScript sees it as Promisable<string>
      const manifest = JSON.parse(result as string);

      // Use snapshot for client manifest
      expect(manifest).toMatchSnapshot();
    });

    test('generates valid client manifest with algorithm prefix', () => {
      const result = plugin(schema, documents, {
        output: 'client',
        includeAlgorithmPrefix: true,
      });
      // We know result is a string, but TypeScript sees it as Promisable<string>
      const manifest = JSON.parse(result as string);

      // Use snapshot for client manifest with algorithm prefix
      expect(manifest).toMatchSnapshot();
    });

    test('generates valid client manifest with custom algorithm', () => {
      const result = plugin(schema, documents, {
        output: 'client',
        algorithm: 'md5',
      });
      // We know result is a string, but TypeScript sees it as Promisable<string>
      const manifest = JSON.parse(result as string);

      // Use snapshot for client manifest with custom algorithm
      expect(manifest).toMatchSnapshot();
    });
  });

  describe('Server Manifest Generation', () => {
    test('generates valid server manifest with default options', () => {
      const result = plugin(schema, documents, { output: 'server' });
      // We know result is a string, but TypeScript sees it as Promisable<string>
      const manifest = JSON.parse(result as string);

      // Use snapshot for server manifest
      expect(manifest).toMatchSnapshot();
    });
  });

  describe('Error Handling', () => {
    test('throws error on missing operation names', () => {
      const docWithUnnamedOperation = parse(`
        query {
          hello
        }
      `);

      const docs: Types.DocumentFile[] = [
        {
          document: docWithUnnamedOperation,
          location: 'test.graphql',
        },
      ];

      expect(() => plugin(schema, docs, { output: 'client' })).toThrow(
        'OperationDefinition missing name',
      );
    });
  });
});
