const puppeteer = require("puppeteer");
const fs = require("fs");

const Url = "";

// Helper function to pause and wait for manual interaction
async function manualScrollPause() {
  console.log(
    "Manual scrolling enabled. Scroll down to load more reviews and press Enter to continue..."
  );

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

  const newReviews = await page.$$eval(
    "div.WMbnJf.vY6njf.gws-localreviews__google-review",
    (reviewElements) =>
      reviewElements.map((review) => {
        const AuthorImg =
          review.querySelector(".lDY1rd")?.getAttribute("src") || "";

        const profileName =
          review.querySelector(".jxjCjc .TSUbDb > a")?.textContent.trim() || "";

        const postedTime =
          review
            .querySelector(
              "div > div.jxjCjc > div.gQfZge > div > div > div.PuaHbe > span.dehysf.lTi8oc"
            )
            ?.textContent.trim() || "";

        const imageElements = review.querySelectorAll("div.JrO5Xe");
        const imageUrls = Array.from(imageElements).map((imgDiv) => {
          const bgImage = imgDiv.style.backgroundImage || "";
          return bgImage.match(/url\("(.*?)"\)/)?.[1] || "";
        });

        const ratingText =
          review.querySelector(
            "div.jxjCjc > div.gQfZge > div > div > div.PuaHbe > span.lTi8oc.z3HNkc"
          )?.ariaLabel || "";
        const rating = Number(
          ratingText.match(/Rated (\d+(\.\d+)?) out of 5/)?.[1]
        );

        const reviewText =
          review.querySelector(".review-full-text")?.textContent.trim() || "";

        const reviewText2 =
          review
            .querySelector(
              "#reviewSort > div > div.gws-localreviews__general-reviews-block > div > div.jxjCjc > div.gQfZge > div > div > div.Jtu6Td > span > span"
            )
            ?.textContent.trim() || "";

        // Only return the review if not all of imageUrls, reviewText, and reviewText2 are empty
        if (!(imageUrls.length === 0 && !reviewText && !reviewText2)) {
          return {
            AuthorImg,
            profileName,
            postedTime,
            imageUrls,
            rating,
            reviewText,
            reviewText2,
          };
        }
        return null; // Return null if all fields are empty
      })
  );

  // Filter out null entries (reviews with all fields empty)
  reviews.push(...newReviews.filter((review) => review !== null));

  return reviews;
}

async function getTestData() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(Url, { waitUntil: "networkidle2", timeout: 120000 });

    const reviews = await getAllReviews(page);

    console.log(reviews);

    // Save the filtered reviews to a JSON file
    try {
      fs.writeFileSync(
        "FilteredReviews.json",
        JSON.stringify(reviews, null, 2),
        "utf-8"
      );
      console.log(`Total reviews extracted: ${reviews.length}`);
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
