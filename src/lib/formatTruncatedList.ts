/** Join list items, truncating with a suffix when over `maxVisible`. */
export function formatTruncatedList(
  items: readonly string[],
  maxVisible: number,
  moreSuffix: (remainingCount: number) => string
): string {
  if (items.length <= maxVisible) {
    return items.join(', ');
  }

  const visible = items.slice(0, maxVisible).join(', ');
  return `${visible} ${moreSuffix(items.length - maxVisible)}`;
}
