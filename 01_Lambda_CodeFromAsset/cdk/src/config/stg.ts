import { PROJECT_NAME, type StageConfig } from './common.js';

export const stgConfig: StageConfig = {
  projectName: PROJECT_NAME,
  stageName: 'stg',
  lambdaMemoryMiB: 512,
};
