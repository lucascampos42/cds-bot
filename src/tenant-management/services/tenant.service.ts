import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateTenantDto,
  TenantResponseDto,
  TenantStatus,
  UpdateTenantStatusDto,
} from '../dto';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  private readonly prisma: PrismaClient;

  constructor() {
    // Cliente Prisma para o schema público (gestão de tenants)
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async createTenant(
    createTenantDto: CreateTenantDto,
  ): Promise<TenantResponseDto> {
    const { clientId, name, email, phone, notes } = createTenantDto;
    const schemaName = `${process.env.DATABASE_SCHEMA_PREFIX}${clientId}`;

    this.logger.log(`Iniciando criação do tenant: ${clientId}`);

    try {
      // 1. Verificar se o clientId já existe
      await this.validateClientIdAvailability(clientId);

      // 2. Criar registro no schema público
      const tenant = await this.createTenantRecord({
        clientId,
        schemaName,
        name,
        email,
        phone,
        notes,
      });

      // 3. Criar schema no PostgreSQL
      await this.createDatabaseSchema(schemaName);

      // 4. Aplicar migrations no novo schema
      await this.applyMigrations(schemaName);

      // 5. Ativar o tenant
      await this.updateTenantStatus(clientId, TenantStatus.ACTIVE);

      this.logger.log(`Tenant ${clientId} criado com sucesso`);

      return {
        clientId: tenant.clientId,
        schemaName: tenant.schemaName,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        status: TenantStatus.ACTIVE,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        notes: tenant.notes,
      };
    } catch (error) {
      this.logger.error(`Erro ao criar tenant ${clientId}:`, error);

      // Cleanup em caso de erro
      await this.cleanupFailedTenant(clientId, schemaName);

      throw error;
    }
  }

  async getTenant(clientId: string): Promise<TenantResponseDto> {
    const tenant = await this.findTenantByClientId(clientId);

    if (!tenant) {
      throw new NotFoundException(`Tenant ${clientId} não encontrado`);
    }

    return {
      clientId: tenant.clientId,
      schemaName: tenant.schemaName,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status as TenantStatus,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      notes: tenant.notes,
    };
  }

  async updateTenantStatus(
    clientId: string,
    status: TenantStatus,
    reason?: string,
  ): Promise<TenantResponseDto> {
    const tenant = await this.findTenantByClientId(clientId);

    if (!tenant) {
      throw new NotFoundException(`Tenant ${clientId} não encontrado`);
    }

    const updatedTenant = await this.prisma.$executeRaw`
      UPDATE public.tenants 
      SET status = ${status}, updated_at = NOW()
      WHERE client_id = ${clientId}
    `;

    if (reason) {
      this.logger.log(
        `Status do tenant ${clientId} alterado para ${status}. Motivo: ${reason}`,
      );
    }

    return this.getTenant(clientId);
  }

  async deleteTenant(clientId: string): Promise<void> {
    const tenant = await this.findTenantByClientId(clientId);

    if (!tenant) {
      throw new NotFoundException(`Tenant ${clientId} não encontrado`);
    }

    try {
      // 1. Marcar como deletado
      await this.updateTenantStatus(clientId, TenantStatus.DELETED);

      // 2. Remover schema do banco (cuidado!)
      await this.dropDatabaseSchema(tenant.schemaName);

      // 3. Remover registro
      await this.prisma.$executeRaw`
        DELETE FROM public.tenants WHERE client_id = ${clientId}
      `;

      this.logger.log(`Tenant ${clientId} removido com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao remover tenant ${clientId}:`, error);
      throw error;
    }
  }

  async listTenants(): Promise<TenantResponseDto[]> {
    const tenants = await this.prisma.$queryRaw`
      SELECT * FROM public.tenants ORDER BY created_at DESC
    `;

    return (tenants as any[]).map((tenant) => ({
      clientId: tenant.client_id,
      schemaName: tenant.schema_name,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      status: tenant.status,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      notes: tenant.notes,
    }));
  }

  private async validateClientIdAvailability(clientId: string): Promise<void> {
    const existing = await this.findTenantByClientId(clientId);

    if (existing) {
      throw new ConflictException(`Cliente ${clientId} já existe`);
    }
  }

  private async findTenantByClientId(clientId: string): Promise<any> {
    const result = await this.prisma.$queryRaw`
      SELECT * FROM public.tenants WHERE client_id = ${clientId}
    `;

    return (result as any[])[0] || null;
  }

  private async createTenantRecord(data: any): Promise<any> {
    const result = await this.prisma.$executeRaw`
      INSERT INTO public.tenants (client_id, schema_name, name, email, phone, notes, status, created_at, updated_at)
      VALUES (${data.clientId}, ${data.schemaName}, ${data.name}, ${data.email}, ${data.phone}, ${data.notes}, ${TenantStatus.PENDING}, NOW(), NOW())
    `;

    return {
      clientId: data.clientId,
      schemaName: data.schemaName,
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async createDatabaseSchema(schemaName: string): Promise<void> {
    this.logger.log(`Criando schema: ${schemaName}`);

    await this.prisma.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`,
    );
  }

  private async applyMigrations(schemaName: string): Promise<void> {
    this.logger.log(`Aplicando migrations no schema: ${schemaName}`);

    // Criar tabelas do WhatsApp no novo schema
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'disconnected',
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".contacts (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        name VARCHAR(255),
        is_group BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (session_id) REFERENCES "${schemaName}".sessions(session_id) ON DELETE CASCADE
      )
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE "${schemaName}".messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        message_id VARCHAR(255) UNIQUE NOT NULL,
        from_phone VARCHAR(20) NOT NULL,
        to_phone VARCHAR(20) NOT NULL,
        content TEXT,
        message_type VARCHAR(50) DEFAULT 'text',
        timestamp TIMESTAMP NOT NULL,
        is_from_me BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (session_id) REFERENCES "${schemaName}".sessions(session_id) ON DELETE CASCADE
      )
    `);

    // Criar índices
    await this.prisma.$executeRawUnsafe(
      `CREATE INDEX idx_${schemaName}_sessions_status ON "${schemaName}".sessions(status)`,
    );
    await this.prisma.$executeRawUnsafe(
      `CREATE INDEX idx_${schemaName}_contacts_session ON "${schemaName}".contacts(session_id)`,
    );
    await this.prisma.$executeRawUnsafe(
      `CREATE INDEX idx_${schemaName}_messages_session ON "${schemaName}".messages(session_id)`,
    );
    await this.prisma.$executeRawUnsafe(
      `CREATE INDEX idx_${schemaName}_messages_timestamp ON "${schemaName}".messages(timestamp)`,
    );
  }

  private async dropDatabaseSchema(schemaName: string): Promise<void> {
    this.logger.warn(`Removendo schema: ${schemaName}`);

    await this.prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
    );
  }

  private async cleanupFailedTenant(
    clientId: string,
    schemaName: string,
  ): Promise<void> {
    try {
      // Remover schema se foi criado
      await this.dropDatabaseSchema(schemaName);

      // Remover registro se foi criado
      await this.prisma.$executeRaw`
        DELETE FROM public.tenants WHERE client_id = ${clientId}
      `;

      this.logger.log(`Cleanup realizado para tenant ${clientId}`);
    } catch (error) {
      this.logger.error(`Erro no cleanup do tenant ${clientId}:`, error);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
