// ========== Notifications Data ==========

const notificationList = document.querySelector("#notificationList");
const totalNotifications = document.querySelector("#totalNotifications");
const unreadNotifications = document.querySelector("#unreadNotifications");
const readNotifications = document.querySelector("#readNotifications");

const notificationSearch = document.querySelector("#notificationSearch");
const notificationTypeFilter = document.querySelector("#notificationTypeFilter");
const notificationStatusFilter = document.querySelector("#notificationStatusFilter");
const clearNotificationFilters = document.querySelector("#clearNotificationFilters");

const notificationResultsText = document.querySelector("#notificationResultsText");
const notificationsEmpty = document.querySelector("#notificationsEmpty");

const markAllReadBtn = document.querySelector("#markAllRead");
const deleteReadBtn = document.querySelector("#deleteRead");

const STATUS_KEY = "nexahrNotificationStatuses";
const DELETED_KEY = "nexahrDeletedNotifications";

let notifications = [];
let deletedNotifications = [];
let notificationStatuses = {};



// ========== Load Notifications ==========

async function LoadNotifications() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) throw new Error("Failed to load data.json");

        const data = await response.json();
        notifications = data.notifications;

        if (!Array.isArray(notifications)) {
            throw new Error("Notifications data is invalid");
        }

        populateTypes();
        renderNotifications();

    } catch (error) {
        console.error("Notifications error:", error);

        notificationResultsText.textContent =
            "Failed to load notifications. Check data.json and use Live Server.";

        notificationList.innerHTML = `
            <div class="notificationMessage error">
                Unable to load notifications.
            </div>
        `;

        notificationsEmpty.hidden = true;
    }
}

// ========== Load Saved Data ==========

try {
    notificationStatuses = JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
    deletedNotifications = JSON.parse(localStorage.getItem(DELETED_KEY)) || [];

    if (
        typeof notificationStatuses !== "object" ||
        notificationStatuses === null ||
        Array.isArray(notificationStatuses)
    ) {
        notificationStatuses = {};
    }

    if (!Array.isArray(deletedNotifications)) {
        deletedNotifications = [];
    }
} catch {
    notificationStatuses = {};
    deletedNotifications = [];
}

// ========== Helpers ==========

function escapeHTML(value) {
    const characters = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value ?? "").replace(/[&<>"']/g, char => characters[char]);
}

function getNotificationIcon(type) {
    const icons = {
        leave: ["fa-calendar-check", "warning"],
        birthday: ["fa-user", "info"],
        employee: ["fa-user", "info"],
        report: ["fa-bell", "info"]
    };

    return icons[type] || ["fa-bell", "info"];
}

function formatDate(date) {
    if (!date) return "Date unavailable";

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) return date;

    return formattedDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function isRead(notification) {
    return notificationStatuses[notification.id] ?? notification.read === true;
}

function getVisibleNotifications() {
    return notifications.filter(notification =>
        !deletedNotifications.includes(String(notification.id))
    );
}

// ========== Save Data ==========

function saveStatuses() {
    localStorage.setItem(STATUS_KEY, JSON.stringify(notificationStatuses));
}

function saveDeleted() {
    localStorage.setItem(DELETED_KEY, JSON.stringify(deletedNotifications));
}

// ========== Update Statistics ==========

function updateStats() {
    const visible = getVisibleNotifications();
    const unread = visible.filter(notification => !isRead(notification)).length;
    const read = visible.length - unread;

    totalNotifications.textContent = visible.length;
    unreadNotifications.textContent = unread;
    readNotifications.textContent = read;

    document.querySelectorAll(".sideBarNotifi, header .notifi").forEach(element => {
        element.dataset.count = unread;
    });

    markAllReadBtn.disabled = unread === 0;
    deleteReadBtn.disabled = read === 0;

    markAllReadBtn.style.opacity = unread === 0 ? ".6" : "1";
    deleteReadBtn.style.opacity = read === 0 ? ".6" : "1";
}

// ========== Notification Types ==========

function populateTypes() {
    const selectedType = notificationTypeFilter.value;
    const types = [...new Set(notifications.map(notification => notification.type))];

    notificationTypeFilter.innerHTML = '<option value="all">All types</option>';

    types.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        notificationTypeFilter.appendChild(option);
    });

    if (types.includes(selectedType)) {
        notificationTypeFilter.value = selectedType;
    }
}

// ========== Render Notifications ==========

function renderNotifications() {
    const search = notificationSearch.value.trim().toLowerCase();
    const type = notificationTypeFilter.value;
    const status = notificationStatusFilter.value;
    const visible = getVisibleNotifications();

    const filtered = visible.filter(notification => {
        const matchesSearch = [
            notification.title,
            notification.message,
            notification.type,
            notification.id
        ].some(value => String(value ?? "").toLowerCase().includes(search));

        const matchesType = type === "all" || notification.type === type;
        const matchesStatus =  status === "all" ||
            (status === "read" && isRead(notification)) ||
            (status === "unread" && !isRead(notification));

        return matchesSearch && matchesType && matchesStatus;
    });

    notificationList.innerHTML = "";

    notificationsEmpty.hidden = filtered.length > 0;

    notificationResultsText.textContent =
        `Showing ${filtered.length} of ${visible.length} notifications`;

    filtered.forEach(notification => {
        const read = isRead(notification);
        const [icon, color] = getNotificationIcon(notification.type);
        const item = document.createElement("article");

        item.className = `notificationItem ${read ? "read" : "unread"}`;
        item.dataset.id = notification.id;

        item.innerHTML = `
            <div class="notificationIcon ${color}">
                <i class="fa-solid ${icon}"></i>
            </div>

            <div class="notificationDetails">
                <h4>
                    ${escapeHTML(notification.title)}
                    ${read ? "" : '<span class="notificationUnreadDot"></span>'}
                </h4>

                <p>${escapeHTML(notification.message || "No additional details.")}</p>

                <div class="notificationMeta">
                    <span class="notificationType">
                        ${escapeHTML(notification.type)}
                    </span>

                    <span class="notificationTime">
                        <i class="fa-regular fa-clock"></i>
                        ${escapeHTML(formatDate(notification.date))}
                    </span>
                </div>
            </div>

            <div class="notificationActions">
                ${read ? "" : `
                    <button type="button" class="notificationActionBtn markRead"
                        data-action="read" aria-label="Mark as read" title="Mark as read">
                        <i class="fa-solid fa-check"></i>
                    </button>
                `}

                <button type="button" class="notificationActionBtn delete"
                    data-action="delete" aria-label="Delete notification"
                    title="Delete notification">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `;

        notificationList.appendChild(item);
    });

    updateStats();
}

// ========== Notification Actions ==========

function markAllAsRead() {
    getVisibleNotifications().forEach(notification => {
        notificationStatuses[notification.id] = true;
    });

    saveStatuses();
    renderNotifications();
}

function deleteReadNotifications() {
    const readItems = getVisibleNotifications().filter(isRead);

    if (!readItems.length) return;

    if (!confirm("Are you sure you want to delete all read notifications?")) {
        return;
    }

    deletedNotifications.push(
        ...readItems.map(notification => String(notification.id))
    );

    saveDeleted();
    renderNotifications();
}

function clearFilters() {
    notificationSearch.value = "";
    notificationTypeFilter.value = "all";
    notificationStatusFilter.value = "all";

    renderNotifications();
}

// ========== Event Listeners ==========

notificationSearch.addEventListener("input", renderNotifications);
notificationTypeFilter.addEventListener("change", renderNotifications);
notificationStatusFilter.addEventListener("change", renderNotifications);

clearNotificationFilters.addEventListener("click", clearFilters);
markAllReadBtn.addEventListener("click", markAllAsRead);
deleteReadBtn.addEventListener("click", deleteReadNotifications);

notificationList.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const item = button.closest(".notificationItem");
    const id = item.dataset.id;

    if (button.dataset.action === "read") {
        notificationStatuses[id] = true;
        saveStatuses();
    }

    if (button.dataset.action === "delete") {
        if (!confirm("Are you sure you want to delete this notification?")) {
            return;
        }

        deletedNotifications.push(id);
        saveDeleted();
    }

    renderNotifications();
});


// ========== Start ==========

LoadNotifications();