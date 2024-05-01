import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { EcrImage, FargateService } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface AppStackProps extends cdk.StackProps {
  vpc: Vpc;
  image: EcrImage;
  redisHostname: string,
  postgresHostname: string,
}

export class AppStack extends cdk.Stack {
  readonly service: FargateService;
  readonly loadBalancer: cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const app = new ApplicationLoadBalancedFargateService(this, "AppService", {
      vpc: props.vpc,
      assignPublicIp: false, // run in private network
      desiredCount: 1,
      cpu: 256,
      memoryLimitMiB: 512,
      publicLoadBalancer: true,
      taskImageOptions: {
        image: props.image,
        environment: {
          REDIS_URL: props.redisHostname,
        },
        containerPort: 3000,
      },
      taskSubnets: {
        subnets: [
          props.vpc.privateSubnets[0],
        ],
      },
      circuitBreaker: {
        rollback: true,
      },
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    app.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '15');

    app.targetGroup.configureHealthCheck({
      path: "/api/health",
    });

    app.service.taskDefinition.taskRole.addToPrincipalPolicy(new PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: Effect.ALLOW,
    }));

    this.service = app.service;
    this.loadBalancer = app.loadBalancer;
  }
}
