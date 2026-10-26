
const employeeTableBody = document.querySelector("#employeeTableBody");
const employeeSearch = document.querySelector("#employeeSearch");
const departmentFilter = document.querySelector("#departmentFilter");
const statusFilter = document.querySelector("#statusFilter");

const employeeModal = document.querySelector("#employeeModal");
const employeeForm = document.querySelector("#employeeForm");

let employees = [];
let departments = [];
let editingEmployeeId = null;

// ========== Load Data ==========

async function loadEmployees() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        departments = data.departments || [];

        const savedEmployees = localStorage.getItem("nexahrEmployees");

        employees = savedEmployees
            ? JSON.parse(savedEmployees)
            : data.employees || [];

        renderDepartmentOptions();
        renderEmployees();

    } catch (error) {
        console.error("Error loading employees:", error);

        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="6">Failed to load employee data.</td>
            </tr>
        `;
    }
}

// ========== Save Data ==========

function saveEmployees() {
    localStorage.setItem("nexahrEmployees", JSON.stringify(employees));
}


// ========== Update Statistics ==========

function updateEmployeeStats() {
    document.querySelector("#totalEmployees").textContent =
        employees.length;

    document.querySelector("#activeEmployees").textContent =
        employees.filter(employee => employee.status === "Active").length;

    document.querySelector("#onLeaveEmployees").textContent =
        employees.filter(employee => employee.status === "On Leave").length;

    document.querySelector("#inactiveEmployees").textContent =
        employees.filter(employee => employee.status === "Inactive").length;
}

// ========== Department Options ==========

function renderDepartmentOptions() {
    //A set stores only unique values, meaning it removes duplicates
    const departmentNames = [ ...new Set([...departments.map(department => department.name),
         ...employees.map(employee => employee.department)]) ].filter(Boolean);

    departmentFilter.innerHTML = `
        <option value="">All Departments</option>
        ${departmentNames.map(department => `
            <option value="${department}">${department}</option>
        `).join("")}
    `;
    //We specify the employee department's menu item in the form.
    const employeeDepartment = document.querySelector("#employeeDepartment");

    employeeDepartment.innerHTML = `
        <option value="">Select Department</option>
        ${departmentNames.map(department => `
            <option value="${department}">${department}</option>
        `).join("")}
    `;
    updateEmployeeStats()
}

// ========== Render Employees ==========

function renderEmployees() {
    const searchValue = employeeSearch.value.trim().toLowerCase();
    const selectedDepartment = departmentFilter.value;
    const selectedStatus = statusFilter.value;

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = [
            employee.name,
            employee.email,
            employee.position
        ].some(value => String(value || "").toLowerCase().includes(searchValue));

        const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;

        const matchesStatus = !selectedStatus || employee.status === selectedStatus;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    if (filteredEmployees.length === 0) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="6">No employees found.</td>
            </tr>
        `;
    } else {
        employeeTableBody.innerHTML = filteredEmployees.map(employee => {
            //object that maps an employee's status to the corresponding CSS class.
            const statusClass = {
                "Active": "active",
                "On Leave": "on-leave",
                "Inactive": "inactive"
            }[employee.status] || "inactive";

            const hireDate = employee.hireDate
                ? new Date(`${employee.hireDate}T00:00:00`).toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                )
                : "N/A";

            return `
                <tr>
                    <td>
                        <div class="employeeInfo">
                            <div class="avatar">
                                <img
                                    src="${employee.image || "assets/avatar.png"}"
                                    alt="${employee.name}
                                >
                            </div>

                            <div class="userDetails">
                                <h4>${employee.name || "Unknown"}</h4>
                                <p>${employee.email || ""}</p>
                            </div>
                        </div>
                    </td>

                    <td>${employee.department || "N/A"}</td>
                    <td>${employee.position || "N/A"}</td>
                    <td>${hireDate}</td>

                    <td>
                        <span class="employeeStatus ${statusClass}">
                            ${employee.status || "Unknown"}
                        </span>
                    </td>

                    <td>
                        <div class="employeeActions">
                            <button
                                type="button"
                                class="employeeMenuBtn"
                                data-id="${employee.id}"
                                aria-label="Employee actions"
                            >
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>

                            <div class="employeeActionMenu">
                                <button
                                    type="button"
                                    data-action="edit"
                                    data-id="${employee.id}"
                                >
                                    <i class="fa-solid fa-pen"></i>
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    class="deleteEmployee"
                                    data-action="delete"
                                    data-id="${employee.id}"
                                >
                                    <i class="fa-solid fa-trash"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    document.querySelector("#employeeResults").textContent = `Showing ${filteredEmployees.length} of ${employees.length} employees`;
}

// ========== Search and Filters ==========

employeeSearch.addEventListener("input", renderEmployees);
departmentFilter.addEventListener("change", renderEmployees);
statusFilter.addEventListener("change", renderEmployees);

// ========== Open and Close Form ==========

function openEmployeeForm(employee = null) {
    employeeForm.reset();
    document.querySelector("#employeeFormMessage").textContent = "";

    editingEmployeeId = employee ? employee.id : null;

    document.querySelector("#employeeFormTitle").textContent =
        employee ? "Edit Employee" : "Add Employee";

    if (employee) {
        document.querySelector("#employeeId").value = employee.id;
        document.querySelector("#employeeName").value = employee.name || "";
        document.querySelector("#employeeEmail").value = employee.email || "";
        document.querySelector("#employeePosition").value = employee.position || "";
        document.querySelector("#employeeDepartment").value = employee.department || "";
        document.querySelector("#employeeHireDate").value = employee.hireDate || "";
        document.querySelector("#employeeStatus").value = employee.status || "Active";
    }

    employeeModal.classList.add("show");
}

function closeEmployeeForm() {
    employeeModal.classList.remove("show");
    editingEmployeeId = null;
}

document.querySelector("#openEmployeeForm").addEventListener("click", () => {
    openEmployeeForm();
});

document.querySelector("#closeEmployeeForm").addEventListener("click", closeEmployeeForm);
document.querySelector("#cancelEmployeeForm").addEventListener("click", closeEmployeeForm);

// ========== Employee Actions ==========

document.addEventListener("click", function (event) {
    const menuButton = event.target.closest(".employeeMenuBtn");

    if (menuButton) {
        const menu = menuButton.nextElementSibling;

        document.querySelectorAll(".employeeActionMenu").forEach(item => {
            if (item !== menu) {
                item.classList.remove("show");
            }
        });

        menu.classList.toggle("show");
        return;
    }

    //Determining whether a button has been pressed Edit or Delete
    const actionButton = event.target.closest("[data-action]");

    if (actionButton) {
        const employeeId = actionButton.dataset.id;
        const action = actionButton.dataset.action;

        const employee = employees.find(item =>
            String(item.id) === String(employeeId)
        );
        
        // Closing menus after selecting an action
        document.querySelectorAll(".employeeActionMenu").forEach(menu => {
            menu.classList.remove("show");
        });

        if (!employee) return;

        if (action === "edit") {
            openEmployeeForm(employee);
        }

        if (action === "delete") {
            const confirmed = confirm(`Are you sure you want to delete ${employee.name}?`);

            if (confirmed) {
                employees = employees.filter(item =>
                    String(item.id) !== String(employeeId)
                );

                saveEmployees();
                renderEmployees();
            }
        }

        return;
    }

    //Close the menu when clicking outside of it
    if (!event.target.closest(".employeeActionMenu")) {
        document.querySelectorAll(".employeeActionMenu").forEach(menu => {
            menu.classList.remove("show");
        });
    }
});

 // ========== Add and Edit Employee ==========

employeeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Get form values
    const employeeData = {
        name: document.querySelector("#employeeName").value.trim(),
        email: document.querySelector("#employeeEmail").value.trim(),
        position: document.querySelector("#employeePosition").value.trim(),
        department: document.querySelector("#employeeDepartment").value,
        hireDate: document.querySelector("#employeeHireDate").value,
        status: document.querySelector("#employeeStatus").value
    };

    const message = document.querySelector("#employeeFormMessage");

    // Check required fields
    if (
        !employeeData.name ||
        !employeeData.email ||
        !employeeData.position ||
        !employeeData.department ||
        !employeeData.hireDate ||
        !employeeData.status
    ) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    // Check duplicate email
    const emailExists = employees.some(function (employee) {
        const sameEmail =  employee.email.toLowerCase() === employeeData.email.toLowerCase();

        const differentEmployee =   String(employee.id) !== String(editingEmployeeId);

        return sameEmail && differentEmployee;
    });

    if (emailExists) {
        message.textContent = "This email is already registered.";
        return;
    }

    // Edit existing employee
    if (editingEmployeeId !== null) {
        for (let i = 0; i < employees.length; i++) {
            if (String(employees[i].id) === String(editingEmployeeId)) {
                employees[i].name = employeeData.name;
                employees[i].email = employeeData.email;
                employees[i].position = employeeData.position;
                employees[i].department = employeeData.department;
                employees[i].hireDate = employeeData.hireDate;
                employees[i].status = employeeData.status;

                break;
            }
        }
    } else {
        // Create new employee ID
        let nextId = 1;

        for (let i = 0; i < employees.length; i++) {
            const id = Number(employees[i].id);

            if (Number.isFinite(id) && id >= nextId) {
                nextId = id + 1;
            }
        }

        // Add new employee
        employees.push({
            id: nextId,
            ...employeeData,
            image: "assets/avatar.png"
        });
    }

    // Save and update the page
    saveEmployees();
    renderDepartmentOptions();
    renderEmployees();
    closeEmployeeForm();
});


// ========== Start ==========

loadEmployees();
