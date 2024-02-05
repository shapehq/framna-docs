import * as cdk from 'aws-cdk-lib';
import { IpAddresses, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Policy, User } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class InfrastructureStack extends cdk.Stack {
  readonly vpc: Vpc;
  readonly dockerRepository: Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, 'VPC', {
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 1,
    });

    this.dockerRepository = new Repository(this, 'Repository', {
      repositoryName: 'shapedocs',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const deploymentPolicy = new Policy(this, 'DeploymentPolicy', {
      policyName: 'DeploymentPolicy',
      statements: [
        // TODO: Change!
      ],
    });

    const deploymentUser = new User(this, 'GitHubActionsUser', {
      managedPolicies: [
        {
          managedPolicyArn: 'arn:aws:iam::aws:policy/AdministratorAccess', // TODO: Change!
        },
      ],
    });

    deploymentUser.attachInlinePolicy(deploymentPolicy);
  }
}
