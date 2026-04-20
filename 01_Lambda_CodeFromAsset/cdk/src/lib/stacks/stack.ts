import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';
import type { StageConfig } from '../../config/common.js';

export interface StackProps extends cdk.StackProps {
  config: StageConfig;
}

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const { config } = props;

    // esbuild でバンドルされた dist/bin/ から ../../../lambda を解決
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const lambdaAssetPath = path.join(__dirname, '../../../lambda/dist');

    const fn = new lambda.Function(this, 'HelloLambda', {
      functionName: `${config.projectName}-${config.stageName}-hello`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(lambdaAssetPath),
      memorySize: config.lambdaMemoryMiB,
    });

    const fnUrl = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: fnUrl.url,
    });
  }
}
