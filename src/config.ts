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

  const dataTarget = resolveDataTarget();

  if (!dataTarget) {
    throw new Error(
      [
        'testDataLoader: missing data target.',
        '',
        `Allowed values: ${config.dataTargets.join(', ')}`,
        '',
        `Example: dataTarget=${config.dataTargets[0]} npx playwright test`,
        `Example: DATA_TARGET=${config.dataTargets[0]} npx playwright test`,
        `Example: npx playwright test --dataTarget=${config.dataTargets[0]}`,
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

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (/^--dataTarget$/i.test(arg)) {
      const nextValue = argv[i + 1]?.trim();
      if (nextValue) {
        return nextValue;
      }
      return undefined;
    }

    if (/^--data-target$/i.test(arg)) {
      const nextValue = argv[i + 1]?.trim();
      if (nextValue) {
        return nextValue;
      }
      return undefined;
    }

    const optionMatch = arg.match(/^--dataTarget=(.+)$/i);
    if (optionMatch) {
      return optionMatch[1].trim();
    }

    const kebabMatch = arg.match(/^--data-target=(.+)$/i);
    if (kebabMatch) {
      return kebabMatch[1].trim();
    }
  }

  return undefined;
}

function normalizeDataPath(dataPath: string): string {
  return dataPath.replace(/[\\/]+$/, '');
}