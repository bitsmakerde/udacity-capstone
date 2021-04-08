import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import * as middy from "middy";
import { cors } from "middy/middlewares";
import { generateUploadUrl } from "../../businessLogic/attachments";
import { carExists, updateCarAttachment } from "../../businessLogic/cars";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const carId = event.pathParameters.carId;
    console.log(carId);
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    const validTodoId = await carExists(carId, jwtToken);
    if (!validTodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Todo item does not exist",
        }),
      };
    }

    const sigUrl = await generateUploadUrl(carId);

    await updateCarAttachment(carId, jwtToken);

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
