export function buildDateFilter(dateRange?: string) {
  if (!dateRange) return {};

  const now = new Date();
  const parts = dateRange.trim().toLowerCase().split(' ');

  if (parts.length !== 2) return {};

  const amount = Number(parts[0]);
  const unit = parts[1];

  if (isNaN(amount) || amount <= 0) return {};

  const fromDate = new Date(now);

  switch (unit) {
    case 'day':
    case 'days':
      fromDate.setDate(now.getDate() - amount);
      break;
    case 'month':
    case 'months':
      fromDate.setMonth(now.getMonth() - amount);
      break;
    case 'year':
    case 'years':
      fromDate.setFullYear(now.getFullYear() - amount);
      break;
    default:
      return {};
  }

  fromDate.setHours(0, 0, 0, 0);
  now.setHours(23, 59, 59, 999);

  return {
    gte: fromDate,
    lte: now,
  };
}
