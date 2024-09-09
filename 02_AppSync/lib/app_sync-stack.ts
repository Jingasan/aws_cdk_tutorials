import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class AppSyncStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AppSync APIの作成
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "demo-api", // AppSyncのAPI名
      definition: appsync.Definition.fromFile("schema.graphql"), // GraphQL型定義の指定
    });

    // DynamoDBテーブルの作成
    const table = new dynamodb.Table(this, "BooksTable", {
      tableName: "books", // テーブル名
      partitionKey: { name: "title", type: dynamodb.AttributeType.STRING },
    });

    // DynamoDBをAppSyncのデータソースとして追加
    const dataSource = api.addDynamoDbDataSource("ItemsDataSource", table);

    // getBooksクエリのリゾルバーの追加
    dataSource.createResolver("getBooksResolver", {
      typeName: "Query",
      fieldName: "getBooks",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    // createBookミューテーションのリゾルバーの追加
    dataSource.createResolver("createBookResolver", {
      typeName: "Mutation",
      fieldName: "createBook",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
        appsync.PrimaryKey.partition("title").is("input.title"),
        appsync.Values.projecting("input")
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
  }
}
