# GraphQL CodeGen Persisted Query List

A GraphQL CodeGen plugin for generating persisted query manifests.

## Installation

```bash
pnpm add -D graphql-codegen-persisted-query-list
```

## Usage

Add the plugin to your GraphQL CodeGen configuration:

### Using YAML Config

```yml
# codegen.yml
generates:
  ./generated-gql/persisted-query-manifest/client.json:
    plugins:
      - graphql-codegen-persisted-query-list
    config:
      output: client
      
  ./generated-gql/persisted-query-manifest/server.json:
    plugins:
      - graphql-codegen-persisted-query-list
    config:
      output: server
      includeAlgorithmPrefix: true # Enable prefixed document identifiers for compliance with GraphQL over HTTP spec
```

### Using JavaScript/TypeScript Config

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // ... other config
  generates: {
    './generated-gql/persisted-query-manifest/client.json': {
      documents: ['./client/**/*.{graphql,gql}', './pages/**/*.{graphql,gql}'],
      plugins: ['graphql-codegen-persisted-query-list'],
      config: {
        output: 'client',
      },
    },
    './generated-gql/persisted-query-manifest/server.json': {
      documents: ['./client/**/*.{graphql,gql}', './pages/**/*.{graphql,gql}'],
      plugins: ['graphql-codegen-persisted-query-list'],
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

The plugin's workflow is straightforward but powerful:

1. It collects all GraphQL operations from your codebase
2. It extracts and resolves all fragments used in each operation
3. It outputs a manifest file in your chosen format (client or server)

All generated hashes use the algorithm you specify (default: `sha256`). You can enable the "Prefixed Document Identifier" format (e.g., `sha256:abc123...`) for compliance with the [GraphQL over HTTP specification](https://github.com/graphql/graphql-over-http/blob/52d56fb36d51c17e08a920510a23bdc2f6a720be/spec/Appendix%20A%20--%20Persisted%20Documents.md#sha256-hex-document-identifier) by setting `includeAlgorithmPrefix: true`.

## License

MIT