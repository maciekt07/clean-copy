import { isDomainDisabled } from "../utils/storage.js";

/**
 * prevent multiple injections
 */
/** @type {Window & { __copyGuardAttached?: boolean }} */
const w = window;

if (!w.__copyGuardAttached) {
  init();
  w.__copyGuardAttached = true;
}

async function init() {
  const hostname = location.hostname;

  if (!hostname) return;

  const disabled = await isDomainDisabled(hostname);
  if (!disabled) {
    attachCopyGuard();
  }
}

/**
 * attach copy event listener in capture phase
 * to override site-level handlers
 */
function attachCopyGuard() {
  document.addEventListener("copy", handleCopy, true);
}

/**
 * handle copy event and sanitize clipboard data
 * @param {ClipboardEvent} e
 */
function handleCopy(e) {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed) return;
  if (!e.clipboardData) return;

  const text = selection.toString();

  e.stopImmediatePropagation();
  e.preventDefault();

  e.clipboardData.setData("text/plain", text);

  const html = getSelectionHtml(selection);
  if (html) {
    e.clipboardData.setData("text/html", html);
  }
}

/**
 * extract HTML from current selection
 * @param {Selection} selection
 * @returns {string|null}
 */
function getSelectionHtml(selection) {
  if (selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  const container = document.createElement("div");

  container.appendChild(range.cloneContents());

  return container.innerHTML;
}
