export function uuid(n: number): string {
  return `00000000-0000-0000-0000-${n.toString().padStart(12, '0')}`;
}

export function paginate<T>(items: T[], page: number = 1, limit: number = 20) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const p = Math.max(1, page);
  const start = (p - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { total, page: p, limit, totalPages },
  };
}

export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export function clockTime(date: string, hour: number, min: number = 0): string {
  return `${date}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00.000Z`;
}
