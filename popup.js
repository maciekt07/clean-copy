const btn = document.getElementById("btn");
const domainEl = document.getElementById("domain");

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  let hostname;

  if (!tab?.url || !tab.url.startsWith("http")) {
    domainEl.textContent = "n/a";
    btn.textContent = "n/a";
    btn.disabled = true;
    return;
  }

  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    domainEl.textContent = "n/a";
    btn.disabled = true;
    return;
  }

  document.getElementById("favicon").src =
    `https://www.google.com/s2/favicons?sz=32&domain_url=${hostname}`;
  domainEl.textContent = hostname;

  chrome.storage.local.get(["disabledDomains"], (result) => {
    const disabled = result.disabledDomains || [];
    setButtonState(!disabled.includes(hostname));
  });

  btn.addEventListener("click", () => {
    chrome.storage.local.get(["disabledDomains"], (result) => {
      let disabled = result.disabledDomains || [];
      const isEnabled = !disabled.includes(hostname);

      if (isEnabled) {
        disabled.push(hostname);
      } else {
        disabled = disabled.filter((d) => d !== hostname);
      }

      chrome.storage.local.set({ disabledDomains: disabled });
      setButtonState(!isEnabled);
      chrome.tabs.reload(tab.id);
    });
  });
});

function setButtonState(isEnabled) {
  document.getElementById("action-label").textContent = isEnabled
    ? "disable for this page"
    : "enable for this page";

  if (isEnabled) {
    btn.textContent = "disable";
    btn.className = "btn enabled";
  } else {
    btn.textContent = "enable";
    btn.className = "btn disabled";
  }
}
