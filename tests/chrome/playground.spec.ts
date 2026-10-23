import { PLAYGROUND_HOST } from "@/constants/playground";
import { expect, test } from "../helpers/fixtures";
import {
  copySelection,
  preparePlayground,
  readClipboardHtml,
  readClipboardText,
  selectCase,
  waitForCopyGuard,
} from "../helpers/playground";

type WindowWithCopyHandler = Window & {
  __siteCopyHandlerRan?: number;
};

test.describe.configure({ mode: "serial" });

test.describe("playground", () => {
  test("copies text exactly as selected", async ({ context, page }) => {
    await preparePlayground(context, page);
    await waitForCopyGuard(page);

    const cases = await page.$$eval("[data-case][data-expect]", (sections) =>
      sections.map((section) => ({
        id: section.getAttribute("data-case") ?? "",
        expected: section.getAttribute("data-expect") ?? "",
      })),
    );

    expect(cases.length).toBeGreaterThan(0);

    for (const testCase of cases) {
      await selectCase(page, testCase.id);
      await copySelection(page);

      expect(await readClipboardText(page), testCase.id).toBe(
        testCase.expected,
      );
    }
  });

  test("drops a link injected into text/html", async ({ context, page }) => {
    await preparePlayground(context, page);
    await waitForCopyGuard(page);

    await selectCase(page, "html-with-link");
    await copySelection(page);

    const html = await readClipboardHtml(page);
    expect(html).toContain("Some selected text");
    expect(html).not.toContain("spam.example");
  });

  test("keeps formatting from the selected rich text", async ({
    context,
    page,
  }) => {
    await preparePlayground(context, page);
    await waitForCopyGuard(page);

    await selectCase(page, "rich-html");
    await copySelection(page);

    const html = await readClipboardHtml(page);
    expect(html).toContain("<b>bold text</b>");
    expect(html).toContain("https://example.com/x");
  });

  test("does not run the page copy handler", async ({ context, page }) => {
    await preparePlayground(context, page);
    await waitForCopyGuard(page);

    await selectCase(page, "append-source");
    await copySelection(page);

    const runs = await page.evaluate(
      () => (window as WindowWithCopyHandler).__siteCopyHandlerRan ?? 0,
    );
    expect(runs).toBe(0);
  });

  test("lets the page text through when the domain is disabled", async ({
    context,
    page,
  }) => {
    const worker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent("serviceworker"));
    await worker.evaluate(
      (host) => chrome.storage.local.set({ disabledDomains: [host] }),
      PLAYGROUND_HOST,
    );

    await preparePlayground(context, page);
    await selectCase(page, "append-source");
    await copySelection(page);

    expect(await readClipboardText(page)).toContain("Read more");
  });
});
