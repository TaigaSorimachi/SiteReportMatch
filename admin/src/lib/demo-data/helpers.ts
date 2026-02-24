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
