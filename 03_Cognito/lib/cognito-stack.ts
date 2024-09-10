import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { randomUUID } from "crypto";

// CDKで作成する各リソース名のPrefix
const name = "cognito-cdk" + randomUUID();

export class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Cognitoユーザープールの作成
     */
    const userPool = new cognito.UserPool(this, "Sample-users-pool", {
      // ユーザープール名
      userPoolName: name,
      // セルフサインアップを有効にするかどうか(Default: false)
      selfSignUpEnabled: true,
      // ユーザー名の他に認証での利用を許可する属性(username/email/phone/preferredUsername)
      signInAliases: { email: true },
      // 属性の追加
      standardAttributes: {
        givenName: { required: true },
        familyName: { required: true },
      },
      // カスタム属性の追加
      customAttributes: {
        family_name_kana: new cognito.StringAttribute({
          minLen: 1,
          maxLen: 256,
          mutable: true,
        }),
        given_name_kana: new cognito.StringAttribute({
          minLen: 1,
          maxLen: 256,
          mutable: true,
        }),
      },
      // パスワードポリシーの設定
      passwordPolicy: {
        minLength: 10, // 最小文字数
        requireLowercase: false, // 小文字を必須とするか
        requireUppercase: false, // 大文字を必須とするか
        requireDigits: false, // 数字を必須とするか
        requireSymbols: false, // 記号を必須とするか
        tempPasswordValidity: cdk.Duration.days(7), // 一時パスワードの有効期間(日)
      },
      // Lambdaトリガーの設定
      lambdaTriggers: {
        // 認証後のLambda実行の設定
        postConfirmation: undefined,
      },
      // ユーザーアカウントの復旧方法
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      // cdk destroy時に削除するかの設定(Default: RETAIN (削除されない))
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * ユーザープールクライアントの追加
     */
    userPool.addClient("Application", {
      // ユーザープールクライアント名
      userPoolClientName: name,
      // シークレットを作成するか false(default):作成しない
      generateSecret: false,
      // 高度な認証設定のトークンの取り消しを有効化
      enableTokenRevocation: true,
      // ユーザー存在エラーの防止 true:有効化
      preventUserExistenceErrors: true,
      // サポートするプロバイダー
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      // OAuthの設定
      oAuth: {
        // OAuth2.0で利用する認可フロー
        flows: {
          authorizationCodeGrant: true, // 認証コード付与
          clientCredentials: true,
          implicitCodeGrant: true, // 暗黙的な付与
        },
        // 許可するサインイン後のリダイレクト先URL群
        callbackUrls: [],
        // 許可するサインアウト後のリダイレクト先URL群
        logoutUrls: [],
      },
      authFlows: {
        // 管理ユーザーによるユーザー名とパスワードでの認証(サーバーサイドで利用)
        adminUserPassword: true,
        // ユーザー名とパスワードでの認証
        userPassword: true,
        // SRP(セキュアリモートパスワード)プロトコルベースの認証(最もセキュアなため、利用推奨)
        userSrp: true,
      },
      // 認証フローセッションの持続期間(分)(3-15分の範囲で指定)
      authSessionValidity: cdk.Duration.minutes(3),
      // IDトークンの有効期限(5分-1日の範囲で指定)
      idTokenValidity: cdk.Duration.seconds(1800),
      // アクセストークンの有効期限(5分-1日の範囲で指定)
      accessTokenValidity: cdk.Duration.seconds(1800),
      // リフレッシュトークンの有効期限
      // 60分-10年の範囲で指定, IDトークン/アクセストークンよりも長い時間を指定すること
      refreshTokenValidity: cdk.Duration.seconds(3600),
    });
  }
}
