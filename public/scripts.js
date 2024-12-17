/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the user's Collection table and displays it.
async function fetchAndDisplayCollection() {
    const tableElement = document.getElementById('collection');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/collection', {
        method: 'GET'
    });

    const responseData = await response.json();
    const collectiontableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    collectiontableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Logs out user
async function logoutCollector(event) {
    const response = await fetch("/logout", {
        method: 'PUT',
    });
    
    const responseData = await response.json();
    const messageElement = document.getElementById('logoutCollectorResultMsg');

    if (responseData.success) {
        window.location.href = '/'; // user successfully logged out -> redirect to create account/login page
    } else {
        messageElement.textContent = "Error logging out user!";
    }
}

// Logic for Deleting a Collection
async function deleteCollection(event) {
    console.log("Deleting a collection");
    event.preventDefault();
    const collectionName = document.getElementById("deleteCollectionName").value;
    try {
        const response = await fetch ("/delete-collection", {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collectionName })
        });

        const responseData = await response.json();
        const resultMsg = document.getElementById("deleteCollectionResultMsg");

        if (responseData.success) {
            resultMsg.textContent = responseData.message;
            fetchAndDisplayCollection(); // reload list of user's collections
        } else {
        resultMsg.textContent = "Error Deleting Collection"
        }
    } catch (error) {
        console.log("Error Deleting Collection: ", error);
        resultMsg.textContent = "An error occurred while attempting to delete the collection: " + collectionName;
    }
}

// Logic for Viewing items in a Collection through Join Query
async function getItemsInCollection(event) {
    event.preventDefault();

    const collectionName = document.getElementById('viewItemsCollectionName').value
    console.log("Viewing Items in collection: ", collectionName)
    try {
        const response = await fetch(`/items-in-collection?collectionName=${encodeURIComponent(collectionName)}`, {
             method: "GET"
         });
        const responseData = await response.json();
        const itemsTableBody = document.querySelector("#itemsTable tbody");
        itemsTableBody.innerHTML = "";

        if (responseData.data && responseData.data.length > 0) {
            responseData.data.forEach((item) => {
                const trElement = document.createElement("tr");
                trElement.innerHTML = `
                    <td>${item[0]}</td>
                    <td>${item[1]}</td>
                    <td>${item[2]}</td>
                    <td>${item[3]}</td>
                    <td>${item[4]}</td>
                    <td>${item[5]}</td>
                `;
                itemsTableBody.appendChild(trElement);
            });
        } else {
             const trElement = document.createElement("tr");
             trElement.innerHTML = `<td colspan="6"> No Items Found </td>`;
             itemsTableBody.appendChild(trElement);
        }
    } catch (error) {
        console.log("Error Fetching items in Collection: ", error);
    }
}

// fetch item count grouped by collectionName for logged in user
async function countItemsGroupByCollection(event) {
    event.preventDefault();

    try {
        const response = await fetch ("/count-items-group-by-collection", {
            method: "GET"
        });
        const responseData = await response.json();
        const countCollectionsTableBody = document.querySelector("#itemCountTable tbody");
        countCollectionsTableBody.innerHTML = "";

        if (responseData.data && responseData.data.length > 0) {
            responseData.data.forEach((row) => {
                const trElement = document.createElement("tr");
                trElement.innerHTML = `
                    <td>${row[0]}</td>
                    <td>${row[1]}</td>
                `;
                countCollectionsTableBody.appendChild(trElement);
            });
        } else {
             const trElement = document.createElement("tr");
             trElement.innerHTML = `<td> No Collections Found </td>`;
             countCollectionsTableBody.appendChild(trElement);
        }
    } catch (error ) {
        console.log("Error Fetching items in Collection: ", error);
    }


}


// Updates items from user's collection.
async function updateItemFromCollection(event) {
    event.preventDefault();

    const itemIDValue = document.getElementById('updateItemID').value;
    const newItemNameValue = document.getElementById('updateNewItemName').value;
    const newPrevCollectorIDValue = document.getElementById('updatePrevCollectorID').value;

    const response = await fetch('/update-item', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            itemID: itemIDValue,
            newItemName: newItemNameValue,
            newPrevCollectorID: newPrevCollectorIDValue
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateItemResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Item updated successfully!";
        // fetchTableData(); //TODO
    } else {
        messageElement.textContent = "Error updating item!";
    }
}

async function insertTradingCardHandler(event) {
    event.preventDefault();

    const athlete = document.getElementById('card_athlete').value.trim();
    const cardVariation = document.getElementById('card_cardVariation').value.trim();
    const sport = document.getElementById('card_sport').value.trim();
    const itemName = document.getElementById('card_itemName').value.trim();
    const prevCollectorID = document.getElementById('card_prevCollector').value.trim();
    const seriesName = document.getElementById('card_seriesName').value.trim();
    const releaseDate = document.getElementById('card_releaseDate').value;
    const manufacturerName = document.getElementById('card_manufacturerName').value.trim();
    const country = document.getElementById('card_country').value.trim();

    try {
        const response = await fetch('/insertTradingCard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                athlete,
                cardVariation,
                sport,
                itemName,
                prevCollectorID,
                seriesName,
                releaseDate,
                manufacturerName,
                country
            })
        });

        if (response.ok) {
            alert('The trading card has been inserted into the DB');
        } else {
            const data = await response.json();
            console.log(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error inserting trading card: ', error);
    }
}

async function insertCoinHandler(event) {
    event.preventDefault();

    const currency = document.getElementById('coin_currency').value.trim();
    const denomination = document.getElementById('coin_denomination').value.trim();
    const itemName = document.getElementById('coin_itemName').value.trim();
    const prevCollectorID = document.getElementById('coin_prevCollector').value.trim();
    const seriesName = document.getElementById('coin_seriesName').value.trim();
    const releaseDate = document.getElementById('coin_releaseDate').value;
    const manufacturerName = document.getElementById('coin_manufacturerName').value.trim();
    const country = document.getElementById('coin_country').value.trim();

    try {
        const response = await fetch('/insertCoin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currency,
                denomination,
                itemName,
                prevCollectorID,
                seriesName,
                releaseDate,
                manufacturerName,
                country
            })
        });

        if (response.ok) {
            alert('The coin has been inserted into the DB');
        } else {
            const data = await response.json();
            console.log(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error inserting coin: ', error);
    }
}

async function selectSeriesAfterDateHandler(event) {
    event.preventDefault(); 

    const date = document.getElementById('series_releaseDate').value;

    try {
        const response = await fetch(`/selectSeriesAfterDate?releaseDate=${encodeURIComponent(date)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const series = await response.json();  
            
            const tableBody = document.querySelector('#seriesTable tbody'); 
            tableBody.innerHTML = '';

            if (series.length > 0) {
                series.forEach(row => {
                    const tableRow = document.createElement('tr');  

                    tableRow.innerHTML = `
                        <td style="padding:10px">${row[0]}</td> 
                        <td style="padding:10px">${row[1]}</td> 
                        <td style="padding:10px">${row[2]}</td> 
                    `;

                    tableBody.appendChild(tableRow);
                });
            } else {
                const noResultsRow = document.createElement('tr');
                noResultsRow.innerHTML = '<td colspan="3">No series found after this date.</td>';
                tableBody.appendChild(noResultsRow);
            }
        } else {
            console.error('Error fetching series:', response.statusText);
        }
    } catch (error) {
        console.error('Error finding any series:', error);
    }
}

async function selectAuctionHousesHandler(event) {
    event.preventDefault(); 

    const minItems = document.getElementById('minItems').value; 

    try {
        const response = await fetch(`/selectAuctionHouses?minItems=${encodeURIComponent(minItems)}`, {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json' 
            }
        });

        if (response.ok) {
            const auctionHouses = await response.json();
            
            const tableBody = document.querySelector('#auctionHousesTable tbody'); 
            tableBody.innerHTML = ''; 

            if (auctionHouses.length > 0) {
                auctionHouses.forEach(row => {
                    const tableRow = document.createElement('tr');
                    
                    tableRow.innerHTML = `
                        <td style="padding:10px">${row[0]}</td>
                        <td style="padding:10px">${row[1]}</td>
                    `;

                    tableBody.appendChild(tableRow); 
                });
            } else {
                const noResultsRow = document.createElement('tr');
                noResultsRow.innerHTML = '<td colspan="2">No auction houses found with the specified number of items.</td>';
                tableBody.appendChild(noResultsRow);
            }
        } else {
            console.error('Error fetching auction houses:', response.statusText);  
        }
    } catch (error) {
        console.error('Error finding any auction houses:', error);  
    }
}

// Displays the projected history table
async function displayHistoryProjection(event) {
    event.preventDefault();

    const selectedColumns = Array.from(document.querySelectorAll('input[name="projColumns"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedColumns.length === 0) {
        alert("Select at least one column");
        return;
    }

    const tableElement = document.getElementById('projectionTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/project-on-history', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedColumns)
    });

    const responseData = await response.json();
    const tableContent = responseData.data;

    // clear old data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    // map SQL column names to more readable names
    const columnNameMap = {
        prevCollectorID: "Collector ID",
        prevCollectorName: "Collector Name",
        acquireDate: "Acquisition Date",
        sellDate: "Sell Date",
        priceSold: "Price Sold"
    };

    if (tableContent.length === 0) {
        const noDataRow = tableBody.insertRow();
        const noDataCell = noDataRow.insertCell(0);
        noDataCell.setAttribute('colspan', selectedColumns.length); // cols are still visible even when no data
        noDataCell.textContent = 'No data available';
        return;
    }

    // column headers (names)
    const headerRow = tableElement.insertRow(0);
    selectedColumns.forEach((column, index) => {
        const th = document.createElement('th');
        th.textContent = columnNameMap[column];
        headerRow.appendChild(th);
    });

    // make and fill rows
    tableContent.forEach((row) => {
        const newRow = tableBody.insertRow();
        // data values in cells
        row.forEach((column, index) => {
            const cell = newRow.insertCell(index);
            cell.textContent = column || 'n/a';
        });
    });
}

// Displays the total valuation of user's collections
async function displayCollectionValuation(event) {
    event.preventDefault();

    const tableElement = document.getElementById('collectionValuationTable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/collection-valuations', {
        method: 'GET'
    });

    const responseData = await response.json();
    const valuationTableContent = responseData.data;
    const messageElement = document.getElementById('collectionValuationResultMsg');

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    if (responseData.success && valuationTableContent.length == 0) {
        messageElement.textContent = "User has no collections or no items in all collections have valuations.";
        return;
    } else if (!responseData.success) {
        messageElement.textContent = "Error viewing total valuations!";
        return;
    } else {
        messageElement.textContent = "";
    }

    valuationTableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// Displays the auctions with all the items from the given collection
async function displayAuctionsWithCollectionItems(event) {
    event.preventDefault();

    const tableElement = document.getElementById('auctionItemCollectionTable');
    const tableBody = tableElement.querySelector('tbody');

    const collectionID = document.getElementById('auctionCollectionItemID').value;

    const response = await fetch('/auctions-with-collection-items', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({collectionID: collectionID})
    });

    const responseData = await response.json();
    const auctionTableContent = responseData.data;
    const messageElement = document.getElementById('auctionItemCollectionResultMsg');

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    console.log(responseData);

    if (responseData.success && auctionTableContent.length == 0) {
        messageElement.textContent = "No auctions have all items in that collection.";
        return;
    } else if (!responseData.success) {
        messageElement.textContent = "Error viewing auctions!";
        return;
    } else {
        messageElement.textContent = "";
    }

    auctionTableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    document.getElementById("logoutCollector").addEventListener("click", logoutCollector);
    document.getElementById("deleteCollectionForm").addEventListener("submit", deleteCollection);
    document.getElementById("countItemsInCollections").addEventListener("click", countItemsGroupByCollection);
    document.getElementById('viewItemsInCollectionForm').addEventListener('submit', getItemsInCollection);
    document.getElementById('tradingCardForm').addEventListener('submit', insertTradingCardHandler)
    document.getElementById('coinForm').addEventListener('submit', insertCoinHandler)
    document.getElementById("updateItemFromCollection").addEventListener("submit", updateItemFromCollection);
    document.getElementById("projectHistoryForm").addEventListener("submit", displayHistoryProjection);
    document.getElementById('seriesAfterDateForm').addEventListener('submit', selectSeriesAfterDateHandler);
    document.getElementById('collectionValuationForm').addEventListener('submit', displayCollectionValuation);
    document.getElementById('auctionHousesForm').addEventListener('submit', selectAuctionHousesHandler);
    document.getElementById('auctionItemCollectionForm').addEventListener('submit', displayAuctionsWithCollectionItems);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayCollection();
}
