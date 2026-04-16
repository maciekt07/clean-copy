/**
 * key used in chrome.storage
 * @type {string}
 */
const DISABLED_KEY = "disabledDomains";

/**
 * get all disabled domains
 * @returns {Promise<string[]>}
 */
export async function getDisabledDomains() {
    const data = await chrome.storage.local.get(DISABLED_KEY);
    const val = data[DISABLED_KEY];

    return Array.isArray(val) ? val : [];
}

/**
 * check if a domain is disabled
 * @param {string} hostname
 * @returns {Promise<boolean>}
 */
export async function isDomainDisabled(hostname) {
    const disabled = await getDisabledDomains();
    return disabled.includes(hostname);
}

/**
 * add a domain to disabled list
 * @param {string} hostname
 * @returns {Promise<void>}
 */
export async function disableDomain(hostname) {
    const disabled = await getDisabledDomains();

    if (!disabled.includes(hostname)) {
        await chrome.storage.local.set({
            [DISABLED_KEY]: [...disabled, hostname],
        });
    }
}

/**
 * remove a domain from disabled list
 * @param {string} hostname
 * @returns {Promise<void>}
 */
export async function enableDomain(hostname) {
    const disabled = await getDisabledDomains();

    await chrome.storage.local.set({
        [DISABLED_KEY]: disabled.filter((d) => d !== hostname),
    });
}

/**
 * toggle domain state
 * @param {string} hostname
 * @returns {Promise<boolean>}
 */
export async function toggleDomain(hostname) {
    const disabled = await getDisabledDomains();
    const isDisabled = disabled.includes(hostname);

    if (isDisabled) {
        await enableDomain(hostname);
        return true;
    } else {
        await disableDomain(hostname);
        return false;
    }
}
