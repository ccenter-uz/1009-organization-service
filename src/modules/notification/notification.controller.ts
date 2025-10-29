import { Controller, Post, Get, Put, Delete, Patch, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationServiceCommands as Commands } from 'types/organization/notification/commands';
import {
  NotificationInterfaces,
  NotificationUpdateDto,
  NotificationCreateDto,
} from 'types/organization/notification';
import {
  DeleteDto,
  GetOneDto,
  LanguageRequestDto,
  ListQueryDto,
} from 'types/global';
import { CityFilterDto } from 'types/organization/city/dto/filter-city.dto';
import { NotificationFilterDto } from 'types/organization/notification/dto/filter-notification.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('city')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @MessagePattern({ cmd: Commands.CREATE })
  create(
    @Payload() data: NotificationCreateDto
  ): Promise<NotificationInterfaces.Response> {
    return this.notificationService.create(data);
  }

  @Get('all')
  @MessagePattern({ cmd: Commands.GET_ALL_LIST })
  findAll(
    @Payload() data: NotificationFilterDto
  ): Promise<NotificationInterfaces.ResponseWithoutPagination> {
    return this.notificationService.findAll(data);
  }

  @Get('by-id')
  @MessagePattern({ cmd: Commands.GET_BY_ID })
  findOne(
    @Payload() data: GetOneDto
  ): Promise<NotificationInterfaces.Response> {
    return this.notificationService.findOne(data);
  }

  @Put()
  @MessagePattern({ cmd: Commands.UPDATE })
  update(
    @Payload() data: NotificationUpdateDto
  ): Promise<NotificationInterfaces.Response> {
    return this.notificationService.update(data);
  }

  @Delete()
  @MessagePattern({ cmd: Commands.DELETE })
  remove(@Payload() data: DeleteDto): Promise<NotificationInterfaces.Response> {
    return this.notificationService.remove(data);
  }

  @Patch()
  @MessagePattern({ cmd: Commands.RESTORE })
  restore(
    @Payload() data: GetOneDto
  ): Promise<NotificationInterfaces.Response> {
    return this.notificationService.restore(data);
  }

  // @Post()
  // @ApiBody({ type: NotificationCreateDto })
  // @HttpCode(HttpStatus.CREATED)
  // async sentNotification(
  //   @Body() data: NotificationCreateDto
  // ): Promise<NotificationInterfaces.Response> {
  //   return this.notificationService.sentNotification(data);
  // }
}
