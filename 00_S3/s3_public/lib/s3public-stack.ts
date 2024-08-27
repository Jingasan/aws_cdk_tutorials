import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as S3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import { randomUUID } from "crypto";

export class S3PublicStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * バケットの作成
     */
    const bucket = new S3.Bucket(this, "CreateBucket", {
      // バケット名
      bucketName: "test-bucket-" + randomUUID(),
      // パブリックアクセスを許可
      publicReadAccess: true,
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ACLS,
      // バケットの削除を許可
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * バケットポリシーの設定
     */
    const bucketPolicy = new iam.PolicyStatement({
      sid: "BucketPolicy",
      // 不特定多数からのアクセスを許可
      effect: iam.Effect.ALLOW,
      principals: [new iam.ArnPrincipal("*")],
      actions: ["s3:GetObject"],
      resources: [bucket.bucketArn, bucket.bucketArn + "/*"],
      conditions: {},
    });
    bucket.addToResourcePolicy(bucketPolicy);
  }
}
