const puppeteer = require("puppeteer");
const fs = require("fs");

const Url =
  "https://www.google.com/search?q=ruma+nails+%26+spa&oq=ruma+nails+%26+spa&gs_lcrp=EgZjaHJvbWUqDAgAECMYJxiABBiKBTIMCAAQIxgnGIAEGIoFMg0IARAuGK8BGMcBGIAEMggIAhBFGCcYOzIHCAMQABiABDIGCAQQRRg9MgYIBRBFGD0yBggGEEUYPTIGCAcQRRhB0gEIODk5OGowajeoAgiwAgE&sourceid=chrome&ie=UTF-8#lrd=0x89c25d7e7c1e16c5:0xcce7df910fd64046,1,,,,";

async function getTestData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(Url, { waitUntil: "networkidle2", timeout: 120000 }); // Wait for the page to fully load

    const reviews = await page.$$eval(
      "div.WMbnJf.vY6njf.gws-localreviews__google-review", // Container for reviews
      (reviewElements) =>
        reviewElements.map((review) => {
          // Extracting the profile name
          const profileName =
            review.querySelector(".jxjCjc .TSUbDb > a")?.textContent.trim() ||
            "";

          // Extracting the rating (e.g., "Rated 5.0 out of 5")
          const ratingText =
            review.querySelector(
              ".Puahb span.TiI8oc.Z3HNkc[aria-label^='Rated']"
            )?.ariaLabel || "";
          const rating = ratingText.match(/Rated (\d+(\.\d+)?) out of 5/)?.[1];

          // Extracting the review text
          const reviewText =
            review.querySelector(".review-full-text")?.textContent.trim() || "";

          return {
            profileName,
            rating: rating ? parseFloat(rating) : null,
            reviewText,
          };
        })
    );

    console.log(reviews);

    // Save the retrieved data to a JSON file
    try {
      fs.writeFileSync(
        "GoogleReviews.json",
        JSON.stringify(reviews, null, 2),
        "utf-8"
      );
      console.log("Review data saved to GoogleReviews.json");
    } catch (fsError) {
      console.error("Error writing to file:", fsError);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    await browser.close();
  }
}

getTestData();
