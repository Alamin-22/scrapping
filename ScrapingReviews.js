const puppeteer = require("puppeteer");
const fs = require("fs");

const Url =
  "https://www.google.com/search?q=ruma+nails+%26+spa&oq=ruma+nails+%26+spa&gs_lcrp=EgZjaHJvbWUqDAgAECMYJxiABBiKBTIMCAAQIxgnGIAEGIoFMg0IARAuGK8BGMcBGIAEMggIAhBFGCcYOzIHCAMQABiABDIGCAQQRRg9MgYIBRBFGD0yBggGEEUYPTIGCAcQRRhB0gEIMjAyMGowajeoAgiwAgE&sourceid=chrome&ie=UTF-8#lrd=0x89c25d7e7c1e16c5:0xcce7df910fd64046,1,,,,";

// Helper function to pause and wait for manual interaction
async function manualScrollPause() {
  console.log(
    "Manual scrolling enabled. Scroll down to load more reviews and press Enter to continue..."
  );

  // Keep the browser open and wait for the user to hit Enter in the terminal
  process.stdin.setRawMode(true);
  return new Promise((resolve) => {
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    });
  });
}

async function getAllReviews(page) {
  const reviews = [];

  // Wait for manual scrolling and loading of reviews
  await manualScrollPause(page);

  // After the pause, extract all the reviews that have been loaded
  const newReviews = await page.$$eval(
    "div.WMbnJf.vY6njf.gws-localreviews__google-review", // Container for reviews
    (reviewElements) =>
      reviewElements.map((review) => {
        // Extracting the profile image
        const AuthorImg =
          review.querySelector(".lDY1rd")?.getAttribute("src") || "";

        // Extracting the profile name
        const profileName =
          review.querySelector(".jxjCjc .TSUbDb > a")?.textContent.trim() || "";

        // Extracting the posted time
        const postedTime =
          review
            .querySelector(
              "div > div.jxjCjc > div.gQfZge > div > div > div.PuaHbe > span.dehysf.lTi8oc"
            )
            ?.textContent.trim() || "";

        // For retrieving Reviewed Images
        const imageElements = review.querySelectorAll("div.JrO5Xe");
        const imageUrls = Array.from(imageElements).map((imgDiv) => {
          const bgImage = imgDiv.style.backgroundImage || "";
          return bgImage.match(/url\("(.*?)"\)/)?.[1] || ""; // Extract the URL from the 'background-image'
        });

        // Extracting the rating
        const ratingText =
          review.querySelector(
            "div.jxjCjc > div.gQfZge > div > div > div.PuaHbe > span.lTi8oc.z3HNkc"
          )?.ariaLabel || ""; // aria-label contains the rating info
        const rating = Number(
          ratingText.match(/Rated (\d+(\.\d+)?) out of 5/)?.[1]
        );

        // Extracting the review text
        const reviewText =
          review.querySelector(".review-full-text")?.textContent.trim() || "";
        const reviewText2 =
          review
            .querySelector(
              "#reviewSort > div > div.gws-localreviews__general-reviews-block > div > div.jxjCjc > div.gQfZge > div > div > div.Jtu6Td > span > span"
            )
            ?.textContent.trim() || "";

        return {
          AuthorImg,
          profileName,
          postedTime,
          imageUrls,
          rating,
          reviewText,
          reviewText2
        };
      })
  );

  reviews.push(...newReviews); // Add new reviews to the array

  return reviews;
}

async function getTestData() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(Url, { waitUntil: "networkidle2", timeout: 120000 }); // Wait for the page to fully load

    const reviews = await getAllReviews(page);

    console.log(reviews);

    // Save the retrieved data to a JSON file
    try {
      fs.writeFileSync(
        "Reviews2.json",
        JSON.stringify(reviews, null, 2),
        "utf-8"
      );
      console.log(`Total reviews extracted: ${reviews.length}`);
      console.log("Review data saved to RumaNailsAllReviews.json");
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
