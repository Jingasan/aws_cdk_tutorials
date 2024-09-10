import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as IAM from "aws-cdk-lib/aws-iam";
import * as Lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as Logs from "aws-cdk-lib/aws-logs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { randomUUID } from "crypto";

// CDKで作成する各リソース名のPrefix
const name = "hello-cdk-" + randomUUID();

export class LambdaTsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Lambda用LogGroupの作成
     */
    const logGroup = new Logs.LogGroup(this, "MyLambdaLogGroup", {
      // ロググループ名
      logGroupName: `/aws/lambda/${name}`,
      // ログの保持期間：３ヵ月に設定
      retention: Logs.RetentionDays.THREE_MONTHS,
      // スタック削除時：LogGroupも削除
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * IAMロールの作成
     */
    const iamRoleForLambda = new IAM.Role(this, "iamRoleForLambda", {
      // ロール名
      roleName: `${name}-lambda-role`,
      // ロールの実行者 -> Lambda関数
      assumedBy: new IAM.ServicePrincipal("lambda.amazonaws.com"),
      // ロールの説明文
      description: "IAM Role for Lambda",
      // ロールに対するポリシーの割り当て
      managedPolicies: [
        // CloudWatchLogsへのログ出力を許可するポリシー
        IAM.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        // Lambda関数をVPCに設置する場合のポリシー
        // iam.ManagedPolicy.fromAwsManagedPolicyName(
        //   "service-role/AWSLambdaVPCAccessExecutionRole"
        // ),
      ],
    });

    /**
     * IAMポリシーの作成
     */
    // const iamPolicyForLambda = new iam.ManagedPolicy(
    //   this,
    //   "iamPolicyForLambda",
    //   {
    //     // ポリシー名
    //     managedPolicyName: name,
    //     // ポリシーの説明文
    //     description: "IAM Policy for Lambda",
    //     // ポリシー内容
    //     statements: [
    //       new iam.PolicyStatement({
    //         sid: "lambda",
    //         effect: iam.Effect.ALLOW,
    //         actions: [],
    //         resources: [],
    //         conditions: [],
    //       }),
    //     ],
    //   }
    // );

    // IAMロールにAWS管理ポリシー(S3フルアクセス権限)を追加
    iamRoleForLambda.addManagedPolicy(
      IAM.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    // IAMロールに自身で作成したポリシーを追加
    // iamRoleForLambda.addManagedPolicy(iamPolicyForLambda);

    /**
     * Lambda関数の作成
     */
    const lambdaFunc = new Lambda.NodejsFunction(this, "Function", {
      // 関数名
      functionName: name,
      // 実行環境の指定
      runtime: Runtime.NODEJS_20_X,
      // ハンドラーの指定
      entry: "lib/lambda.ts",
      // ロールの指定
      role: iamRoleForLambda,
      // Lambda関数のタイムアウト時間
      timeout: cdk.Duration.seconds(30),
      // Lambda関数のメモリサイズ
      memorySize: 128,
      // 環境変数の設定
      environment: {
        ENV_VALUE: "Hello, world!",
      },
      // ロググループの設定
      logGroup: logGroup,
      // Lambda関数の説明文
      description: "Lambda by CDK",
    });

    // API Gatewayの作成
    const restApi = new apigateway.RestApi(this, "RestApi", {
      // API Gateway名
      restApiName: name,
      // エンドポイントタイプ(EDGE(Default)/REGIONAL/PRIVATE)
      endpointTypes: [apigateway.EndpointType.EDGE],
      // デプロイ設定
      deployOptions: {
        // ステージ名(ステージ名はURLに入ってくる)
        stageName: "v1",
      },
      // API Gatewayの説明文
      description: "API Gateway by CDK",
    });

    // API Gatewayにリクエスト先のリソースを追加(エンドポイントの定義)
    const restApiHello = restApi.root.addResource("{proxy+}");

    // API GatewayのリソースにLambda関数を紐付け
    restApiHello.addMethod(
      "ANY", // HTTPの全メソッドを許可
      new cdk.aws_apigateway.LambdaIntegration(lambdaFunc), // Lambda関数を紐付け
      {
        authorizer: undefined, // 認証の指定(今回は認証を使用しない)
      }
    );
  }
}
