import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import * as middy from "middy";
import { cors } from "middy/middlewares";
import { deleteCar } from "../../businessLogic/cars";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const carId = event.pathParameters.carId;
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    console.log("carId", carId);

    await deleteCar(carId, jwtToken);
    return {
      statusCode: 204,
      body: JSON.stringify({
        carId,
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
