import { Stack, StackProps } from "aws-cdk-lib"
import { CfnCacheCluster, CfnSubnetGroup } from "aws-cdk-lib/aws-elasticache"
import { Connections, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2"
import { Construct } from "constructs"

interface RedisStackProps extends StackProps {
    vpc: Vpc;
}

export class RedisStack extends Stack {
    readonly cluster: CfnCacheCluster;
    readonly connections: Connections;

    constructor(scope: Construct, id: string, props: RedisStackProps) {
        super(scope, id, props);

        const subnetGroup = new CfnSubnetGroup(this, "SubnetGroup", {
            cacheSubnetGroupName: `${id}SubnetGroup`,
            description: `List of subnets used for redis cache ${id}`,
            subnetIds: props.vpc.privateSubnets.map(subnet => subnet.subnetId)
        });

        const securityGroup = new SecurityGroup(this, "SecurityGroup", {
            securityGroupName: `${id}SecurityGroup`,
            vpc: props.vpc
        });

        this.connections = new Connections({
            securityGroups: [securityGroup],
            defaultPort: Port.tcp(6379)
        });

        this.cluster = new CfnCacheCluster(this, `${id}Cluster`, {
            cacheNodeType: 'cache.t2.micro',
            engine: 'redis',
            numCacheNodes: 1,
            autoMinorVersionUpgrade: true,
            cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName,
            vpcSecurityGroupIds: [
                securityGroup.securityGroupId,
            ]
        });
    }
}
