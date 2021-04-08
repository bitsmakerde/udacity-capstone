import * as uuid from "uuid";

import { TodoItem } from "../models/CarItem";
import { TodosAccess } from "../dataLayer/carAccess";
import { CreateTodoRequest } from "../requests/CreateCarRequest";
import { parseUserId } from "../auth/utils";

const todoAccess = new TodosAccess();

import { createLogger } from "../utils/logger";
import { TodoUpdate } from "../models/CarUpdate";
const logger = createLogger("todos");

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken);
  return todoAccess.getTodosFor(userId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const todoId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await todoAccess.createTodo({
    todoId,
    userId,
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest,
  });
}

export async function deleteTodo(todoId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken);
  const todoItem = await todoAccess.getTodoFor(todoId, userId);
  await todoAccess.deleteTodo(todoId, todoItem.createdAt);
}

export async function updateTodoAttachment(todoId: string, jwtToken: string) {
  logger.info("jwtToken", jwtToken);
  const userId = parseUserId(jwtToken);
  await todoAccess.updateTodoAttachment(todoId, userId);
}

export async function updateTodo(
  todoId: string,
  jwtToken: string,
  updatedTodo: TodoUpdate
) {
  logger.info("jwtToken", jwtToken);
  const userId = parseUserId(jwtToken);
  await todoAccess.updateTodo(todoId, userId, updatedTodo);
}

export async function todoExists(
  todoId: string,
  jwtToken: string
): Promise<boolean> {
  logger.info("jwtToken", jwtToken);
  const userId = parseUserId(jwtToken);
  return await todoAccess.todoExists(todoId, userId);
}
