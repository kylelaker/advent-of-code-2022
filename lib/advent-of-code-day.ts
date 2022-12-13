import * as cdk from 'aws-cdk-lib';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface AdventOfCodeDayProps {
  readonly day: number;
  readonly name: string;
  readonly api: apigw.HttpApi;
  readonly timeout?: cdk.Duration;
  readonly memory?: number;
}

export class AdventOfCodeDay extends Construct {
  constructor(scope: Construct, id: string, props: AdventOfCodeDayProps) {
    super(scope, id);
    const codePath = `lambda/day/${props.day}/solution.ts`;
    if ((props.timeout?.toSeconds() ?? 3) > 30) {
      throw new Error('API integration timeout is limited to 30 seconds');
    }
    const fn = new nodejs.NodejsFunction(this, `SolutionDay${props.day}`, {
      entry: codePath,
      runtime: lambda.Runtime.NODEJS_18_X,
      tracing: lambda.Tracing.ACTIVE,
      timeout: props.timeout,
      memorySize: props.memory ?? 256,
    });
    props.api.addRoutes({
      methods: [apigw.HttpMethod.POST],
      path: `/day/${props.day}/solution`,
      integration: new HttpLambdaIntegration(`SolutionIntegrationDay${props.day}`, fn),
    });
  }
}
