import { Construct } from 'constructs'
import { InfrastructureStack } from './infrastructure-stack';
import { Environment } from 'aws-cdk-lib';
import { PostgresStack } from './postgres-stack';
import { RedisStack } from './redis-stack';
import { AppStack } from './app-stack';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';

interface DocsDeploymentProps {
    env: Environment,
    publicCertificateArn: string,
}

export default class DocsDeployment extends Construct {
    readonly infrastructure: InfrastructureStack
    readonly postgres: PostgresStack
    readonly redis: RedisStack
    readonly app: AppStack

    constructor(scope: Construct, id: string, props: DocsDeploymentProps) {
        super(scope, id)

        this.infrastructure = new InfrastructureStack(scope, `${id}Infrastructure`, {
            env: props.env,
        });
        
        this.postgres = new PostgresStack(scope, `${id}Postgres`, {
            env: props.env,
            vpc: this.infrastructure.vpc,
        });
        
        this.redis = new RedisStack(scope, `${id}Redis`, {
            env: props.env,
            vpc: this.infrastructure.vpc,
        });
        
        this.app = new AppStack(scope, `${id}App`, {
            env: props.env,
            vpc: this.infrastructure.vpc,
            image: ContainerImage.fromEcrRepository(this.infrastructure.dockerRepository, 'latest'),
            postgresHostname: this.postgres.dbInstance.instanceEndpoint.hostname,
            redisHostname: this.redis.cluster.attrRedisEndpointAddress,
            publicCertificateArn: props.publicCertificateArn,
        });

        this.app.service.connections.allowToDefaultPort(this.redis);
    }
}
