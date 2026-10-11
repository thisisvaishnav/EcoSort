/**
 * EcoSort Heroes Feature Flags
 *
 * Controls visibility of experimental or unreleased worlds.
 * The Society world stays disabled by default until Wave 4 final integration.
 */

export function isSocietyWorldEnabled(): boolean {
  // 1. Build-time environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ENABLE_SOCIETY === 'true') {
    return true;
  }

  // 2. Client-side URL query parameter override (e.g. ?world=society or ?society=1)
  if (typeof window !== 'undefined' && window.location?.search) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('world') === 'society' || params.get('society') === '1' || params.get('enable_society') === 'true') {
      return true;
    }
  }

  // 3. Client-side localStorage override for developer/QA testing
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (window.localStorage.getItem('ecohero:society_enabled') === 'true') {
        return true;
      }
    } catch {
      // Storage access may be restricted in sandboxed environments
    }
  }

  // Disabled by default
  return false;
}

export function setSocietyWorldEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (enabled) {
        window.localStorage.setItem('ecohero:society_enabled', 'true');
      } else {
        window.localStorage.removeItem('ecohero:society_enabled');
      }
    } catch {
      // Ignore storage errors
    }
  }
}
