async function initialFetchCloudWatchData() {
    let baseURL = "https://2pba08y0dk.execute-api.us-east-1.amazonaws.com/testing/yamlcloudwatchtest";
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
    let baseURL = "https://2pba08y0dk.execute-api.us-east-1.amazonaws.com/testing/yamlcloudwatchtest";
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
    let metricLabel = cleanMetricName(data.Id)

    let table = document.createElement("table");
    let tableRow = document.createElement("tr");
    table.style.margin = "10px";
    let tableHeader = document.createElement("th");
    tableHeader.innerHTML = "Metric Name";
    table.appendChild(tableRow);
    tableRow.appendChild(tableHeader);
    data.Timestamps.forEach(timestamp => {
        let header = document.createElement("th");
        header.innerHTML = timestamp;
        tableRow.appendChild(header);
    })
    let results = document.querySelector("#results");
    results.appendChild(table)

    let dataRow = document.createElement("tr");
    table.appendChild(dataRow);
    let metricLabelRow = document.createElement("td");
    metricLabelRow.innerHTML = metricLabel;
    dataRow.appendChild(metricLabelRow);
    data.Values.forEach(value => {
        let row = document.createElement("td");
        row.innerHTML = value;
        dataRow.appendChild(row);
    })
}

function newCreateTable(data) {
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
    })
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
    })
    table.appendChild(tableBody);

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
        return
    } else {
        sectionHeader.removeChild(loadingModal);
        let metricDataResults = data.data.MetricDataResults.length;
        for (let i = 0; i < metricDataResults; i++) {
            newCreateTable(data.data.MetricDataResults[i])
        }
    }

}

document.addEventListener("DOMContentLoaded", function() {
    displayMetricTableData();
})
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
        return
    } else {
        sectionHeader.removeChild(loadingModal);
        let results = document.querySelector("#results");
        results.remove();
        let newResults = document.querySelector("#sectionResults");
        let section = document.createElement("section");
        section.setAttribute("class", "col");
        section.setAttribute("id", "results");
        newResults.appendChild(section);
        let metricDataResults = data.data.MetricDataResults.length;
        for (let i = 0; i < metricDataResults; i++) {
            newCreateTable(data.data.MetricDataResults[i])
        }
    }

}

function enableButton() {
    let button = document.querySelector("#customTimeButton")
    let inputValue = document.querySelector("#timeframeLength").value;
    if (inputValue && inputValue >= 1 && inputValue <= 100) {
        button.disabled = false;
        button.classList.remove("btn-secondary")
        button.classList.add("btn-primary")
    } else {
        button.disabled = true;
        button.classList.remove("btn-primary")
        button.classList.add("btn-secondary")
    }
}
