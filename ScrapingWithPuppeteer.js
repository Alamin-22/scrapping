const puppeteer = require("puppeteer");

const fs = require("fs"); // Import the fs module to save retrieve data into json file

const Url =
  "https://www.daraz.com.bd/products/full-set-pc-intel-core-i3-2nd-genaration-4gb-ddr3-ram-500gb-hdd-19-monitor-keyboard-mouse-all-complete-i369403069-s1846356037.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Apc%253Bnid%253A369403069%253Bsrc%253ALazadaMainSrp%253Brn%253Aac529b72a80f43e44627562cc1ebc6bf%253Bregion%253Abd%253Bsku%253A369403069_BD%253Bprice%253A11578%253Bclient%253Adesktop%253Bsupplier_id%253A700695872671%253Bbiz_source%253Ahttps%253A%252F%252Fwww.daraz.com.bd%252F%253Bslot%253A2%253Butlog_bucket_id%253A470687%253Basc_category_id%253A5638%253Bitem_id%253A369403069%253Bsku_id%253A1846356037%253Bshop_id%253A510841%253BtemplateInfo%253A-1_A3%25231103_B_L%2523&freeshipping=0&fs_ab=1&fuse_fs=&lang=en&location=Dhaka&price=11578&priceCompare=skuId%3A1846356037%3Bsource%3Alazada-search-voucher%3Bsn%3Aac529b72a80f43e44627562cc1ebc6bf%3BunionTrace%3A2140e7c317297700876157773e3bf7%3BoriginPrice%3A1157800%3BvoucherPrice%3A1157800%3BdisplayPrice%3A1157800%3BsinglePromotionId%3A50000024024005%3BsingleToolCode%3AflashSale%3BvoucherPricePlugin%3A1%3BbuyerId%3A0%3Btimestamp%3A1729770087943&ratingscore=5.0&request_id=ac529b72a80f43e44627562cc1ebc6bf&review=1&sale=61&search=1&source=search&spm=a2a0e.searchlist.list.2&stock=1";

async function getTestData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(Url, { waitUntil: "networkidle2", timeout: 90000 }); // added 90 sec to load the data properly

    const ProductInfo = {
      images: [],
      specificationsKeys: [],
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
    // // Extract product specifications
    // ProductInfo.specificationsKeys = await page.$$eval(".key-li", (specs) =>
    //   specs.map((spec) => spec.textContent.trim())
    // );

    // this functino will save the retrieve data into a json file
    try {
      fs.writeFileSync(
        "retrieveData.json",
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
