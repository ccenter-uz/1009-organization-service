export default function excelDateToDateTime(excelDate: any) {
   
  
    // Если входное значение уже является строкой формата ISO
    if (typeof excelDate === 'string') {
      const parsedDate = new Date(excelDate);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      } else {
        console.error('Invalid string date value:', excelDate);
        throw new RangeError('Invalid string date value');
      }
    }
  
    // Если входное значение — число Excel
    if (typeof excelDate === 'number' && !isNaN(excelDate)) {
      // Базовая дата для Excel в Windows: 1 января 1900 года
      const excelEpoch = new Date(Date.UTC(1900, 0, 1));
  
      // Excel добавляет лишний день (учитывает ошибку високосного года 1900)
      const correctedDays = excelDate - 1;
  
      // Целая часть — это дни, дробная часть — время
      const milliseconds = correctedDays * 24 * 60 * 60 * 1000;
  
      // Создаём объект Date
      const jsDate = new Date(excelEpoch.getTime() + milliseconds);
  
      if (!isNaN(jsDate.getTime())) {
        return jsDate.toISOString();
      }
    }
  
    console.error('Invalid Excel date value:', excelDate);
    throw new RangeError('Invalid Excel date value');
  }
  