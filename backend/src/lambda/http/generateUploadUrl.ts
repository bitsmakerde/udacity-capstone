import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import * as middy from "middy";
import { cors } from "middy/middlewares";
import { generateUploadUrl } from "../../businessLogic/attachments";
import { todoExists, updateTodoAttachment } from "../../businessLogic/cars";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    console.log(todoId);
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    const validTodoId = await todoExists(todoId, jwtToken);
    if (!validTodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Todo item does not exist",
        }),
      };
    }

    const sigUrl = await generateUploadUrl(todoId);

    await updateTodoAttachment(todoId, jwtToken);

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: sigUrl,
      }),
    };
  }
);

handler.use(
  cors({
    credentials: true,
    headers: "*",
  })
);
