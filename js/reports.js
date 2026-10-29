
/* ========== Reports Data ========== */

// Get report statistics elements
const reportEmployees = document.querySelector("#reportEmployees");
const reportPresent = document.querySelector("#reportPresent");
const reportLeaves = document.querySelector("#reportLeaves");
const reportAbsent = document.querySelector("#reportAbsent");

// Get filter and action buttons
const reportPeriod = document.querySelector("#reportPeriod");
const reportDepartment = document.querySelector("#reportDepartment");
const resetReportFilters = document.querySelector("#resetReportFilters");
const printReport = document.querySelector("#printReport");

// Get leave summary elements
const leaveSummaryBody = document.querySelector("#leaveSummaryBody");
const leaveSummaryCount = document.querySelector("#leaveSummaryCount");
const reportMessage = document.querySelector("#reportMessage");

// Get chart containers
const attendanceChartElement = document.querySelector("#attendanceReportChart");
const departmentChartElement = document.querySelector("#departmentReportChart");

// Store loaded data and chart instances
let reportsData = {};
let attendanceChart;
let departmentChart;


/* ========== Load Data ========== */

async function loadReportsData() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        reportsData = await response.json();

        fillDepartmentFilter();
        renderReports();

    } catch (error) {
        console.error(error);

        reportMessage.textContent = "Failed to load report data.";

        leaveSummaryBody.innerHTML = `
            <tr>
                <td colspan="5" class="reportEmpty">
                    Unable to load report data.
                </td>
            </tr>
        `;
    }
}


/* ========== Helpers ========== */

// Normalize text for consistent comparisons
function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
}

// Get the normalized status of a record
function getStatus(record) {
    return normalize(record.status);
}

// Check whether a record matches the selected department
function matchesDepartment(record) {
    return reportDepartment.value === "all" || normalize(record.department) === normalize(reportDepartment.value);
}

// Check whether the record date matches the selected period
function matchesPeriod(record, dateKey) {
    // Include all dates when no period filter is selected
    if (reportPeriod.value === "all") return true;

    const date = new Date(record[dateKey]);

    // Exclude records with invalid dates
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();

    // Match records from the current month and year
    if (reportPeriod.value === "month") {
        return date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
    }

    // Match records from the current year
    return date.getFullYear() === now.getFullYear();
}


/* ========== Escape HTML ========== */

function escapeHTML(value) {
    // Replace special characters with safe HTML entities
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(/[&<>"']/g, char => entities[char]);
}


/* ========== Department Filter ========== */

function fillDepartmentFilter() {
    // Extract department names from the loaded data
    const departments = reportsData.departments.map(department => department.name);

    reportDepartment.innerHTML = `
        <option value="all">All Departments</option>
        ${departments.map(name => `
            <option value="${escapeHTML(name)}">${escapeHTML(name)}</option>
        `).join("")}
    `;
}


/* ========== Filter Data ========== */

function getFilteredData(key, dateKey = "") {
    // Filter records by department and, when provided, date
    return reportsData[key].filter(record =>
        matchesDepartment(record) &&
        (!dateKey || matchesPeriod(record, dateKey))
    );
}


/* ========== Statistics ========== */

function renderStatistics(employees, attendance, leaves) {
    reportEmployees.textContent = employees.length;

    reportPresent.textContent = attendance.filter(
        record => getStatus(record) === "present"
    ).length;

    reportAbsent.textContent = attendance.filter(
        record => getStatus(record) === "absent"
    ).length;

    reportLeaves.textContent = leaves.length;
}


/* ========== Attendance Chart ========== */

function renderAttendanceChart(attendance) {
    // Define the attendance statuses shown in the chart
    const statuses = ["present", "late", "absent", "on leave"];

    // Count records for each status
    const series = statuses.map(status =>
        attendance.filter(record => getStatus(record) === status).length
    );

    if (attendanceChart) attendanceChart.destroy();

    // Create the attendance donut chart
    attendanceChart = new ApexCharts(attendanceChartElement, {
        chart: {
            type: "donut",
            height: 280,
            fontFamily: "Poppins, sans-serif"
        },
        series,
        labels: ["Present", "Late", "Absent", "On Leave"],
        colors: ["#10B981", "#F59E0B", "#EF4444", "#64748B"],
        legend: {
            position: "bottom",
            fontSize: "12px"
        },
        dataLabels: {
            enabled: true
        },
        noData: {
            text: "No attendance data available"
        },
        tooltip: {
            y: {
                formatter: value => `${value} Records`
            }
        },
        responsive: [{
            breakpoint: 575,
            options: {
                chart: { height: 250 },
                legend: { fontSize: "10px" }
            }
        }]
    });

    attendanceChart.render();
}


/* ========== Department Chart ========== */

function renderDepartmentChart(employees) {
    // Get department names matching the selected filter
    const departments = reportsData.departments.map(department => department.name)
        .filter(name => reportDepartment.value === "all" 
        || normalize(name) === normalize(reportDepartment.value));

    // Count employees in each department
    const series = departments.map(name => employees.filter(employee => normalize(employee.department) === normalize(name)).length);


    if (departmentChart) departmentChart.destroy();

    departmentChart = new ApexCharts(departmentChartElement, {
        chart: {
            type: "bar",
            height: 280,
            toolbar: { show: false },
            fontFamily: "Poppins, sans-serif"
        },
        series: [{
            name: "Employees",
            data: series
        }],
        xaxis: {
            categories: departments,
            labels: {
                rotate: -35,
                trim: true,
                style: { fontSize: "10px" }
            }
        },
        yaxis: {
            min: 0,
            forceNiceScale: true,
            labels: {
                formatter: value => Math.round(value)
            }
        },
        colors: ["#4F46E5"],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: "45%"
            }
        },
        dataLabels: {
            enabled: true
        },
        grid: {
            borderColor: "#E2E8F0"
        },
        noData: {
            text: "No department data available"
        },
        tooltip: {
            y: {
                formatter: value => `${value} Employees`
            }
        }
    });

    departmentChart.render();
}


/* ========== Leave Summary Table ========== */

function renderLeaveSummary(leaves) {
    // Store leave request counts grouped by leave type
    const summary = {};

    leaves.forEach(request => {
        const type = request.type;
        const status = getStatus(request);

        // Initialize counters when a leave type appears for the first time
        if (!summary[type]) {
            summary[type] = {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0
            };
        }

        // Count the total requests for this leave type
        summary[type].total++;

        // Count requests by their status
        if (["pending", "approved", "rejected"].includes(status)) {
            summary[type][status]++;
        }
    });

    // Display the total number of leave requests
    leaveSummaryCount.textContent =
        `${leaves.length} ${leaves.length === 1 ? "Request" : "Requests"}`;

    // Get all leave types included in the summary
    const types = Object.keys(summary);

    leaveSummaryBody.innerHTML = types.length
        ? types.map(type => `
            <tr>
                <td>${escapeHTML(type)}</td>
                <td>${summary[type].total}</td>
                <td>${summary[type].pending}</td>
                <td>${summary[type].approved}</td>
                <td>${summary[type].rejected}</td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="5" class="reportEmpty">
                    No leave requests found for these filters.
                </td>
            </tr>
        `;
}


/* ========== Render Reports ========== */

function renderReports() {
    // Get filtered data for each report section
    const employees = getFilteredData("employees");
    const attendance = getFilteredData("attendance", "date");
    const leaves = getFilteredData("leaveRequests", "startDate");

    // Update statistics, charts, and leave summary
    renderStatistics(employees, attendance, leaves);
    renderAttendanceChart(attendance);
    renderDepartmentChart(employees);
    renderLeaveSummary(leaves);

    reportMessage.textContent = "";
}


/* ========== Events ========== */

reportPeriod.addEventListener("change", renderReports);
reportDepartment.addEventListener("change", renderReports);

resetReportFilters.addEventListener("click", () => {
    reportPeriod.value = "all";
    reportDepartment.value = "all";

    renderReports();
});

printReport.addEventListener("click", () => window.print());

/* ========== Start App ========== */

if (typeof ApexCharts === "undefined") {
    reportMessage.textContent =
        "Charts could not load. Check your internet connection.";
} else {
    loadReportsData();
}
 