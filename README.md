# GraphQL CodeGen Persisted Queries

A GraphQL Codegen plugin for generating persisted query manifests for server and client.

## Installation

```bash
pnpm add -D @replit/graphql-codegen-persisted-queries
```

## Usage

### YAML Config

```yml
# codegen.yml
generates:
  ./generated-gql/persisted-query-manifest/client.json:
    plugins:
      - @replit/graphql-codegen-persisted-queries
    config:
      output: client
      
  ./generated-gql/persisted-query-manifest/server.json:
    plugins:
      - @replit/graphql-codegen-persisted-queries
    config:
      output: server
      includeAlgorithmPrefix: true # Enable prefixed document identifiers for compliance with GraphQL over HTTP spec
```

### TypeScript Config

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // ... other config
  generates: {
    './generated-gql/persisted-query-manifest/client.json': {
      documents: ['./client/**/*.{graphql,gql}', './pages/**/*.{graphql,gql}'],
      plugins: ['@replit/graphql-codegen-persisted-queries'],
      config: {
        output: 'client',
      },
    },
    './generated-gql/persisted-query-manifest/server.json': {
      documents: ['./client/**/*.{graphql,gql}', './pages/**/*.{graphql,gql}'],
      plugins: ['@replit/graphql-codegen-persisted-queries'],
      config: {
        output: 'server',
        includeAlgorithmPrefix: true, // Enable prefixed document identifiers for compliance with GraphQL over HTTP spec
      },
    }
  }
};

export default config;
```

## Configuration Options

| Option                  | Type                   | Default    | Description                                                            |
|-------------------------|------------------------|------------|------------------------------------------------------------------------|
| `output`                | `'client' \| 'server'` | (required) | Format of the generated manifest                                       |
| `algorithm`             | `string`               | `'sha256'` | Hash algorithm to use for generating operation IDs                     |
| `includeAlgorithmPrefix`| `boolean`              | `false`    | Whether to prefix hashes with algorithm name (e.g., `sha256:abc123...`) |

## Output Formats

### Client Format

The client format provides a simple mapping between operation names and their hashes, making it easy for clients to reference operations by name:

```json
{
   "GetUser": "abcdef123456...",
   "UpdateUser": "fedcba654321..."
}
```

With `includeAlgorithmPrefix: true`:

```json
{
   "GetUser": "sha256:abcdef123456...",
   "UpdateUser": "sha256:fedcba654321..."
}
```

### Server Format

The server format is more comprehensive, mapping operation hashes to their complete details (type, name, and body). This is ideal for server-side lookup and validation:

```json
{
   "format": "apollo-persisted-query-manifest",
   "version": 1,
   "operations": {
      "abcdef123456...": {
         "type": "query",
         "name": "GetUser",
         "body": "query GetUser { user { id name } }"
      },
      "fedcba654321...": {
         "type": "mutation",
         "name": "UpdateUser",
         "body": "mutation UpdateUser($id: ID!, $name: String!) { updateUser(id: $id, name: $name) { id name } }"
      }
   }
}
```

With `includeAlgorithmPrefix: true`:

```json
{
   "format": "apollo-persisted-query-manifest",
   "version": 1,
   "operations": {
      "sha256:abcdef123456...": {
         "type": "query",
         "name": "GetUser",
         "body": "query GetUser { user { id name } }"
      },
      "sha256:fedcba654321...": {
         "type": "mutation",
         "name": "UpdateUser",
         "body": "mutation UpdateUser($id: ID!, $name: String!) { updateUser(id: $id, name: $name) { id name } }"
      }
   }
}
```

## How It Works

The plugin's workflow is straightforward:

1. It collects all GraphQL operations from your codebase
2. It adds `__typename` to all selection sets in the operations for proper type resolution
3. It identifies all fragments used in each operation, resolving them recursively to ensure all nested fragments are included
4. It orders the documents with operation definitions first, followed by fragments to ensure hash consistency
5. It generates operation hashes using the specified algorithm (default: `sha256`)
6. It outputs a manifest file in your chosen format (client or server)

You can enable the "Prefixed Document Identifier" format (e.g., `sha256:abc123...`) for compliance with the [GraphQL over HTTP specification (RFC at the time of publishing this package)](https://github.com/graphql/graphql-over-http/blob/52d56fb36d51c17e08a920510a23bdc2f6a720be/spec/Appendix%20A%20--%20Persisted%20Documents.md#sha256-hex-document-identifier) by setting `includeAlgorithmPrefix: true`.

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Watch mode for development
pnpm dev
```

### Testing

The plugin includes a comprehensive test suite built with Vitest:

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## License

MIT
