import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpStatus, 
  HttpCode,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { TenantService } from './services';
import { 
  CreateTenantDto, 
  TenantResponseDto, 
  UpdateTenantStatusDto 
} from './dto';

@ApiTags('Tenant Management')
@Controller('tenant')
@UsePipes(new ValidationPipe({ transform: true }))
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Criar novo tenant',
    description: 'Cria um novo cliente com schema isolado no banco de dados'
  })
  @ApiBody({ type: CreateTenantDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Tenant criado com sucesso',
    type: TenantResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Cliente já existe'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos'
  })
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantService.createTenant(createTenantDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos os tenants',
    description: 'Retorna lista de todos os tenants cadastrados'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tenants',
    type: [TenantResponseDto]
  })
  async listTenants(): Promise<TenantResponseDto[]> {
    return this.tenantService.listTenants();
  }

  @Get(':clientId')
  @ApiOperation({ 
    summary: 'Consultar tenant específico',
    description: 'Retorna informações detalhadas de um tenant'
  })
  @ApiParam({ 
    name: 'clientId', 
    description: 'ID único do cliente',
    example: 'empresa123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados do tenant',
    type: TenantResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tenant não encontrado'
  })
  async getTenant(@Param('clientId') clientId: string): Promise<TenantResponseDto> {
    return this.tenantService.getTenant(clientId);
  }

  @Put(':clientId/status')
  @ApiOperation({ 
    summary: 'Atualizar status do tenant',
    description: 'Altera o status de um tenant (ativo, suspenso, etc.)'
  })
  @ApiParam({ 
    name: 'clientId', 
    description: 'ID único do cliente',
    example: 'empresa123'
  })
  @ApiBody({ type: UpdateTenantStatusDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Status atualizado com sucesso',
    type: TenantResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tenant não encontrado'
  })
  async updateTenantStatus(
    @Param('clientId') clientId: string,
    @Body() updateStatusDto: UpdateTenantStatusDto
  ): Promise<TenantResponseDto> {
    return this.tenantService.updateTenantStatus(
      clientId, 
      updateStatusDto.status, 
      updateStatusDto.reason
    );
  }

  @Delete(':clientId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Remover tenant',
    description: 'Remove completamente um tenant e seu schema (CUIDADO: operação irreversível)'
  })
  @ApiParam({ 
    name: 'clientId', 
    description: 'ID único do cliente',
    example: 'empresa123'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Tenant removido com sucesso'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tenant não encontrado'
  })
  async deleteTenant(@Param('clientId') clientId: string): Promise<void> {
    return this.tenantService.deleteTenant(clientId);
  }

  @Get(':clientId/health')
  @ApiOperation({ 
    summary: 'Verificar saúde do tenant',
    description: 'Verifica se o schema do tenant está acessível e funcionando'
  })
  @ApiParam({ 
    name: 'clientId', 
    description: 'ID único do cliente',
    example: 'empresa123'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status de saúde do tenant'
  })
  async checkTenantHealth(@Param('clientId') clientId: string): Promise<{ status: string; message: string }> {
    try {
      const tenant = await this.tenantService.getTenant(clientId);
      
      // Verificação básica se o tenant existe e está ativo
      if (tenant.status === 'active') {
        return {
          status: 'healthy',
          message: `Tenant ${clientId} está ativo e funcionando`
        };
      } else {
        return {
          status: 'unhealthy',
          message: `Tenant ${clientId} está com status: ${tenant.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Erro ao verificar tenant ${clientId}: ${error.message}`
      };
    }
  }
}
