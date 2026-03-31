import { categoryNavMarkup } from "../render.js";

export async function initHome() {
  const root = document.querySelector("[data-page-content]");
  root.innerHTML = `
    <section class="hero">
      <div class="hero-inner">
        <div>
          <p class="overline">New Product</p>
          <h1>XX99 Mark II Headphones</h1>
          <p>Experience natural, lifelike audio and exceptional build quality made for the passionate music enthusiast.</p>
          <a class="btn btn-primary" href="./product.html?id=xx99-mark-ii"><span>See Product</span></a>
        </div>
        <div class="hero-img" role="img" aria-label="XX99 Mark II Headphones"></div>
      </div>
    </section>

    ${categoryNavMarkup({ withContainer: true })}

    <section class="container home-highlights">
      <div class="home-highlights-wrapper">
        <article class="highlight zx9">
          <span class="zx9-img" role="img" aria-label="ZX9 speaker"></span>
          <div>
            <h2>ZX9 Speaker</h2>
            <p>Upgrade to premium speakers that are phenomenally built to deliver truly remarkable sound.</p>
            <a class="btn btn-dark" href="./product.html?id=zx9"><span>See Product</span></a>
          </div>
        </article>

        <article class="highlight zx7">
          <h3>ZX7 Speaker</h3>
          <a class="btn btn-outline" href="./product.html?id=zx7"><span>See Product</span></a>
        </article>

        <article class="highlight yx1">
          <picture>
            <source media="(max-width: 550px)" srcset="./assets/home/mobile/image-earphones-yx1.jpg">
            <source media="(max-width: 768px)" srcset="./assets/home/tablet/image-earphones-yx1.jpg">
            <img class="yx1-img" src="./assets/home/desktop/image-earphones-yx1.jpg" alt="YX1 earphones product image"/>
          </picture>
          <div>
            <h3>YX1 Earphones</h3>
            <a class="btn btn-outline" href="./product.html?id=yx1"><span>See Product</span></a>
          </div>
        </article>
      </div>
    </section>
  `;
}
