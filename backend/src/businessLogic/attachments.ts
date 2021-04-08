import { AttachmentsAccess } from "../dataLayer/attachmentsAccess";
const attachmentsAccess = new AttachmentsAccess();
import { createLogger } from "../utils/logger";
const logger = createLogger("generateUploadUrl");

export async function generateUploadUrl(carId: string): Promise<string> {
  logger.info(generateUploadUrl);
  const sigurl = await attachmentsAccess.generateUploadUrl(carId);
  logger.info(sigurl);
  return sigurl;
}
