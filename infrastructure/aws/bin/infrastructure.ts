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
  domainName: 'staging.docs.shapetools.io',
  publicCertificateArn: 'arn:aws:acm:eu-central-1:841481405304:certificate/6a081533-5176-40d1-b1b8-27a88abb8dbe',
})

new DocsDeployment(app, 'Prod', {
  env: prodAccount,
  domainName: 'docs.shapetools.io',
  publicCertificateArn: 'arn:aws:acm:eu-central-1:841481405304:certificate/6d513b25-bbca-49ec-9de0-377e303c313f', // TODO: Replace with prod cert
})
