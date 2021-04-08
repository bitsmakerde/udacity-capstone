import * as AWS from "aws-sdk";
const s3 = new AWS.S3({
  signatureVersion: "v4",
});

const bucketName = process.env.ATTACHMENTS_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export class AttachmentsAccess {
  async generateUploadUrl(carId: string): Promise<string> {
    return s3.getSignedUrl("putObject", {
      Bucket: bucketName,
      Key: carId,
      Expires: +urlExpiration,
    });
  }
}
