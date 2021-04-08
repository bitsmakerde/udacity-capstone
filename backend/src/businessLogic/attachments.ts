import { AttachmentsAccess } from "../dataLayer/attachmentsAccess";
const attachmentsAccess = new AttachmentsAccess();
import { createLogger } from "../utils/logger";
const logger = createLogger("generateUploadUrl");

export async function generateUploadUrl(todoId: string): Promise<string> {
  logger.info(generateUploadUrl);
  const sigurl = await attachmentsAccess.generateUploadUrl(todoId);
  logger.info(sigurl);
  return sigurl;
}
