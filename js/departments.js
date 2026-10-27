
/* ========== DOM Elements ========== */

const departmentGrid = document.querySelector("#departmentGrid");
const departmentSearch = document.querySelector("#departmentSearch");
const departmentModal = document.querySelector("#departmentModal");
const departmentForm = document.querySelector("#departmentForm");

const departmentName = document.querySelector("#departmentName");
const departmentManager = document.querySelector("#departmentManager");
const departmentLocation = document.querySelector("#departmentLocation");
const departmentBudget = document.querySelector("#departmentBudget");
const departmentFormMessage = document.querySelector("#departmentFormMessage");

/* ========== Data Management ========== */

let departments = [];
let employees = [];
let editingDepartmentId = null;

async function loadDepartments() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        const savedDepartments = localStorage.getItem("nexahrDepartments");

        departments = savedDepartments !== null
            ? JSON.parse(savedDepartments)
            : data.departments || [];

        employees = data.employees || [];

        renderDepartments();
    } catch (error) {
        console.error("Error loading departments:", error);

        departmentGrid.innerHTML = `
            <p class="departmentMessage">
                Failed to load departments. Please check data.json.
            </p>
        `;
    }
}

/* ========== Save Departments ========== */

function saveDepartments() {
    localStorage.setItem(
        "nexahrDepartments",
        JSON.stringify(departments)
    );
}

/* ========== Helper Functions ========== */

function escapeHTML(value) {
    // converted special characters into safe formats when inserting text into HTML.
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// Formatting the budget to make it easier to read.
function formatBudget(budget) {
    return Number(budget || 0).toLocaleString("en-US");
}

function getDepartmentEmployeeCount(departmentName) {
    return employees.filter(employee =>
        employee.department === departmentName
    ).length;
}

/* ========== Department Statistics ========== */

function updateDepartmentStats() {
    document.querySelector("#totalDepartments").textContent =
        departments.length;

    document.querySelector("#totalDepartmentEmployees").textContent =
        employees.length;

    const totalBudget = departments.reduce((total, department) => {
        return total + Number(department.budget || 0);
    }, 0);

    document.querySelector("#totalDepartmentBudget").textContent =  formatBudget(totalBudget);
}

/* ========== Render Departments ========== */

function renderDepartments() {
    const searchValue = departmentSearch.value.trim().toLowerCase();

    const filteredDepartments = departments.filter(department => {
        return [
            department.id,
            department.name,
            department.manager,
            department.location
        ].some(value =>  String(value || "").toLowerCase().includes(searchValue));
    });

    updateDepartmentStats();

    if (filteredDepartments.length === 0) {
        departmentGrid.innerHTML = `
            <p class="departmentMessage">
                No departments found.
            </p>
        `;
    } else {
        departmentGrid.innerHTML = filteredDepartments.map(department => {
            const employeeCount = getDepartmentEmployeeCount(department.name);

            return `
                <article class="departmentCard">

                    <div class="departmentCardTop">
                        <div class="departmentCardIcon">
                            <i class="fa-solid fa-building"></i>
                        </div>

                        <span class="departmentId">
                            ${escapeHTML(department.id)}
                        </span>
                    </div>

                    <h4>${escapeHTML(department.name)}</h4>

                    <p class="departmentCardSubtitle">
                        Department Overview
                    </p>

                    <div class="departmentDetails">

                        <div class="departmentDetail">
                            <span class="detailLabel">Manager</span>
                            <span class="detailValue">
                                ${escapeHTML(department.manager || "N/A")}
                            </span>
                        </div>

                        <div class="departmentDetail">
                            <span class="detailLabel">Location</span>
                            <span class="detailValue">
                                ${escapeHTML(department.location || "N/A")}
                            </span>
                        </div>

                        <div class="departmentDetail">
                            <span class="detailLabel">Employees</span>
                            <span class="detailValue departmentEmployeeCount">
                                <i class="fa-solid fa-users"></i>
                                ${employeeCount}
                            </span>
                        </div>

                        <div class="departmentDetail">
                            <span class="detailLabel">Budget</span>
                            <span class="detailValue">
                                ${formatBudget(department.budget)}
                            </span>
                        </div>

                    </div>

                    <div class="departmentCardActions">

                        <button
                            type="button"
                            class="editDepartment"
                            data-action="edit"
                            data-id="${escapeHTML(department.id)}"
                        >
                            <i class="fa-solid fa-pen"></i>
                            Edit
                        </button>

                        <button
                            type="button"
                            class="deleteDepartment"
                            data-action="delete"
                            data-id="${escapeHTML(department.id)}"
                        >
                            <i class="fa-solid fa-trash"></i>
                            Delete
                        </button>

                    </div>

                </article>
            `;
        }).join("");
    }

    document.querySelector("#departmentResults").textContent = `Showing ${filteredDepartments.length} of ${departments.length} departments`;
}

/* ========== Search ========== */

departmentSearch.addEventListener("input", renderDepartments);

/* ========== Open / Close Modal ========== */

function openDepartmentModal(department = null) {
    departmentForm.reset();
    departmentFormMessage.textContent = "";

    editingDepartmentId = department ? department.id : null;

    document.querySelector("#departmentModalTitle").textContent =
        department ? "Edit Department" : "Add Department";

    if (department) {
        departmentName.value = department.name || "";
        departmentManager.value = department.manager || "";
        departmentLocation.value = department.location || "";
        departmentBudget.value = department.budget ?? "";
    }

    departmentModal.classList.add("show");
}

function closeDepartmentModal() {
    departmentModal.classList.remove("show");
    departmentFormMessage.textContent = "";
    editingDepartmentId = null;
}

document.querySelector("#addDepartmentBtn").addEventListener("click", () => {
    openDepartmentModal();
});

document.querySelector("#closeDepartmentModal").addEventListener("click", () => {
    closeDepartmentModal();
});

document.querySelector("#cancelDepartmentModal").addEventListener("click", () => {
    closeDepartmentModal();
});

departmentModal.addEventListener("click", event => {
    if (event.target === departmentModal) {
        closeDepartmentModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeDepartmentModal();
    }
});

/* ========== Edit / Delete ========== */

departmentGrid.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) return;

    const departmentId = actionButton.dataset.id;

    const department = departments.find(item =>
        String(item.id) === String(departmentId)
    );

    if (!department) return;

    if (actionButton.dataset.action === "edit") {
        openDepartmentModal(department);
    }

    if (actionButton.dataset.action === "delete") {
        const employeeCount = getDepartmentEmployeeCount(department.name);

        let message = `Are you sure you want to delete ${department.name}?`;

        if (employeeCount > 0) {
            message += ` This department has ${employeeCount} employees.`;
        }

        if (!confirm(message)) return;

        departments = departments.filter(item =>
            String(item.id) !== String(departmentId)
        );

        saveDepartments();
        renderDepartments();
    }
});

/* ========== Add / Update Department ========== */

departmentForm.addEventListener("submit", event => {
    event.preventDefault();

    departmentFormMessage.textContent = "";

    const budgetValue = departmentBudget.value;

    const departmentData = {
        name: departmentName.value.trim(),
        manager: departmentManager.value.trim(),
        location: departmentLocation.value.trim(),
        budget: Number(budgetValue)
    };

    if (
        !departmentData.name ||
        !departmentData.manager ||
        !departmentData.location ||
        budgetValue === "" ||
        !Number.isFinite(departmentData.budget) ||
        departmentData.budget < 0
    ) {
        departmentFormMessage.textContent =
            "Please fill in all fields with valid values.";
        return;
    }

    const duplicateDepartment = departments.some(department => {
        return (
            department.name.toLowerCase() === departmentData.name.toLowerCase() &&
            String(department.id) !== String(editingDepartmentId)
        );
    });

    if (duplicateDepartment) {
        departmentFormMessage.textContent =
            "This department name already exists.";
        return;
    }

    if (editingDepartmentId !== null) {
        departments = departments.map(department => {
            if (String(department.id) !== String(editingDepartmentId)) {
                return department;
            }

            return {
                ...department,
                ...departmentData
            };
        });
    } else {
        const highestId = departments.reduce((max, department) => {
            const match = String(department.id).match(/^DEP-(\d+)$/);

            return match ? Math.max(max, Number(match[1])) : max;
        }, 0);

        const newDepartment = {
            id: `DEP-${String(highestId + 1).padStart(3, "0")}`,
            ...departmentData
        };

        departments.push(newDepartment);
    }

    saveDepartments();
    renderDepartments();
    closeDepartmentModal();
});

/* ========== Initialize ========== */

loadDepartments();
