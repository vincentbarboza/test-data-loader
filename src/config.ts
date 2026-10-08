export interface TestDataLoaderConfig {
  dataTargets: readonly string[];
  dataPath: string;
}

interface InternalConfig {
  dataTargets: readonly string[];
  dataPath: string;
  dataTarget: string;
}

let config: InternalConfig | undefined;

export function setConfig(options: TestDataLoaderConfig): void {
  if (!options.dataTargets.length) {
    throw new Error(
      'testDataLoader: "dataTargets" must contain at least one target.',
    );
  }

  if (!options.dataPath.trim()) {
    throw new Error(
      'testDataLoader: "dataPath" cannot be empty.',
    );
  }

  const dataTarget = process.env.dataTarget;

  if (!dataTarget) {
    throw new Error(
      [
        'testDataLoader: missing data target.',
        '',
        `Allowed values: ${options.dataTargets.join(', ')}`,
        '',
        `Example: dataTarget=${options.dataTargets[0]} npx playwright test`,
      ].join('\n'),
    );
  }

  if (!options.dataTargets.includes(dataTarget)) {
    throw new Error(
      [
        `testDataLoader: invalid data target "${dataTarget}".`,
        '',
        `Allowed values: ${options.dataTargets.join(', ')}`,
      ].join('\n'),
    );
  }

  config = {
    dataTargets: options.dataTargets,
    dataPath: normalizeDataPath(options.dataPath),
    dataTarget,
  };
}

export function getConfig(): InternalConfig {
  if (!config) {
    throw new Error(
      'testDataLoader has not been configured. Call testDataLoader.config() first.',
    );
  }

  return config;
}

function normalizeDataPath(dataPath: string): string {
  return dataPath.replace(/[\\/]+$/, '');
}