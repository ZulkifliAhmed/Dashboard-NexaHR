
const leaveTableBody = document.querySelector("#leaveTableBody");
const leaveSearch = document.querySelector("#leaveSearch");
const leaveStatusFilter = document.querySelector("#leaveStatusFilter");
const leaveTypeFilter = document.querySelector("#leaveTypeFilter");
const clearLeaveFilters = document.querySelector("#clearLeaveFilters");
const leaveEmpty = document.querySelector("#leaveEmpty");
const leaveResultsText = document.querySelector("#leaveResultsText");

let leaveRequests = [];

// ========== Load Leave Requests ==========

async function loadLeaveRequests() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        const savedRequests = localStorage.getItem("nexahrLeaveRequests");

        leaveRequests = savedRequests
            ? JSON.parse(savedRequests)
            : data.leaveRequests || [];

        renderLeaveTypeOptions();
        renderLeaveRequests();
    } catch (error) {
        console.error("Error loading leave requests:", error);

        leaveTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="leaveError">
                    Failed to load leave requests.
                </td>
            </tr>
        `;

        leaveEmpty.hidden = true;
        leaveResultsText.textContent = "Failed to load leave requests.";
    }
}

// ========== Render Leave Type Options ==========

function renderLeaveTypeOptions() {
    const leaveTypes = [...new Set(leaveRequests.map(request => request.type))];

    leaveTypeFilter.innerHTML = `
        <option value="">All leave types</option>
        ${leaveTypes.map(type => `<option value="${type}">${type}</option>`).join("")}
    `;
}

// ========== Render Leave Requests ==========

function renderLeaveRequests() {
    const searchValue = leaveSearch.value.toLowerCase().trim();
    const statusValue = leaveStatusFilter.value;
    const typeValue = leaveTypeFilter.value;

    const filteredRequests = leaveRequests.filter(request => {
        const matchesSearch = request.employeeName.toLowerCase().includes(searchValue) ||
            request.employeeId.toLowerCase().includes(searchValue) ||
            request.department.toLowerCase().includes(searchValue);

        const matchesStatus =  !statusValue || request.status === statusValue;

        const matchesType =  !typeValue || request.type === typeValue;

        return matchesSearch && matchesStatus && matchesType;
    });

    leaveTableBody.innerHTML = filteredRequests.map(request => `
        <tr>
            <td>
                <div class="leaveEmployee">
                    <div class="leaveEmployeeAvatar">
                        ${request.employeeName.charAt(0).toUpperCase()}
                    </div>

                    <div class="leaveEmployeeInfo">
                        <strong>${request.employeeName}</strong>
                        <span>${request.employeeId}</span>
                    </div>
                </div>
            </td>

            <td>${request.type}</td>

            <td>
                <div class="leavePeriod">
                    <span>${request.startDate}</span>
                    <span>to ${request.endDate}</span>
                </div>
            </td>

            <td>
                ${request.duration}
                ${request.duration === 1 ? "day" : "days"}
            </td>

            <td>${request.reason}</td>

            <td>
                <span class="leaveStatus ${request.status.toLowerCase()}">
                    ${request.status}
                </span>
            </td>

            <td>
                ${request.status === "Pending" ? `
                    <div class="leaveActions">
                        <button
                            type="button"
                            class="leaveActionBtn approve"
                            data-id="${request.id}"
                            data-status="Approved"
                        >
                            Approve
                        </button>

                        <button
                            type="button"
                            class="leaveActionBtn reject"
                            data-id="${request.id}"
                            data-status="Rejected"
                        >
                            Reject
                        </button>
                    </div>
                ` : "-"}
            </td>
        </tr>
    `).join("");

    updateLeaveStats();
    
    leaveEmpty.hidden = filteredRequests.length !== 0;

    leaveResultsText.textContent = `Showing ${filteredRequests.length} of ${leaveRequests.length} requests`;
}

// ========== Update Statistics ==========

function updateLeaveStats() {
    const total = leaveRequests.length;

    const pending = leaveRequests.filter(
        request => request.status === "Pending"
    ).length;

    const approved = leaveRequests.filter(
        request => request.status === "Approved"
    ).length;

    const rejected = leaveRequests.filter(
        request => request.status === "Rejected"
    ).length;

    document.querySelector("#totalRequests").textContent = total;
    document.querySelector("#pendingRequests").textContent = pending;
    document.querySelector("#approvedRequests").textContent = approved;
    document.querySelector("#rejectedRequests").textContent = rejected;

    document.querySelector("#pendingSummary").textContent =
        `${pending} ${pending === 1 ? "request" : "requests"}`;
}

// ========== Approve or Reject Requests ==========

leaveTableBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-id][data-status]");

    if (!button) return;

    const requestId = button.dataset.id;
    const newStatus = button.dataset.status;

    if (!["Approved", "Rejected"].includes(newStatus)) return;

    leaveRequests = leaveRequests.map(request => {
        if ( String(request.id) === requestId && request.status === "Pending") {
            return {
                ...request,
                status: newStatus
            };
        }
        return request;
    });

    localStorage.setItem("nexahrLeaveRequests", JSON.stringify(leaveRequests));

    renderLeaveRequests();
});

// ========== Search and Filters ==========

leaveSearch.addEventListener("input", renderLeaveRequests);

leaveStatusFilter.addEventListener("change", renderLeaveRequests);

leaveTypeFilter.addEventListener("change", renderLeaveRequests);

// ========== Clear Filters ==========

clearLeaveFilters.addEventListener("click", () => {
    leaveSearch.value = "";
    leaveStatusFilter.value = "";
    leaveTypeFilter.value = "";

    renderLeaveRequests();
});

// ========== Initialize Page ==========

loadLeaveRequests();
