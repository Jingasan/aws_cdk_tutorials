import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { randomUUID } from "crypto";

export class LambdaTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Lambda関数の作成
     */
    const func = new NodejsFunction(this, "Function", {
      entry: "lib/lambda.ts",
      runtime: Runtime.NODEJS_20_X,
      functionName: "hello-world-" + randomUUID(),
    });
  }
}
