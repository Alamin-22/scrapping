const puppeteer = require("puppeteer");
const fs = require("fs");

const Url =
  "https://www.google.com/search?q=ruma+nails+%26+spa&oq=ruma&gs_lcrp=EgZjaHJvbWUqDggAEEUYJxg7GIAEGIoFMg4IABBFGCcYOxiABBiKBTIOCAEQRRgnGDsYgAQYigUyBwgCEAAYgAQyBggDEEUYOzIGCAQQRRg9MgYIBRBFGD0yBggGEEUYPTIGCAcQRRhB0gEIMTM5MWowajeoAgiwAgE&sourceid=chrome&ie=UTF-8#lrd=0x89c25d7e7c1e16c5:0xcce7df910fd64046,1,,,,";

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

        const AuthorName =
          review.querySelector(".jxjCjc .TSUbDb > a")?.textContent.trim() || "";

        const officialReviewLink =
          review.querySelector(".jxjCjc .TSUbDb > a")?.getAttribute("href") ||
          "";

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

        // Helper function to get a random icon from the array
        function getRandomIcon() {
          // Icons for providedBy field
          const icons = [
            `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 48 48"
    >
      <path
        fill="#ffc107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      ></path>
      <path
        fill="#ff3d00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      ></path>
      <path
        fill="#4caf50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      ></path>
      <path
        fill="#1976d2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      ></path>
    </svg>`,
            `  <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 48 48"
    >
      <path
        fill="#ffc107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      ></path>
      <path
        fill="#ff3d00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      ></path>
      <path
        fill="#4caf50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      ></path>
      <path
        fill="#1976d2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      ></path>
    </svg>`,
            `  <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 48 48"
    >
      <path
        fill="#ffc107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
      ></path>
      <path
        fill="#ff3d00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
      ></path>
      <path
        fill="#4caf50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
      ></path>
      <path
        fill="#1976d2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
      ></path>
    </svg>`,
            `  <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 256 256"
    >
      <path
        fill="#1877f2"
        d="M256 128C256 57.308 198.692 0 128 0S0 57.308 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.348-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.959 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"
      ></path>
      <path
        fill="#fff"
        d="m177.825 165l5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A129 129 0 0 0 128 256a129 129 0 0 0 20-1.555V165z"
      ></path>
    </svg>`,
            `  <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.5em"
      height="1.5em"
      viewBox="0 0 32 32"
    >
      <path
        fill="#ff0019"
        d="M28.146 24.302c-.188 1.292-2.823 4.646-4.036 5.13c-.417.161-.813.125-1.135-.12c-.203-.161-.417-.49-3.26-5.104l-.844-1.375c-.328-.495-.266-1.146.141-1.641c.396-.479.974-.656 1.479-.464c.026.016 2.13.703 2.13.703c4.781 1.573 4.938 1.635 5.141 1.786c.302.25.443.635.38 1.083zm-9.583-7.021c-.344-.516-.333-1.125.016-1.542l1.328-1.813c2.917-3.979 3.083-4.188 3.281-4.328c.339-.229.76-.24 1.161-.042c1.156.563 3.495 4.036 3.635 5.37v.047c.042.453-.141.823-.458 1.047c-.219.141-.422.219-5.859 1.542c-.859.219-1.339.339-1.62.438l.036-.042c-.536.161-1.135-.099-1.479-.635zm-3.344-2.062c-.255.078-1.047.323-2.021-1.25c0 0-6.578-10.349-6.729-10.667c-.094-.359.016-.766.339-1.094c.979-1.016 6.286-2.5 7.677-2.161c.453.12.766.401.875.807c.083.448.729 10.047.823 12.198c.089 1.839-.703 2.089-.964 2.167m.87 10.521c-.016 5.031-.026 5.203-.109 5.443c-.135.37-.458.625-.906.703c-1.281.219-5.286-1.26-6.125-2.25c-.161-.219-.26-.438-.281-.661a.85.85 0 0 1 .063-.458c.099-.26.24-.464 3.839-4.682l1.057-1.255c.365-.464 1-.604 1.599-.365c.583.219.943.719.901 1.26v2.24zM5.177 22.521c-.391-.01-.745-.25-.953-.641c-.146-.286-.25-.755-.318-1.333c-.182-1.734.042-4.354.563-5.182c.24-.38.599-.583.99-.568c.26 0 .495.078 5.641 2.198l1.505.599c.542.203.875.76.844 1.401c-.042.62-.401 1.099-.927 1.24l-2.141.682c-4.786 1.542-4.948 1.578-5.198 1.557zm19.969 9.474h-.005l-.005.005z"
      ></path>
    </svg>`,
          ];
          const randomIndex = Math.floor(Math.random() * icons.length);
          return icons[randomIndex];
        }

        // Randomly assign one of the  icons
        const providedBy = getRandomIcon();

        // Only return the review if not all of imageUrls, reviewText, and reviewText2 are empty and if rating is above 2
        if (
          !(imageUrls.length === 0 && !reviewText && !reviewText2) &&
          rating > 2
        ) {
          return {
            AuthorImg,
            AuthorName,
            officialReviewLink,
            postedTime,
            imageUrls,
            rating,
            reviewText,
            reviewText2,
            providedBy,
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
