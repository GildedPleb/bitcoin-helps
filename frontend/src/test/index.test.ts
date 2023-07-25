// src/test/index.test.ts
import { toMatchImageSnapshot } from "jest-image-snapshot";
import puppeteer, { KnownDevices, type WaitForOptions } from "puppeteer";

expect.extend({ toMatchImageSnapshot });

const URL = "http://localhost:3000/";
const OPTIONS: WaitForOptions = {
  waitUntil: "networkidle0",
};

// List of devices to emulate
const devices = [
  "Pixel 5 landscape",
  "Pixel 5",
  "iPhone 13 Pro Max",
  "iPhone SE",
  "iPhone SE landscape",
  "iPad Pro 11",
];

// List of desktop screen sizes to emulate
const desktopSizes = [
  { width: 1300, height: 1600 },
  { width: 3000, height: 1700 },
  { width: 1500, height: 750 },
  { width: 750, height: 400 },
  { width: 750, height: 750 },
];

describe("Visual Regression Testing", () => {
  // Test all device configurations
  jest.setTimeout(100_000);

  // Test all desktop screen sizes
  for (const size of desktopSizes) {
    it(`should look the same on desktop ${size.width}x${size.height}`, async () => {
      // jest.setTimeout(10_000);
      const browser = await puppeteer.launch({ headless: "new" });
      try {
        const page = await browser.newPage();
        await page.setViewport(size);
        await page.goto(URL, OPTIONS);
        await page.waitForTimeout(1000);
        await page.focus("body");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Tab");
        await page.keyboard.type("Address");
        await page.keyboard.press("Enter");
        const screenshot = await page.screenshot();
        expect(screenshot).toMatchImageSnapshot();
      } finally {
        await browser.close();
      }
    });
  }

  for (const device of devices) {
    it(`should look the same on ${device}`, async () => {
      const browser = await puppeteer.launch({ headless: "new" });
      try {
        const page = await browser.newPage();
        await page.emulate(KnownDevices[device]);
        await page.goto(URL, OPTIONS);
        await page.waitForTimeout(1000);
        const screenshot = await page.screenshot();
        expect(screenshot).toMatchImageSnapshot();
      } finally {
        await browser.close();
      }
    });
  }

  it(`Desktop 1500 x 750: View menu via Accessibility`, async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1500, height: 750 });
      await page.goto("http://localhost:3000/", OPTIONS);
      await page.waitForTimeout(1000);
      await page.focus("body");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      const screenshot = await page.screenshot();
      expect(screenshot).toMatchImageSnapshot();
    } finally {
      await browser.close();
    }
  });
});
