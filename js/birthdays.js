
// ========== DOM Elements & Variables ==========

const birthdayTableBody = document.querySelector("#birthdayTableBody");
const birthdaySearch = document.querySelector("#birthdaySearch");

const birthdayResults = document.querySelector("#birthdayResults");
const totalEmployees = document.querySelector("#totalEmployees");
const monthlyBirthdays = document.querySelector("#monthlyBirthdays");
const upcomingCount = document.querySelector("#upcomingCount");

let allEmployees = [];


// Get the next birthday date for an employee
function getNextBirthday(birthdayValue) {
    if (!birthdayValue) return null;

    const [, month, day] = birthdayValue.split("-").map(Number);

    if (!month || !day) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextBirthday = new Date(today.getFullYear(), month - 1, day);

    // Move the birthday to next year if it has already passed
    if (nextBirthday < today) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return nextBirthday;
}

// Calculate the number of days until a birthday
function getDaysUntilBirthday(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round((date - today) / (1000 * 60 * 60 * 24));
}

// ========== Birthday Formatting Functions ==========

// Format birthday without the year
function formatBirthday(birthdayValue) {
    if (!birthdayValue) return "Not provided";

    const [, month, day] = birthdayValue.split("-").map(Number);

    if (!month || !day) return "Not provided";

    const date = new Date(2000, month - 1, day);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

// Format the next birthday with the year
function formatFullDate(date) {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// Get the birthday status based on remaining days
function getBirthdayStatus(date) {
    const days = getDaysUntilBirthday(date);

    if (days === 0) {
        return '<span class="birthdayBadge today">Today!</span>';
    }

    if (days <= 7) {
        return `<span class="birthdayBadge soon">In ${days} days</span>`;
    }

    return `<span class="birthdayBadge">${days} days left</span>`;
}


// ========== Birthday Statistics ==========

function updateBirthdayStats(employees) {
    const currentMonth = new Date().getMonth() + 1;

    // Count birthdays in the current month
    const monthlyCount = employees.filter(employee => {
        if (!employee.birthday) return false;

        const [, month] = employee.birthday.split("-").map(Number);

        return month === currentMonth;
    }).length;

    // Count birthdays within the next 30 days
    const upcoming = employees.filter(employee => {
        const nextBirthday = getNextBirthday(employee.birthday);

        return nextBirthday && getDaysUntilBirthday(nextBirthday) <= 30;
    }).length;

    // Update statistics in HTML
    totalEmployees.textContent = employees.length;
    monthlyBirthdays.textContent = monthlyCount;
    upcomingCount.textContent = upcoming;
}

// ========== Render Birthdays ==========

function renderBirthdays(employees) {

    // Calculate and sort upcoming birthdays
    const validEmployees = employees.map(employee => ({...employee,
            nextBirthday: getNextBirthday(employee.birthday)}))
            .filter(employee => employee.nextBirthday)
            .sort((a, b) => a.nextBirthday - b.nextBirthday);

    if (validEmployees.length === 0) {
        birthdayTableBody.innerHTML = `
            <tr>
                <td colspan="5">No birthdays found.</td>
            </tr>
        `;

        birthdayResults.textContent = "Showing 0 employees";
        return;
    }

    // Generate employee table rows
    birthdayTableBody.innerHTML = validEmployees.map(employee => `
        <tr>
            <td>
                <div class="birthdayEmployee">
                    <img
                        src="${employee.image || "assets/avatar.png"}"
                        alt="${employee.name}"
                        onerror="this.onerror=null;this.src='assets/avatar.png';"
                    >

                    <div>
                        <h4>${employee.name}</h4>
                        <p>${employee.email || ""}</p>
                    </div>
                </div>
            </td>

            <td>${employee.department || "N/A"}</td>

            <td>${formatBirthday(employee.birthday)}</td>

            <td>${formatFullDate(employee.nextBirthday)}</td>

            <td>${getBirthdayStatus(employee.nextBirthday)}</td>
        </tr>
    `).join("");
 
    birthdayResults.textContent = `Showing ${validEmployees.length} employees`;
}


// ========== Load Birthdays Data ==========

async function loadBirthdays() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        allEmployees = data.employees || [];

        // Update statistics and display birthdays
        updateBirthdayStats(allEmployees);
        renderBirthdays(allEmployees);

    } catch (error) {
        console.error("Error loading birthdays:", error);

        birthdayTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load employee data. Please try again.
                </td>
            </tr>
        `;
    }
}


// ========== Search Birthdays ==========

birthdaySearch.addEventListener("input", function () {
    const searchValue = this.value.trim().toLowerCase();

    // Filter employees by name or department
    const filteredEmployees = allEmployees.filter(employee =>(employee.name || "")
        .toLowerCase().includes(searchValue) ||
        (employee.department || "").toLowerCase().includes(searchValue)
    );

    renderBirthdays(filteredEmployees);
});


// ========== Initialize Birthdays ==========

loadBirthdays();
