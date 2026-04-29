import type { Page } from "@playwright/test";

export async function openPopup(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await page.waitForSelector(".app-name");

  return {
    getAppName: () => page.locator(".app-name"),
    getDomain: () => page.locator("#domain"),
    getActionLabel: () => page.locator("#action-label"),
    getButton: () => page.locator("#btn"),
    clickButton: async () => {
      await page.locator("#btn").click();
    },
  };
}
