import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as dotenv from 'dotenv';
dotenv.config();

const POSTGRES_HOST = process.env.POSTGRES_HOST || '';
const POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || '';
const POSTGRES_DB = process.env.POSTGRES_DB || 'postgres';
const DB_REGION = process.env.DB_REGION || 'eu-west-1';
const DB_ARN = process.env.DB_ARN || '';

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get reference to existing VPC
    const vpc = ec2.Vpc.fromLookup(this, 'ExistingVPC', {
      vpcId: 'vpc-063222ae6b4704e12',
    });

    // Get reference to existing security group
    const existingSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'ExistingSecurityGroup',
      'sg-097061c324ba2cec0',
    );

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
      // Add VPC configuration
      vpc,
      vpcSubnets: {
        subnets: [
          ec2.Subnet.fromSubnetId(this, 'Subnet1', 'subnet-09b3732269394a19b'),
          ec2.Subnet.fromSubnetId(this, 'Subnet2', 'subnet-07dc415d97eada0e1'),
          ec2.Subnet.fromSubnetId(this, 'Subnet3', 'subnet-052b2af593d06f70f'),
        ],
      },
      securityGroups: [existingSecurityGroup],
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      allowPublicSubnet: true,
      environment: {
        NODE_ENV: 'production',
        POSTGRES_HOST,
        POSTGRES_PORT,
        POSTGRES_USER,
        POSTGRES_PASSWORD,
        POSTGRES_DB,
        DB_REGION,
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
