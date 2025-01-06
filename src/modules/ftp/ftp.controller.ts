import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FtpService } from './ftp.service';
import { FtpServiceCommands as Commands } from 'types/organization/ftp';

@Controller()
export class FtpController {
  private readonly logger = new Logger(FtpController.name);

  constructor(private readonly ftpService: FtpService) {}

  @MessagePattern({ cmd: Commands.READ_FILES })
  async handleReadFiles(data: { remoteFilePath: string; localFilePath: string }): Promise<any[]> {
    this.logger.debug(`Received READ_FILES command with data:`, data);

    const { remoteFilePath, localFilePath } = data;

    return await this.ftpService.readExcelFileFromFTP(remoteFilePath);
  }
}
