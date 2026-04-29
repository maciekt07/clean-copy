import { expect, test } from "../helpers/fixtures";
import { openPopup } from "../helpers/popup";

const EXTENSION_NAME = "Clean Copy";
const TEST_URL = "https://example.com";

test("extension loads and popup shows the disable action", async ({
  context,
  extensionId,
}) => {
  await context.addInitScript((url: string) => {
    if (
      window.location.protocol !== "chrome-extension:" ||
      !window.location.pathname.endsWith("/popup.html")
    ) {
      return;
    }

    chrome.tabs.query = async () => [
      {
        active: true,
        audible: false,
        autoDiscardable: true,
        discarded: false,
        groupId: -1,
        highlighted: true,
        id: 123,
        incognito: false,
        frozen: false,
        index: 0,
        mutedInfo: { muted: false },
        pinned: false,
        selected: true,
        url,
        windowId: 1,
      },
    ];
    chrome.tabs.reload = async () => {};
  }, TEST_URL);

  const popupPage = await context.newPage();
  const popup = await openPopup(popupPage, extensionId);

  await expect(popup.getAppName()).toHaveText(EXTENSION_NAME);
  await expect(popup.getDomain()).toHaveText("example.com");
  await expect(popup.getActionLabel()).toHaveText("disable for this domain");
  await expect(popup.getButton()).toHaveText("disable");

  await popup.clickButton();

  await expect(popup.getActionLabel()).toHaveText("enable for this domain");
  await expect(popup.getButton()).toHaveText("enable");
});
