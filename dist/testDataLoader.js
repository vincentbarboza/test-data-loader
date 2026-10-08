"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("./config");
const loader = (dataPath) => {
    const config = (0, config_1.getConfig)();
    const normalizedPath = normalizeLoaderPath(dataPath);
    const directory = node_path_1.default.resolve(process.cwd(), config.dataPath, normalizedPath);
    if (!node_fs_1.default.existsSync(directory)) {
        throw new Error(`testDataLoader: directory does not exist: "${directory}".`);
    }
    if (!node_fs_1.default.statSync(directory).isDirectory()) {
        throw new Error(`testDataLoader: path is not a directory: "${directory}".`);
    }
    const suffix = `.${config.dataTarget}.ts`;
    const matchingFiles = node_fs_1.default
        .readdirSync(directory)
        .filter(file => file.endsWith(suffix));
    if (matchingFiles.length === 0) {
        throw new Error(`testDataLoader: no "${suffix}" file found in "${directory}".`);
    }
    if (matchingFiles.length > 1) {
        throw new Error(`testDataLoader: multiple "${suffix}" files found in "${directory}": ${matchingFiles.join(', ')}.`);
    }
    const filePath = node_path_1.default.join(directory, matchingFiles[0]);
    const loadedModule = require(filePath);
    if (typeof loadedModule === 'object' &&
        loadedModule !== null &&
        'default' in loadedModule) {
        return loadedModule.default;
    }
    return loadedModule;
};
loader.config = (options) => {
    (0, config_1.setConfig)(options);
};
function normalizeLoaderPath(loaderPath) {
    if (!loaderPath.startsWith('/')) {
        throw new Error(`testDataLoader: path "${loaderPath}" must start with "/".`);
    }
    if (loaderPath === '/') {
        return '';
    }
    const normalizedPath = loaderPath
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');
    const segments = normalizedPath.split('/');
    if (segments.includes('..')) {
        throw new Error(`testDataLoader: path "${loaderPath}" cannot contain "..".`);
    }
    return normalizedPath;
}
const testDataLoader = loader;
exports.default = testDataLoader;
