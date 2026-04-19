import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test, expect, chromium } from "@playwright/test";

const EXTENSION_PATH = path.resolve(process.cwd());
const TEST_URL = "https://example.com";
const EXTENSION_NAME = "Clean Copy";

test("extension loads and popup shows the disable action", async () => {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "clean-copy-checks-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || "chromium",
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  await context.addInitScript((url) => {
    if (
      window.location.protocol !== "chrome-extension:" ||
      !window.location.pathname.endsWith("/popup/popup.html")
    ) {
      return;
    }

    chrome.tabs.query = async () => /** @type {chrome.tabs.Tab[]} */ ([{
      active: true,
      audible: false,
      autoDiscardable: true,
      discarded: false,
      groupId: -1,
      highlighted: true,
      id: 123,
      incognito: false,
      index: 0,
      mutedInfo: { muted: false },
      pinned: false,
      selected: true,
      url,
      windowId: 1,
    }]);
    chrome.tabs.reload = async () => {};
  }, TEST_URL);

  try {
    const extensionsPage = await context.newPage();
    await extensionsPage.goto("chrome://extensions", { waitUntil: "load" });

    let extensionId = null;
    await expect
      .poll(async () => {
        extensionId = await extensionsPage.evaluate((name) => {
          const manager = document.querySelector("extensions-manager");
          const list = manager?.shadowRoot?.querySelector("extensions-item-list");
          const items = list?.shadowRoot
            ? Array.from(list.shadowRoot.querySelectorAll("extensions-item"))
            : [];
          const item = items.find(
            (node) => node.shadowRoot?.querySelector("#name")?.textContent?.trim() === name,
          );

          return item?.id ?? null;
        }, EXTENSION_NAME);

        return extensionId;
      })
      .toBeTruthy();

    await expect(
      extensionsPage.locator(`extensions-item[id="${extensionId}"]`),
    ).toBeAttached();

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup/popup.html`, {
      waitUntil: "domcontentloaded",
    });

    await expect(popup.locator(".app-name")).toHaveText(EXTENSION_NAME);
    await expect(popup.locator("#domain")).toHaveText("example.com");
    await expect(popup.locator("#action-label")).toHaveText("disable for this domain");
    await expect(popup.locator("#btn")).toHaveText("disable");

    await popup.locator("#btn").click();

    await expect(popup.locator("#action-label")).toHaveText("enable for this domain");
    await expect(popup.locator("#btn")).toHaveText("enable");
  } finally {
    await context.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
});
