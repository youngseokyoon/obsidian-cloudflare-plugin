import ImageUploader from "../imageUploader";
import AWS from 'aws-sdk';
import { UploaderUtils } from "../uploaderUtils";

export default class R2Uploader implements ImageUploader {
  private readonly r2!: AWS.S3;
  private readonly bucket!: string;
  private pathTmpl: string;
  private customDomainName: string;

  constructor(setting: R2Setting) {
    this.r2 = new AWS.S3({
      accessKeyId: setting.accessKeyId,
      secretAccessKey: setting.secretAccessKey,
      endpoint: setting.endpoint,
      region: 'auto', // Cloudflare R2 uses 'auto' region
      s3ForcePathStyle: true, // Needed for Cloudflare R2
      signatureVersion: 'v4', // Cloudflare R2 uses v4 signatures
    });
    this.bucket = setting.bucketName;
    this.pathTmpl = setting.path;
    this.customDomainName = setting.customDomainName;
  }

  async upload(image: File, fullPath: string): Promise<string> {
    const arrayBuffer = await this.readFileAsArrayBuffer(image);
    const uint8Array = new Uint8Array(arrayBuffer);

    if (!this.customDomainName || this.customDomainName.trim() === '') {
      throw new Error("R2 Custom Domain Name is not set. Please configure it in the plugin settings.");
    }

    // Use fullPath (which contains the unique timestamped name from PasteListener) instead of image.name
    let path = UploaderUtils.generateName(this.pathTmpl, fullPath);
    path = path.replace(/^\/+/, ''); // remove the /
    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: uint8Array,
      ContentType: `image/${image.name.split('.').pop()}`,
    };
    return new Promise((resolve, reject) => {
      this.r2.upload(params, (err, data) => {
        if (err) {
          console.error("R2 Upload Error:", err);
          reject(err);
        } else {
          // Use the path (Key) we generated, as data.Location might include the bucket name in a way that's hard to parse reliably
          // or might be the internal endpoint.
          // Encode the path segments to handle spaces and special characters in the URL
          const dst = path.split('/').map(p => encodeURIComponent(p)).join('/');
          const finalUrl = UploaderUtils.customizeDomainName(dst, this.customDomainName);
          resolve(finalUrl);
        }
      });
    });
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}

export interface R2Setting {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucketName: string;
  path: string;
  customDomainName: string;
}