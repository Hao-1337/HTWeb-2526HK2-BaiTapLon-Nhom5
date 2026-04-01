import { getState, cartTotal, clearCart } from "../store.js";
import { getAccountSession, isLoggedIn, saveOrder, generateOrderId } from "../account-store.js";
import {
  cloneTemplateContent,
  createCategoryNavElement,
  createModalController,
  formatPrice,
  renderCartItems,
  syncCartCount
} from "../render.js";

function renderSummaryItems(items, container) {
  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
        <article class="summary-item">
          <img src="./assets/${item.cartImg}" alt="${item.short}" />
          <div>
            <h4>${item.short}</h4>
            <p>${formatPrice(item.price)}</p>
          </div>
          <span>x${item.qty}</span>
        </article>
      `
    )
    .join("");
}

function renderSuccessItems(items, container) {
  if (!container) return;

  container.innerHTML = items
    .map(
      (item) => `
        <li class="success-item">
          <img src="./assets/${item.cartImg}" alt="${item.short}" width="50" height="50" />
          <p class="success-item-info">
            ${item.short}
            <span>${formatPrice(item.price)}</span>
          </p>
          <span>x${item.qty}</span>
        </li>
      `
    )
    .join("");
}

export async function initCheckoutPage() {
  const root = document.querySelector("[data-page-content]");
  if (!root) return;

  if (!isLoggedIn()) {
    document.title = "Checkout - Sign In Required";
    root.replaceChildren(cloneTemplateContent("checkout-login-required-template"));
    const loginBtn = document.querySelector("[data-checkout-login]");
    if (loginBtn)
      loginBtn.addEventListener("click", () => {
        window.location.href = "./account.html?next=checkout";
      });
    const goBackButton = document.querySelector("[data-go-back]");
    if (goBackButton) goBackButton.addEventListener("click", () => window.history.back());
    return;
  }

  const state = getState();
  const hasItems = state.cartItems.length > 0;
  const shipping = 50;
  const vat = Math.round(cartTotal() * 0.2);
  const grand = cartTotal() + shipping + vat;

  if (!hasItems) {
    document.title = "Checkout - No items in cart";
    root.replaceChildren(cloneTemplateContent("checkout-empty-template"));

    const categoryNav = createCategoryNavElement({ withContainer: true, extraClass: "empty-checkout-nav" });
    if (categoryNav) root.append(categoryNav);

    const goBackButton = document.querySelector("[data-go-back]");
    if (goBackButton)
      goBackButton.addEventListener("click", () => {
        window.history.back();
      });
    return;
  }

  root.replaceChildren(cloneTemplateContent("checkout-page-template"));

  const session = getAccountSession();
  const emailInput = document.querySelector("[data-checkout-form] input[name='email']");
  if (emailInput && session?.email) emailInput.value = session.email;

  const summaryItems = document.querySelector("[data-summary-items]");
  const summaryTotal = document.querySelector("[data-summary-total]");
  const summaryShipping = document.querySelector("[data-summary-shipping]");
  const summaryVat = document.querySelector("[data-summary-vat]");
  const summaryGrand = document.querySelector("[data-summary-grand]");
  const successItems = document.querySelector("[data-success-items]");
  const successGrandTotal = document.querySelector("[data-success-grand-total]");
  const placeOrder = document.querySelector("[data-place-order]");
  const form = document.querySelector("[data-checkout-form]");
  const goBackBtn = document.querySelector("[data-go-back]");
  const success = document.querySelector("[data-success]");
  const successPanel = document.querySelector("[data-success-panel]");
  const successHome = document.querySelector("[data-success-home]");
  const paymentRadios = document.querySelectorAll("[data-payment-radio]");
  const paymentExtra = document.querySelector("[data-payment-extra]");
  const cashExtra = document.querySelector("[data-cash-extra]");
  const eMoneyNum = document.querySelector("[data-emoney-num]");
  const eMoneyPin = document.querySelector("[data-emoney-pin]");

  renderSummaryItems(state.cartItems, summaryItems);
  renderSuccessItems(state.cartItems, successItems);
  if (summaryTotal) summaryTotal.textContent = formatPrice(cartTotal());
  if (summaryShipping) summaryShipping.textContent = formatPrice(shipping);
  if (summaryVat) summaryVat.textContent = formatPrice(vat);
  if (summaryGrand) summaryGrand.textContent = formatPrice(grand);
  if (successGrandTotal) successGrandTotal.textContent = formatPrice(grand);
  if (placeOrder) placeOrder.disabled = !hasItems;

  const syncPaymentState = () => {
    const payment = form.elements.payment.value;
    const isEMoney = payment === "e-money";
    paymentExtra.hidden = !isEMoney;
    cashExtra.hidden = isEMoney;
    eMoneyNum.required = isEMoney;
    eMoneyPin.required = isEMoney;

    if (!isEMoney) {
      clearFieldError("eMoneyNum");
      clearFieldError("eMoneyPin");
      return;
    }

    if (touchedFields.has("eMoneyNum")) validateField("eMoneyNum");
    if (touchedFields.has("eMoneyPin")) validateField("eMoneyPin");
  };

  const successModalController = createModalController({
    modal: success,
    panel: successPanel,
    trigger: placeOrder
  });

  if (!placeOrder || !form || !goBackBtn || !success || !successPanel || !successHome || !paymentExtra || !cashExtra || !eMoneyNum || !eMoneyPin) return;

  goBackBtn.addEventListener("click", () => {
    window.history.back();
  });

  const NAME_RE = /^[\p{L}]+(?:[\p{L}' -]*[\p{L}])?$/u;
  const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  const PHONE_ALLOWED_RE = /^\+?[\d\s().-]+$/;
  const ADDRESS_RE = /^(?=.*[\p{L}])(?=.*\d)[\p{L}\d\s.,'#/-]{5,}$/u;
  const ZIP_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/;
  const PLACE_RE = /^[\p{L}]+(?:[\p{L}' -]*[\p{L}])?$/u;

  const hasValidPhoneDigits = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  };

  const validators = {
    name: (value) => {
      const inputValue = value.trim();
      if (!inputValue) return "Cannot be empty";
      return NAME_RE.test(inputValue) ? "" : "Enter a valid name";
    },
    email: (value) => {
      const inputValue = value.trim();
      if (!inputValue) return "Cannot be empty";
      return EMAIL_RE.test(inputValue) ? "" : "Enter a valid email";
    },
    phone: (value) => {
      const inputValue = value.trim();
      if (!inputValue) return "Cannot be empty";
      return PHONE_ALLOWED_RE.test(inputValue) && hasValidPhoneDigits(inputValue) ? "" : "Enter a valid phone number";
    },
    address: (value) => {
      const inputValue = value.trim();
      if (!inputValue) return "Cannot be empty";
      return ADDRESS_RE.test(inputValue) ? "" : "Enter a valid street address";
    },
    zip: (value) => {
      const inputValue = value.trim();
      if (!inputValue) return "Cannot be empty";
      return ZIP_RE.test(inputValue) ? "" : "Enter a valid ZIP code";
    },
    city: (value) => {
      const inputValue = value.trim();
      if (!inputValue) return "Cannot be empty";
      return PLACE_RE.test(inputValue) ? "" : "Enter a valid city";
    },
    country: (value) => {
      const inputValue = value.trim();
      if (!inputValue) return "Cannot be empty";
      return PLACE_RE.test(inputValue) ? "" : "Enter a valid country";
    },
    eMoneyNum: (value) => (cashExtra.hidden ? (/^\d{9}$/.test(value.trim()) ? "" : "9 digits required") : ""),
    eMoneyPin: (value) => (cashExtra.hidden ? (/^\d{4}$/.test(value.trim()) ? "" : "4 digits required") : "")
  };
  const touchedFields = new Set();
  let hasSubmittedOrder = false;

  const showFieldError = (name, message) => {
    const errEl = document.querySelector(`[data-err="${name}"]`);
    const input = form.elements[name];
    if (errEl) errEl.textContent = message;
    if (input && input.type !== "radio") {
      input.classList.toggle("input-error", !!message);
    }
  };

  const clearFieldError = (name) => showFieldError(name, "");

  const validateField = (name, { markTouched = false } = {}) => {
    const input = form.elements[name];
    const validate = validators[name];
    if (!input || !validate) return true;
    if (markTouched) touchedFields.add(name);
    const msg = validate(input.value);
    showFieldError(name, msg);
    return !msg;
  };

  const validateAll = () => {
    let valid = true;
    for (const name of Object.keys(validators)) {
      if (!validateField(name, { markTouched: true })) {
        valid = false;
      }
    }
    return valid;
  };

  const focusFirstInvalidField = () => {
    for (const name of Object.keys(validators)) {
      const input = form.elements[name];
      if (input instanceof HTMLElement && input.classList.contains("input-error")) {
        input.focus();
        return;
      }
    }
  };

  Object.keys(validators).forEach((name) => {
    const input = form.elements[name];
    if (input && input.type !== "radio") {
      input.addEventListener("input", () => {
        if (!input.value.trim() && !touchedFields.has(name)) {
          clearFieldError(name);
          return;
        }
        validateField(name);
      });
      input.addEventListener("blur", () => {
        validateField(name, { markTouched: true });
      });
    }
  });

  paymentRadios.forEach((radio) => {
    radio.addEventListener("change", syncPaymentState);
  });
  syncPaymentState();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (hasSubmittedOrder) return;

    syncPaymentState();
    if (!validateAll()) {
      focusFirstInvalidField();
      return;
    }

    const payload = Object.fromEntries(new FormData(form).entries());

    saveOrder({
      id: generateOrderId(),
      date: new Date().toISOString(),
      paymentMethod: payload.payment,
      items: state.cartItems.map((item) => ({ ...item })),
      total: cartTotal(),
      shipping,
      vat,
      grand,
      status: "awaiting",
      shippingAddress: {
        name: payload.name,
        email: payload.email,
        address: payload.address,
        city: payload.city,
        zip: payload.zip,
        country: payload.country
      }
    });

    hasSubmittedOrder = true;
    clearCart();
    syncCartCount();
    renderCartItems();
    placeOrder.disabled = true;

    touchedFields.clear();
    form.reset();
    Object.keys(validators).forEach((name) => clearFieldError(name));
    if (summaryItems) summaryItems.innerHTML = "";
    if (summaryTotal) summaryTotal.textContent = formatPrice(0);
    if (summaryShipping) summaryShipping.textContent = formatPrice(0);
    if (summaryVat) summaryVat.textContent = formatPrice(0);
    if (summaryGrand) summaryGrand.textContent = formatPrice(0);
    if (paymentRadios[0]) paymentRadios[0].checked = true;
    syncPaymentState();

    successModalController.open();
  });

  if (successHome)
    successHome.addEventListener("click", () => {
      clearCart();
      syncCartCount();
      renderCartItems();
      successModalController.close();
    });
}
