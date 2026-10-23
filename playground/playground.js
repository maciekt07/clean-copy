const strategies = {
  "append-source"(event) {
    const text = getCopiedText(event);
    event.clipboardData.setData(
      "text/plain",
      `${text}\n\nRead more: https://spam.example/article?utm_source=copy`,
    );
  },

  "prepend-attribution"(event) {
    const text = getCopiedText(event);
    event.clipboardData.setData("text/plain", `"${text}" - example.com`);
  },

  "html-with-link"(event) {
    const text = getCopiedText(event);
    event.clipboardData.setData(
      "text/html",
      `<p>${text}</p><p><a href="https://spam.example">Source</a></p>`,
    );
  },
};

function getCopiedText(event) {
  return event.clipboardData.getData("text/plain") || getSelection().toString();
}

function caseFromSelection() {
  const selection = getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  let node = selection.getRangeAt(0).startContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  return node.closest("[data-case]");
}

function markSiteHandlerRan() {
  window.__siteCopyHandlerRan = (window.__siteCopyHandlerRan ?? 0) + 1;
  document.querySelector("#handler-count").textContent =
    window.__siteCopyHandlerRan;
}

window.addEventListener("copy", (event) => {
  const caseElement = caseFromSelection();
  if (!caseElement) return;

  markSiteHandlerRan();

  const strategy = strategies[caseElement.dataset.strategy];
  if (!strategy) return;

  // without preventDefault chrome overwrites clipboard changes
  event.preventDefault();
  strategy(event);
});

// runs before the extension's listener on document, then writes after the
// event has finished. Used to check the async gap.
window.addEventListener(
  "copy",
  (event) => {
    const caseElement = caseFromSelection();
    if (caseElement?.dataset.strategy !== "async-clipboard") return;

    const text = getCopiedText(event);
    setTimeout(() => {
      navigator.clipboard
        .writeText(`${text}\n\nvia clipboard API`)
        .catch(() => {});
    }, 0);
  },
  true,
);

for (const section of document.querySelectorAll("[data-case]")) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Select";

  button.addEventListener("click", () => {
    const target = section.querySelector(".selectable");
    const range = document.createRange();
    range.selectNodeContents(target);

    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });

  section.append(button);
}
