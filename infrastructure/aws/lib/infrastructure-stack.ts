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
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            // ECR
            "ecr:GetAuthorizationToken",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchCheckLayerAvailability",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload",
            // ECS
            "ecs:DescribeServices",
            "ecs:UpdateService",
            "ecs:RegisterTaskDefinition",
            "ecs:DeregisterTaskDefinition",
            "ecs:DescribeTaskDefinition",
            "iam:PassRole"
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
