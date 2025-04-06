import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dotenv from 'dotenv';
dotenv.config();

const POSTGRES_HOST =
  process.env.POSTGRES_HOST ||
  'nodejs-aws.clqoegiss1r3.eu-west-1.rds.amazonaws.com';
const POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD =
  process.env.POSTGRES_PASSWORD || 'fefvyw-kyghuc-wahMu5';
const POSTGRES_DB = process.env.POSTGRES_DB || 'postgres';
const DB_REGION = process.env.DB_REGION || 'eu-west-1';
const DB_ARN =
  process.env.DB_ARN || 'arn:aws:rds:eu-west-1:248189938737:db:nodejs-aws';
const PRODUCT_ENDPOINT =
  process.env.PRODUCT_ENDPOINT ||
  'https://hq21lip4pj.execute-api.eu-west-1.amazonaws.com/prod/products/';

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda Function
    const handler = new lambda.Function(this, 'NestJsHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../'), {
        bundling: {
          command: [
            'bash',
            '-c',
            'npm install && npm run build && cp -r dist/* /asset-output/ && cp package.json /asset-output/ && cd /asset-output && npm install --production',
          ],
          image: cdk.DockerImage.fromRegistry('node:18'),
          user: 'root',
        },
      }),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        NODE_ENV: 'production',
        POSTGRES_HOST,
        POSTGRES_PORT,
        POSTGRES_USER,
        POSTGRES_PASSWORD,
        POSTGRES_DB,
        DB_REGION,
        PRODUCT_ENDPOINT,
      },
    });

    // Add RDS access permissions to Lambda
    handler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['rds-db:connect', 'rds:DescribeDBInstances'],
        resources: [DB_ARN],
      }),
    );

    // API Gateway
    const api = new apigateway.RestApi(this, 'NestJsApi', {
      restApiName: 'NestJS API Service',
      description: 'NestJS API Gateway',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Integrate API Gateway with Lambda
    const integration = new apigateway.LambdaIntegration(handler, {
      proxy: true,
    });

    // Add proxy resource to handle all routes
    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
