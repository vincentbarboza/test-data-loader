# Test Data Loader

A small library for loading TypeScript test fixtures from a configured directory, dynamically selecting the data set based on the runtime environment.

It lets you separate test data by `dataTarget` (for example, `unit`, `integration`, or `e2e`) and automatically find the matching file in your project directory structure.

## Features

- Loads test data from a configured directory
- Supports multiple targets through `dataTargets`
- Automatically selects a file that matches the `dataTarget` value
- Organizes fixtures by route or context, close to the test code
- Works with TypeScript/Node modules that use a default export

## Requirements

- Node.js 18+
- A test runner or TypeScript runtime setup that can load `.ts` fixture files with `require()`
- TypeScript and `@types/node` are needed to build this repository locally

## Installation

Add the GitHub dependency to the consuming project's `package.json`:

```json
{
  "dependencies": {
    "@vincent/test-data-loader": "git+https://github.com/vincentbarboza/test-data-loader.git#main"
  }
}
```

Then run `npm install`. The `prepare` script builds the library during installation, so the `dist` directory does not need to be committed to Git. For reproducible installations, replace `main` with a tag or a specific commit hash.

To work on this repository locally, install the dependencies and build the project:

```bash
npm install
npm run build
```

## Configuration

Before loading data, call `config()` with the allowed `dataTargets` and the base path for your test data files.

```ts
import testDataLoader from '@vincent/test-data-loader';

testDataLoader.config({
  dataTargets: ['unit', 'integration'],
  dataPath: './test-data',
});
```

### Environment variable

The library reads the `dataTarget` environment variable:

```bash
dataTarget=unit npx jest
```

Or, in Windows PowerShell:

```powershell
$env:dataTarget = 'unit'
npx jest
```

An error is thrown if `dataTarget` is missing or is not one of the allowed values.

## Expected directory structure

The configured `dataPath` is used as the root directory. The loader accepts a path that starts with `/` and looks for the corresponding file under that root.

For example:

```text
project/
├── test-data/
│   └── users/
│       └── list/
│           ├── data.unit.ts
│           └── data.integration.ts
├── src/
│   └── users.spec.ts
└── package.json
```

With this configuration:

```ts
testDataLoader.config({
  dataTargets: ['unit', 'integration'],
  dataPath: './test-data',
});
```

And this environment variable:

```bash
dataTarget=integration
```

The following call:

```ts
const users = testDataLoader('/users/list');
```

will search in:

```text
./test-data/users/list/
```

and load the matching file, `data.integration.ts`.

## Example data file

```ts
export default [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];
```

The loader also supports a default export of an object or a simple value:

```ts
const data = {
  total: 2,
  items: ['alpha', 'beta'],
};

export default data;
```

## Important rules

- The path passed to `testDataLoader()` must start with `/`
- The path must not contain `..`
- The target directory must exist
- Exactly one file ending in `.<dataTarget>.ts` must be present in the target directory
- Fixture files can use `export default`; CommonJS modules that export the value directly are also supported

## Complete example

```ts
import testDataLoader from '@vincent/test-data-loader';

testDataLoader.config({
  dataTargets: ['unit', 'integration'],
  dataPath: './test-data',
});

const userData = testDataLoader('/users/profile');

console.log(userData);
```

## Project scripts

Build the project with:

```bash
npm run build
```

## About

This project provides a lightweight way to keep environment-specific test data in dedicated TypeScript fixture files, instead of hardcoding fixtures directly in tests.
