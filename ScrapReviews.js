const puppeteer = require("puppeteer");

const fs = require("fs"); // Import the fs module to save retrieve data into json file

const Url =
  "https://www.daraz.com.bd/products/53-i366883605-s1828881808.html?pvid=f08c2b52-76df-4267-b1d3-4f30b4327645&search=jfy&scm=1007.28811.406918.0&priceCompare=skuId%3A1828881808%3Bsource%3Atpp-recommend-plugin-41701%3Bsn%3Af08c2b52-76df-4267-b1d3-4f30b4327645%3BunionTrace%3A2102fca017299373844315143e1ca9%3BoriginPrice%3A31000%3BvoucherPrice%3A31000%3BdisplayPrice%3A31000%3BsourceTag%3A%23auto_collect%231%24auto_collect%24%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A1%3BbuyerId%3A0%3ButdId%3A-1%3Btimestamp%3A1729937384516&spm=a2a0e.tm80335411.just4u.d_366883605";

async function getTestData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(Url, { waitUntil: "networkidle2", timeout: 120000 }); // added 120 sec to load the data properly

    const ProductInfo = {
      images: [],
      productTitle: "",
      oldPrice: "",
      newPrice: "",
      discount: "",
    };

    // Extract image URLs
    ProductInfo.images = await page.$$eval(".pdp-mod-common-image", (imgs) =>
      imgs.map((img) => img.src)
    );

    // Extract product title
    ProductInfo.productTitle = await page.$eval(
      ".pdp-mod-product-badge-title",
      (el) => el.textContent.trim()
    );

    // Extract new price (current price)
    ProductInfo.newPrice = await page.$eval(
      "#module_product_price_1 .pdp-mod-product-price .pdp-price_type_normal.pdp-price_color_orange.pdp-price_size_xl",
      (el) => el.textContent.trim()
    );

    // Extract old price (discounted price)
    ProductInfo.oldPrice = await page
      .$eval(
        "#module_product_price_1 .origin-block .pdp-price_type_deleted.pdp-price_color_lightgray.pdp-price_size_xs",
        (el) => el.textContent.trim()
      )
      .catch(() => "");
    // Extract discounted %
    ProductInfo.discount = await page
      .$eval(".pdp-product-price__discount", (el) => el.textContent.trim())
      .catch(() => "");

    // this functino will save the retrieve data into a json file
    try {
      fs.writeFileSync(
        "/RetrieveData/airpodData.json",
        JSON.stringify(ProductInfo, null, 2),
        "utf-8"
      );
      console.log("Product data saved to retrieveData.json");
    } catch (fsError) {
      console.error("Error writing to file:", fsError);
    }

    console.log("Product Data:", ProductInfo);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    await browser.close();
  }
}

getTestData();
