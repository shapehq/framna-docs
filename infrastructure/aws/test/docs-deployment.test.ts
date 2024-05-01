import * as cdk from "aws-cdk-lib";
import DocsDeployment from '../lib/docs-deployment';

describe('DocsDeployment', () => {
    it('should create the expected stacks', () => {
        const app = new cdk.App()

        new DocsDeployment(app, 'Test', { env: { account: '123456789012', region: 'us-east-1' } })

        const stackNames = app.synth().stacks.map(stack => stack.stackName)
        stackNames.sort()

        expect(stackNames).toEqual([
            'TestApp',
            'TestInfrastructure',
            'TestPostgres',
            'TestRedis'
        ])
    })
})
