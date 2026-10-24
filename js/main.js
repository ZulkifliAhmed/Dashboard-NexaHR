
/* ==============================
   Toggle Aside
============================== */

const btn = document.querySelector(".big");
const toggleAside = document.querySelector("aside");

if (btn && toggleAside) {
    btn.addEventListener("click", function () {
        toggleAside.classList.toggle("toggleAside");
    });
}

/* ==============================
   Show Mobile Navigation
============================== */

const showNav = document.querySelector(".mobile");
const mobileNav = document.querySelector("aside");
const closeNav = document.querySelector(".close");

if (showNav && mobileNav) {
    showNav.addEventListener("click", function () {
        mobileNav.style.left = "0";
    });
}

if (closeNav && mobileNav) {
    closeNav.addEventListener("click", function () {
        mobileNav.style.left = "-200px";
    });
}


/* ==============================
   User Dropdown Menu
============================== */

const userInfo = document.querySelector(".userInfo");
const userTrigger = document.querySelector(".userInfo-trigger");

if (userInfo && userTrigger) {
    userTrigger.addEventListener("click", () => {
        const isOpen = userInfo.classList.toggle("active");

        userTrigger.setAttribute("aria-expanded", isOpen);
    });

    document.addEventListener("click", (event) => {
        if (!userInfo.contains(event.target)) {
            userInfo.classList.remove("active");
            userTrigger.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            userInfo.classList.remove("active");
            userTrigger.setAttribute("aria-expanded", "false");
        }
    });
}


/* ==============================
   Aside Active Links
============================== */

const asideNav = document.querySelectorAll("nav li");

asideNav.forEach((item) => {
    item.addEventListener("click", function () {
        asideNav.forEach((element) => {
            element.classList.remove("active");
        });

        this.classList.add("active");
    });
});


/* ==============================
   Data Management
============================== */

let dataPromise = null;

function fetchData() {
    // Reuse the existing request instead of fetching data.json repeatedly.
    if (!dataPromise) {
        dataPromise = fetch("./data.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load data.json");
                }

                return response.json();
            })
            .catch((error) => {
                dataPromise = null;
                throw error;
            });
    }

    return dataPromise;
}


/* ==============================
   Notifications
============================== */

async function updateNotificationCount() {
    try {
        const data = await fetchData();
        const notifications = data.notifications ?? [];

        const unreadCount = notifications.filter(
            (notification) => notification.read === false
        ).length;

        const notificationElements = document.querySelectorAll(
            "aside nav .sideBarNotifi, main header .right .notifi"
        );

        notificationElements.forEach((element) => {
            element.dataset.count = unreadCount;
        });
    } catch (error) {
        console.error("Error loading notifications:", error);
    }
}

updateNotificationCount();


/* ==============================
   Global Employee Search
============================== */

const globalSearch = document.querySelector("#globalSearch");
const searchResults = document.querySelector("#searchResults");

if (globalSearch && searchResults) {
    // Display the search results dropdown.
    function showSearchResults() {
        searchResults.classList.add("show");
        globalSearch.setAttribute("aria-expanded", "true");
    }

    // Hide the search results dropdown.
    function hideSearchResults() {
        searchResults.classList.remove("show");
        globalSearch.setAttribute("aria-expanded", "false");
    }

    // Get searchable values from an employee.
    function getEmployeeSearchText(employee) {
        return [
            employee.name,
            employee.id,
            employee.email,
            employee.department,
            employee.position
        ]
            .filter((value) => value !== undefined && value !== null)
            .join(" ")
            .toLowerCase();
    }

    // Render matching employees.
    function renderSearchResults(employees, query) {
        const normalizedQuery = query.trim().toLowerCase();

        const matches = employees
            .filter((employee) => {
                return getEmployeeSearchText(employee).includes(
                    normalizedQuery
                );
            })
            .slice(0, 8);

        searchResults.replaceChildren();

        if (matches.length === 0) {
            const message = document.createElement("div");

            message.className = "noResults";
            message.textContent = "No employees found.";

            searchResults.appendChild(message);
            showSearchResults();
            return;
        }

        matches.forEach((employee) => {
            const link = document.createElement("a");
            link.className = "searchResult";
            link.href = "employees.html";
            link.setAttribute("role", "option");

            const avatar = document.createElement("div");
            avatar.className = "resultAvatar";

            const avatarIcon = document.createElement("i");
            avatarIcon.className = "fa-solid fa-user";

            avatar.appendChild(avatarIcon);

            const info = document.createElement("div");
            info.className = "resultInfo";

            const name = document.createElement("h4");
            name.textContent =
                employee.name ??
                "Unnamed employee";
                
            const details = document.createElement("p");
            details.textContent = [
                employee.jobTitle ?? employee.position,
                employee.department
            ]
                .filter(Boolean)
                .join(" · ");

            info.append(name, details);
            link.append(avatar, info);
            searchResults.appendChild(link);
        });

        showSearchResults();
    }

    // Search using the data already loaded by fetchData().
    globalSearch.addEventListener("input", async function () {
        const query = this.value.trim();

        if (!query) {
            searchResults.replaceChildren();
            hideSearchResults();
            return;
        }

        try {
            const data = await fetchData();
            const employees = data.employees ?? [];

            renderSearchResults(employees, query);
        } catch (error) {
            console.error("Error searching employees:", error);

            searchResults.replaceChildren();

            const message = document.createElement("div");
            message.className = "noResults";
            message.textContent = "Unable to load employees.";

            searchResults.appendChild(message);
            showSearchResults();
        }
    });

    // Close results when clicking outside the search area.
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".search")) {
            hideSearchResults();
        }
    });

    // Close results with Escape.
    globalSearch.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            hideSearchResults();
            globalSearch.blur();
        }
    });
}
