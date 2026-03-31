import { CATEGORY_ITEMS } from "../data.js";

export async function initCategoryPage(category) {
  const root = document.querySelector("[data-page-content]");
  const title = category[0].toUpperCase() + category.slice(1);
  const items = CATEGORY_ITEMS[category] || [];

  root.innerHTML = `
    <section class="category-hero" data-aos="fade-down" data-aos-once="true" data-aos-duration="600"><div class="container" data-aos="zoom-in" data-aos-once="true" data-aos-duration="500" data-aos-delay="300"><h1>${title}</h1></div></section>
    <section class="container category-grid">
      ${items
        .map(
          (item, index) => `
            <article class="category-item ${index % 2 ? "reverse" : ""}" data-aos="fade">
              <div class="category-img-wrap">
                <img src="./assets/${item.src}" alt="${item.product}" />
              </div>
              <div>
                ${item.feature ? `<p class="overline">${item.feature}</p>` : ""}
                <h2>${item.product}</h2>
                <p>${item.detail}</p>
                <a class="btn btn-primary" href="./product.html?id=${item.id}"><span>See Product</span></a>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}
