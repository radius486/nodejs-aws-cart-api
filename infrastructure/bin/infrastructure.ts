#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/infrastructure-stack';
import * as dotenv from 'dotenv';
dotenv.config();

const app = new cdk.App();
new ApiStack(app, 'NestJsApiStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
