import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { FtpService } from './ftp.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FtpServiceCommands } from 'types/organization/ftp';

@ApiBearerAuth()
@ApiTags('ftp')
@Controller('ftp')
export class FtpController {
  constructor(private readonly ftpService: FtpService) {}

  @Get('process-files')
  @HttpCode(HttpStatus.OK)
  @MessagePattern({ cmd: FtpServiceCommands.POST_ORGANIZATIONS })
  async processFiles(@Payload('rows') rows: any): Promise<any> {
    const createRes = await this.ftpService.createExcelData(rows.new);
    const deleteRes = await this.ftpService.deactivateExcelData(rows.deactive);
    const updateRes = await this.ftpService.updateExcelData(rows.update);

    return { createRes, deleteRes, updateRes };
  }
}
