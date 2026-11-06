export type AdminListOptions = {
  query: string;
  status: string;
  oldestFirst: boolean;
};

// Names remain searchable without Hungarian accents; telephone formatting
// does not affect a match. All filtering is in memory, never patient URLs.
export function normalizeAdminSearch(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("hu-HU")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function filterAdminRecords<T extends Record<string, unknown>>(
  records: T[],
  options: AdminListOptions,
  fields: string[],
): T[] {
  const query = normalizeAdminSearch(options.query);
  return records
    .filter(
      (record) =>
        (options.status === "all" ||
          (record.status || "new") === options.status) &&
        (!query ||
          normalizeAdminSearch(
            fields.map((field) => record[field]).join(" "),
          ).includes(query)),
    )
    .sort((a, b) => {
      const first = Date.parse(String(a.created_at || "")) || 0;
      const second = Date.parse(String(b.created_at || "")) || 0;
      return options.oldestFirst ? first - second : second - first;
    });
}
