import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { UpdateCarRequest } from "../../requests/UpdateCarRequest";
import { updateCar } from "../../businessLogic/cars";

import * as middy from "middy";
import { cors } from "middy/middlewares";

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const carId = event.pathParameters.carId;
    const updatedTodo: UpdateCarRequest = JSON.parse(event.body);
    console.log(carId);
    console.log(updatedTodo);
    const authorization = event.headers.Authorization;
    const split = authorization.split(" ");
    const jwtToken = split[1];

    updateCar(carId, jwtToken, updatedTodo);

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
