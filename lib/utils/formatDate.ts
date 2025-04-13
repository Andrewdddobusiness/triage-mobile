export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "TBD";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";

  // Format: "Mar 15, 2024"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(startDate: string | undefined, endDate: string | undefined): string {
  if (!startDate || !endDate) return "Dates TBD";

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === end) return start;
  return `${start} - ${end}`;
}
