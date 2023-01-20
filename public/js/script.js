var menuInfo = null
var menuHTMLReference = []
var newOrderGlobal = []
var tempData = null
var inputTarget = null
var dashBoardColumnButtonsHTML = []
var dashBoardInactiveColumnButtonsHTML = []

async function fetchJSON() {
    // Fetch the JSON file
    const response = await fetch('homeScreenData.json');
    // Parse the JSON file
    const data = await response.json();

    menuInfo = data;

    return data
}

function populateData(data) {
    title = data.title
    menuItems = data.menuItems

    dashBoardContainer = document.getElementById('dashboard-content');
    dashBoardContainer.innerHTML = ""

    for (const coloumnIndex in menuItems) {
        row = menuItems[coloumnIndex];
        var coloumnHTMLReference = []
        coloumnHTML = document.createElement('div');
        coloumnHTML.className = 'dashboard_column';
        coloumnHTML.id = "column_" + coloumnIndex;

        coloumnItemsHTML = document.createElement('div');
        coloumnItemsHTML.className = 'column_items';
        coloumnItemsHTML.id = "column_items_" + coloumnIndex;

        cloumnHeaderContainer = document.createElement('div');
        cloumnHeaderContainer.className = 'column_header_container';

        coloumnIcon = document.createElement('i');
        className = "column_icon " + row.icon_fa;
        coloumnIcon.className = className;

        columnHeader = document.createElement('h1');
        columnHeader.innerHTML = row.title;


        cloumnHeaderContainer.appendChild(coloumnIcon);
        cloumnHeaderContainer.appendChild(columnHeader);
        coloumnHTML.appendChild(cloumnHeaderContainer);

        for (const itemIndex in row.links) {
            item = row.links[itemIndex];
            linkHTML = document.createElement('a');
            linkHTML.className = 'column_item';
            linkHTML.href = item.url;
            dataId = coloumnIndex + "_item_" + itemIndex;
            linkHTML.setAttribute("data-id", dataId);

            itemContentContainer = document.createElement('div');
            itemContentContainer.className = 'column_item_content';

            itemImage = document.createElement('img');
            itemImage.src = item.icon;

            itemTitle = document.createElement('p');
            itemTitle.innerHTML = item.title;

            itemContentContainer.appendChild(itemImage);
            itemContentContainer.appendChild(itemTitle);

            linkHTML.appendChild(itemContentContainer);
            coloumnItemsHTML.appendChild(linkHTML);

            coloumnHTMLReference.push(linkHTML);
        }

        coloumnHTML.appendChild(coloumnItemsHTML);
        dashBoardContainer.appendChild(coloumnHTML);

        menuHTMLReference.push(coloumnItemsHTML);
    }
}

async function addDragAndDrop() {
    for (coloumnIndex in menuHTMLReference) {
        await Sortable.create(menuHTMLReference[coloumnIndex], {
            group: "shared",
            animation: 150,
            store: {
                set : function(sortable) {
                    const newOrder = sortable.toArray();
                    const coloumn = sortable.el
                    const coloumnId = parseInt(sortable.el.id.split("_")[2]);
                    newOrderGlobal.push({
                        "coloumnId" : coloumnId,
                        "coloumn" : coloumn,
                        "items" : newOrder
                    });
                    changeOrder();
                }

            }
        });
    }
}

function changeOrder() {
    if (newOrderGlobal.length != 2) {
        return
    }
    toArray = newOrderGlobal[0].items
    fromArray = newOrderGlobal[1].items
    toArrayId = newOrderGlobal[0].coloumnId
    fromArrayId = newOrderGlobal[1].coloumnId
    htmlToContainer = newOrderGlobal[0].coloumn
    htmlFromContainer = newOrderGlobal[1].coloumn
    JSONToArray = menuInfo.menuItems[toArrayId].links
    JSONFromArray = menuInfo.menuItems[fromArrayId].links


    for (itemId in toArray) {
        item = toArray[itemId]
        itemColoumnId = parseInt(item.split("_")[0])
        itemHTML = htmlToContainer.children[itemId]

        if (itemColoumnId == fromArrayId) {
            itemIndex = parseInt(item.split("_")[2])
            
            removedElement = JSONFromArray.splice(itemIndex, 1)
            JSONToArray.splice(itemId, 0, removedElement[0])
        } else {

        }

        dataId = toArrayId + "_item_" + itemId;
        itemHTML.setAttribute("data-id", dataId);

    }

    for (itemId in fromArray) {
        itemHTML = htmlFromContainer.children[itemId]

        dataId = fromArrayId + "_item_" + itemId;
        itemHTML.setAttribute("data-id", dataId);
    }

    newOrderGlobal = []
    updateJSON();
}

async function updateJSON() {
    //send post request to server to update json
    const response = await fetch('/updateJSON', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuInfo)
    });
}

async function createDashboard() {
    const data = await fetchJSON();
    populateData(data);
    await addDragAndDrop();
    await spawnDashboardEditWindow(data);
}

async function spawnDashboardEditWindow(data) {
    tempData = structuredClone(data);
    const menuItems = tempData.menuItems;
    const dashboardColumnButtonContainer = document.getElementById('dashboardColumnButtons');
    const addColumnButton = document.getElementById('addColumnButton');

    Sortable.create(dashboardColumnButtonContainer, {
        group: "columns",
        animation: 100,
        store: {
            set : function(sortable) { resortDashboardColumns(sortable) }
        }
    });

    for (menuItemIndex in menuItems) {
        const menuItem = menuItems[menuItemIndex];
        spawnColoumnButton(menuItem, menuItemIndex);
    }

    for (let i = 0; i < 6 - menuItems.length; i++) {
        spawnUnusedColumnButtonSpace();  
    }

    addColumnButton.addEventListener('click', function() {
        addNewColumnClick();
    });

    addInputEventListeners();
}
 
function addInputEventListeners() {
    const titleInput = document.getElementById('input_title');
    const iconInput = document.getElementById('input_icon');
    const urlInput = document.getElementById('input_url');

    titleInput.addEventListener('input', function() {
        console.log(titleInput.value);
        updateTempData(inputTarget, titleInput.value, "title")
    });

    iconInput.addEventListener('input', function() {
        console.log(iconInput.value);
        updateTempData(inputTarget, titleInput.value, "icon")
    });

    urlInput.addEventListener('input', function() {
        console.log(urlInput.value);
        updateTempData(inputTarget, titleInput.value, "url")
    });
}

function updateTempData(inputData, input, inputType) {
    switch (inputData.type) {
        case "row":
            inputData.dataReference[inputType] = input;
            break;
        case "column":
            if (inputType == "icon") {
                inputData.dataReference["icon_fa"] = input;
                break;
            }
            inputData.dataReference[inputType] = input;
            break;
        default:
            break;
    }

}

function resortDashboardColumns(sortable) {
    const newOrder = sortable.toArray();
    let menuItems = tempData.menuItems;
    let newColumnArray = [];
    let normalIndex = 0;

    for (stringIndex of newOrder) {
        const index = parseInt(stringIndex);
        const dashboardColumn = dashBoardColumnButtonsHTML[index];
        dashboardColumn.setAttribute("data-id", normalIndex);
        newColumnArray[normalIndex] = menuItems[index];
        normalIndex++
    }

    tempData.menuItems = newColumnArray;
}

function spawnColoumnButton(menuItemData, index) {
    const dashboardColumnButtonContainer = document.getElementById('dashboardColumnButtons');
    const title = menuItemData.title;    

    const dashboardColumnButton = document.createElement('div');
    dashboardColumnButton.className = 'dashboardColumnButtonActive';
    dashboardColumnButton.setAttribute("data-id", index);

    const dashboardColumnText = document.createElement('p');
    dashboardColumnText.innerHTML = title;

    dashboardColumnButton.appendChild(dashboardColumnText);
    dashboardColumnButtonContainer.appendChild(dashboardColumnButton);

    dashboardColumnButton.addEventListener('click', function() {
        columnButtonClick(dashboardColumnButton, index);
    });
    dashBoardColumnButtonsHTML.push(dashboardColumnButton);

    return dashboardColumnButton;
}

function spawnUnusedColumnButtonSpace() {
    const dashboardColumnButtonsInactive = document.getElementById('dashboardColumnButtonsInactive');

    const dashboardColumnButton = document.createElement('div');
    dashboardColumnButton.className = 'dashboardColumnButtonInactive';
    dashboardColumnButtonsInactive.appendChild(dashboardColumnButton);
    dashBoardInactiveColumnButtonsHTML.push(dashboardColumnButton);
}

function addNewColumnClick() {
    let menuItems = tempData.menuItems;
    let menuItemsLength = menuItems.length;
    const inactiveButtonsLength = dashBoardInactiveColumnButtonsHTML.length;
    const inactiveButtonsContainer = document.getElementById('dashboardColumnButtonsInactive');
    const dashboardColumnButtonContainer = document.getElementById('dashboardColumnButtonContainer');
    const addColumnButton = document.getElementById('addColumnButton');
    //make space for new column button

    if (inactiveButtonsLength > 0) {
        inactiveButtonsContainer.removeChild(dashBoardInactiveColumnButtonsHTML[0]);
        dashBoardInactiveColumnButtonsHTML.splice(0, 1);
        if (inactiveButtonsLength == 1) {
            inactiveButtonsContainer.style.display = "none";
        }
    } else {
        dashboardColumnButtonContainer.removeChild(addColumnButton);
    }

    data = {
        "title" : "New Column",
        "icon_fa" : "fas fa-plus",
        "links" : []
    };

    const newButton = spawnColoumnButton(data, menuItemsLength);
    menuItems.push(data);
    columnButtonClick(newButton, menuItemsLength);
}

function columnButtonClick(dashboardColumnButton, index){
    const menuItems = tempData.menuItems;
    const menuItem = menuItems[index];
    const rows = menuItem.links;

    activateColumnButton(dashboardColumnButton)
    const target = {
        "type" : "column",
        "HTMLreference" : dashboardColumnButton,
        "dataReference" : menuItem
    }
    setInputs(target, menuItem.title, menuItem.icon_fa);

    clearRows();

    for (rowIndex in rows) {
        const row = rows[rowIndex];
        spawnRowButton(row, rowIndex);
    }

    for (let i = 0; i < 7 - rows.length; i++) {
        spawnUnusedRowButton();
    }
}

function activateColumnButton(dashboardColumnButton) {
    const preivousActivatedButton = document.getElementsByClassName('dashboardColumnButtonActivated')[0];
    if (preivousActivatedButton != undefined) {
        preivousActivatedButton.classList.remove('dashboardColumnButtonActivated');
    }

    dashboardColumnButton.classList.add('dashboardColumnButtonActivated');
}

function setInputs(target, title, icon, url) {
    const titleInput = document.getElementById('input_title');
    const iconInput = document.getElementById('input_icon');
    const urlInput = document.getElementById('input_url');
    inputTarget = target;

    if (title != undefined) {
        titleInput.disabled = false;
        titleInput.value = title;
    }
    
    if (icon != undefined) {
        iconInput.disabled = false;
        iconInput.value = icon;
    }
        
    if (url != undefined) {
        urlInput.disabled = false;
        urlInput.value = url;
    }
}

function clearRows() {
    const rowButtonContainer = document.getElementById('dashboardRowButtons');
    rowButtonContainer.innerHTML = "";
    const rowButtonContainerInactive = document.getElementById('dashboardRowButtonsInactive');
    rowButtonContainerInactive.innerHTML = "";
}

function spawnRowButton(rowData, index) {
    const rowButtonContainer = document.getElementById('dashboardRowButtons');
    const rowButtonDiv = document.createElement('div');
    rowButtonDiv.className = 'dashboardRowButtonActive';
    rowButtonDiv.setAttribute("data-id", index);
    rowButtonText = document.createElement('p');
    rowButtonText.innerHTML = rowData.title;
    rowButtonDiv.appendChild(rowButtonText);

    rowButtonDiv.addEventListener('click', function() {
        rowButtonClick(rowButtonDiv, rowData, index);
    });

    rowButtonContainer.appendChild(rowButtonDiv);
}

function spawnUnusedRowButton() {
    const rowButtonContainerInactive = document.getElementById('dashboardRowButtonsInactive');
    const rowButtonDiv = document.createElement('div');
    rowButtonDiv.className = 'dashboardRowButtonInactive';
    rowButtonContainerInactive.appendChild(rowButtonDiv);
}

function rowButtonClick(rowButton, rowData, index) {
    activateRowButton(rowButton);
    const target = {
        "type" : "row",
        "HTMLreference" : rowButton,
        "dataReference" : rowData
    }
    inputTarget = target;
    setInputs(target, rowData.title, rowData.icon, rowData.url);
}

function activateRowButton(rowButton) {
    const preivousActivatedButton = document.getElementsByClassName('dashboardRowButtonActivated')[0];
    if (preivousActivatedButton != undefined) {
        preivousActivatedButton.classList.remove('dashboardRowButtonActivated');
    }

    rowButton.classList.add('dashboardRowButtonActivated');
}

function setEditWindowVisibility(visibility) {
    const editWindow = document.getElementById('newServiceFormContainer')
    if (visibility) {
        editWindow.style.display = "flex"
    } else {
        editWindow.style.display = "none"
    }
}

function saveChangesClick() {
    menuInfo = structuredClone(tempData);
    updateJSON();
}

function deleteChangesClick() {
    tempData = structuredClone(data);
}