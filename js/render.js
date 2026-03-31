import { getState, incrementCart, decrementFromCart, clearCart, cartTotal } from "./store.js";

const currency = new Intl.NumberFormat("en-US");

export function formatPrice(price) {
  return `$ ${currency.format(price)}`;
}

function getTemplate(templateId) {
  const template = document.getElementById(templateId);
  return template instanceof HTMLTemplateElement ? template : null;
}

export function cloneTemplateContent(templateId) {
  const template = getTemplate(templateId);
  return template ? template.content.cloneNode(true) : document.createDocumentFragment();
}

function cloneTemplateElement(templateId) {
  const fragment = cloneTemplateContent(templateId);
  return fragment.firstElementChild ?? null;
}

export function createCategoryNavElement(options = {}) {
  const { withContainer = true, extraClass = "" } = options;
  const categoryNav = cloneTemplateElement("category-nav-template");
  if (!categoryNav) return null;

  categoryNav.classList.toggle("container", withContainer);
  extraClass
    .split(/\s+/)
    .filter(Boolean)
    .forEach((className) => categoryNav.classList.add(className));

  return categoryNav;
}

export function categoryNavMarkup(options = {}) {
  const categoryNav = createCategoryNavElement(options);
  return categoryNav ? categoryNav.outerHTML : "";
}

export function bannerMarkup() {
  const banner = cloneTemplateElement("banner-template");
  return banner ? banner.outerHTML : "";
}

export function footerMarkup() {
  const footer = cloneTemplateElement("footer-template");
  return footer ? footer.outerHTML : "";
}
  
let modalLockCount = 0;

function lockBodyScroll() {
  modalLockCount += 1;
  if (modalLockCount > 1) return;
  document.body.classList.add("modal-open");
}

function unlockBodyScroll() {
  modalLockCount = Math.max(0, modalLockCount - 1);
  if (modalLockCount > 0) return;
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
    if (focusTarget) focusTarget.focus();
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
      if (onOpen) onOpen();
      document.addEventListener("keydown", onEscape);
      setTimeout(focusFirstElement, 0);
    },
    close: () => {
      if (modal.hidden) return;
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      unlockBodyScroll();
      document.removeEventListener("keydown", onEscape);
      if (onClose) onClose();
      if (trigger) trigger.focus();
      else if (lastFocused && typeof lastFocused.focus === "function") {
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

  if (!modal || !panel || !openBtn || !clearBtn) return;

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
    if (event.target.closest("[data-cart-close]")) modalController.close();

    if (event.target.closest("[data-cart-checkout]")) modalController.close();
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
  if (!badge) return;
  const amount = getState().cartItems.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = String(amount);
  if (trigger) trigger.setAttribute("data-has-items", amount > 0 ? "true" : "false");
}

export function renderCartItems() {
  const list = document.querySelector("[data-cart-items]");
  const total = document.querySelector("[data-cart-total]");
  if (!list || !total) return;

  const state = getState();
  const totalUnits = state.cartItems.reduce((sum, item) => sum + item.qty, 0);
  const title = document.querySelector("[data-cart-title]");
  if (title) title.textContent = `Cart (${totalUnits})`;

  const checkoutActions = document.querySelector("[data-cart-checkout-actions]");
  if (checkoutActions) {
    checkoutActions.innerHTML = state.cartItems.length
      ? `<a class="btn btn-primary" data-cart-checkout href="./checkout.html"><span>Checkout</span></a>
         <button class="btn btn-ghost" data-cart-close><span>Close</span></button>`
      : `<button class="btn btn-dark btn-grow" disabled><span>No items in the list</span></button>`;
  }

  if (!state.cartItems.length) {
    const emptyState = cloneTemplateElement("cart-empty-template");
    list.replaceChildren();
    if (emptyState) {
      list.append(emptyState);
    }
  } else {
    list.innerHTML = state.cartItems
      .map(
        (item) => `
          <article class="cart-item">
            <img src="./assets/${item.cartImg}" alt="${item.short}" />
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

  if (!headerRoot || !footerRoot) return;

  const header = cloneTemplateElement("site-header-template");
  const cartModal = cloneTemplateElement("cart-modal-template");
  if (header) {
    header.setAttribute("data-home", isHomePage ? "true" : "false");
    const activeLink = header.querySelector(`[data-page-link="${activePath}"]`);
    if (activeLink) activeLink.setAttribute("data-active", "true");

    const mobileNav = header.querySelector("[data-mobile-nav]");
    if (mobileNav) {
      const mobileNavList = document.createElement("ul");
      mobileNavList.className = "mobile-nav-list";

      const navThumbMap = {
        home: "./assets/shared/desktop/logo.svg",
        headphones: "./assets/shared/desktop/image-headphones.png",
        speakers: "./assets/shared/desktop/image-speakers.png",
        earphones: "./assets/shared/desktop/image-earphones.png"
      };

      const desktopLinks = Array.from(header.querySelectorAll("nav a"));
      desktopLinks.forEach((link) => {
        const listItem = document.createElement("li");
        const mobileLink = document.createElement("a");
        const pageKey = link.getAttribute("data-page-link") ?? "";
        const label = link.textContent?.trim() ?? "";
        mobileLink.href = link.getAttribute("href") ?? "#";

        const leftWrap = document.createElement("span");
        leftWrap.className = "mobile-nav-left";

        const thumb = document.createElement("img");
        thumb.className = "mobile-nav-thumb";
        thumb.src = navThumbMap[pageKey] ?? "./assets/shared/desktop/logo.svg";
        thumb.alt = "";
        thumb.setAttribute("aria-hidden", "true");

        const text = document.createElement("span");
        text.className = "mobile-nav-label";
        text.textContent = label;

        leftWrap.append(thumb, text);

        const arrow = document.createElement("img");
        arrow.className = "mobile-nav-arrow";
        arrow.src = "./assets/shared/desktop/icon-arrow-right.svg";
        arrow.alt = "";
        arrow.setAttribute("aria-hidden", "true");

        mobileLink.append(leftWrap, arrow);

        if (link.getAttribute("data-active") === "true") {
          mobileLink.setAttribute("data-active", "true");
        }

        listItem.append(mobileLink);
        mobileNavList.append(listItem);
      });

      mobileNav.replaceChildren(mobileNavList);
    }
  }
  headerRoot.replaceChildren(...[header, cartModal].filter(Boolean));

  if (extraRoot) {
    const extraSections = [];
    if (activePath !== "home") {
      const categoryNav = createCategoryNavElement({ withContainer: true });
      if (categoryNav) extraSections.push(categoryNav);
    }

    const banner = cloneTemplateElement("banner-template");
    if (banner) extraSections.push(banner);
    extraRoot.replaceChildren(...extraSections);
  }

  const footer = cloneTemplateElement("footer-template");
  footerRoot.replaceChildren(...[footer].filter(Boolean));
}

export function wireHeader(activePath) {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (!header || !menuToggle || !mobileNav) return;

  let menuOpen = false;
  let resizeTicking = false;
  let isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

  const syncHeaderScroll = () => {
    const scrolled = window.scrollY >= 390;
    header.setAttribute("data-scrolled", scrolled ? "true" : "false");
    if (activePath !== "home") {
      header.setAttribute("data-home", "false");
    }
    mobileNav.style.top = `${header.offsetHeight}px`;
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

  const onResize = () => {
    if (resizeTicking) return;

    resizeTicking = true;
    window.requestAnimationFrame(() => {
      const mobileNow = window.matchMedia("(max-width: 768px)").matches;
      const switchedToDesktop = isMobileViewport && !mobileNow;
      isMobileViewport = mobileNow;

      if (switchedToDesktop && menuOpen) closeMenu();

      syncHeaderScroll();
      resizeTicking = false;
    });
  };

  menuToggle.addEventListener("click", () => {
    if (menuOpen) closeMenu();
    else openMenu();
  });

  mobileNav.addEventListener("click", (event) => {
    if (event.target === mobileNav || event.target.closest("a")) closeMenu();
  });

  window.addEventListener("scroll", syncHeaderScroll);
  window.addEventListener("resize", onResize);
  syncHeaderScroll();
}
