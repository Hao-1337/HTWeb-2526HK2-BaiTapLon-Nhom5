import { getAccountSession, isLoggedIn, login, logout, getOrders, removeOrder } from "../account-store.js";
import { cloneTemplateContent, formatPrice } from "../render.js";

function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function renderOrderCard(order) {
    const firstItem = order.items[0];
    const extraCount = order.items.length - 1;
    const statusClass = order.status === "complete" ? "status-complete" : "status-awaiting";
    const statusLabel = order.status === "complete" ? "Delivered" : "Awaiting Delivery";
    const paymentMethod = order.paymentMethod || "cash";
    const paymentLabel = paymentMethod === "e-money" ? "e-Payment" : "Cash on Delivery";

    return `
        <article class="order-card" data-order-id="${order.id}" data-payment-method="${paymentMethod}" data-order-status="${order.status}">
            <div class="order-card-header">
                <span class="order-id">${order.id}</span>
                <span class="order-date">${formatDate(order.date)}</span>
                <span class="order-status ${statusClass}">${statusLabel}</span>
            </div>
            <div class="order-card-body">
                <div class="order-items-preview">
                    <img src="./assets/${firstItem.cartImg}" alt="${firstItem.short}" />
                    <div class="order-item-info">
                        <strong>${firstItem.short}</strong>
                        <span>${formatPrice(firstItem.price)} &times; ${firstItem.qty}</span>
                    </div>
                    ${extraCount > 0 ? `<span class="order-extra-items">+${extraCount} more item${extraCount > 1 ? "s" : ""}</span>` : ""}
                </div>
                <div class="order-total-info">
                    <span class="order-payment">${paymentLabel}</span>
                    <span>Grand Total</span>
                    <strong>${formatPrice(order.grand)}</strong>
                </div>
                <div class="order-actions">
                    <button class="btn btn-dark order-cancel" type="button" data-cancel-order ${order.status === "complete" ? "disabled" : ""}>Cancel Order</button>
                    <p class="order-cancel-tooltip" data-cancel-tooltip role="alert" hidden>
                        Only awaiting e-payment orders can be canceled.
                    </p>
                </div>
            </div>
        </article>
`;
}

function renderOrders(filter) {
    const container = document.querySelector("[data-orders-list]");
    if (!container) return;

    const orders = getOrders().filter((o) => (filter === "all" ? true : o.status === filter));
    if (!orders.length) {
        container.innerHTML = `<p class="orders-empty">No orders here yet.</p>`;
        return;
    }
    container.innerHTML = orders.map(renderOrderCard).join("");
}

function showCancelErrorTooltip(card) {
    const tooltip = card.querySelector("[data-cancel-tooltip]");
    if (!tooltip) return;

    tooltip.hidden = false;
    window.clearTimeout(tooltip._hideTimerId);
    tooltip._hideTimerId = window.setTimeout(() => {
        tooltip.hidden = true;
    }, 2200);
}

function initOrderCancelHandlers(tabs) {
    const list = document.querySelector("[data-orders-list]");
    if (!list) return;

    list.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-cancel-order]");
        if (!btn) return;

        const card = btn.closest("[data-order-id]");
        if (!card) return;

        const paymentMethod = card.dataset.paymentMethod;
        const orderStatus = card.dataset.orderStatus;
        if (paymentMethod !== "e-money" || orderStatus === "complete") {
            showCancelErrorTooltip(card);
            return;
        }

        const orderId = card.dataset.orderId;
        if (!orderId) return;

        const removed = removeOrder(orderId);
        if (!removed) return;

        const activeTab = [...tabs].find((tab) => tab.hasAttribute("data-active"));
        renderOrders(activeTab?.dataset.tab || "all");
    });
}

function initDashboard(isNew = false) {
    const session = getAccountSession();
    const root = document.querySelector("[data-page-content]");
    if (!root) return;

    root.replaceChildren(cloneTemplateContent("account-dashboard-template"));

    const nameEl = document.querySelector("[data-account-name]");
    const emailEl = document.querySelector("[data-account-email]");
    const logoutBtn = document.querySelector("[data-logout]");
    const tabs = document.querySelectorAll("[data-tab]");
    const welcomeBanner = document.querySelector("[data-welcome-banner]");
    const avatar = document.querySelector("[data-account-avatar]");

    if (nameEl) nameEl.textContent = session.name;
    if (emailEl) emailEl.textContent = session.email;
    if (avatar instanceof HTMLImageElement) {
        avatar.src = "./assets/dbtheme.jpg";
        avatar.alt = `${session.name} profile picture`;
        avatar.onerror = () => {
            avatar.src = "./assets/shared/desktop/icon-account.svg";
            avatar.alt = "Account";
        };
    }
    if (welcomeBanner) {
        welcomeBanner.hidden = !isNew;
        if (isNew) welcomeBanner.textContent = `Welcome, ${session.name}! Your account has been created.`;
    }

    renderOrders("all");
    initOrderCancelHandlers(tabs);

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.removeAttribute("data-active"));
            tab.setAttribute("data-active", "true");
            renderOrders(tab.dataset.tab);
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logout();
            const accountLink = document.querySelector("[data-account-link]");
            const accountIcon = accountLink?.querySelector("img");
            if (accountLink) {
                accountLink.setAttribute("data-logged-in", "false");
            }
            if (accountIcon) {
                accountIcon.src = "./assets/shared/desktop/icon-account.svg";
                accountIcon.alt = "Account";
            }
            initLogin();
        });
    }
}

const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

const loginValidators = {
    email: (v) => {
        if (!v.trim()) return "Cannot be empty";
        return EMAIL_RE.test(v.trim()) ? "" : "Enter a valid email address";
    },
    password: (v) => {
        if (!v) return "Cannot be empty";
        return v.length >= 6 ? "" : "Must be at least 6 characters";
    },
};

function initLogin() {
    const root = document.querySelector("[data-page-content]");
    if (!root) return;

    root.replaceChildren(cloneTemplateContent("account-login-template"));

    const form = document.querySelector("[data-login-form]");
    const globalErrorEl = document.querySelector("[data-login-error]");

    if (!form) return;

    const touched = new Set();

    const showFieldError = (name, msg) => {
        const errEl = document.querySelector(`[data-err="${name}"]`);
        const input = form.elements[name];
        if (errEl) errEl.textContent = msg;
        if (input) input.classList.toggle("input-error", !!msg);
    };

    const validateField = (name, markTouched = false) => {
        if (markTouched) touched.add(name);
        if (!touched.has(name)) return true;
        const input = form.elements[name];
        if (!input) return true;
        const msg = loginValidators[name](input.value);
        showFieldError(name, msg);
        return !msg;
    };

    const focusFirstInvalidField = () => {
        for (const name of Object.keys(loginValidators)) {
            const input = form.elements[name];
            if (input instanceof HTMLElement && input.classList.contains("input-error")) return input.focus();
        }
    };

    ["email", "password"].forEach((name) => {
        const input = form.elements[name];
        if (!input) return;
        input.addEventListener("input", () => {
            if (globalErrorEl) globalErrorEl.textContent = "";
            validateField(name);
        });
        input.addEventListener("blur", () => validateField(name, true));
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (globalErrorEl) globalErrorEl.textContent = "";
        const emailOk = validateField("email", true);
        const passwordOk = validateField("password", true);
        if (!emailOk || !passwordOk) return focusFirstInvalidField();

        const result = login(form.elements.email.value, form.elements.password.value);

        if (result.success) {
            const accountLink = document.querySelector("[data-account-link]");
            const accountIcon = accountLink?.querySelector("img");
            if (accountLink) accountLink.setAttribute("data-logged-in", "true");
            if (accountIcon) {
                accountIcon.src = "./assets/dbtheme.jpg";
                accountIcon.alt = "Profile picture";
                accountIcon.onerror = () => {
                    accountIcon.src = "./assets/shared/desktop/icon-account.svg";
                    accountIcon.alt = "Account";
                };
            }

            const params = new URLSearchParams(window.location.search);
            const next = params.get("next");
            if (next === "checkout") {
                window.location.href = "./checkout.html";
                return;
            }

            initDashboard(result.isNew);
        } else if (globalErrorEl) globalErrorEl.textContent = result.error;
    });
}

export async function initAccountPage() {
    if (isLoggedIn()) initDashboard();
    else initLogin();
}
