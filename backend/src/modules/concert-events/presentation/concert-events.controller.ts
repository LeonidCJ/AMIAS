import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateConcertEventDto } from '../application/dtos/create-concert-event.dto';
import { CreateConcertEventUseCase } from '../application/use-cases/create-concert-event.use-case';
import { ListActiveEventsUseCase } from '../application/use-cases/list-active-events.use-case';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../auth/domain/user.entity';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('concert-events')
export class ConcertEventsController {
  constructor(
    private readonly createConcertEventUseCase: CreateConcertEventUseCase,
    private readonly listActiveEventsUseCase: ListActiveEventsUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateConcertEventDto) {
    const event = await this.createConcertEventUseCase.execute(
      dto.name,
      dto.venue,
      dto.capacity,
      dto.rate,
      new Date(dto.eventDate),
    );
    return {
      message: 'Concert event created successfully',
      event: {
        id: event.id,
        name: event.name,
        venue: event.venue,
        capacity: event.capacity.getValue(),
        rate: event.rate,
        eventDate: event.eventDate,
        createdAt: event.createdAt,
      },
    };
  }

  @Get()
  async findAll() {
    const events = await this.listActiveEventsUseCase.execute();
    return events.map((event) => ({
      id: event.id,
      name: event.name,
      venue: event.venue,
      capacity: event.capacity.getValue(),
      rate: event.rate,
      eventDate: event.eventDate,
      createdAt: event.createdAt,
    }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    await this.prisma.$transaction([
      this.prisma.productSize.deleteMany({ where: { product: { concertEventId: id } } }),
      this.prisma.product.deleteMany({ where: { concertEventId: id } }),
      this.prisma.concertEvent.delete({ where: { id } }),
    ]);

    return {
      message: 'Concierto/Gira eliminada correctamente del sistema.',
    };
  }
}
