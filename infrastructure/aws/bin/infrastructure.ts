#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { AppStack } from '../lib/app-stack';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';

const app = new cdk.App();

// --- STAGING --- //
const nonProdAccount: cdk.Environment = {
  account: "841481405304",
  region: "eu-central-1",
};

const stagingInfra = new InfrastructureStack(app, 'StagingInfrastructure', {
  env: nonProdAccount,
});

new AppStack(app, 'StagingApp', {
  env: nonProdAccount,
  vpc: stagingInfra.vpc,
  image: ContainerImage.fromEcrRepository(stagingInfra.dockerRepository, 'latest'),
});
// --- END: STAGING --- //


// --- PRODUCTION --- //
const prodAccount: cdk.Environment = {
  account: "721428964064",
  region: "eu-central-1",
};

// const productionInfra = new InfrastructureStack(app, 'ProductionInfrastructure', {
//   env: prodAccount,
// });

// new AppStack(app, 'ProductionApp', {
//   env: prodAccount,
//   vpc: stagingInfra.vpc,
//   image: ContainerImage.fromEcrRepository(stagingInfra.dockerRepository, 'latest'),
// });
// --- END: PRODUCTION --- //
