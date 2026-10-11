// ======================================
// Employees Overview
// ======================================

const overviewOptions = {

    chart: {
        type: "area",
        height: 200
    },

    series: [
        {
            name: "Employees",
            data: [180, 190, 200, 215, 225, 235, 248]
        }
    ],

    xaxis: {
        categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul"
        ]
    },

    stroke: {
        curve: "smooth"
    },

    colors: ["#6366F1"],

    tooltip: {
        y: {
            formatter: function (value) {
                return value + " Employees";
            }
        }
    }
};

const overviewChart = new ApexCharts(
    document.querySelector("#employeesOverview"),
    overviewOptions
);

overviewChart.render();

// ======================================
// Employees by Department
// ======================================

const departmentOptions = {

    chart: {
        type: "donut",
        height: 200
    },

    series: [
        42,
        35,
        28,
        18,
        16,
        22
    ],

    labels: [
        "Development",
        "Design",
        "Marketing",
        "HR",
        "Finance",
        "Sales"
    ],

    colors: [
        "#6366F1",
        "#3B82F6",
        "#8B5CF6",
        "#10B981",
        "#F59E0B",
        "#EF4444"
    ],

    legend: {
        position: "right"
    },

    tooltip: {
        y: {
            formatter: function (value) {
                return value + " Employees";
            }
        }
    }
};

const departmentChart = new ApexCharts(
    document.querySelector("#employeesDepartment"),
    departmentOptions
);

departmentChart.render();