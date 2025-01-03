export function formatDate(dateString: string): string {
  // Adjust for timezone offset to ensure the correct date is shown
  const date = new Date(dateString);
  const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  
  return adjustedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function adjustForTimezone(date: Date): Date {
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}