import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import * as stream from 'stream';
import { ObjectId } from 'mongodb';

// Define MulterFile interface for type safety
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

@Injectable()
export class GridFsService {
  private gridFsBucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    if (!this.connection.db) {
      throw new Error('Database connection not established');
    }
    // Use any to bypass type checking issues between mongoose and mongodb versions
    this.gridFsBucket = new GridFSBucket(this.connection.db as any);
  }

  async uploadFile(
    file: MulterFile,
    metadata: Record<string, any>,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const readableStream = new stream.Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);

      const uploadStream = this.gridFsBucket.openUploadStream(
        file.originalname,
        {
          contentType: file.mimetype,
          metadata,
        },
      );

      readableStream
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => {
          resolve(uploadStream.id.toString());
        });
    });
  }

  async getFile(id: string): Promise<{
    stream: any;
    file: any;
  }> {
    try {
      const _id = new ObjectId(id);
      const cursor = this.gridFsBucket.find({ _id });
      const file = await cursor.next();

      if (!file) {
        throw new Error('File not found');
      }

      return {
        stream: this.gridFsBucket.openDownloadStream(_id),
        file,
      };
    } catch (error: any) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  async deleteFile(id: string): Promise<void> {
    try {
      const _id = new ObjectId(id);
      await this.gridFsBucket.delete(_id);
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
