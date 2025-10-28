import { SegmentService } from './../segment/segment.service';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatedByEnum,
  OrganizationMethodEnum,
  OrganizationStatusEnum,
} from 'types/global';
import { ExcelData } from 'types/organization/organization/dto/create-exel.dto';
import { OrganizationExcelDataFieldsEnum } from 'types/organization/organization/enum';

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
      try {
        for (const row of newRows) {
          const foundSegment = await this.prisma.segment.findFirst({
            where: {
              name: row.SEGMENT,
            },
          });
          let segment: any;
          if (!foundSegment) {
            segment = await this.segment.create({
              name: row.SEGMENT,
            });
          } else {
            segment = foundSegment;
          }
          const foundOrg = await this.prisma.organization.findFirst({
            where: {
              clientId: row.CLNT_ID,
            },
          });
          if (foundOrg) {
            continue;
          }

          let res = await this.prisma.organization.create({
            data: {
              clientId: row.CLNT_ID || '',
              name: row.NAME || '',
              Phone: {
                create: [
                  {
                    phone: row.PHONE || '',
                    isSecret: true,
                  },
                ],
              },
              segmentId: segment.id || 0,
              account: row.ACCOUNT || '',
              inn: row.INN || '',
              bankNumber: row.BANK || '',
              address: row.ADDRESS || '',
              mail: row.MAIL || '',
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
              clientId: row.CLNT_ID || '',
              name: row.NAME || '',
              PhoneVersion: {
                create: [
                  {
                    phone: row.PHONE || '',
                    isSecret: true,
                  },
                ],
              },
              segmentId: segment.id || 0,
              account: row.ACCOUNT || '',
              inn: row.INN || '',
              bankNumber: row.BANK || '',
              address: row.ADDRESS || '',
              mail: row.MAIL || '',
              createdBy: CreatedByEnum.Billing,
              status: OrganizationStatusEnum.Check,
              organizationId: res.id,
              method: OrganizationMethodEnum.Create,
            },
          });
          this.logger.debug(`Method: ${methodName} - Response: `, res);
        }
      } catch (error) {
        console.error('Error processing CSV files:', error.message);

        throw error;
      }
      return newRows.length + '-created rows';
    } catch (error) {
      console.error('Error processing CSV files:', error);
      throw error;
    }
  }

  async deactivateExcelData(deactiveRows: ExcelData[] | []): Promise<string> {
    try {
      for (const row of deactiveRows) {
        const organization = await this.prisma.organization.findUnique({
          where: { clientId: row.CLNT_ID },
        });

        if (!organization) {
          console.error(`Organization with clientId ${row.CLNT_ID} not found.`);
          continue;
        }

        await this.prisma.organization.update({
          where: {
            clientId: row.CLNT_ID,
          },
          data: {
            deletedAt: new Date(),
            status: OrganizationStatusEnum.Deleted,
          },
        });

        await this.prisma.organizationVersion.update({
          where: {
            clientId: row.CLNT_ID,
          },
          data: {
            deletedAt: new Date(),
            status: OrganizationStatusEnum.Deleted,
            method: OrganizationMethodEnum.Delete,
          },
        });
      }
      return deactiveRows.length + '-deleted rows';
    } catch (error) {
      console.error('Error processing CSV files:', error.message);

      throw error;
    }
  }

  async updateExcelData(updateRows: ExcelData[] | []): Promise<string> {
    try {
      for (const row of updateRows) {
        const organization = await this.prisma.organization.findUnique({
          where: { clientId: row.CLNT_ID },
        });

        if (!organization) {
          console.error(`Organization with clientId ${row.CLNT_ID} not found.`);
          continue;
        }

        if (row.UPDATES && row.UPDATES.length > 0) {
          let segment: any;
          if (row.UPDATES.includes('SEGMENT')) {
            const foundSegment = await this.prisma.segment.findFirst({
              where: {
                name: row.SEGMENT,
              },
            });
            if (!foundSegment) {
              segment = await this.segment.create({
                name: row.SEGMENT,
              });
            } else {
              segment = foundSegment;
            }
          }

          await this.prisma.organization.update({
            where: { clientId: row.CLNT_ID },
            data: Object.fromEntries(
              row.UPDATES.replaceAll('"', '')
                .split(',')
                .map((i) => i.trim())
                .filter((item) => !['START', 'STOP'].includes(item))
                .map((item) => {
                  if (item === 'PHONE') {
                    return [
                      'Phone',
                      { create: [{ phone: row[item], isSecret: true }] },
                    ];
                  }

                  if (item === 'SEGMENT') {
                    return ['segmentId', segment.id];
                  }

                  return [OrganizationExcelDataFieldsEnum[item], row[item]];
                })
            ),
          });

          await this.prisma.organizationVersion.update({
            where: { clientId: row.CLNT_ID },
            data: {
              method: OrganizationMethodEnum.Update,
              ...Object.fromEntries(
                row.UPDATES.replaceAll('"', '')
                  .split(',')
                  .map((i) => i.trim())
                  .filter(
                    (item) => !['START', 'STOP'].includes(item.toUpperCase())
                  )
                  .map((item) => {
                    if (item === 'PHONE') {
                      return [
                        'PhoneVersion',
                        { create: [{ phone: row[item], isSecret: true }] },
                      ];
                    }

                    if (item === 'SEGMENT') {
                      return ['segmentId', segment.id];
                    }

                    return [OrganizationExcelDataFieldsEnum[item], row[item]];
                  })
              ),
            },
          });
        }
      }
      return updateRows.length + '-updated rows';
    } catch (error) {
      console.error('Error processing CSV files:', error.message);
      throw error;
    }
  }
}
