export const PROJECT_NAME = 'cdk-tutorials';

export interface StageConfig {
  projectName: string;
  stageName: string;
  /** Lambda メモリサイズ (MiB) */
  lambdaMemoryMiB: number;
}
