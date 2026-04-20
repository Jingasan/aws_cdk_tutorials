import * as cdk from 'aws-cdk-lib';
import type { StageConfig } from '../config/common.js';
import { Stack } from '../lib/stacks/stack.js';

export function createApp(config: StageConfig): void {
  const app = new cdk.App();
  const account = process.env['CDK_DEFAULT_ACCOUNT'];
  const prefix = `${config.projectName}-${config.stageName}`;

  /** その他のリソースは ap-northeast-1 に配置 */
  new Stack(app, `${prefix}-Stack`, {
    config,
    env: { account, region: 'ap-northeast-1' },
    crossRegionReferences: true,
  });
}
