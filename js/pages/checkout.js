import { getState, cartTotal, clearCart } from "../store.js";
import { formatPrice, syncCartCount, renderCartItems, categoryNavMarkup } from "../render.js";
import { createModalController } from "../render.js";

export async function initCheckoutPage() {
    const root = document.querySelector("[data-page-content]");
    const state = getState();
    const hasItems = state.cartItems.length > 0;
    const shipping = 50;
    const vat = Math.round(cartTotal() * 0.2);
    const grand = cartTotal() + shipping + vat;

    if (!hasItems) {
        document.title = "Checkout - No items in cart";
        root.innerHTML = `
      <section class="container checkout-layout checkout-empty">
        <button class="go-back" type="button" data-go-back>< Go Back</button>
        <h4>No items in your cart. Please add items to proceed to checkout.</h4>
      </section>
    ` + categoryNavMarkup({ withContainer: true });
        const goBackBtn = document.querySelector("[data-go-back]");
        if (goBackBtn) {
            goBackBtn.addEventListener("click", () => {
                window.history.back();
            });
        }
        return;
    }

    root.innerHTML = `
    <section class="container checkout-layout">
      <button class="go-back" type="button" data-go-back>< Go Back</button>
      <form class="checkout-form" data-checkout-form id="checkout-form">
        <h1>Checkout</h1>
        <h3 class="form-group-title">Billing Details</h3>
        <div class="form-grid">
          <label>
            <span class="label-row"><span>Name</span><span class="form-error" data-err="name"></span></span>
            <input name="name" required placeholder="Alexei Ward" />
          </label>
          <label>
            <span class="label-row"><span>Email Address</span><span class="form-error" data-err="email"></span></span>
            <input name="email" type="email" required placeholder="alexei@mail.com" />
          </label>
          <label>
            <span class="label-row"><span>Phone Number</span><span class="form-error" data-err="phone"></span></span>
            <input name="phone" required placeholder="+1 202-555-0136" />
          </label>
        </div>

        <h3 class="form-group-title">Shipping Info</h3>
        <div class="form-grid">
          <label class="span-2">
            <span class="label-row"><span>Address</span><span class="form-error" data-err="address"></span></span>
            <input name="address" required placeholder="1137 Williams Avenue" />
          </label>
          <label>
            <span class="label-row"><span>Zip Code</span><span class="form-error" data-err="zip"></span></span>
            <input name="zip" required placeholder="10001" />
          </label>
          <label>
            <span class="label-row"><span>City</span><span class="form-error" data-err="city"></span></span>
            <input name="city" required placeholder="New York" />
          </label>
          <label>
            <span class="label-row"><span>Country</span><span class="form-error" data-err="country"></span></span>
            <input name="country" required placeholder="United States" />
          </label>
        </div>

        <h3 class="form-group-title">Payment Details</h3>
        <div class="payment-grid">
          <p class="payment-method-label">Payment Method</p>
          <div class="payment-options">
            <label class="radio-option">
              <input type="radio" name="payment" value="e-money" checked data-payment-radio />
              e-Money
            </label>
            <label class="radio-option">
              <input type="radio" name="payment" value="cash" data-payment-radio />
              Cash on Delivery
            </label>
          </div>
        </div>

        <div class="payment-extra" data-payment-extra>
          <div class="form-grid">
            <label>
              <span class="label-row"><span>e-Money Number</span><span class="form-error" data-err="eMoneyNum"></span></span>
              <input name="eMoneyNum" data-emoney-num placeholder="238521993" />
            </label>
            <label>
              <span class="label-row"><span>e-Money PIN</span><span class="form-error" data-err="eMoneyPin"></span></span>
              <input name="eMoneyPin" data-emoney-pin placeholder="6891" />
            </label>
          </div>
        </div>

        <div class="cash-extra" data-cash-extra hidden>
          <p>
            The Cash on Delivery option enables you to pay in cash when our delivery courier arrives
            at your residence. Just make sure your address is correct so that your order will not be cancelled.
          </p>
        </div>
      </form>

      <aside class="summary">
        <h2>Summary</h2>
        <div class="summary-items">
          ${
              state.cartItems
                  .map(
                      (item) => `
                <article class="summary-item">
                  <img src="/assets/${item.cartImg}" alt="${item.short}" />
                  <div>
                    <h4>${item.short}</h4>
                    <p>${formatPrice(item.price)}</p>
                  </div>
                  <span>x${item.qty}</span>
                </article>
              `,
                  )
                  .join("") ||
              `
              <div class="checkout-empty">
                <iframe
                  title="checkout empty"
                  src="https://giphy.com/embed/nKERd2uhn8hhe"
                  width="240"
                  height="180"
                  style="pointer-events:none;border:0;"
                ></iframe>
                <button type="button" class="btn btn-dark" data-back-purchase><span>Back to Purchase</span></button>
              </div>
            `
          }
        </div>

        <div class="summary-line"><span>Total</span><strong>${formatPrice(cartTotal())}</strong></div>
        <div class="summary-line"><span>Shipping</span><strong>${formatPrice(shipping)}</strong></div>
        <div class="summary-line"><span>VAT (included)</span><strong>${formatPrice(vat)}</strong></div>
        <div class="summary-line grand"><span>Grand total</span><strong>${formatPrice(grand)}</strong></div>

        <button type="button" class="btn btn-primary" data-place-order ${hasItems ? "" : "disabled"}><span>Continue &amp; Pay</span></button>
      </aside>
    </section>

    <div class="success-modal" data-success hidden>
      <div class="success-panel" data-success-panel role="dialog" aria-modal="true" aria-label="Order success">
        <div class="success-icon">&#10003;</div>
        <h3>Thank you<br>for your order</h3>
        <p>You will receive an email confirmation shortly.</p>
        <div class="success-info">
          <ul class="success-items">
            ${state.cartItems
                .map(
                    (item) => `
                  <li class="success-item">
                    <img src="/assets/${item.cartImg}" alt="${item.short}" width="50" height="50" />
                    <p class="success-item-info">
                      ${item.short}
                      <span>${formatPrice(item.price)}</span>
                    </p>
                    <span>x${item.qty}</span>
                  </li>
                `,
                )
                .join("")}
          </ul>
          <div class="success-total">
            <p class="success-total-label">Grand Total</p>
            <span class="success-total-amount">${formatPrice(grand)}</span>
          </div>
        </div>
        <a class="btn btn-dark" data-success-home href="./index.html"><span>Back to Home</span></a>
      </div>
    </div>
  `;

    const placeOrder = document.querySelector("[data-place-order]");
    const form = document.querySelector("[data-checkout-form]");
    const goBackBtn = document.querySelector("[data-go-back]");
    const backPurchaseBtn = document.querySelector("[data-back-purchase]");
    const success = document.querySelector("[data-success]");
    const successPanel = document.querySelector("[data-success-panel]");
    const successHome = document.querySelector("[data-success-home]");
    const paymentRadios = document.querySelectorAll("[data-payment-radio]");
    const paymentExtra = document.querySelector("[data-payment-extra]");
    const cashExtra = document.querySelector("[data-cash-extra]");
    const eMoneyNum = document.querySelector("[data-emoney-num]");
    const eMoneyPin = document.querySelector("[data-emoney-pin]");

    const syncPaymentState = () => {
        const payment = form.elements.payment.value;
        const isEMoney = payment === "e-money";
        paymentExtra.hidden = !isEMoney;
        cashExtra.hidden = isEMoney;
        eMoneyNum.required = isEMoney;
        eMoneyPin.required = isEMoney;
    };

    paymentRadios.forEach((radio) => {
        radio.addEventListener("change", syncPaymentState);
    });
    syncPaymentState();

    const successModalController = createModalController({
        modal: success,
        panel: successPanel,
        trigger: placeOrder,
    });

    if (!placeOrder) {
        return;
    }

    goBackBtn.addEventListener("click", () => {
        window.history.back();
    });

    if (backPurchaseBtn) {
        backPurchaseBtn.addEventListener("click", () => {
            window.history.back();
        });
    }

    const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

    const validators = {
        name: (v) => (v.trim() ? "" : "Cannot be empty"),
        email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Wrong format"),
        phone: (v) => (PHONE_RE.test(v.trim()) ? "" : "Invalid phone number"),
        address: (v) => (v.trim() ? "" : "Cannot be empty"),
        zip: (v) => (/^\d{3,10}$/.test(v.trim()) ? "" : "Must be a number"),
        city: (v) => (v.trim() ? "" : "Cannot be empty"),
        country: (v) => (v.trim() ? "" : "Cannot be empty"),
        eMoneyNum: (v) => (cashExtra.hidden ? (/^\d{9}$/.test(v.trim()) ? "" : "9 digits required") : ""),
        eMoneyPin: (v) => (cashExtra.hidden ? (/^\d{4}$/.test(v.trim()) ? "" : "4 digits required") : ""),
    };

    const showFieldError = (name, message) => {
        const errEl = document.querySelector(`[data-err="${name}"]`);
        const input = form.elements[name];
        if (errEl) errEl.textContent = message;
        if (input && input.type !== "radio") {
            input.classList.toggle("input-error", !!message);
        }
    };

    const clearFieldError = (name) => showFieldError(name, "");

    const validateAll = () => {
        let valid = true;
        for (const [name, validate] of Object.entries(validators)) {
            const input = form.elements[name];
            if (!input) continue;
            const msg = validate(input.value);
            showFieldError(name, msg);
            if (msg) valid = false;
        }
        return valid;
    };

    // Clear errors on user input
    Object.keys(validators).forEach((name) => {
        const input = form.elements[name];
        if (input && input.type !== "radio") {
            input.addEventListener("input", () => clearFieldError(name));
        }
    });

    placeOrder.addEventListener("click", () => {
        syncPaymentState();
        if (!validateAll()) {
            // Scroll first error into view
            const firstError = form.querySelector(".input-error");
            if (firstError) firstError.focus();
            return;
        }

        const payload = Object.fromEntries(new FormData(form).entries());
        setTimeout(() => {
            alert(`just to make sure everything is collected correctly \n${JSON.stringify(payload)}`);
        }, 1200);

        successModalController.open();
    });

    if (successHome) {
        successHome.addEventListener("click", () => {
            clearCart();
            syncCartCount();
            renderCartItems();
            successModalController.close();
        });
    }
}
