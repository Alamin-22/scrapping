const axios = require("axios");
const cheerio = require("cheerio");

const Url =
  "https://www.daraz.com.bd/products/full-set-pc-intel-core-i3-2nd-genaration-4gb-ddr3-ram-500gb-hdd-19-monitor-keyboard-mouse-all-complete-i369403069-s1846356037.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Apc%253Bnid%253A369403069%253Bsrc%253ALazadaMainSrp%253Brn%253Aac529b72a80f43e44627562cc1ebc6bf%253Bregion%253Abd%253Bsku%253A369403069_BD%253Bprice%253A11578%253Bclient%253Adesktop%253Bsupplier_id%253A700695872671%253Bbiz_source%253Ahttps%253A%252F%252Fwww.daraz.com.bd%252F%253Bslot%253A2%253Butlog_bucket_id%253A470687%253Basc_category_id%253A5638%253Bitem_id%253A369403069%253Bsku_id%253A1846356037%253Bshop_id%253A510841%253BtemplateInfo%253A-1_A3%25231103_B_L%2523&freeshipping=0&fs_ab=1&fuse_fs=&lang=en&location=Dhaka&price=11578&priceCompare=skuId%3A1846356037%3Bsource%3Alazada-search-voucher%3Bsn%3Aac529b72a80f43e44627562cc1ebc6bf%3BunionTrace%3A2140e7c317297700876157773e3bf7%3BoriginPrice%3A1157800%3BvoucherPrice%3A1157800%3BdisplayPrice%3A1157800%3BsinglePromotionId%3A50000024024005%3BsingleToolCode%3AflashSale%3BvoucherPricePlugin%3A1%3BbuyerId%3A0%3Btimestamp%3A1729770087943&ratingscore=5.0&request_id=ac529b72a80f43e44627562cc1ebc6bf&review=1&sale=61&search=1&source=search&spm=a2a0e.searchlist.list.2&stock=1";

async function getTestData() {
  try {
    const response = await axios.get(Url);
    const $ = cheerio.load(response.data);

    const ProductInfo = {
      images: [],
      specificationsKeys: [],
      productTitle: "",
      oldPrice: "",
      newPrice: "",
    };

    // Extract image URLs (from src attribute)
    $(".pdp-mod-common-image").each((index, element) => {
      const imgSrc = $(element).attr("src");
      if (imgSrc) {
        ProductInfo.images.push(imgSrc);
      }
    });

    // Extract product title
    const productTitleElement = $(".pdp-mod-product-badge-title").first();
    if (productTitleElement.length) {
      ProductInfo.productTitle = productTitleElement.text().trim();
    }

    // Extract new price (current price)
    const newPriceElement = $(".pdp-price .pdp-price_type_normal notranslatepdp-price_color_orange pdp-price_size_xl");
    if (newPriceElement.length) {
      ProductInfo.newPrice = newPriceElement.text().trim();
    }

    // Extract old price (discounted or original price)
    const oldPriceElement = $(".pdp-price .pdp-price_type_deleted").first();
    if (oldPriceElement.length) {
      ProductInfo.oldPrice = oldPriceElement.text().trim();
    }

    // Extract product specifications
    $(".key-li").each((index, element) => {
      ProductInfo.specificationsKeys.push($(element).text().trim());
    });

    console.log("Product Data:", ProductInfo);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

getTestData();
