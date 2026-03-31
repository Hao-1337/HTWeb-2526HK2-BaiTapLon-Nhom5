import { loadStore } from "./store.js";
import { renderLayout, wireCart, wireHeader } from "./render.js";
import { isLoggedIn } from "./account-store.js";

const pageName = document.body.dataset.page;

window.scrollTo(0, 0);
loadStore();
renderLayout(pageName);
wireHeader(pageName);
wireCart();

const accountLink = document.querySelector("[data-account-link]");
const accountIcon = accountLink?.querySelector("img");
if (accountLink) {
  const loggedIn = isLoggedIn();
  accountLink.setAttribute("data-logged-in", loggedIn ? "true" : "false");
  if (accountIcon && loggedIn) {
    accountIcon.src = "./assets/dbtheme.jpg";
    accountIcon.alt = "Profile picture";
    accountIcon.onerror = () => {
      accountIcon.src = "./assets/shared/desktop/icon-account.svg";
      accountIcon.alt = "Account";
    };
  }
}

if (pageName === "home") {
  const { initHome } = await import("./pages/home.js");
  await initHome();
}

if (pageName === "headphones" || pageName === "speakers" || pageName === "earphones") {
  const { initCategoryPage } = await import("./pages/category.js");
  await initCategoryPage(pageName);
}

if (pageName === "product") {
  const { initProductPage } = await import("./pages/product.js");
  await initProductPage();
}

if (pageName === "checkout") {
  const { initCheckoutPage } = await import("./pages/checkout.js");
  await initCheckoutPage();
}

if (pageName === "account") {
  const { initAccountPage } = await import("./pages/account.js");
  await initAccountPage();
}

AOS.init({
  once: true
});
