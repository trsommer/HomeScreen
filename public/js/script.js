var menuInfo = null
var menuHTMLReference = []
var newOrderGlobal = []
var tempData = null
var inputTarget = null
var dashBoardColumnButtonsHTML = []
var dashBoardInactiveColumnButtonsHTML = []
currentEntity = null

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
            linkHTML.setAttribute("target", "_blank");
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
    //await addDragAndDrop();
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

    clearColumns();

    for (menuItemIndex in menuItems) {
        const menuItem = menuItems[menuItemIndex];
        spawnColoumnButton(menuItem, menuItemIndex);
    }

    for (let i = 0; i < 6 - menuItems.length; i++) {
        spawnUnusedColumnButtonSpace();  
    }

    addInputEventListeners();
}

function clearColumns() {
    const dashboardColumnButtonContainer = document.getElementById('dashboardColumnButtons');
    const dashboardColumnButtonsInactive = document.getElementById('dashboardColumnButtonsInactive');
    
    dashboardColumnButtonContainer.innerHTML = "";
    dashboardColumnButtonsInactive.innerHTML = "";
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
        updateTempData(inputTarget, iconInput.value, "icon")
    });

    urlInput.addEventListener('input', function() {
        console.log(urlInput.value);
        updateTempData(inputTarget, urlInput.value, "url")
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
    const dashBoardColumnButtons = document.getElementById('dashboardColumnButtons').children;
    let menuItems = tempData.menuItems;
    let tempMenuItems = structuredClone(menuItems);
    let normalIndex = 0;

    for (dashboardColumn of dashBoardColumnButtons) {
        dataID = parseInt(dashboardColumn.getAttribute("data-id"));

        menuItems[normalIndex] = tempMenuItems[dataID];

        dashboardColumn.setAttribute("data-id", normalIndex);
        normalIndex++
    }

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
        columnButtonClick(dashboardColumnButton);
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
    columnButtonClick(newButton);
}

function columnButtonClick(dashboardColumnButton){
    index = parseInt(dashboardColumnButton.getAttribute("data-id"));
    const rowButtonContainer = document.getElementById('dashboardRowButtons');
    const menuItems = tempData.menuItems;
    const menuItem = menuItems[index];
    const rows = menuItem.links;
    const addRowButton = document.getElementById('addRowButton');
    const deleteEntityButton = document.getElementById('button_delete_entity');

    activateColumnButton(dashboardColumnButton)
    const target = {
        "type" : "column",
        "HTMLreference" : dashboardColumnButton,
        "dataReference" : menuItem
    }
    setInputs(target, menuItem.title, menuItem.icon_fa);

    Sortable.create(rowButtonContainer, {
        group: "rows",
        animation: 100,
        store: {
            set : function(sortable) { resortDashboardRows(sortable, rows, index) }
        }
    });

    clearRows();

    for (rowIndex in rows) {
        const row = rows[rowIndex];
        spawnRowButton(row, rowIndex);
    }

    for (let i = 0; i < 6 - rows.length; i++) {
        spawnUnusedRowButton();
    }


    if (rows.length < 7) {
        addRowButton.style.display = "flex";
        //removes all previous event listeners
        cloneAddRowButton = addRowButton.cloneNode(true);
        addRowButton.replaceWith(cloneAddRowButton);

        document.getElementById('addRowButton').addEventListener('click', function() {
            addNewRowClick(rows);
        });
    } else {
        addRowButton.style.display = "none";
    }



    setCurrentEntity(menuItem, menuItems, "column", index);

    deleteEntityButton.addEventListener('click', function() {
        deleteEntityClick(menuItem, menuItems);
    });
}

function resortDashboardRows(sortable, rowData, columnIndex) {
    const rowContainer = document.getElementById('dashboardRowButtons').children;
    const tempRows = structuredClone(rowData);
    let normalIndex = 0;

    for (rowButton of rowContainer) {
        var dataId = parseInt(rowButton.getAttribute("data-id"));

        rowData[normalIndex] = tempRows[dataId];
            
        rowButton.setAttribute("data-id", normalIndex);
        normalIndex++;
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
    } else {
        titleInput.disabled = true;
        titleInput.value = "";
    }
    
    if (icon != undefined) {
        iconInput.disabled = false;
        iconInput.value = icon;
    } else {
        iconInput.disabled = true;
        iconInput.value = "";
    }
        
    if (url != undefined) {
        urlInput.disabled = false;
        urlInput.value = url;
    } else {
        urlInput.disabled = true;
        urlInput.value = "";
    }
}

function addNewRowClick(data) {
    const activeRowButtons = document.getElementById('dashboardRowButtons');
    const inactiveRowButtons = document.getElementById('dashboardRowButtonsInactive');
    const addRowButton = document.getElementById('addRowButton');

    if (inactiveRowButtons.children.length > 0) {
        inactiveRowButtons.removeChild(inactiveRowButtons.children[0]);
    } else {
        addRowButton.style.display = "none";
    }

    const newRowData = {
        "title" : "New Row",
        "icon" : "fas fa-plus",
        "url" : ""
    };

    const rowIndex = activeRowButtons.children.length

    newRow = spawnRowButton(newRowData, rowIndex);

    rowButtonClick(newRow, newRowData, rowIndex);

    data.push(newRowData);
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

    return rowButtonDiv;
}

function spawnUnusedRowButton() {
    const rowButtonContainerInactive = document.getElementById('dashboardRowButtonsInactive');
    const rowButtonDiv = document.createElement('div');
    rowButtonDiv.className = 'dashboardRowButtonInactive';
    rowButtonContainerInactive.appendChild(rowButtonDiv);
}

function rowButtonClick(rowButton, rowData, index) {
    const deleteEntityButton = document.getElementById('button_delete_entity');
    activateRowButton(rowButton);

    const target = {
        "type" : "row",
        "HTMLreference" : rowButton,
        "dataReference" : rowData
    }

    const entityData = rowData

    inputTarget = target;
    setInputs(target, rowData.title, rowData.icon, rowData.url);

    setCurrentEntity(entityData, null, "row", null);
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
        dragElement(document.getElementById("newServiceFormContainer"));
    } else {
        editWindow.style.display = "none"
    }
}

function saveChangesClick() {
    menuInfo = structuredClone(tempData);
    updateJSON();

    populateData(menuInfo);
}

function deleteChangesClick() {
    tempData = structuredClone(data);
}

function setCurrentEntity(entity, parent, type, columnIndex) {
    switch (type) {
        case "column":
            currentEntity = {
                "entity" : entity,
                "parent" : parent,
                "type" : type,
                "columnIndex" : columnIndex
            }
            break;
        case "row":
            var newParent;
            if (currentEntity.type == "column") {
                newParent = currentEntity.entity.links
            } else {
                newParent = currentEntity.parent
            }
            columnIndex = currentEntity.columnIndex
            currentEntity = {
                "entity" : entity,
                "parent" : newParent,
                "type" : type,
                "columnIndex" : columnIndex
            }
        default:
            break;
    }
}

function deleteEntityClick() {
    if (currentEntity == undefined || currentEntity == null) {
        return;
    }

    const HTMLColumnContainer = document.getElementById('dashboardColumnButtons');
    const parent = currentEntity.parent;
    const entity = currentEntity.entity;
    const index = parent.indexOf(entity);
    const type = currentEntity.type;

    parent.splice(index, 1);
    var columnIndex = currentEntity.columnIndex;

    if (type == "column") {
        columnIndex = 0;
    }
    columnButton = HTMLColumnContainer.children[columnIndex];
    columnButtonClick(columnButton);

    if (type == "column") {
        HTMLColumnContainer.removeChild(HTMLColumnContainer.children[index]);
        spawnUnusedColumnButtonSpace();
    }
}