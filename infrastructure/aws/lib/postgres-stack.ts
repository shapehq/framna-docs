import { Construct } from 'constructs'
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Vpc, InstanceClass, InstanceType, InstanceSize } from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as sm from 'aws-cdk-lib/aws-secretsmanager'

interface PostgresStackProps extends StackProps {
    vpc: Vpc;
}

export class PostgresStack extends Stack {
    readonly dbInstance: rds.DatabaseInstance;
    readonly database: string = 'docs';
    readonly username: string = 'docs';
    readonly password: sm.Secret;

    constructor(scope: Construct, id: string, props: PostgresStackProps) {
        super(scope, id, props);

        this.password = new sm.Secret(this, `DbPasswordSecret`, {
            secretName: `${id}DbPassword`,
            generateSecretString: {
                excludePunctuation: true
            }
        })

        const parameterGroup = new rds.ParameterGroup(this, 'PostgresParameterGroup', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_16,
            }),
            description: 'Parameter group for postgres16',
            parameters: {
                'rds.force_ssl': '0', // allow non-ssl connections
            },
        });

        this.dbInstance = new rds.DatabaseInstance(this, `DbInstance`, {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_16,
            }),
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            credentials: {
                username: this.username,
                password: this.password.secretValue
            },
            vpc: props.vpc,
            allocatedStorage: 5,
            maxAllocatedStorage: 50,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: Duration.days(7),
            deletionProtection: true,
            databaseName: this.database,
            removalPolicy: RemovalPolicy.RETAIN,
            enablePerformanceInsights: true,
            multiAz: false,
            storageEncrypted: true,
            parameterGroup: parameterGroup,
        })
    }
}
