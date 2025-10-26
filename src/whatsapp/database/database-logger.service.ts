import { Injectable, Logger } from '@nestjs/common';

export interface DatabaseOperation {
  operation: string;
  schema: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class DatabaseLoggerService {
  private readonly logger = new Logger(DatabaseLoggerService.name);

  logOperation(operation: DatabaseOperation): void {
    const logMessage = `[${operation.schema}] ${operation.operation} - ${operation.duration}ms`;
    
    if (operation.success) {
      this.logger.log(logMessage);
    } else {
      this.logger.error(`${logMessage} - ERRO: ${operation.error}`);
    }
  }

  logConnectionEvent(event: string, schema: string, details?: any): void {
    this.logger.log(`[${schema}] ${event}`, details);
  }

  logTransaction(schema: string, operations: string[], duration: number): void {
    this.logger.log(
      `[${schema}] TRANSAÇÃO: ${operations.join(', ')} - ${duration}ms`
    );
  }
}
