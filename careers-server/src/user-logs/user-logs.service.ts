import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserLog, UserLogDocument } from './schemas/user-log.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Request } from 'express';

export interface CreateLogDto {
  userId: string;
  action: string;
  details?: Record<string, any>;
  resourceType: string;
  resourceId: string;
  request?: Request | Record<string, any>;
}

@Injectable()
export class UserLogsService {
  constructor(
    @InjectModel(UserLog.name) private userLogModel: Model<UserLogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Create a new log entry
   * @param createLogDto The log data to create
   * @returns The created log
   */
  async createLog(createLogDto: CreateLogDto): Promise<UserLogDocument> {
    const { userId, action, details, resourceType, resourceId, request } =
      createLogDto;

    const logData: Partial<UserLog> = {
      userId,
      action,
      details: details || {},
      resourceType,
      resourceId,
    };

    // Add request information if available
    if (request && typeof request === 'object' && 'headers' in request) {
      logData.ip = this.getClientIp(request);
      logData.userAgent = (request.headers['user-agent'] as string) || '';
    }

    // Fetch user information if userId is provided
    if (userId && userId !== 'anonymous') {
      try {
        const user = await this.userModel.findById(userId).exec();
        if (user) {
          logData.userName = user.name;
          logData.userEmail = user.email;
        }
      } catch (error) {
        console.error('Error fetching user for logging:', error);
        // Continue with logging even if user fetch fails
      }
    }

    const newLog = new this.userLogModel(logData);
    return newLog.save();
  }

  /**
   * Get logs by user ID
   * @param userId The ID of the user
   * @returns Array of logs for the user
   */
  async getLogsByUser(userId: string): Promise<UserLogDocument[]> {
    return this.userLogModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get logs by resource type and ID
   * @param resourceType The type of resource
   * @param resourceId The ID of the resource
   * @returns Array of logs for the resource
   */
  async getLogsByResource(
    resourceType: string,
    resourceId: string,
  ): Promise<UserLogDocument[]> {
    return this.userLogModel
      .find({ resourceType, resourceId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all logs with pagination
   * @param page The page number
   * @param limit The number of logs per page
   * @returns Array of logs
   */
  async getAllLogs(
    page = 1,
    limit = 20,
  ): Promise<{ logs: UserLogDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.userLogModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userLogModel.countDocuments(),
    ]);

    return { logs, total };
  }

  /**
   * Helper method to get client IP from request
   * @param request Express request object or similar object
   * @returns Client IP address
   */
  private getClientIp(request: Request | Record<string, any>): string {
    // Check if headers exist
    if (!request.headers) {
      return 'unknown';
    }

    const xForwardedFor = request.headers['x-forwarded-for'] as
      | string
      | string[]
      | undefined;
    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0];
      return ips.trim();
    }

    // Handle both Express Request and generic Record types
    const ip = 'ip' in request ? ((request as any).ip as string) : undefined;
    const socketRemoteAddress =
      'socket' in request && (request as any).socket
        ? ((request as any).socket.remoteAddress as string)
        : undefined;

    return ip || socketRemoteAddress || 'unknown';
  }
}
