import { isDomainDisabled, toggleDomain as toggleDomainInStorage } from "../utils/storage.js";

/** @type {HTMLButtonElement | null} */
const btn = document.getElementById("btn") instanceof HTMLButtonElement ? /** @type {any} */ (document.getElementById("btn")) : null;
const domainEl = document.getElementById("domain");
const faviconEl = (/** @type {HTMLImageElement | null} */ (document.getElementById("favicon")));
const actionLabel = document.getElementById("action-label");

init();

async function init() {
  const tab = await getActiveTab();
  const hostname = getHostname(tab?.url);

  if (!hostname) {
    setUnavailable();
    return;
  }

  renderDomain(hostname);

  const isDisabled = await isDomainDisabled(hostname);
  const isEnabled = !isDisabled;

  setButtonState(isEnabled);

  if (btn) {
    btn.addEventListener("click", async () => {
      // get current state to avoid stale closure issues if popup stays open
      const newStateEnabled = await toggleDomainInStorage(hostname);
      
      setButtonState(newStateEnabled);
      if (tab.id) {
        chrome.tabs.reload(tab.id);
      }
    });
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

/**
 * @param {string | undefined} url
 * @returns {string | null}
 */
function getHostname(url) {
  if (!url || !url.startsWith("http")) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * @param {string} hostname
 */
function renderDomain(hostname) {
  if (faviconEl) {
    faviconEl.src = `https://www.google.com/s2/favicons?sz=32&domain_url=${hostname}`;
  }
  if (domainEl) {
    domainEl.textContent = hostname;
  }
}

function setUnavailable() {
  if (domainEl) domainEl.textContent = "n/a";
  if (btn) {
    btn.textContent = "n/a";
    btn.disabled = true;
  }
}

/**
 * @param {boolean} isEnabled
 */
function setButtonState(isEnabled) {
  if (actionLabel) {
    actionLabel.textContent = isEnabled
      ? "disable for this domain"
      : "enable for this domain";
  }

  if (btn) {
    btn.textContent = isEnabled ? "disable" : "enable";
    btn.className = `btn ${isEnabled ? "enabled" : "disabled"}`;
  }
}
