import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { randomUUID } from "crypto";
import * as fs from "fs";

// CDKで作成する各リソース名のPrefix
const name = "cognito-cdk-" + randomUUID();

export class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Cognitoユーザープールの作成
     */
    const userPool = new cognito.UserPool(this, "UserPool", {
      // ユーザープール名
      userPoolName: name,
      // ユーザーが自身でサインアップできるようにするかどうか(Default: false)
      selfSignUpEnabled: true,
      // サインアップ後のユーザー確認方法
      userVerification: {
        // コードによる検証
        emailStyle: cognito.VerificationEmailStyle.CODE,
        // 検証メッセージ
        emailSubject: "Verify email message",
        emailBody: "Thanks for signing up! Your verification code is {####}",
        smsMessage: "Thanks for signing up! Your verification code is {####}",
      },
      // ユーザー名の他に認証での利用を許可する属性(username/email/phone/preferredUsername)
      signInAliases: { email: true },
      // 属性の追加
      standardAttributes: {
        givenName: { required: false },
        familyName: { required: false },
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
        minLength: 8, // 最小文字数
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
     * アプリケーションクライアントの追加
     */
    const userPoolClient = userPool.addClient("ApplicationClient", {
      // アプリケーションクライアント名
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
      // OAuth認証を無効化するかどうか(default: false)
      disableOAuth: false,
      // OAuthの設定(ユーザー／パスワード認証する分には設定不要)
      oAuth: {
        // OAuth2.0で利用する認可フロー
        flows: {
          // 認可コードグラント
          // [フロー]
          // 1. クライアントアプリがユーザーを認証するため、Cognitoの認可サーバーにリダイレクトする。
          // 2. ユーザーが認証を行い、認可サーバーがクライアントアプリケーションに「認可コード」を返す。
          // 3. クライアントアプリケーションが認可コードを使用してCognitoにアクセストークンをリクエストし、
          // 最終的にアクセストークンが発行される。
          // [特徴]
          // ユーザーが介在するフローであり、セキュアである。
          // アクセストークンが直接ブラウザに返されないため、ブラウザ経由の攻撃リスクが少ない。
          // 主にサーバーサイドアプリケーションやWebアプリケーションで使われる。
          authorizationCodeGrant: true,
          // クライアント認証グラント
          // [フロー]
          // クライアントアプリケーション（サーバーなど）が直接Cognitoに対し、
          // クライアントIDとクライアントシークレットを送信して認証を行い、アクセストークンを取得する。
          // [特徴]
          // ユーザー認証は行わず、クライアント（アプリケーション）が認証される。
          // システム間通信やマイクロサービス間の認証に適している。
          // クライアントのみがリソースにアクセスするため、アクセストークンはユーザーに関連付けられていない。
          clientCredentials: false,
          // インプリシットグラント
          // [フロー]
          // 1. クライアントアプリケーションがユーザーを認証するため、Cognitoの認可サーバーにリダイレクトする。
          // 2. 認証後、アクセストークンが直接ユーザーのブラウザに返される（認可コードを経由せず）。
          // [特徴]
          // 認可コードを使わないため、よりシンプルで直接的ですが、セキュリティ面で弱点がある。
          // ブラウザやクライアントサイドで使用されるため、アクセストークンがURLなどに露出する可能性がある。
          // セキュリティ強化版の「authorization code grant with PKCE(Proof Key for Code Exchange)」が
          // 推奨されることが多く、implicit grantは推奨されなくなっている。
          implicitCodeGrant: false,
        },
        // 許可するサインイン後のリダイレクト先URL群
        callbackUrls: ["https://example.com/app"],
        // 許可するサインアウト後のリダイレクト先URL群
        logoutUrls: ["https://example.com/app"],
        // カスタムスコープ
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PHONE,
          cognito.OAuthScope.PROFILE,
        ],
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

    // ユーザープールIDの出力
    new cdk.CfnOutput(this, "OutputUserPoolID", {
      value: userPool.userPoolId,
      description: "User Pool ID",
    });

    // アプリケーションクライアントIDの出力
    new cdk.CfnOutput(this, "OutputApplicationClientID", {
      value: userPoolClient.userPoolClientId,
      description: "Application Client ID",
    });
  }
}
