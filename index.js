async function initialFetchCloudWatchData() {
    let baseURL = "https://e7jk6o4svh.execute-api.us-east-1.amazonaws.com/testing/yamlcloudwatchtest";
    try {
        let response = await fetch(baseURL);
        if (!response.ok) {
            return {
                "errorMessage": response,
                "result": false
            }
        } else {
            let cloudWatchData = await response.json();
            return {
                "data": cloudWatchData,
                "result": true
            }
        }
    } catch (err) {
        return {
            "errorMessage": err,
            "result": false
        }
    }
}

async function customTimeFetchCloudWatchData(timeframeLength, timeframeUnit) {
    let baseURL = "https://e7jk6o4svh.execute-api.us-east-1.amazonaws.com/testing/yamlcloudwatchtest";
    let timeframeLengthParam = `/?timeframeLength=${timeframeLength}&`;
    let timeframeUnitParam = `timeframeUnit=${timeframeUnit}`;
    let paramURL = baseURL + timeframeLengthParam + timeframeUnitParam;
    try {
        let response = await fetch(paramURL);
        if (!response.ok) {
            return {
                "errorMessage": response,
                "result": false
            }
        } else {
            let cloudWatchData = await response.json();
            return {
                "data": cloudWatchData,
                "result": true
            }
        }
    } catch (err) {
        return {
            "errorMessage": err,
            "result": false
        }
    }
}

function cleanMetricName(metricName) {
    let cleanMetricName = metricName.replace(/_/g, ' ').split(' ');
    cleanMetricName = cleanMetricName.map(word => word.charAt(0).toUpperCase() + word.slice(1));    
    return cleanMetricName.join(' ');
}

function createTable(data) {
    let metricLabel = cleanMetricName(data.Id);
    let tableWrapper = document.createElement("div");
    tableWrapper.setAttribute("class", "table-responsive");
    let table = document.createElement("table");
    table.setAttribute("class", "table");
    let tableHead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    tableHead.appendChild(headerRow);
    let tableRowMetricName = document.createElement("th");
    tableRowMetricName.setAttribute("scope", "col");
    tableRowMetricName.setAttribute("style", "text-decoration: underline;");
    tableRowMetricName.innerHTML = "Metric Name";
    headerRow.appendChild(tableRowMetricName);
    data.Timestamps.forEach(timestamp => {
        let header = document.createElement("th");
        header.setAttribute("scope", "col");
        header.innerHTML = timestamp;
        headerRow.appendChild(header);
    });
    table.appendChild(tableHead);
    tableWrapper.appendChild(table);
    let results = document.querySelector("#results");
    results.appendChild(tableWrapper);

    let tableBody = document.createElement("tbody");
    let columnRow = document.createElement("tr");
    tableBody.appendChild(columnRow);
    table.appendChild(tableBody);
    let rowHeader = document.createElement("th");
    rowHeader.setAttribute("scope", "row");
    rowHeader.innerHTML = metricLabel;
    columnRow.appendChild(rowHeader);
    data.Values.forEach(value => {
        let row = document.createElement("td");
        row.innerHTML = value;
        columnRow.appendChild(row);
    });
    table.appendChild(tableBody);
}

function generateCharts(metricData, resultsSection) {
    metricData.forEach(metric => {
        // Create a chart container
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';

        // Create a heading for each chart (based on Id or Label)
        const chartTitle = document.createElement('h3');
        chartTitle.innerHTML = cleanMetricName(metric.Id);
        chartContainer.appendChild(chartTitle);

        // Create canvas for Chart.js
        const canvas = document.createElement('canvas');
        canvas.id = metric.Id;  // Use the Id as a unique identifier
        chartContainer.appendChild(canvas);

        // Append the chart container to the results section
        resultsSection.appendChild(chartContainer);

        // Generate the chart using Chart.js
        const ctx = document.getElementById(metric.Id).getContext('2d');

        if (metric.Timestamps.length > 0 && metric.Values.length > 0) {
            // If data is available, create a bar chart
            createBarChart(ctx, metric.Label, metric.Timestamps, metric.Values);
        } else {
            // If no data, create an empty graph with "No Data Available"
            createEmptyChart(ctx, metric.Label);
        }
    });
}

// Function to create a bar chart using Chart.js
function createBarChart(ctx, label, timestamps, values) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: timestamps,
            datasets: [{
                label: label,
                data: values,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Timestamps'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Values'
                    }
                }
            }
        }
    });
}

// Function to create an empty chart if there is no data available
function createEmptyChart(ctx, label) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['No Data Available'],
            datasets: [{
                label: label,
                data: [0],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Timestamps'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Values'
                    }
                }
            }
        }
    });
}

async function displayMetricTableData() {
    let loadingModal = document.createElement("p");
    loadingModal.innerHTML = "loading . . .";
    let sectionHeader = document.querySelector(".loading");
    sectionHeader.append(loadingModal);
    let data = await initialFetchCloudWatchData();
    if (!data.result) {
        sectionHeader.removeChild(loadingModal);
        let error = document.createElement("p");
        error.innerHTML = `Error: ${data.errorMessage.status}`;
        sectionHeader.appendChild(error);
        return;
    } else {
        sectionHeader.removeChild(loadingModal);
        let resultsSection = document.querySelector("#results");
        resultsSection.innerHTML = "";  // Clears previous content

        // Create tables for each metric
        data.data.MetricDataResults.forEach(metric => {
            createTable(metric);
        });

        // Generate charts for the same data
        generateCharts(data.data.MetricDataResults, resultsSection);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    displayMetricTableData();
});

async function submitCustomTimeframe() {
    let timeframeLength = document.querySelector("#timeframeLength").value;
    let timeframeUnit = document.querySelector("#timeframeUnit").value.toLowerCase();
    let loadingModal = document.createElement("p");
    loadingModal.innerHTML = "loading . . .";
    let sectionHeader = document.querySelector(".loading");
    sectionHeader.append(loadingModal);

    let data = await customTimeFetchCloudWatchData(timeframeLength, timeframeUnit);
    if (!data.result) {
        sectionHeader.removeChild(loadingModal);
        let error = document.createElement("p");
        error.innerHTML = `Error: ${data.errorMessage.status}`;
        sectionHeader.appendChild(error);
        return;
    } else {
        sectionHeader.removeChild(loadingModal);

        let resultsSection = document.querySelector("#results");
        resultsSection.innerHTML = "";  // Clears previous content

        // Create tables for each metric
        data.data.MetricDataResults.forEach(metric => {
            createTable(metric);
        });

        // Generate charts for the same data
        generateCharts(data.data.MetricDataResults, resultsSection);
    }
}

function enableButton() {
    let button = document.querySelector("#customTimeButton");
    let inputValue = document.querySelector("#timeframeLength").value;
    if (inputValue && inputValue >= 1 && inputValue <= 100) {
        button.disabled = false;
        button.classList.remove("btn-secondary");
        button.classList.add("btn-primary");
    } else {
        button.disabled = true;
        button.classList.remove("btn-primary");
        button.classList.add("btn-secondary");
    }
}
