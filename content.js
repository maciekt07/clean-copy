function getHostname() {
  return location.hostname;
}

function attachCopyGuard() {
  document.addEventListener(
    "copy",
    (e) => {
      const selection = window.getSelection();
      if (!selection) return;
      const cleanText = selection.toString();
      e.stopImmediatePropagation();
      e.preventDefault();
      e.clipboardData.setData("text/plain", cleanText);
      e.clipboardData.setData("text/html", cleanText);
    },
    true,
  );
}

chrome.storage.local.get(["disabledDomains"], (result) => {
  const disabled = result.disabledDomains || [];
  if (!disabled.includes(getHostname())) {
    attachCopyGuard();
  }
});
