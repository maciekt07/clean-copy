import type { BrowserContext, Page } from "@playwright/test";
import { PLAYGROUND_URL } from "@/constants/playground";

const ORIGIN = new URL(PLAYGROUND_URL).origin;

type WindowWithCopyHandler = Window & {
  __siteCopyHandlerRan?: number;
};

export async function preparePlayground(
  context: BrowserContext,
  page: Page,
): Promise<void> {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: ORIGIN,
  });
  await page.goto(PLAYGROUND_URL);
  await page.bringToFront();
}

export async function selectCase(page: Page, id: string): Promise<void> {
  await page.evaluate((caseId) => {
    const target = document.querySelector(
      `[data-case="${caseId}"] .selectable`,
    );
    if (!target) throw new Error(`Missing playground case: ${caseId}`);

    const range = document.createRange();
    range.selectNodeContents(target);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, id);
}

export async function copySelection(page: Page): Promise<void> {
  const modifier = process.platform === "darwin" ? "Meta" : "Control";
  await page.keyboard.press(`${modifier}+C`);
}

export async function readClipboardText(page: Page): Promise<string> {
  return page.evaluate(() => navigator.clipboard.readText());
}

export async function readClipboardHtml(page: Page): Promise<string | null> {
  return page.evaluate(async () => {
    for (const item of await navigator.clipboard.read()) {
      if (item.types.includes("text/html")) {
        return (await item.getType("text/html")).text();
      }
    }
    return null;
  });
}

export async function waitForCopyGuard(page: Page): Promise<void> {
  const deadline = Date.now() + 3000;

  for (;;) {
    await selectCase(page, "append-source");
    await copySelection(page);

    const text = await readClipboardText(page);
    if (!text.includes("Read more")) {
      await page.evaluate(() => {
        (window as WindowWithCopyHandler).__siteCopyHandlerRan = 0;
      });
      return;
    }

    if (Date.now() > deadline) {
      throw new Error("copy guard did not attach in time");
    }

    await page.waitForTimeout(100);
  }
}
