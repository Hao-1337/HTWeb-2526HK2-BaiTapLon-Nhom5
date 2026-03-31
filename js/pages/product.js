import { loadProducts, getProductById } from "../data.js";
import { addToCart } from "../store.js";
import { syncCartCount, formatPrice, renderCartItems } from "../render.js";

export async function initProductPage() {
  const root = document.querySelector("[data-page-content]");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const products = await loadProducts();
  const item = getProductById(products, id || "");

  if (!item) {
    root.innerHTML = "<section class='container'><p>Product not found.</p></section>";
    return;
  }

  root.innerHTML = `
    <section class="container product-detail" data-aos="fade" data-aos-duration="1000">
      <button class="go-back" type="button" data-go-back>< Go Back</button>
      <div class="product-hero">
        <div class="product-img-wrap">
          <img src="./assets/${item.productIMG}" alt="${item.product}" />
        </div>
        <div>
          ${item.feature ? `<p class="overline">${item.feature}</p>` : ""}
          <h1>${item.product}</h1>
          <p>${item.info}</p>
          <p class="price">${formatPrice(item.price)}</p>
          <div class="add-cart-row">
            <div class="qty-stepper" data-qty-stepper>
              <button type="button" data-qty-dec aria-label="Decrease quantity">-</button>
              <span data-qty-display>1</span>
              <button type="button" data-qty-inc aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn-primary" data-add-cart><span>Add to Cart</span></button>
          </div>
        </div>
      </div>

      <div class="feature-grid">
        <article>
          <h3>Features</h3>
          <p>${item.featureDesc1}</p>
          <p>${item.featureDesc2}</p>
        </article>
        <article>
          <h3>In the box</h3>
          <ul>
            ${item.inTheBox.map(([qty, text]) => `<li><strong>${qty}</strong> ${text}</li>`).join("")}
          </ul>
        </article>
      </div>

      <div class="gallery">
        ${item.gallery
          .map(([url, alt]) => `<img src="./assets/${url}" alt="${alt}" />`)
          .join("")}
      </div>

      <section class="preference">
        <h3>You May Also Like</h3>
        <div class="preference-grid">
          ${item.preference
            .map(
              (pref) => `
                <article class="preference-card" data-aos="flip-left">
                  <img src="./assets/${pref.url}" alt="${pref.product}" />
                  <h4>${pref.product}</h4>
                  <a class="btn btn-primary" href="./product.html?id=${pref.link.replace("/product_detail/", "")}"><span>See Product</span></a>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    </section>
  `;

  document.title = `Audiophile - ${item.product}`;

  let qty = 1;

  const qtyDisplay = document.querySelector("[data-qty-display]");
  const qtyDecBtn = document.querySelector("[data-qty-dec]");
  const qtyIncBtn = document.querySelector("[data-qty-inc]");
  const addBtn = document.querySelector("[data-add-cart]");
  const goBackBtn = document.querySelector("[data-go-back]");

  const updateQtyDisplay = () => {
    qtyDisplay.textContent = String(qty);
    qtyDecBtn.disabled = qty <= 1;
  };

  qtyDecBtn.addEventListener("click", () => {
    if (qty > 1) {
      qty -= 1;
      updateQtyDisplay();
    }
  });

  qtyIncBtn.addEventListener("click", () => {
    qty += 1;
    updateQtyDisplay();
  });

  goBackBtn.addEventListener("click", () => {
    window.history.back();
  });

  addBtn.addEventListener("click", () => {
    addToCart(item, qty);
    syncCartCount();
    renderCartItems();
  });
}
