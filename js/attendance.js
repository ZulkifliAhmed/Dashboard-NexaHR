
/* ========== Attendance Data ========== */

const attendanceTableBody = document.querySelector("#attendanceTableBody");
const attendanceSearch = document.querySelector("#attendanceSearch");
const statusFilter = document.querySelector("#statusFilter");
const departmentFilter = document.querySelector("#departmentFilter");
const attendanceDate = document.querySelector("#attendanceDate");
const clearAttendanceFilters = document.querySelector("#clearAttendanceFilters");
const exportAttendanceBtn = document.querySelector("#exportAttendanceBtn");
const attendanceResultsText = document.querySelector("#attendanceResultsText");
const attendanceEmpty = document.querySelector("#attendanceEmpty");

const totalAttendance = document.querySelector("#totalAttendance");
const presentCount = document.querySelector("#presentCount");
const lateCount = document.querySelector("#lateCount");
const absentCount = document.querySelector("#absentCount");

let attendanceRecords = [];
let filteredAttendance = [];

/* ========== Escape HTML ========== */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

/* ========== Load Attendance Data ========== */

async function loadAttendance() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        attendanceRecords = Array.isArray(data.attendance) ? data.attendance : [];

        filteredAttendance = [...attendanceRecords];

        updateAttendanceStats();
        populateDepartmentFilter();
        renderAttendance();

    } catch (error) {
        console.error("Error loading attendance:", error);

        attendanceTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="attendanceLoading">
                    Failed to load attendance records. Check data.json.
                </td>
            </tr>
        `;

        attendanceResultsText.textContent = "Unable to load attendance data.";
    }
}

/* ========== Update Statistics ========== */

function updateAttendanceStats() {
    totalAttendance.textContent = attendanceRecords.length;

    presentCount.textContent = attendanceRecords.filter(record =>
        record.status === "Present"
    ).length;

    lateCount.textContent = attendanceRecords.filter(record =>
        record.status === "Late"
    ).length;

    absentCount.textContent = attendanceRecords.filter(record =>
        record.status === "Absent"
    ).length;
}

/* ========== Department Filter ========== */

function populateDepartmentFilter() {
    const departments = [
        ...new Set(attendanceRecords.map(record => record.department).filter(Boolean))
    ].sort();

    departmentFilter.innerHTML = `
        <option value="">All departments</option>
        ${departments.map(department => `
            <option value="${escapeHTML(department)}">
                ${escapeHTML(department)}
            </option>
        `).join("")}
    `;
}

/* ========== Render Attendance Table ========== */

function renderAttendance() {
    attendanceEmpty.hidden = filteredAttendance.length !== 0;

    attendanceResultsText.textContent =
        `Showing ${filteredAttendance.length} of ${attendanceRecords.length} records`;

    if (filteredAttendance.length === 0) {
        attendanceTableBody.innerHTML = "";
        return;
    }

    attendanceTableBody.innerHTML = filteredAttendance.map(record => {
        const statusClass = String(record.status || "").toLowerCase().replace(/\s+/g, "-");

        return `
            <tr>
                <td class="attendanceRecordId">
                    ${escapeHTML(record.id)}
                </td>

                <td>
                    <div class="attendanceEmployee">
                        <div class="attendanceEmployeeIcon">
                            <i class="fa-solid fa-user"></i>
                        </div>

                        <div class="attendanceEmployeeInfo">
                            <strong>
                                ${escapeHTML(record.employeeName)}
                            </strong>
                            <span>
                                ${escapeHTML(record.employeeId)}
                            </span>
                        </div>
                    </div>
                </td>

                <td>${escapeHTML(record.department)}</td>
                <td>${escapeHTML(record.date)}</td>
                <td>${escapeHTML(record.checkIn || "—")}</td>
                <td>${escapeHTML(record.checkOut || "—")}</td>
                <td>${escapeHTML(record.totalHours ?? "—")}</td>

                <td>
                    <span class="attendanceStatus ${escapeHTML(statusClass)}">
                        ${escapeHTML(record.status)}
                    </span>
                </td>
            </tr>
        `;
    }).join("");
}

/* ========== Search and Filters ========== */

function filterAttendance() {
    const searchValue = attendanceSearch.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedDepartment = departmentFilter.value;
    const selectedDate = attendanceDate.value;

    filteredAttendance = attendanceRecords.filter(record => {
        const searchTableText = [
            record.id,
            record.employeeId,
            record.employeeName,
            record.department
        ].join(" ").toLowerCase();

        const matchesSearch = searchTableText.includes(searchValue);

        const matchesStatus = !selectedStatus || record.status === selectedStatus;

        const matchesDepartment = !selectedDepartment || record.department === selectedDepartment;

        const matchesDate = !selectedDate || record.date === selectedDate;

        return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
    });

    renderAttendance();
}

attendanceSearch.addEventListener("input", filterAttendance);
statusFilter.addEventListener("change", filterAttendance);
departmentFilter.addEventListener("change", filterAttendance);
attendanceDate.addEventListener("change", filterAttendance);

/* ========== Clear Filters ========== */

clearAttendanceFilters.addEventListener("click", function () {
    attendanceSearch.value = "";
    statusFilter.value = "";
    departmentFilter.value = "";
    attendanceDate.value = "";

    filterAttendance();
}); 


/* ========== Export CSV ========== */

exportAttendanceBtn.addEventListener("click", function () {
    if (filteredAttendance.length === 0) {
        alert("There are no attendance records to export.");
        return;
    }

    // Defining column headings
    const headers = [
        "Record ID",
        "Employee ID",
        "Employee Name",
        "Department",
        "Date",
        "Check In",
        "Check Out",
        "Total Hours",
        "Status"
    ];

    // Preparing employee data
    const rows = filteredAttendance.map(record => [
        record.id,
        record.employeeId,
        record.employeeName,
        record.department,
        record.date,
        record.checkIn,
        record.checkOut,
        record.totalHours,
        record.status
    ]);

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n");

    // Convert text into a downloadable CSV file.

    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "nexahr-attendance.csv";
    link.click();
    URL.revokeObjectURL(url);
});

/* ========== Initialize Page ========== */

loadAttendance();
