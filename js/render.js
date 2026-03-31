import { getState, incrementCart, decrementFromCart, clearCart, cartTotal } from "./store.js";

const currency = new Intl.NumberFormat("en-US");

export function formatPrice(price) {
  return `$ ${currency.format(price)}`;
}

export function categoryNavMarkup(options = {}) {
  const { withContainer = true, extraClass = "" } = options;
  const wrapperClass = `${withContainer ? "container" : ""} ${extraClass}`.trim();
  return `
    <section class="category-nav selection-animation ${wrapperClass}">
      <a class="category-card" href="./headphones.html">
        <img src="/assets/shared/desktop/image-headphones.png" alt="headphones" />
        <h3>Headphones</h3>
        <span>Shop <img src="/assets/shared/desktop/icon-arrow-right.svg" alt="" /></span>
      </a>
      <a class="category-card" href="./speakers.html">
        <img src="/assets/shared/desktop/image-speakers.png" alt="speakers" />
        <h3>Speakers</h3>
        <span>Shop <img src="/assets/shared/desktop/icon-arrow-right.svg" alt="" /></span>
      </a>
      <a class="category-card" href="./earphones.html">
        <img src="/assets/shared/desktop/image-earphones.png" alt="earphones" />
        <h3>Earphones</h3>
        <span>Shop <img src="/assets/shared/desktop/icon-arrow-right.svg" alt="" /></span>
      </a>
    </section>
  `;
}

export function bannerMarkup() {
  return `
    <section class="banner container">
      <div class="banner-copy">
        <h2>Bringing you the <span>best</span> audio gear</h2>
        <p>
          Located at the heart of New York City, Audiophile is the premier store for high end
          headphones, earphones, speakers, and audio accessories. We have a large showroom and
          luxury demonstration rooms available for you to browse and experience a wide range of our
          products.
        </p>
      </div>
      <picture>
        <source media="(max-width: 768px)" srcset="/assets/shared/mobile/image-best-gear.jpg" />
        <source media="(max-width: 1024px)" srcset="/assets/shared/tablet/image-best-gear.jpg" />
        <img src="/assets/shared/desktop/image-best-gear.jpg" alt="best gear" data-aos="flip-right" data-aos-duration="800" data-aos-delay="100" />
      </picture>
    </section>
  `;
}

export function footerMarkup() {
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-top">
          <img src="/assets/shared/desktop/logo.svg" alt="audiophile" class="logo" />
          <nav>
            <a href="./index.html">Home</a>
            <a href="./headphones.html">Headphones</a>
            <a href="./speakers.html">Speakers</a>
            <a href="./earphones.html">Earphones</a>
          </nav>
        </div>
        <p class="footer-info">
          Audiophile is an all in one stop to fulfill your audio needs. We are a small team of
          music lovers and sound specialists who are devoted to helping you get the most out of
          personal audio. Come and visit our demo facility. We are open 7 days a week.
        </p>
        <div class="footer-bottom">
          <p class="footer-sign">Copyright 2026. All Rights Reserved</p>
          <div class="footer-socials">
            <a href="#" aria-label="facebook"><img src="/assets/shared/desktop/icon-facebook.svg" alt="" /></a>
            <a href="#" aria-label="twitter"><img src="/assets/shared/desktop/icon-twitter.svg" alt="" /></a>
            <a href="#" aria-label="instagram"><img src="/assets/shared/desktop/icon-instagram.svg" alt="" /></a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

let modalLockCount = 0;

function lockBodyScroll() {
  modalLockCount += 1;
  if (modalLockCount > 1) {
    return;
  }
  document.body.classList.add("modal-open");
}

function unlockBodyScroll() {
  modalLockCount = Math.max(0, modalLockCount - 1);
  if (modalLockCount > 0) {
    return;
  }
  document.body.classList.remove("modal-open");
}

export function createModalController({ modal, panel, trigger, onOpen, onClose }) {
  if (!modal || !panel) {
    return {
      open: () => {},
      close: () => {}
    };
  }

  let lastFocused = null;

  const focusFirstElement = () => {
    const focusTarget = panel.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (focusTarget) {
      focusTarget.focus();
    }
  };

  const onEscape = (event) => {
    if (event.key === "Escape") {
      controller.close();
    }
  };

  const controller = {
    open: () => {
      lastFocused = document.activeElement;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      lockBodyScroll();
      if (onOpen) {
        onOpen();
      }
      document.addEventListener("keydown", onEscape);
      setTimeout(focusFirstElement, 0);
    },
    close: () => {
      if (modal.hidden) {
        return;
      }
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      unlockBodyScroll();
      document.removeEventListener("keydown", onEscape);
      if (onClose) {
        onClose();
      }
      if (trigger) {
        trigger.focus();
      } else if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }
  };

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      controller.close();
    }
  });

  return controller;
}

export function wireCart() {
  const modal = document.querySelector("[data-cart-modal]");
  const panel = document.querySelector("[data-cart-panel]");
  const openBtn = document.querySelector("[data-cart-open]");
  const clearBtn = document.querySelector("[data-cart-clear]");

  const modalController = createModalController({
    modal,
    panel,
    trigger: openBtn,
    onOpen: () => {
      renderCartItems();
    }
  });

  openBtn.addEventListener("click", modalController.open);

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-cart-close]")) {
      modalController.close();
    }

    if (event.target.closest("[data-cart-checkout]")) {
      modalController.close();
    }
  });

  clearBtn.addEventListener("click", () => {
    clearCart();
    renderCartItems();
    syncCartCount();
  });

  renderCartItems();
  syncCartCount();
}

export function syncCartCount() {
  const badge = document.querySelector("[data-cart-count]");
  const trigger = document.querySelector("[data-cart-open]");
  if (!badge) {
    return;
  }
  const amount = getState().cartItems.length;
  badge.textContent = String(amount);
  if (trigger) {
    trigger.setAttribute("data-has-items", amount > 0 ? "true" : "false");
  }
}

export function renderCartItems() {
  const list = document.querySelector("[data-cart-items]");
  const total = document.querySelector("[data-cart-total]");
  if (!list || !total) {
    return;
  }

  const state = getState();
  const title = document.querySelector("[data-cart-title]");
  if (title) {
    title.textContent = `Cart (${state.cartItems.length})`;
  }

  const checkoutActions = document.querySelector("[data-cart-checkout-actions]");
  if (checkoutActions) {
    checkoutActions.innerHTML = state.cartItems.length
      ? `<a class="btn btn-primary" data-cart-checkout href="./checkout.html"><span>Checkout</span></a>
         <button class="btn btn-ghost" data-cart-close><span>Close</span></button>`
      : `<button class="btn btn-dark btn-grow" disabled><span>No items in the list</span></button>`;
    // Tại sao nhỉ
    // <button class="btn btn-ghost" data-cart-close><span>Close</span></button>
  }

  if (!state.cartItems.length) {
    list.innerHTML = `
      <div class="cart-empty">
        <iframe
          title="cart empty"
          src="https://giphy.com/embed/nKERd2uhn8hhe"
          width="180"
          height="180"
          style="pointer-events:none;border:0;"
        ></iframe>
      </div>
    `;
  } else {
    list.innerHTML = state.cartItems
      .map(
        (item) => `
          <article class="cart-item">
            <img src="/assets/${item.cartImg}" alt="${item.short}" />
            <div>
              <h4>${item.short}</h4>
              <p>${formatPrice(item.price)}</p>
            </div>
            <div class="qty-controls">
              <button data-cart-dec="${item.id}">-</button>
              <span>${item.qty}</span>
              <button data-cart-inc="${item.id}">+</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  list.querySelectorAll("[data-cart-inc]").forEach((button) => {
    button.addEventListener("click", () => {
      incrementCart(button.dataset.cartInc);
      renderCartItems();
      syncCartCount();
    });
  });

  list.querySelectorAll("[data-cart-dec]").forEach((button) => {
    button.addEventListener("click", () => {
      decrementFromCart(button.dataset.cartDec);
      renderCartItems();
      syncCartCount();
    });
  });

  total.textContent = formatPrice(cartTotal());
}

export function renderLayout(activePath) {
  const headerRoot = document.querySelector("[data-header]");
  const footerRoot = document.querySelector("[data-footer]");
  const extraRoot = document.querySelector("[data-extra]");
  const isHomePage = activePath === "home";

  headerRoot.innerHTML = `
    <header class="site-header" data-home="${isHomePage ? "true" : "false"}" data-scrolled="false">
      <div class="container header-inner">
        <button class="menu-toggle" data-menu-toggle aria-label="Toggle menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <a href="./index.html" class="logo-link"><img src="/assets/shared/desktop/logo.svg" alt="audiophile" class="logo" /></a>
        <nav>
          <a ${activePath === "home" ? "data-active='true'" : ""} href="./index.html">Home</a>
          <a ${activePath === "headphones" ? "data-active='true'" : ""} href="./headphones.html">Headphones</a>
          <a ${activePath === "speakers" ? "data-active='true'" : ""} href="./speakers.html">Speakers</a>
          <a ${activePath === "earphones" ? "data-active='true'" : ""} href="./earphones.html">Earphones</a>
        </nav>
        <button class="cart-open" data-cart-open data-has-items="false" aria-label="Open cart">
          <img src="/assets/shared/desktop/icon-cart.svg" alt="" />
          <span data-cart-count>0</span>
        </button>
      </div>
      <div class="mobile-nav" data-mobile-nav hidden>
        ${categoryNavMarkup({ withContainer: false, extraClass: "mobile-nav-cards" })}
      </div>
    </header>

    <div class="cart-modal" data-cart-modal aria-hidden="true" hidden>
      <div class="cart-panel" data-cart-panel role="dialog" aria-modal="true" aria-label="Cart dialog">
        <div class="cart-top">
          <h3 data-cart-title>Cart (0)</h3>
          <button data-cart-clear>Remove all</button>
        </div>
        <div data-cart-items></div>
        <div class="cart-total">
          <span>Total</span>
          <strong data-cart-total>$ 0</strong>
        </div>
        <div class="cart-actions" data-cart-checkout-actions>
          <a class="btn btn-primary" data-cart-checkout href="./checkout.html"><span>Checkout</span></a>
          <button class="btn btn-ghost" data-cart-close><span>Close</span></button>
        </div>
      </div>
    </div>
  `;

  if (extraRoot) {
    extraRoot.innerHTML = (activePath !== "home" ? categoryNavMarkup({ withContainer: true }) : "") + bannerMarkup();
  }

  footerRoot.innerHTML = footerMarkup();
}

export function wireHeader(activePath) {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (!header || !menuToggle || !mobileNav) {
    return;
  }

  let menuOpen = false;

  const syncHeaderScroll = () => {
    const scrolled = window.scrollY >= 390;
    header.setAttribute("data-scrolled", scrolled ? "true" : "false");
    if (activePath !== "home") {
      header.setAttribute("data-home", "false");
    }
    mobileNav.style.top = header.offsetHeight / 2 + "px";
  };

  const openMenu = () => {
    menuOpen = true;
    mobileNav.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.classList.add("is-open");
    lockBodyScroll();
  };

  const closeMenu = () => {
    menuOpen = false;
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.classList.remove("is-open");
    unlockBodyScroll();
  };

  menuToggle.addEventListener("click", () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  mobileNav.addEventListener("click", (event) => {
    if (event.target === mobileNav || event.target.closest("a")) {
      closeMenu();
    }
  });

  window.addEventListener("scroll", syncHeaderScroll);
  syncHeaderScroll();
}
