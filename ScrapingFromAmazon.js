const puppeteer = require("puppeteer");

const fs = require("fs");

const Url =
  "https://www.amazon.in/Gaming-Wireless-Console-Emulators-Dual-Player/dp/B0DF91J997/ref=sr_1_3_sspa?crid=3RGXMR92ICFOW&dib=eyJ2IjoiMSJ9.4WktvgbGB3qDkJX2XkTIeBfAM_D607A3FDabFFik0n6eFu0gVPomNuo7bfi57Ks1ZVK4A2T7Ze5LN8JJjGTgJMu9oFutG0bdxFvpmW6tqtmEYACdH_-b0oBwixMWfGnTisuiNnavBorYt5dMT44k42kRsh8TsJcBO-GpAFScfrA75jRi-UzAXSwbBQXlpeUPeEpcAnC-w2_B0sOidTmITOhSlHIyG5Sth6OXtTIEG6CPe6xGGEcy1xTmPCJkVCoC6iuTp4_-FYxOFx_w_YIZo3UvwLqAHAPrxo-5qkm3-m8.YqTqWFeGVkfY0MDVRZddFRRyw_v4MahlznNWlx6Hww8&dib_tag=se&gad_source=1&gclid=Cj0KCQjwpvK4BhDUARIsADHt9sRTW06ExejA88eZ-vDyp2y_FMph-Uh5uLGTX72itBLi8XUbtfySVZcaAoIDEALw_wcB&keywords=video+game+for+tv&linkCode=ll2&linkId=acc91394ee095262d98a97188796b12a&qid=1729938591&sprefix=vide%2Caps%2C266&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1";

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
      Reviews: [],
    };

    // Extract image URLs
    ProductInfo.images = await page.$$eval(
      "#altImages > ul > li > span > span > span .a-button-text > img",
      (imgs) => imgs.map((img) => img.src)
    );

    // Extract product title
    ProductInfo.productTitle = await page.$eval("#productTitle", (el) =>
      el.textContent.trim()
    );

    // Extract new price (current price)
    ProductInfo.newPrice = await page.$eval(
      "#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span:nth-child(2) > span.a-price-whole",
      (el) => {
        const price = el.textContent.trim().replace(/[^0-9]/g, ""); // Remove non-numeric characters
        return Number(price); // Convert to number
      }
    );

    // Extract old price (discounted price)
    ProductInfo.oldPrice = await page
      .$eval(
        "#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-small.aok-align-center > span > span.aok-relative > span.a-size-small.a-color-secondary.aok-align-center.basisPrice > span > span:nth-child(2)",
        (el) => {
          const price = el.textContent.trim().replace(/[^0-9]/g, ""); // Remove non-numeric characters
          return Number(price); // Convert to number
        }
      )
      .catch(() => 0); // Return 0 if old price is not found

    // Extract discounted %
    ProductInfo.discount = await page
      .$eval(
        "#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-size-large.a-color-price.savingPriceOverride.aok-align-center.reinventPriceSavingsPercentageMargin.savingsPercentage",
        (el) => el.textContent.trim()
      )
      .catch(() => "");

    // For Retrieve Reviews.

    ProductInfo.Reviews = await page.$$eval(
      "#cm-cr-dp-review-list .a-section.review.aok-relative", // Target the review container
      (reviews) =>
        reviews.map((review) => {
          // Extracting all relevant information
          const profileName =
            review
              .querySelector("div.a-profile-content span.a-profile-name")
              ?.textContent.trim() || "";
          const reviewTitle =
            review
              .querySelector("a.review-title span") // Selector for review title text (updated)
              ?.textContent.trim() || "";
          const reviewDetails =
            review
              .querySelector(
                "div.a-row.a-spacing-small.review-data > span > div > div.a-expander-content.reviewText.review-text-content.a-expander-partial-collapse-content > span"
              )
              ?.textContent.trim() || "";
          const rating = Number(
            review
              .querySelector("i.review-rating span")
              ?.textContent.match(/\d+/)?.[0] || ""
          );
          const postedDate =
            review.querySelector("span.review-date")?.textContent.trim() || "";

          // Return an object containing all the extracted data
          return {
            profileName,
            reviewTitle, // This will now target the actual review title text
            reviewDetails,
            rating,
            postedDate,
          };
        })
    );

    console.log(ProductInfo.Reviews);

    // this functino will save the retrieve data into a json file
    try {
      fs.writeFileSync(
        "AmazonProduct.json",
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
