import * as cdk from 'aws-cdk-lib';
import { IpAddresses, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Effect, Policy, PolicyStatement, User } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class InfrastructureStack extends cdk.Stack {
  readonly vpc: Vpc;
  readonly dockerRepository: Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, 'VPC', {
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      maxAzs: 2,
    });

    this.dockerRepository = new Repository(this, 'Repository', {
      repositoryName: 'shapedocs',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const deploymentPolicy = new Policy(this, 'DeploymentPolicy', {
      policyName: 'DeploymentPolicy',
      statements: [
        // ECR permissions
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "ecr:GetAuthorizationToken",
            "ecr:PutImage",
          ],
          resources: [
            "*"
          ],
        }),  
        // ECS permissions
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            "ecs:Describe*",
            "ecs:RegisterTaskDefinition",
            "ecs:UpdateService",
          ],
          resources: [
            "*"
          ],
        }),
      ],
    });

    const deploymentUser = new User(this, 'GitHubActionsUser');

    deploymentPolicy.attachToUser(deploymentUser);

    deploymentUser.attachInlinePolicy(deploymentPolicy);
  }
}
