import "./style.css";
import { browser } from "wxt/browser";
import {
  isDomainDisabled,
  toggleDomain as toggleDomainInStorage,
} from "../../utils/storage";

const btn = document.querySelector<HTMLButtonElement>("#btn");
const domainEl = document.querySelector<HTMLSpanElement>("#domain");
const faviconEl = document.querySelector<HTMLImageElement>("#favicon");
const actionLabel = document.querySelector<HTMLSpanElement>("#action-label");

init();

async function init(): Promise<void> {
  const tab = await getActiveTab();
  const hostname = getHostname(tab?.url);

  if (!hostname) {
    setUnavailable();
    return;
  }

  renderDomain(hostname);

  const isDisabled = await isDomainDisabled(hostname);
  setButtonState(!isDisabled);

  btn?.addEventListener("click", async () => {
    const newStateEnabled = await toggleDomainInStorage(hostname);

    setButtonState(newStateEnabled);

    if (tab?.id) {
      await browser.tabs.reload(tab.id);
    }
  });
}

async function getActiveTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return tab;
}

function getHostname(url?: string): string | null {
  if (!url?.startsWith("http")) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function renderDomain(hostname: string): void {
  if (faviconEl) {
    faviconEl.src = `https://www.google.com/s2/favicons?sz=32&domain_url=${hostname}`;
  }

  if (domainEl) {
    domainEl.textContent = hostname;
  }
}

function setUnavailable(): void {
  if (domainEl) domainEl.textContent = "n/a";

  if (btn) {
    btn.textContent = "n/a";
    btn.disabled = true;
  }
}

function setButtonState(isEnabled: boolean): void {
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
