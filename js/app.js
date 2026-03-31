import { loadStore } from "./store.js";
import { renderLayout, wireCart, wireHeader } from "./render.js";

const pageName = document.body.dataset.page;

loadStore();
renderLayout(pageName);
wireHeader(pageName);
wireCart();

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
