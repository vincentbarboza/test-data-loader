export interface TestDataLoaderConfig {
  dataTargets: readonly string[];
  dataPath: string;
}

interface InternalConfig {
  dataTargets: readonly string[];
  dataPath: string;
}

interface RuntimeConfig extends InternalConfig {
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

  config = {
    dataTargets: options.dataTargets,
    dataPath: normalizeDataPath(options.dataPath),
  };
}

export function getConfig(): RuntimeConfig {
  if (!config) {
    throw new Error(
      'testDataLoader has not been configured. Call testDataLoader.config() first.',
    );
  }

  const dataTarget = process.env.dataTarget;

  if (!dataTarget) {
    throw new Error(
      [
        'testDataLoader: missing data target.',
        '',
        `Allowed values: ${config.dataTargets.join(', ')}`,
        '',
        `Example: dataTarget=${config.dataTargets[0]} npx playwright test`,
      ].join('\n'),
    );
  }

  if (!config.dataTargets.includes(dataTarget)) {
    throw new Error(
      [
        `testDataLoader: invalid data target "${dataTarget}".`,
        '',
        `Allowed values: ${config.dataTargets.join(', ')}`,
      ].join('\n'),
    );
  }

  return {
    ...config,
    dataTarget,
  };
}

function normalizeDataPath(dataPath: string): string {
  return dataPath.replace(/[\\/]+$/, '');
}