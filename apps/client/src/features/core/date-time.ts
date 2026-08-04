export function formatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatDateInput(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function parseLocalDateTime(dateText: string, timeText: string) {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateText.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeText.trim());
  if (!dateMatch || !timeMatch) return null;

  const [, dayText, monthText, yearText] = dateMatch;
  const [, hourText, minuteText] = timeMatch;
  const day = Number(dayText);
  const month = Number(monthText) - 1;
  const year = Number(yearText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const result = new Date(year, month, day, hour, minute, 0, 0);

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month ||
    result.getDate() !== day ||
    result.getHours() !== hour ||
    result.getMinutes() !== minute
  ) {
    return null;
  }

  return result;
}
