import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CreateCarRequest } from "../../requests/CreateCarRequest";

import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createCar } from "../../businessLogic/cars";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("createTotos");

    const newTodo: CreateCarRequest = JSON.parse(event.body);

    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];
    const todo = await createCar(newTodo, jwtToken);

    console.log("newTotoItem", todo);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todo,
      }),
    };
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
