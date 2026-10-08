import { type TestDataLoaderConfig } from './config';
type TestDataLoader = {
    <T = unknown>(dataPath: string): T;
    config(options: TestDataLoaderConfig): void;
};
declare const testDataLoader: TestDataLoader;
export default testDataLoader;
