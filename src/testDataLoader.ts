import fs from 'node:fs';
import path from 'node:path';

import {
  getConfig,
  setConfig,
  type TestDataLoaderConfig,
} from './config';

type TestDataLoader = {
  <T = unknown>(dataPath: string): T;
  config(options: TestDataLoaderConfig): void;
};

const loader = <T = unknown>(dataPath: string): T => {
  const config = getConfig();

  const normalizedPath = normalizeLoaderPath(dataPath);

  const directory = path.resolve(
    process.cwd(),
    config.dataPath,
    normalizedPath,
  );

  if (!fs.existsSync(directory)) {
    throw new Error(
      `testDataLoader: directory does not exist: "${directory}".`,
    );
  }

  if (!fs.statSync(directory).isDirectory()) {
    throw new Error(
      `testDataLoader: path is not a directory: "${directory}".`,
    );
  }

  const suffix = `.${config.dataTarget}.ts`;

  const matchingFiles = fs
    .readdirSync(directory)
    .filter(file => file.endsWith(suffix));

  if (matchingFiles.length === 0) {
    throw new Error(
      `testDataLoader: no "${suffix}" file found in "${directory}".`,
    );
  }

  if (matchingFiles.length > 1) {
    throw new Error(
      `testDataLoader: multiple "${suffix}" files found in "${directory}": ${matchingFiles.join(', ')}.`,
    );
  }

  const filePath = path.join(directory, matchingFiles[0]);

  const loadedModule = require(filePath) as {
    default?: T;
  } | T;

  if (
    typeof loadedModule === 'object' &&
    loadedModule !== null &&
    'default' in loadedModule
  ) {
    return loadedModule.default as T;
  }

  return loadedModule as T;
};

loader.config = (options: TestDataLoaderConfig): void => {
  setConfig(options);
};

function normalizeLoaderPath(loaderPath: string): string {
  if (!loaderPath.startsWith('/')) {
    throw new Error(
      `testDataLoader: path "${loaderPath}" must start with "/".`,
    );
  }

  if (loaderPath === '/') {
    return '';
  }

  const normalizedPath = loaderPath
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  const segments = normalizedPath.split('/');

  if (segments.includes('..')) {
    throw new Error(
      `testDataLoader: path "${loaderPath}" cannot contain "..".`,
    );
  }

  return normalizedPath;
}

const testDataLoader = loader as TestDataLoader;

export default testDataLoader;