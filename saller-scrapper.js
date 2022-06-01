var fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
var fs = require("fs");

function toFile(array, path) {
  var fileContent = fs.readFileSync(path, "utf-8");

  const file = fs.createWriteStream(path);

  file.write(fileContent);

  array.forEach(function (v) {
    file.write(v.name + "," + v.number + "\n");
  });

  file.end();
}

async function scrape() {
  // add stealth plugin and use defaults (all evasion techniques)
  puppeteer.use(StealthPlugin());

  for (let index = 3; index < 499; index++) {
    console.log(`reading: urls/properties/page-${index}.txt`);
    var sellers = [];

    var browser = await puppeteer.launch({ headless: false });
    var urls = fs.readFileSync(`urls/properties/page-${index}.txt`, "utf-8");
    var urls = urls.split(/\r?\n/);

    for (const url in urls) {
      if (Object.hasOwnProperty.call(urls, url)) {
        const element = urls[url];

        if (element == "") {
          continue;
        }

        var seller = {};

        var page = await browser.newPage();
        await page.goto(`${element}`);

        await page.waitForTimeout(1000);
        var pageHasAd = await page.$("#aw0 > img");

        if (pageHasAd) {
          await page.close();
          continue;
        }

        try {
          const showNumberButton = await page.waitForSelector(
            "#body-wrapper > div > header:nth-child(3) > div > div > div > div > div > div:nth-child(2) > div > div > span._8918c0a8._4b8407ec._79855a31",
            { timeout: 1000 }
          );

          await showNumberButton.click();
          await page.waitForTimeout(1000);

          const sellerNumberElement = await page.waitForSelector(
            "#body-wrapper > div > header:nth-child(3) > div > div > div > div._0a9bc591 > div._408759e3 > div:nth-child(2) > div > div._1075545d.b34f9439._42f36e3b._96d4439a._1709dcb4 > span"
          );

          const sellerNumber = await page.evaluate(
            (sellerNumberElement) => sellerNumberElement.innerHTML,
            sellerNumberElement
          );

          seller.number = sellerNumber;

          const sellerNameElement = await page.waitForSelector(
            "#body-wrapper > div > header:nth-child(3) > div > div > div > div._0a9bc591 > div._408759e3 > div:nth-child(2) > div > a > div > div._1075545d._6caa7349._42f36e3b.d059c029 > span"
          );

          const sellerName = await page.evaluate(
            (sellerNameElement) => sellerNameElement.innerHTML,
            sellerNameElement
          );

          seller.name = sellerName;

          console.log("seller", seller);

          sellers.push(seller);

          page.close();
        } catch (error) {
          await page.close();
        }
      }
    }

    // console.log("sellers", sellers);

    // unique
    sellers = [
      ...new Map(sellers.map((item) => [item["number"], item])).values(),
    ];

    // without number hashed
    sellers = sellers.filter((seller) => seller.number != "** *** ****");

    toFile(sellers, "data/properties-sellers.csv");

    browser.close();
  }
}
scrape();
