import { Injectable } from '@nestjs/common';
import * as ftp from 'basic-ftp';
import * as XLSX from 'xlsx';
import * as stream from 'stream';

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
        secure: false,
      });
      console.log('Connected to FTP server');
    } catch (error) {
      console.error('Failed to connect to FTP server:', error.message);
      throw error;
    }
  }

  async readExcelFileFromFTP(remoteFilePath: string): Promise<any[]> {
    try {
      await this.connect();

      // Создаем поток для получения данных
      const fileStream = new stream.PassThrough();
      // Скачиваем файл в поток
      await this.client.downloadTo(fileStream, remoteFilePath);

      // Преобразуем поток в буфер
      const fileBuffer = await this.streamToBuffer(fileStream);

      // Обработка Excel файла из буфера
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      console.log('Excel data:', data);
      return data;
    } catch (error) {
      console.error('Error reading Excel file:', error.message);
      throw error;
    } finally {
      this.client.close();
      console.log('FTP connection closed');
    }
  }

  private streamToBuffer(fileStream: stream.PassThrough): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      fileStream.on('data', (chunk) => chunks.push(chunk));
      fileStream.on('end', () => resolve(Buffer.concat(chunks)));
      fileStream.on('error', reject);
    });
  }
}
