(async () => {
  const src = chrome.runtime.getURL("content/cleanCopy.js");
  await import(src);
})();
