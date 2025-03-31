import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda Function
    const handler = new lambda.Function(this, 'NestJsHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
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
      },
    });

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
