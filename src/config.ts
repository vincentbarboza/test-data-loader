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

  const dataTarget = process.env.dataTarget?.trim();

  if (!dataTarget) {
    throw new Error(
      [
        'testDataLoader: missing data target.',
        '',
        ...formatDataTargetHelp(options.dataTargets),
      ].join('\n'),
    );
  }

  if (!options.dataTargets.includes(dataTarget)) {
    throw new Error(
      [
        `testDataLoader: invalid data target "${dataTarget}"`,
        '',
        ...formatDataTargetHelp(options.dataTargets),
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

function formatDataTargetHelp(dataTargets: readonly string[]): string[] {
  const defaultTarget = dataTargets[0];

  return [
    `Allowed values: [${dataTargets.map(target => `'${target}'`).join(', ')}]`,
    '',
    'Set dataTarget to one of the allowed values before loading test data.',
    'Bash:',
    `dataTarget=${defaultTarget} npm test`,
    '',
    'PowerShell:',
    `$env:dataTarget='${defaultTarget}'; npm test`,
    '',
  ];
}

function normalizeDataPath(dataPath: string): string {
  return dataPath.replace(/[\\/]+$/, '');
}