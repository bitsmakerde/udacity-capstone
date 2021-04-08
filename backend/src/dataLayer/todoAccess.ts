import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { createLogger } from "../utils/logger";
const logger = createLogger("todoAccess");
const XAWS = AWSXRay.captureAWS(AWS);

import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todoUserId = process.env.TODO_USER_ID,
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET
  ) {}

  async getTodosFor(userId: string): Promise<TodoItem[]> {
    console.log("Getting all todos userId: ", userId);

    var params = {
      TableName: this.todosTable,
      IndexName: this.todoUserId,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const result = await this.docClient.query(params).promise();

    const items = result.Items;
    logger.info("items", result);
    logger.info("items", items);
    return items as TodoItem[];
  }

  async getTodoFor(todoId: string, userId: string): Promise<TodoItem> {
    logger.info("Getting one todo item based on todoId and userId", {
      user: userId,
      item: todoId,
    });
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todoUserId,
        KeyConditionExpression: "userId = :userId and todoId = :todoId",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":todoId": todoId,
        },
      })
      .promise();

    const item = result.Items[0];
    return item as TodoItem;
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem,
      })
      .promise();

    return todoItem;
  }

  async deleteTodo(todoId: string, createdAt: string) {
    console.log("createdAt", createdAt);

    var params = {
      TableName: this.todosTable,
      Key: {
        todoId,
        createdAt,
      },
      ConditionExpression: "todoId = :todoId and createdAt = :createdAt",
      ExpressionAttributeValues: {
        ":todoId": todoId,
        ":createdAt": createdAt,
      },
    };

    await this.docClient.delete(params).promise();
  }

  async updateTodo(
    todoId: string,
    userId: string,
    updatedTodo: TodoUpdate
  ): Promise<void> {
    logger.info("Updating a todo item");
    const todoItem = await this.getTodoFor(todoId, userId);
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId: todoId,
          createdAt: todoItem.createdAt,
        },
        UpdateExpression: "set #name = :name, done = :done, dueDate = :dueDate",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: {
          ":name": updatedTodo.name,
          ":done": updatedTodo.done,
          ":dueDate": updatedTodo.dueDate,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  async updateTodoAttachment(todoId: string, userId: string) {
    const url = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
    const todo = await this.getTodoFor(todoId, userId);

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId: todoId,
          createdAt: todo.createdAt,
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
          ":attachmentUrl": url,
        },
        ReturnValues: "UPDATED_NEW",
      })
      .promise();
  }

  async todoExists(todoId: string, userId: string) {
    const todoItem = await this.getTodoFor(todoId, userId);
    const parms = {
      TableName: this.todosTable,
      Key: {
        todoId: todoItem.todoId,
        createdAt: todoItem.createdAt,
      },
    };
    const result = await this.docClient.get(parms).promise();

    logger.info("Get todo item: ", result);
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
