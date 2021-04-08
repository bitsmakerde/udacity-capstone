import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { UpdateTodoRequest } from "../../requests/UpdateCarRequest";
import { updateTodo } from "../../businessLogic/cars";

import * as middy from "middy";
import { cors } from "middy/middlewares";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    console.log(todoId);
    console.log(updatedTodo);
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    updateTodo(todoId, jwtToken, updatedTodo);

    return {
      statusCode: 200,
      body: " ",
    };
  }
);

handler.use(
  cors({
    headers: "*",
    credentials: true,
  })
);
