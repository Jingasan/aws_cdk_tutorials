import { PROJECT_NAME, type StageConfig } from './common.js';

export const devConfig: StageConfig = {
  projectName: PROJECT_NAME,
  stageName: 'dev',
  lambdaMemoryMiB: 128,
};
