import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from './s3.service';

/**
 * The PUBLIC storage profile: Copart gallery images, served straight from the
 * CDN with no signing.
 *
 * It is a different bucket rather than a different ACL because Backblaze B2 —
 * unlike DigitalOcean Spaces — has no per-object visibility: a bucket is public
 * or private as a whole. Verified against the real buckets: an object in the
 * public one downloads with no credentials (200), one in the private bucket
 * answers 401.
 *
 * Falls back to the default profile's envs when the public ones are absent, so
 * a half-configured environment keeps working exactly as before the split.
 */
@Injectable()
export class PublicS3Service extends S3Service {
  protected readonly logger = new Logger(PublicS3Service.name);

  protected resolveProfile() {
    return {
      endpoint: process.env.PUBLIC_S3_ENDPOINT || process.env.AWS_S3_ENDPOINT,
      bucket:
        process.env.PUBLIC_S3_BUCKET ||
        process.env.AWS_S3_BUCKET ||
        process.env.AWS_S3_BUCKET_PUBLIC ||
        '',
      region: process.env.PUBLIC_S3_REGION || process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.PUBLIC_S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey:
        process.env.PUBLIC_S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
      cdnBaseUrl: process.env.PUBLIC_CDN_BASE_URL || process.env.CDN_BASE_URL,
    };
  }
}
