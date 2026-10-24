import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetStockMonitorUseCase } from '../application/use-cases/get-stock-monitor.use-case';
import { RegisterBatchInflowUseCase } from '../application/use-cases/register-batch-inflow.use-case';
import { GetInventoryParametersUseCase } from '../application/use-cases/get-inventory-parameters.use-case';
import { CreateBatchInflowDto } from '../application/dtos/create-batch-inflow.dto';
import { StockQueryDto } from '../application/dtos/stock-query.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../auth/domain/user.entity';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly getStockMonitorUseCase: GetStockMonitorUseCase,
    private readonly registerBatchInflowUseCase: RegisterBatchInflowUseCase,
    private readonly getInventoryParametersUseCase: GetInventoryParametersUseCase,
  ) {}

  /**
   * TR-036 & TR-037: Monitor de stock por SKU con alerta crítica (isCritical: true si stock <= 10).
   * Soporta filtros opcionales: ?cutId=...&colorId=...&isCritical=true
   */
  @Get('stocks')
  async getStocks(@Query() query: StockQueryDto) {
    const isCriticalFilter =
      query.isCritical === 'true'
        ? true
        : query.isCritical === 'false'
        ? false
        : undefined;

    const result = await this.getStockMonitorUseCase.execute({
      cutId: query.cutId || undefined,
      colorId: query.colorId || undefined,
      isCritical: isCriticalFilter,
    });

    return {
      summary: result.summary,
      stocks: result.stocks,
      items: result.stocks,
    };
  }

  /**
   * TR-039: Registro transaccional (ACID) de ingreso de lote textil con incremento atómico.
   * Endpoints equivalentes: POST /inventory/batches, POST /inventory/stocks y POST /inventory/stocks/batch
   */
  @Post('batches')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERARIO)
  async registerBatch(@Body() dto: CreateBatchInflowDto) {
    const result = await this.registerBatchInflowUseCase.execute(dto);
    return {
      message: `Lote ${result.batch.batchNumber} registrado en transacción atómica (+${result.batch.totalUnitsAdded} prendas en ${result.batch.totalSkusUpdated} SKU).`,
      ...result,
    };
  }

  @Post('stocks')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERARIO)
  async registerBatchStocksAlias(@Body() dto: CreateBatchInflowDto) {
    return this.registerBatch(dto);
  }

  @Post('stocks/batch')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERARIO)
  async registerBatchStocksBatchAlias(@Body() dto: CreateBatchInflowDto) {
    return this.registerBatch(dto);
  }

  /**
   * TR-038: Endpoints livianos de parámetros maestros para desplegables dinámicos.
   */
  @Get('parameters/cuts')
  async getParameterCuts() {
    return this.getInventoryParametersUseCase.getCuts();
  }

  @Get('parameters/colors')
  async getParameterColors() {
    return this.getInventoryParametersUseCase.getColors();
  }

  @Get('parameters/sizes')
  async getParameterSizes() {
    return this.getInventoryParametersUseCase.getSizes();
  }
}
