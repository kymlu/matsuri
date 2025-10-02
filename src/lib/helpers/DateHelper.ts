export function formatExportDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth() is 0-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function formatJapaneseDateRange(startDateString: string, endDateString?: string): string {
  const startDate = new Date(startDateString);
  if (isNaN(startDate.getTime())) {
    throw new Error('Invalid date string');
  }
  
  const year = startDate.getFullYear();
  const month = startDate.getMonth() + 1; // getMonth() is 0-indexed
  const day = startDate.getDate();
  
  var formattedString = `${year}年${month}月${day}日`;

  if (endDateString) {
    const endDate = new Date(endDateString);
    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid date string');
    }
    if (endDate.getTime() !== startDate.getTime()) {
      const endYear = endDate.getFullYear();
      const endMonth = endDate.getMonth() + 1;
      const endDay = endDate.getDate();
      
      if (endYear !== year) {
        formattedString += `〜${endYear}年${endMonth}月${endDay}日`;
      } else if (endMonth !== month) {
        formattedString += `〜${endMonth}月${endDay}日`;
      } else {
        formattedString += `〜${endDay}日`;
      }
    }
  }

  return formattedString;
}