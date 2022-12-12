import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { AdventOfCodeDay } from './advent-of-code-day';

export class AdventOfCode2022Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const defaultNotImplemented = new nodejs.NodejsFunction(this, 'NotImplemented', {
      entry: 'lambda/not-implemented.ts',
      runtime: lambda.Runtime.NODEJS_18_X,
    });
    const defaultIntegration = new HttpLambdaIntegration(
      'NotImplementedIntegration',
      defaultNotImplemented
    );
    const httpApi = new apigw.HttpApi(this, 'Api', {
      defaultIntegration,
    });
    const supportedDays = [
      { day: 1, name: 'Calorie Counting' },
      { day: 2, name: 'Rock Paper Scissors' },
      { day: 3, name: 'Rucksack Reorganization' },
      { day: 4, name: 'Camp Cleanup' },
      { day: 5, name: 'Supply Stacks' },
      { day: 6, name: 'Tuning Trouble' },
      { day: 7, name: 'No Space Left On Device' },
      { day: 8, name: 'Treetop Tree House' },
      { day: 9, name: 'Rope Bridge' },
      { day: 10, name: 'Cathode-Ray Tube' },
      { day: 11, name: 'Monkey in the Middle' },
    ];
    supportedDays.map(
      ({ day, name }) =>
        new AdventOfCodeDay(this, `Day${day}`, {
          day,
          name,
          api: httpApi,
        })
    );
    new cdk.CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
  }
}
