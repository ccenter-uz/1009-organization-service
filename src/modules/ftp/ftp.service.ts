import { SegmentService } from './../segment/segment.service';
import { Injectable, Logger } from '@nestjs/common';
import excelDateToDateTime from '@/common/helper/excelDateConverter';
import { PrismaService } from '../prisma/prisma.service';
import { CreatedByEnum, OrganizationStatusEnum } from 'types/global';
import { ExcelData } from 'types/organization/organization/dto/create-exel.dto';

@Injectable()
export class FtpService {
  private logger = new Logger(FtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly segment: SegmentService
  ) {}

  async createExcelData(newRows: ExcelData[] | []): Promise<string> {
    const methodName: string = this.createExcelData.name;

    try {
      this.logger.debug(`Method: ${methodName} - Request: `, newRows);

      newRows.forEach(async (row) => {
        const foundSegment = await this.prisma.segment.findFirst({
          where: {
            name: row['SEGMENT'] + '',
          },
        });
        let segment: any;
        if (!foundSegment) {
          segment = await this.segment.create({
            name: row['SEGMENT'] + '',
          });
        } else {
          segment = foundSegment;
        }
        const foundOrg = await this.prisma.organization.findFirst({
          where: {
            clientId: row['CLNT_ID'] + '',
          },
        });
        if (foundOrg) {
          return;
        }

        let res = await this.prisma.organization.create({
          data: {
            clientId: row['CLNT_ID'] + '' || '',
            createdAt: row['START'] ? excelDateToDateTime(row['START']) : '',
            deletedAt: row['STOP'] ? excelDateToDateTime(row['STOP']) : null,
            name: row['NAME'] + '' || '',
            Phone: {
              create: [
                {
                  phone: row['PHONE'] + '' || '',
                  isSecret: true,
                },
              ],
            },
            segmentId: segment.id || 0,
            account: row['ACCOUNT'] + '' || '',
            inn: row['INN'] + '' || '',
            bankNumber: row['BANK'] + '' || '',
            address: row['ADDRESS'] + '' || '',
            mail: row['MAIL'] || '',
            createdBy: CreatedByEnum.Billing,
            status: OrganizationStatusEnum.Check,
          },
          select: {
            id: true,
            clientId: true,
            createdAt: true,
            deletedAt: true,
            name: true,
            segmentId: true,
            account: true,
            inn: true,
            bankNumber: true,
            address: true,
            mail: true,
            createdBy: true,
            status: true,
          },
        });

        await this.prisma.organizationVersion.create({
          data: {
            clientId: row['CLNT_ID'] + '' || '',
            createdAt: row['START'] ? excelDateToDateTime(row['START']) : '',
            deletedAt: row['STOP'] ? excelDateToDateTime(row['STOP']) : null,
            name: row['NAME'] + '' || '',
            PhoneVersion: {
              create: [
                {
                  phone: row['PHONE'] + '' || '',
                  isSecret: true,
                },
              ],
            },
            segmentId: segment.id || 0,
            account: row['ACCOUNT'] + '' || '',
            inn: row['INN'] + '' || '',
            bankNumber: row['BANK'] + '' || '',
            address: row['ADDRESS'] + '' || '',
            mail: row['MAIL'] || '',
            createdBy: CreatedByEnum.Billing,
            status: OrganizationStatusEnum.Check,
            organizationId: res.id,
          },
        });
        this.logger.debug(`Method: ${methodName} - Response: `, res);
      });
    } catch (error) {
      console.error('Error processing CSV files:', error.message);

      throw error;
    }
    return newRows.length + '-create rows ';
  }

  async deactiveteExcelData(deactiveRows: ExcelData[] | []): Promise<string> {
    try {
      deactiveRows.forEach(async (row) => {
        const organization = await this.prisma.organization.findUnique({
          where: { clientId: row['CLNT_ID'] + '' },
        });

        if (!organization) {
          console.error(
            `Organization with clientId ${row['CLNT_ID']} not found.`
          );
          return;
        }

        let res = await this.prisma.organization.update({
          where: {
            clientId: row['CLNT_ID'] + '',
          },
          data: {
            deletedAt: row['STOP'] ? excelDateToDateTime(row['STOP']) : null,
            createdBy: CreatedByEnum.Billing,
            status: OrganizationStatusEnum.Deleted,
          },
        });

        let orgVer = await this.prisma.organizationVersion.update({
          where: {
            clientId: row['CLNT_ID'] + '',
          },
          data: {
            deletedAt: row['STOP'] ? excelDateToDateTime(row['STOP']) : null,
            createdBy: CreatedByEnum.Billing,
            status: OrganizationStatusEnum.Deleted,
          },
        });
      });
    } catch (error) {
      console.error('Error processing CSV files:', error.message);

      throw error;
    }

    return deactiveRows.length + '-delete rows';
  }
}
