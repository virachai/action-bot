import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '@repo/config';
import { S3Asset, S3Error } from '@repo/types';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

/**
 * S3 Service for managing video assets and outputs
 */
export class S3Service {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: config.s3.region,
            credentials: config.s3.credentials,
        });
    }

    /**
     * Upload a file to S3
     */
    async uploadFile(
        localPath: string,
        bucket: string,
        key: string,
        contentType?: string
    ): Promise<S3Asset> {
        try {
            const fileStream = createReadStream(localPath);
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: fileStream,
                ContentType: contentType,
            });

            await this.client.send(command);

            const url = await this.getSignedUrl(bucket, key);

            return {
                bucket,
                key,
                url,
                type: this.getAssetType(key),
                uploadedAt: new Date().toISOString(),
            };
        } catch (error) {
            throw new S3Error(
                `Failed to upload file to S3: ${key}`,
                bucket,
                key,
                error as Error
            );
        }
    }

    /**
     * Download a file from S3
     */
    async downloadFile(bucket: string, key: string, localPath: string): Promise<void> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const response = await this.client.send(command);

            if (!response.Body) {
                throw new Error('No body in S3 response');
            }

            const writeStream = createWriteStream(localPath);
            await pipeline(response.Body as Readable, writeStream);
        } catch (error) {
            throw new S3Error(
                `Failed to download file from S3: ${key}`,
                bucket,
                key,
                error as Error
            );
        }
    }

    /**
     * Get signed URL for an S3 object
     */
    async getSignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            return await getSignedUrl(this.client, command, { expiresIn });
        } catch (error) {
            throw new S3Error(
                `Failed to generate signed URL for: ${key}`,
                bucket,
                key,
                error as Error
            );
        }
    }

    /**
     * List objects in a bucket with prefix
     */
    async listObjects(bucket: string, prefix?: string): Promise<S3Asset[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
            });

            const response = await this.client.send(command);

            if (!response.Contents) {
                return [];
            }

            const assets: S3Asset[] = [];

            for (const item of response.Contents) {
                if (!item.Key) continue;

                const url = await this.getSignedUrl(bucket, item.Key);

                assets.push({
                    bucket,
                    key: item.Key,
                    url,
                    type: this.getAssetType(item.Key),
                    size: item.Size,
                    uploadedAt: item.LastModified?.toISOString(),
                });
            }

            return assets;
        } catch (error) {
            throw new S3Error(
                `Failed to list objects in bucket: ${bucket}`,
                bucket,
                prefix || '',
                error as Error
            );
        }
    }

    /**
     * Upload JSON data to S3
     */
    async uploadJson(data: unknown, bucket: string, key: string): Promise<S3Asset> {
        try {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify(data, null, 2),
                ContentType: 'application/json',
            });

            await this.client.send(command);

            const url = await this.getSignedUrl(bucket, key);

            return {
                bucket,
                key,
                url,
                type: 'video', // Generic type for JSON
                uploadedAt: new Date().toISOString(),
            };
        } catch (error) {
            throw new S3Error(
                `Failed to upload JSON to S3: ${key}`,
                bucket,
                key,
                error as Error
            );
        }
    }

    /**
     * Download and parse JSON from S3
     */
    async downloadJson<T>(bucket: string, key: string): Promise<T> {
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const response = await this.client.send(command);

            if (!response.Body) {
                throw new Error('No body in S3 response');
            }

            const bodyString = await response.Body.transformToString();
            return JSON.parse(bodyString) as T;
        } catch (error) {
            throw new S3Error(
                `Failed to download JSON from S3: ${key}`,
                bucket,
                key,
                error as Error
            );
        }
    }

    /**
     * Determine asset type from file extension
     */
    private getAssetType(key: string): 'image' | 'video' | 'audio' {
        const ext = key.toLowerCase().split('.').pop();

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return 'image';
        }

        if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
            return 'video';
        }

        return 'audio';
    }
}
