export interface TestDataLoaderConfig {
    dataTargets: readonly string[];
    dataPath: string;
}
interface InternalConfig {
    dataTargets: readonly string[];
    dataPath: string;
    dataTarget: string;
}
export declare function setConfig(options: TestDataLoaderConfig): void;
export declare function getConfig(): InternalConfig;
export {};
