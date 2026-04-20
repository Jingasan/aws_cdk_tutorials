import { build } from "esbuild";

// 3環境分のエントリポイントをビルド
const envs = ["dev", "stg", "prod"];

await Promise.all(
  // CDK スタック
  envs.map((env) =>
    build({
      entryPoints: [`src/bin/cdk-${env}.ts`],
      bundle: true,
      platform: "node",
      target: "node24",
      outfile: `dist/bin/cdk-${env}.js`,
      format: "esm",
      // ランタイムで解決される依存はバンドルから除外
      external: ["aws-cdk-lib", "constructs"],
    })
  )
);
