import { PROJECT_NAME, type StageConfig } from './common.js';

export const prodConfig: StageConfig = {
  projectName: PROJECT_NAME,
  stageName: 'prod',
  lambdaMemoryMiB: 512,
};
