import { browser } from "wxt/browser";

const DISABLED_KEY = "disabledDomains" as const;

type StorageSchema = {
  [DISABLED_KEY]: string[];
};

/**
 * get all disabled domains
 */
export async function getDisabledDomains(): Promise<string[]> {
  const data = await browser.storage.local.get(DISABLED_KEY);
  const val = (data as StorageSchema)[DISABLED_KEY];

  return Array.isArray(val) ? val : [];
}

/**
 * check if a domain is disabled
 */
export async function isDomainDisabled(hostname: string): Promise<boolean> {
  const disabled = await getDisabledDomains();
  return disabled.includes(hostname);
}

/**
 * add a domain to disabled list
 */
export async function disableDomain(hostname: string): Promise<void> {
  const disabled = await getDisabledDomains();

  if (!disabled.includes(hostname)) {
    await browser.storage.local.set({
      [DISABLED_KEY]: [...disabled, hostname],
    } satisfies StorageSchema);
  }
}

/**
 * remove a domain from disabled list
 */
export async function enableDomain(hostname: string): Promise<void> {
  const disabled = await getDisabledDomains();

  await browser.storage.local.set({
    [DISABLED_KEY]: disabled.filter((d) => d !== hostname),
  } satisfies StorageSchema);
}

/**
 * toggle domain state
 * @returns true if enabled, false if disabled
 */
export async function toggleDomain(hostname: string): Promise<boolean> {
  const disabled = await getDisabledDomains();
  const isDisabled = disabled.includes(hostname);

  if (isDisabled) {
    await enableDomain(hostname);
    return true;
  }

  await disableDomain(hostname);
  return false;
}
