import * as cdk from 'aws-cdk-lib';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { EcrImage, FargateService, Secret } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

interface AppStackProps extends cdk.StackProps {
  vpc: Vpc;
  image: EcrImage;
  redisHostname: string,
  postgresHostname: string,
  postgresUser: string,
  postgresDb: string,
  postgresPassword: sm.ISecret,
  domainName: string,
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
      "GITHUB_PRIVATE_KEY_BASE_64",
      "GITHUB_WEBHOK_REPOSITORY_ALLOWLIST",
      "GITHUB_WEBHOK_REPOSITORY_DISALLOWLIST",
      "GITHUB_WEBHOOK_SECRET",
      // NextAuth
      "NEXTAUTH_SECRET",
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
          POSTGRESQL_HOST: props.postgresHostname,
          POSTGRESQL_USER: props.postgresUser,
          POSTGRESQL_DB: props.postgresDb,
          NEXT_PUBLIC_SHAPE_DOCS_TITLE: "Shape Docs",
          NEXT_PUBLIC_SHAPE_DOCS_DESCRIPTION: "Documentation for Shape's APIs",
          SHAPE_DOCS_PROJECT_CONFIGURATION_FILENAME: ".shape-docs.yml",
          REPOSITORY_NAME_SUFFIX: "-openapi",
          AUTH_TRUST_HOST: "true", // https://authjs.dev/getting-started/deployment#docker
          SHAPE_DOCS_BASE_URL: `https://${props.domainName}`,
          NEXTAUTH_URL: `https://${props.domainName}`,
        },
        secrets: {
          ...envVars.reduce((acc, curr) => { // get each env var from Secrets Manager
            acc[curr] = Secret.fromSecretsManager(secrets[curr]);
            return acc;
          }, {} as { [key: string]: Secret }),
          POSTGRESQL_PASSWORD: Secret.fromSecretsManager(props.postgresPassword),
        },
        containerPort: 3000,
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

    app.loadBalancer.addListener('HTTP', {
      port: 80,
      defaultAction: ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    this.service = app.service;
    this.loadBalancer = app.loadBalancer;
  }
}
