import { beforeEach, describe, expect, it } from "vitest";
import { fakeBrowser } from "wxt/testing";
import {
  disableDomain,
  enableDomain,
  getDisabledDomains,
  isDomainDisabled,
  toggleDomain,
} from "./storage";

describe("domain storage", () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it("returns empty array when nothing stored", async () => {
    expect(await getDisabledDomains()).toEqual([]);
  });

  it("disables a domain and reflects in isDomainDisabled", async () => {
    await disableDomain("example.com");
    expect(await isDomainDisabled("example.com")).toBe(true);
  });

  it("does not duplicate on repeated disable", async () => {
    await disableDomain("example.com");
    await disableDomain("example.com");
    expect(await getDisabledDomains()).toEqual(["example.com"]);
  });

  it("enableDomain is a no-op if domain not present", async () => {
    await enableDomain("example.com");
    expect(await getDisabledDomains()).toEqual([]);
  });

  it("toggleDomain enables when currently disabled, returns true", async () => {
    await disableDomain("example.com");
    const result = await toggleDomain("example.com");
    expect(result).toBe(true);
    expect(await isDomainDisabled("example.com")).toBe(false);
  });

  it("toggleDomain disables when currently enabled, returns false", async () => {
    const result = await toggleDomain("example.com");
    expect(result).toBe(false);
    expect(await isDomainDisabled("example.com")).toBe(true);
  });
});
