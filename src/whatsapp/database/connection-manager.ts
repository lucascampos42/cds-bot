import { PrismaClient } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseLoggerService } from './database-logger.service';

interface ConnectionPool {
  client: PrismaClient;
  schema: string;
  lastUsed: Date;
  isHealthy: boolean;
}

@Injectable()
export class ConnectionManager {
  private readonly logger = new Logger(ConnectionManager.name);
  private readonly connections = new Map<string, ConnectionPool>();
  private readonly maxConnections: number;
  private readonly schemaPrefix: string;

  constructor(private readonly databaseLogger: DatabaseLoggerService) {
    this.maxConnections = parseInt(process.env.POOL_CONNECTIONS_MAX || '20');
    this.schemaPrefix = process.env.DATABASE_SCHEMA_PREFIX || 'client_';
  }

  async getConnection(clientId: string): Promise<PrismaClient> {
    const schema = `${this.schemaPrefix}${clientId}`;

    if (this.connections.has(schema)) {
      const pool = this.connections.get(schema)!;
      pool.lastUsed = new Date();
      return pool.client;
    }

    if (this.connections.size >= this.maxConnections) {
      await this.cleanupOldConnections();
    }

    const client = new PrismaClient({
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?schema=${schema}`,
        },
      },
    });

    await client.$connect();

    const pool: ConnectionPool = {
      client,
      schema,
      lastUsed: new Date(),
      isHealthy: true,
    };

    this.connections.set(schema, pool);
    this.logger.log(`Nova conexão criada para schema: ${schema}`);
    this.databaseLogger.logConnectionEvent('CONNECTION_CREATED', schema);

    return client;
  }

  async executeTransaction<T>(
    clientId: string,
    operation: (client: PrismaClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getConnection(clientId);
    const schema = `${this.schemaPrefix}${clientId}`;
    const startTime = Date.now();

    try {
      const result = await client.$transaction(async (tx) => {
        return operation(tx as PrismaClient);
      });

      const duration = Date.now() - startTime;
      this.databaseLogger.logTransaction(schema, ['TRANSACTION'], duration);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.databaseLogger.logOperation({
        operation: 'TRANSACTION',
        schema,
        duration,
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  private async cleanupOldConnections(): Promise<void> {
    const now = new Date();
    const oldConnections = Array.from(this.connections.entries())
      .filter(([_, pool]) => {
        const timeDiff = now.getTime() - pool.lastUsed.getTime();
        return timeDiff > 300000; // 5 minutos
      })
      .sort(([_, a], [__, b]) => a.lastUsed.getTime() - b.lastUsed.getTime());

    for (const [schema, pool] of oldConnections.slice(0, 5)) {
      await pool.client.$disconnect();
      this.connections.delete(schema);
      this.logger.log(`Conexão removida para schema: ${schema}`);
    }
  }

  async closeAllConnections(): Promise<void> {
    for (const [schema, pool] of this.connections) {
      await pool.client.$disconnect();
      this.logger.log(`Conexão fechada para schema: ${schema}`);
    }
    this.connections.clear();
  }
}
