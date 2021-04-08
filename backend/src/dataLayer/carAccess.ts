import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { createLogger } from "../utils/logger";
const logger = createLogger("carAccess");
const XAWS = AWSXRay.captureAWS(AWS);

import { CarItem } from "../models/CarItem";
import { CarUpdate } from "../models/CarUpdate";

export class CarsAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly carsTable = process.env.PARCPLACES_TABLE,
    private readonly carUserId = process.env.CAR_USER_ID,
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET
  ) {}

  async getCarsFor(userId: string): Promise<CarItem[]> {
    console.log("Getting all cars userId: ", userId);

    var params = {
      TableName: this.carsTable,
      IndexName: this.carUserId,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await this.docClient.query(params).promise();

    const items = result.Items;
    logger.info("items", result);
    logger.info("items", items);
    return items as CarItem[];
  }

  async getCarFor(carId: string, userId: string): Promise<CarItem> {
    logger.info("Getting one car item based on carId and userId", {
      user: userId,
      item: carId,
    });
    const result = await this.docClient
      .query({
        TableName: this.carsTable,
        IndexName: this.carUserId,
        KeyConditionExpression: "userId = :userId and carId = :carId",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":carId": carId,
        },
      })
      .promise();

    const item = result.Items[0];
    return item as CarItem;
  }

  async createCar(carItem: CarItem): Promise<CarItem> {
    await this.docClient
      .put({
        TableName: this.carsTable,
        Item: carItem,
      })
      .promise();

    return carItem;
  }

  async deleteCar(carId: string, createdAt: string) {
    console.log("createdAt", createdAt);

    var params = {
      TableName: this.carsTable,
      Key: {
        carId,
        createdAt,
      },
      ConditionExpression: "carId = :carId and createdAt = :createdAt",
      ExpressionAttributeValues: {
        ":carId": carId,
        ":createdAt": createdAt,
      },
    };

    await this.docClient.delete(params).promise();
  }

  async updateCar(
    carId: string,
    userId: string,
    updatedCar: CarUpdate
  ): Promise<void> {
    logger.info("Updating a car item");
    const carItem = await this.getCarFor(carId, userId);
    await this.docClient
      .update({
        TableName: this.carsTable,
        Key: {
          carId: carId,
          createdAt: carItem.createdAt,
        },
        UpdateExpression: "set #name = :name, done = :done, dueDate = :dueDate",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: {
          ":name": updatedCar.name,
          ":done": updatedCar.done,
          ":dueDate": updatedCar.dueDate,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  async updateCarAttachment(carId: string, userId: string) {
    const url = `https://${this.bucketName}.s3.amazonaws.com/${carId}`;
    const car = await this.getCarFor(carId, userId);

    await this.docClient
      .update({
        TableName: this.carsTable,
        Key: {
          carId: carId,
          createdAt: car.createdAt,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": url,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  async carExists(carId: string, userId: string) {
    const carItem = await this.getCarFor(carId, userId);
    const parms = {
      TableName: this.carsTable,
      Key: {
        carId: carItem.carId,
        createdAt: carItem.createdAt,
      },
    };
    const result = await this.docClient.get(parms).promise();

    logger.info("Get car item: ", result);
    // !! convert to bool
    return !!result.Item;
  }
}

function createDynamoDBClient() {
  /* if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } */

  return new XAWS.DynamoDB.DocumentClient();
}
