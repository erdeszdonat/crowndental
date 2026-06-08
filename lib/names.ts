function capitalizeNameToken(token: string) {
  if (!token) return token;
  return token.charAt(0).toLocaleUpperCase('hu-HU') + token.slice(1).toLocaleLowerCase('hu-HU');
}

function normalizeDisplayName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.split('-').map(capitalizeNameToken).join('-'))
    .join(' ');
}

export function parseHungarianName(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return { firstName: normalizeDisplayName(parts[0]), lastName: undefined };
  }

  if (parts.length > 1) {
    return {
      firstName: normalizeDisplayName(parts.slice(1).join(' ')),
      lastName: normalizeDisplayName(parts[0]),
    };
  }

  return { firstName: undefined, lastName: undefined };
}

export function getContactNameParts(name?: string | null, nickname?: string | null) {
  const parsedName = parseHungarianName(name);
  const cleanNickname = (nickname ?? '').trim();

  return {
    firstName: cleanNickname ? normalizeDisplayName(cleanNickname) : parsedName.firstName,
    lastName: parsedName.lastName,
  };
}

export function getPreferredGreetingName(name?: string | null, nickname?: string | null, fallback = 'Páciens') {
  return getContactNameParts(name, nickname).firstName || fallback;
}
