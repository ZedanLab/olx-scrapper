const puppeteer = require("puppeteer");
var fs = require("fs");

function toFile(array, path) {
  const file = fs.createWriteStream(path);

  array.forEach(function (v) {
    file.write(v + "\n");
  });

  file.end();
}

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for (let index = 1; index < 500; index++) {
    await page.goto(`https://www.olx.com.eg/vehicles/cars-for-sale?page=${index}`);
    //   var element = await page.waitForSelector("article > div > a");
    await page.waitForFunction(
      () => document.querySelectorAll("article > div > a").length
    );

    const hrefs = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("article > div > a"),
        (a) => a.href
      );
    });

    const unique = Array.from(new Set(hrefs));

    toFile(unique, `urls/properties/page-${index}.txt`);
  }

  browser.close();
}
scrape();
