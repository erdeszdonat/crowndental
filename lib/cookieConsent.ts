export const CONSENT_STORAGE_KEY = 'crown_cookie_consent';
export const CONSENT_EVENT = 'crown-cookie-consent';

// Keep this aligned with the effective date shown in the cookie notice.
// Changing it intentionally requires every browser to make a fresh decision.
export const CONSENT_POLICY_VERSION = '2026-07-20';

export type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = ConsentPreferences & {
  policyVersion: string;
  decidedAt: string;
};

export type ParsedConsent = {
  consent: StoredConsent | null;
  preferences: ConsentPreferences;
  requiresDecision: boolean;
};

const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function preferencesFrom(value: unknown): ConsentPreferences {
  if (!value || typeof value !== 'object') return DEFAULT_PREFERENCES;

  const candidate = value as { analytics?: unknown; marketing?: unknown };
  return {
    necessary: true,
    analytics: candidate.analytics === true,
    marketing: candidate.marketing === true,
  };
}

export function currentConsentFrom(value: unknown): StoredConsent | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as {
    analytics?: unknown;
    marketing?: unknown;
    policyVersion?: unknown;
    decidedAt?: unknown;
  };
  if (
    typeof candidate.analytics !== 'boolean'
    || typeof candidate.marketing !== 'boolean'
    || candidate.policyVersion !== CONSENT_POLICY_VERSION
    || typeof candidate.decidedAt !== 'string'
    || !Number.isFinite(Date.parse(candidate.decidedAt))
  ) {
    return null;
  }

  return {
    necessary: true,
    analytics: candidate.analytics,
    marketing: candidate.marketing,
    policyVersion: CONSENT_POLICY_VERSION,
    decidedAt: candidate.decidedAt,
  };
}

export function parseStoredConsent(value: string | null): ParsedConsent {
  if (!value) {
    return { consent: null, preferences: DEFAULT_PREFERENCES, requiresDecision: true };
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    const current = currentConsentFrom(parsed);
    return {
      consent: current,
      // Preserve a legacy user's toggles in the settings UI, but do not load
      // optional scripts until the current policy has been accepted again.
      preferences: current ?? preferencesFrom(parsed),
      requiresDecision: current === null,
    };
  } catch {
    return { consent: null, preferences: DEFAULT_PREFERENCES, requiresDecision: true };
  }
}

export function createConsentRecord(preferences: ConsentPreferences): StoredConsent {
  return {
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    policyVersion: CONSENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
  };
}
