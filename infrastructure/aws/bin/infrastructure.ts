#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import DocsDeployment from '../lib/docs-deployment';

const app = new cdk.App();

/** ACCOUNTS */

const nonProdAccount: cdk.Environment = {
  account: "841481405304",
  region: "eu-central-1",
};

const prodAccount: cdk.Environment = {
  account: "721428964064",
  region: "eu-central-1",
};

/** DEPLOYMENTS */

new DocsDeployment(app, 'Staging', {
  env: nonProdAccount,
  publicCertificateArn: 'arn:aws:acm:eu-central-1:721428964064:certificate/0f3e5e1b-2c5b-4f2c-8a5b-7f9b9e9c2b5d',
})

new DocsDeployment(app, 'Prod', {
  env: prodAccount,
  publicCertificateArn: 'arn:aws:acm:eu-central-1:721428964064:certificate/0f3e5e1b-2c5b-4f2c-8a5b-7f9b9e9c2b5d',
})
