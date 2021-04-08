import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import * as middy from "middy";
import { cors } from "middy/middlewares";
import { deleteTodo } from "../../businessLogic/cars";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    console.log("todoId", todoId);

    await deleteTodo(todoId, jwtToken);
    return {
      statusCode: 204,
      body: JSON.stringify({
        todoId,
      }),
    };
  }
);

handler.use(
  cors({
    headers: "*",
    credentials: true,
  })
);
