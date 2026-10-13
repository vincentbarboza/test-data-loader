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

  const dataTarget =
    resolveDataTarget() ??
    (isPlaywrightDiscoveryProcess() ? config.dataTargets[0] : undefined);

  if (!dataTarget) {
    throw new Error(
      [
        'testDataLoader: missing data target.',
        '',
        `Allowed values: ${config.dataTargets.join(', ')}`,
        '',
        `Example: dataTarget=${config.dataTargets[0]} npx playwright test`,
        `Example: DATA_TARGET=${config.dataTargets[0]} npx playwright test`,
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

function resolveDataTarget(): string | undefined {
  const candidates = [
    process.env.dataTarget,
    process.env.DATA_TARGET,
    process.env.data_target,
    process.env.npm_config_dataTarget,
    process.env.npm_config_data_target,
    process.env.npm_package_config_dataTarget,
    process.env.npm_package_config_data_target,
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim();
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

function isPlaywrightDiscoveryProcess(): boolean {
  if (process.env.TEST_WORKER_INDEX !== undefined) {
    return false;
  }

  const args = process.argv.slice(2);
  return (
    args.includes('--list') ||
    args.includes('test-server') ||
    args.includes('test')
  );
}

function normalizeDataPath(dataPath: string): string {
  return dataPath.replace(/[\\/]+$/, '');
}