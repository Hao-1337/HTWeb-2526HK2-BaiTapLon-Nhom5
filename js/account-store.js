const ACCOUNTS_KEY = "audiophile_accounts";
const SESSION_KEY = "audiophile_account";

function createDemoCompletedOrder(name, email) {
    return {
        id: "ORD-DEMO01",
        date: "2026-03-20T09:30:00Z",
        paymentMethod: "cash",
        items: [
            {
                id: "zx7-speaker",
                short: "ZX7 Speaker",
                cartImg: "cart/image-zx7-speaker.jpg",
                price: 3500,
                qty: 1
            }
        ],
        total: 3500,
        shipping: 50,
        vat: 700,
        grand: 4250,
        status: "complete",
        shippingAddress: {
            name,
            email,
            address: "1137 Williams Avenue",
            city: "New York",
            zip: "10001",
            country: "United States"
        }
    };
}

function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {};
    } catch {
        return {};
    }
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function nameFromEmail(email) {
    const prefix = email.split("@")[0];
    const readable = prefix.replace(/[._-]+/g, " ").trim();
    return readable.charAt(0).toUpperCase() + readable.slice(1);
}

export function getAccountSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    return getAccountSession() !== null;
}

export function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = getAccounts();

    if (accounts[normalizedEmail]) {
        if (accounts[normalizedEmail].password !== password) {
            return { success: false, error: "Incorrect password for this account" };
        }
        if (!Array.isArray(accounts[normalizedEmail].orders) || accounts[normalizedEmail].orders.length === 0) {
            accounts[normalizedEmail].orders = [createDemoCompletedOrder(accounts[normalizedEmail].name, normalizedEmail)];
            saveAccounts(accounts);
        }
        const session = { email: normalizedEmail, name: accounts[normalizedEmail].name };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, session, isNew: false };
    }

    const name = nameFromEmail(normalizedEmail);
    accounts[normalizedEmail] = {
        email: normalizedEmail,
        password,
        name,
        orders: [createDemoCompletedOrder(name, normalizedEmail)]
    };
    saveAccounts(accounts);
    const session = { email: normalizedEmail, name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, session, isNew: true };
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

export function getOrders() {
    const session = getAccountSession();
    if (!session) return [];
    const accounts = getAccounts();
    return accounts[session.email]?.orders || [];
}

export function saveOrder(order) {
    const session = getAccountSession();
    if (!session) return;
    const accounts = getAccounts();
    if (!accounts[session.email]) return;
    accounts[session.email].orders.unshift(order);
    saveAccounts(accounts);
}

export function removeOrder(orderId) {
    const session = getAccountSession();
    if (!session) return false;

    const accounts = getAccounts();
    const account = accounts[session.email];
    if (!account || !Array.isArray(account.orders)) return false;

    const beforeCount = account.orders.length;
    account.orders = account.orders.filter((order) => order.id !== orderId);

    if (account.orders.length === beforeCount) return false;

    saveAccounts(accounts);
    return true;
}

export function generateOrderId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "ORD-";
    for (let i = 0; i < 6; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}
