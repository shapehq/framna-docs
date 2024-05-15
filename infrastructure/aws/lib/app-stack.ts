import * as cdk from 'aws-cdk-lib';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { EcrImage, FargateService, Secret } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';

interface AppStackProps extends cdk.StackProps {
  vpc: Vpc;
  image: EcrImage;
  redisHostname: string,
  postgresHostname: string,
  publicCertificateArn: string,
}

export class AppStack extends cdk.Stack {
  readonly service: FargateService;
  readonly loadBalancer: cdk.aws_elasticloadbalancingv2.ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // list of all env vars to be stored in Secrets Manager
    const envVars = [
      // GitHub
      "GITHUB_APP_ID",
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GITHUB_ORGANIZATION_NAME",
      "GITHUB_PRIVATE_KEY_BASE_64",
      "GITHUB_WEBHOK_REPOSITORY_ALLOWLIST",
      "GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST",
      "GITHUB_WEBHOOK_SECRET",
      // Auth0
      "AUTH0_BASE_URL",
      "AUTH0_CLIENT_ID",
      "AUTH0_CLIENT_SECRET",
      "AUTH0_ISSUER_BASE_URL",
      "AUTH0_MANAGEMENT_CLIENT_ID",
      "AUTH0_MANAGEMENT_CLIENT_SECRET",
      "AUTH0_MANAGEMENT_DOMAIN",
      "AUTH0_SECRET",
      // Other
      "SHAPE_DOCS_BASE_URL", // TODO: Could be part of config along with certificate issuing
    ]

    // create the env vars as secrets in Secrets Manager
    // Note: secrets are created with an initial value which should be replaced via the AWS SecretsManager Console
    // https://eu-central-1.console.aws.amazon.com/secretsmanager/listsecrets?region=eu-central-1
    const secrets = envVars.reduce((acc, curr) => {
      acc[curr] = new sm.Secret(this, `${id}Secret${curr}`, {
        secretName: `${id}/${curr}`,
      });
      return acc;
    }, {} as { [key: string]: sm.Secret });

    // must be created & validated in the AWS Console
    // https://eu-central-1.console.aws.amazon.com/acm/home?region=eu-central-1
    const certificate = Certificate.fromCertificateArn(this, `${id}Certificate`, props.publicCertificateArn)

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
          NEXT_PUBLIC_SHAPE_DOCS_TITLE: 'Shape Docs',
        },
        secrets: envVars.reduce((acc, curr) => { // get each env var from Secrets Manager
          acc[curr] = Secret.fromSecretsManager(secrets[curr]);
          return acc;
        }, {} as { [key: string]: Secret }),
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
      certificate: certificate,
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
