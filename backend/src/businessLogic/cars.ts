import * as uuid from "uuid";

import { CarItem } from "../models/CarItem";
import { CarsAccess } from "../dataLayer/carAccess";
import { CreateCarRequest } from "../requests/CreateCarRequest";
import { parseUserId } from "../auth/utils";

const carAccess = new CarsAccess();

import { createLogger } from "../utils/logger";
import { CarUpdate } from "../models/CarUpdate";
const logger = createLogger("cars");

export async function getAllCars(jwtToken: string): Promise<CarItem[]> {
  const userId = parseUserId(jwtToken);
  return carAccess.getCarsFor(userId);
}

export async function createCar(
  createTodoRequest: CreateCarRequest,
  jwtToken: string
): Promise<CarItem> {
  const carId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await carAccess.createCar({
    carId,
    userId,
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest,
  });
}

export async function deleteCar(carId: string, jwtToken: string) {
  const userId = parseUserId(jwtToken);
  const carItem = await carAccess.getCarFor(carId, userId);
  await carAccess.deleteCar(carId, carItem.createdAt);
}

export async function updateCarAttachment(carId: string, jwtToken: string) {
  logger.info("jwtToken", jwtToken);
  const userId = parseUserId(jwtToken);
  await carAccess.updateCarAttachment(carId, userId);
}

export async function updateCar(
  carId: string,
  jwtToken: string,
  updatedTodo: CarUpdate
) {
  logger.info("jwtToken", jwtToken);
  const userId = parseUserId(jwtToken);
  await carAccess.updateCar(carId, userId, updatedTodo);
}

export async function carExists(
  carId: string,
  jwtToken: string
): Promise<boolean> {
  logger.info("jwtToken", jwtToken);
  const userId = parseUserId(jwtToken);
  return await carAccess.carExists(carId, userId);
}
