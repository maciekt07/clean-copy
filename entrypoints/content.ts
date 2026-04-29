import { isDomainDisabled } from "../utils/storage";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    type WindowWithGuard = Window & {
      __copyGuardAttached?: boolean;
    };

    const w = window as WindowWithGuard;

    /**
     * prevent multiple injections
     */
    if (!w.__copyGuardAttached) {
      init();
      w.__copyGuardAttached = true;
    }

    async function init(): Promise<void> {
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
    function attachCopyGuard(): void {
      document.addEventListener("copy", handleCopy, true);
    }

    /**
     * handle copy event and sanitize clipboard data
     */
    function handleCopy(e: ClipboardEvent): void {
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
     */
    function getSelectionHtml(selection: Selection): string | null {
      if (selection.rangeCount === 0) return null;

      const range = selection.getRangeAt(0);
      const container = document.createElement("div");

      container.appendChild(range.cloneContents());

      return container.innerHTML;
    }
  },
});
