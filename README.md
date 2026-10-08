# Test Data Loader

A small library for loading TypeScript test fixtures from a configured directory and selecting data based on the runtime environment.

Use `dataTarget` to keep different sets of test data in separate files and load the matching set when running your tests.

## Features

- Loads test data from a configured directory
- Supports multiple targets through `dataTargets`
- Selects a fixture based on the `dataTarget` environment variable
- Organizes fixtures by feature or test context
- Supports default exports and direct CommonJS exports

## Requirements

- Node.js 18+
- A test runner or TypeScript runtime setup that can load `.ts` fixture files with `require()`

## Installation

Add the GitHub dependency to your project's `package.json`:

```json
{
  "devDependencies": {
    "@vincent/test-data-loader": "git+https://github.com/vincentbarboza/test-data-loader.git#main"
  }
}
```

Then run `npm install`. The library is built automatically during installation, so no manual build step is required. For reproducible installations, replace `main` with a tag or a specific commit hash.

## Playwright configuration

Configure the loader in `playwright.config.ts` before your tests import fixtures. Use target names that make sense for your project:

```ts
import { defineConfig } from '@playwright/test';
import testDataLoader from '@vincent/test-data-loader';

testDataLoader.config({
  dataTargets: ['targetA', 'targetB'],
  dataPath: './test-data',
});

export default defineConfig({});
```

The library reads the `dataTarget` environment variable. Run Playwright with the desired target:

```bash
dataTarget=targetA npx playwright test
```

In Windows PowerShell:

```powershell
$env:dataTarget='targetA'; npx playwright test
```

Use another configured value, such as `targetB`, to load its matching fixtures. An error is thrown if `dataTarget` is missing or is not one of the configured values.

## Fixture structure and loading

The configured `dataPath` is used as the root directory. The path passed to `testDataLoader()` starts with `/` and identifies a directory under that root. The loader looks in that directory for exactly one filename ending in `.<dataTarget>.ts`.

For example:

```text
project/
├── test-data/
│   └── search/
│       └── expectedData/
│           ├── fixture.targetA.ts
│           └── fixture.targetB.ts
├── tests/
│   └── search.spec.ts
├── playwright.config.ts
└── package.json
```

With `dataTarget=targetA`, this call:

```ts
const searchData = testDataLoader('/search/expectedData');
```

looks in `./test-data/search/expectedData/` and loads `fixture.targetA.ts`.

Fixture files can default-export objects, arrays, or simple values:

```ts
export default {
  query: 'example search',
  expectedResult: 'Example result',
};
```

## Complete Playwright example

This example shows how to load a target-specific fixture and use its values in a Playwright test. Adapt the page URL and selectors to your application:

```ts
import { expect, test } from '@playwright/test';
import testDataLoader from '@vincent/test-data-loader';

type SearchTestData = {
  query: string;
  expectedResult: string;
};

const searchData = testDataLoader<SearchTestData>('/search/expectedData');

test('shows the expected search result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill(searchData.query);
  await page.getByRole('button', { name: 'Search' }).click();

  await expect(
    page.getByRole('link', { name: searchData.expectedResult }),
  ).toBeVisible();
});
```

## Important rules

- The path passed to `testDataLoader()` must start with `/`
- The path must not contain `..`
- The target directory must exist
- Each configured `dataTarget` should contain one fixture per target
- Fixture files can use `export default`; CommonJS modules that export the value directly are also supported

## About

Test Data Loader provides a lightweight way to keep target-specific test data in dedicated TypeScript fixture files instead of hardcoding fixtures directly in tests.
