import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectionManager } from './connection-manager';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(private readonly connectionManager: ConnectionManager) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async performHealthCheck(): Promise<void> {
    try {
      await this.checkConnectionsHealth();
    } catch (error) {
      this.logger.error('Erro durante health check:', error);
    }
  }

  private async checkConnectionsHealth(): Promise<void> {
    const connections = this.connectionManager['connections'];

    for (const [schema, pool] of connections) {
      try {
        await pool.client.$queryRaw`SELECT 1`;
        pool.isHealthy = true;
      } catch (error) {
        this.logger.warn(
          `Conexão não saudável detectada para schema: ${schema}`,
        );
        pool.isHealthy = false;
        await this.attemptReconnection(schema, pool);
      }
    }
  }

  private async attemptReconnection(schema: string, pool: any): Promise<void> {
    try {
      await pool.client.$disconnect();
      await pool.client.$connect();
      pool.isHealthy = true;
      this.logger.log(`Reconexão bem-sucedida para schema: ${schema}`);
    } catch (error) {
      this.logger.error(`Falha na reconexão para schema: ${schema}`, error);
      this.connectionManager['connections'].delete(schema);
    }
  }

  async checkSingleConnection(clientId: string): Promise<boolean> {
    try {
      const client = await this.connectionManager.getConnection(clientId);
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(`Health check falhou para cliente: ${clientId}`, error);
      return false;
    }
  }
}
