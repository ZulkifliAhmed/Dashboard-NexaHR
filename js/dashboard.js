// Carts Statistics
async function updateCarts() {
    try {
        const data = await fetchData();
        const employees = data.employees ?? [];

        const stats = [
            employees.length,
            employees.filter(emp => emp.status === "Active").length,
            employees.filter(emp => emp.status === "On Leave").length,
            employees.filter(emp => emp.status === "Inactive").length
        ];

        const carts = document.querySelectorAll(".carts .range");

        carts.forEach((el, index) => {
            el.dataset.range = stats[index];
        });

        carts.forEach(el => {
            countNumber(el);
        });

    } catch (error) {
        console.error("Failed to load employee data:", error);
    }
}

updateCarts();

// Employees Carts Count
function countNumber(item){
    const maxNum = item.dataset.range
     let count = setInterval(()=>{
        item.textContent++
        if (item.textContent == maxNum) {
            clearInterval(count)
        }
     },1000 / maxNum)
}

// Charts
async function renderDashboardCharts() {
    try {
        const response = await fetch("./data.json");
        
        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        const employees = data.employees;
        const departments = data.departments;

        // Employees Overview

        const monthlyData = {};

        employees.forEach(employee => {
            const date = new Date(employee.hireDate);

            if (Number.isNaN(date.getTime())) return;

            const month = date.toLocaleString("en-US", {
                month: "short",
                timeZone: "UTC"
            });

            const year = date.getUTCFullYear();
            const key = `${year}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

            if (!monthlyData[key]) {
                monthlyData[key] = {
                    label: `${month} ${year}`,
                    count: 0
                };
            }

            monthlyData[key].count++;
        });

        const sortedMonths = Object.keys(monthlyData).sort();

        let total = 0;

        const overviewCategories = [];
        const overviewSeries = [];

        sortedMonths.forEach(key => {
            total += monthlyData[key].count;
            overviewCategories.push(monthlyData[key].label);
            overviewSeries.push(total);
        });

        const overviewOptions = {
            chart: {
                type: "area",
                height: 300
            },

            series: [{
                name: "Employees",
                data: overviewSeries
            }],

            xaxis: {
                categories: overviewCategories
            },

            stroke: {
                curve: "smooth"
            },

            colors: ["#6366F1"],

            tooltip: {
                y: {
                    formatter: value => value + " Employees"
                }
            }
        };

        const overviewElement = document.querySelector("#employeesOverview");

        if (overviewElement) {
            const overviewChart = new ApexCharts(
                overviewElement,
                overviewOptions
            );

            overviewChart.render();
        }

        // Employees by Department
        const departmentCounts = departments.map(department => {
            const count = employees.filter(employee =>
                employee.department === department.name
            ).length;

            return {
                name: department.name,
                count: count
            };
        });

        const departmentOptions = {
            chart: {
                type: "donut",
                height: 300
            },

            series: departmentCounts.map(department => department.count),

            labels: departmentCounts.map(department => department.name),

            colors: [
                "#6366F1",
                "#3B82F6",
                "#8B5CF6",
                "#10B981",
                "#F59E0B",
                "#EF4444",
                "#14B8A6",
                "#F97316"
            ],

            legend: {
                position: "right"
            },

            tooltip: {
                y: {
                    formatter: value => value + " Employees"
                }
            }
        };

        const departmentElement = document.querySelector("#employeesDepartment");

        if (departmentElement) {
            const departmentChart = new ApexCharts(
                departmentElement,
                departmentOptions
            );

            departmentChart.render();
        }

    } catch (error) {
        console.error("Error rendering dashboard charts:", error);
    }
}

renderDashboardCharts();

//recent employees
async function renderRecentEmployees() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        const recentEmployees = [...data.employees]
            .sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate))
            .slice(0, 5);

        const employeeList = document.querySelector(".employeeList");

        if (!employeeList) return;

        employeeList.innerHTML = recentEmployees.map(employee => {
            
            const hireDate = new Date(employee.hireDate);

            const formattedDate = hireDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC"
            });

            return `
                <div class="employeeItem">
                    <div class="employeeInfo">
                        <div class="avatar">
                            <img src="${employee.image}" alt="${employee.name}">
                        </div>

                        <div class="userDetails">
                            <h4>${employee.name}</h4>
                            <p>${employee.position}</p>
                        </div>
                    </div>

                    <p class="titel">${employee.department}</p>

                    <div class="details">
                        <p>${formattedDate}</p>

                        <div class="employeeLink">
                            <i class="fa-solid fa-ellipsis-vertical"></i>
                        </div>

                        <ul class="moreDetails">
                            <li>
                                <a href="#" class="editEmployee"
                                   data-id="${employee.id}">Edit</a>
                            </li>
                            <li>
                                <a href="#" class="deleteEmployee"
                                   data-id="${employee.id}">Delete</a>
                            </li>
                        </ul>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading recent employees:", error);
    }
}

renderRecentEmployees();

 // Employee Dropdown Menu
document.addEventListener("click", function (e) {
    const button = e.target.closest(".employeeLink");

    // If an employee button is clicked
    if (button) {
        const menu = button.closest(".details").querySelector(".moreDetails");

        if (!menu) return;

        // Close other menus
        document.querySelectorAll(".moreDetails.show").forEach(item => {
            item.classList.remove("show");
        });

        // Toggle the selected menu
        menu.classList.toggle("show");
    }

    // Close menus when clicking outside
    else if (!e.target.closest(".moreDetails")) {
        document.querySelectorAll(".moreDetails.show").forEach(menu => {
            menu.classList.remove("show");
        });
    }
});

// Close menus with Escape
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        document.querySelectorAll(".moreDetails.show").forEach(menu => {
            menu.classList.remove("show");
        });
    }
});

async function renderUpcomingBirthdays() {
    try {
        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load data.json");
        }

        const data = await response.json();

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        const upcomingBirthdays = data.employees
            .map(employee => {
                const birthday = new Date(`${employee.birthday}T00:00:00`);

                const nextBirthday = new Date(
                    today.getFullYear(),
                    birthday.getMonth(),
                    birthday.getDate()
                );

                if (
                    birthday.getMonth() < currentMonth ||
                    (birthday.getMonth() === currentMonth &&
                     birthday.getDate() < currentDay)
                ) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                return { ...employee, nextBirthday };
            })
            .sort((a, b) => a.nextBirthday - b.nextBirthday)
            .slice(0, 5);

        const birthdayList = document.querySelector(".birthdayList");

        if (!birthdayList) return;

        birthdayList.innerHTML = upcomingBirthdays.map(employee => {
            const birthday = new Date(`${employee.birthday}T00:00:00`);

            const formattedDate = birthday.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                timeZone: "UTC"
            });

            return `
                <div class="employeeItem">
                    <div class="employeeInfo">
                        <div class="avatar">
                            <img src="${employee.image}" alt="${employee.name}">
                        </div>

                        <div class="userDetails">
                            <h4>${employee.name}</h4>
                            <p>${formattedDate}</p>
                        </div>
                    </div>

                    <div class="details">
                        <p>${employee.department}</p>
                        <i class="fa-solid fa-gift"></i>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading upcoming birthdays:", error);
    }
}

renderUpcomingBirthdays();