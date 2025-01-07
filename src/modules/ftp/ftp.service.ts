import { Injectable } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as xlsx from 'xlsx';

@Injectable()
export class FtpService {
  private client: ftp.Client;

  constructor() {
    this.client = new ftp.Client();
    this.client.ftp.verbose = true;
  }

  async connect(): Promise<void> {
    try {
      await this.client.access({
        host: process.env.FTP_HOST,
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        port: 21,
        secure: true,
        secureOptions: {
          rejectUnauthorized: false,
        },
      });
    } catch (error) {
      console.error('Failed to connect to FTP server:', error.message);
      throw error;
    }
  }

  async processCsvFilesToJSON(): Promise<any[]> {
    const combinedData: any[] = [];
    const tempDir = path.join(os.tmpdir(), 'ftp_temp');
    let processedFilesCount = 0; // Счётчик обработанных файлов

    try {
      await this.connect();

      // Создаём временную директорию, если её нет
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const fileList = await this.client.list();

      // Фильтруем список файлов для исключения директорий и уже обработанных
      const csvFiles = fileList.filter(
        (file) =>
          !file.isDirectory &&
          !file.name.endsWith('_edited.csv') &&
          file.name.endsWith('.csv')
      );

      const batchSize = 50; // Количество файлов в одном пакете

      // Обрабатываем файлы пакетами
      for (
        let batchIndex = 0;
        batchIndex < csvFiles.length;
        batchIndex += batchSize
      ) {
        const batch = csvFiles.slice(batchIndex, batchIndex + batchSize);

        for (const file of batch) {
          if (processedFilesCount >= 110) {
            break; // Прерываем обработку, если достигли лимита
          }

          processedFilesCount++; // Увеличиваем счётчик обработанных файлов

          const remoteFilePath = `/${file.name}`;
          const localTempFilePath = path.join(tempDir, file.name);

          await this.client.downloadTo(localTempFilePath, remoteFilePath);

          // Читаем CSV файл и преобразуем его в JSON
          const workbook = xlsx.read(
            fs.readFileSync(localTempFilePath, 'utf8'),
            {
              type: 'string',
              raw: false,
            }
          );

          const sheetName = workbook.SheetNames[0];
          const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
            defval: null,
          });

          combinedData.push(...rows);

          // Удаляем локальный файл после обработки
          fs.unlinkSync(localTempFilePath);

          // Переименовываем файл на FTP-сервере, добавляя суффикс "_edited"
          const renamedFilePath = `/${path.basename(file.name, '.csv')}_edited.csv`;
          await this.client.rename(remoteFilePath, renamedFilePath);
        }

        // Если достигнут лимит обработанных файлов, выходим из цикла обработки пакетов
        if (processedFilesCount >= 110) {
          break;
        }
      }
    } catch (error) {
      console.error('Error processing CSV files:', error.message);

      throw error;
    } finally {
      this.client.close();
    }

    return combinedData;
  }

  async saveAsJSON(data: any[], outputFilePath: string): Promise<void> {
    try {
      fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving JSON file:', error.message);
      throw error;
    }
  }
}
