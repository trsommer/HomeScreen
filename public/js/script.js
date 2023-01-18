var menuInfo = null
var menuHTMLReference = []
var newOrderGlobal = []
var tempData = null
var currentEdit = null

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
    data = await fetchJSON();
    populateData(data);
    await addDragAndDrop();
    await spawnDashboardEditWindow(data);
}

async function spawnDashboardEditWindow(data) {
    tempData = structuredClone(data);
    var menuItems = tempData.menuItems
    var editContainer = document.getElementById('dashboardColumnButtons');
    var editInactiveContainer = document.getElementById('dashboardColumnButtonsInactive');

    for (let i = 0; i < menuItems.length; i++) {
        const menuItem = menuItems[i];
        div = document.createElement('div');
        div.classList.add('dashboardColumnButton');
        div.classList.add('dashboardColumnButtonsContent');
        
        pElement = document.createElement('p');
        pElement.innerHTML = menuItem.title;

        div.appendChild(pElement);

        div.addEventListener('click', function() {
            openColoumnEdit(menuItem, i)
        });

        editContainer.appendChild(div);
    }

    inactiveLength = 7 - menuItems.length

    for (let i = 0; i < inactiveLength; i++) {
        div = document.createElement('div');
        div.classList.add('dashboardColumnButton');
        editInactiveContainer.appendChild(div);
    }

    addDiv = document.createElement('div');
    addDiv.classList.add('dashboardColumnButton');
    addDiv.classList.add('dashboardColumnButtonsContent');
    pElement = document.createElement('p');
    pElement.innerHTML = "Add Column";
    addDiv.appendChild(pElement);
    editInactiveContainer.appendChild(addDiv);
    
    addDiv.addEventListener('click', function() {
        if (editContainer.children.length == 7) {
            return
        }
        //remove first child from inactive
        editInactiveContainer.removeChild(editInactiveContainer.children[0]);
        newDiv = document.createElement('div');
        newDiv.classList.add('dashboardColumnButton');
        newDiv.classList.add('dashboardColumnButtonsContent');
        newPElement = document.createElement('p');
        newPElement.innerHTML = "new column";
        newDiv.appendChild(newPElement);
        editContainer.appendChild(newDiv);
    });

    await Sortable.create(editContainer, {
        group: "editGroup",
        animation: 150
    });
}

function openColoumnEdit(tempData, index) {
    links = tempData.links
    linkContainer = document.getElementById('dashboardColumnLeft');
    linkContainer.innerHTML = "";
    inputs = document.getElementsByClassName('input_text');
    currentEdit = {
        "type" : "coloumn",
        "coloumn" : index,
        "link" : null
    }

    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        div = document.createElement('div');
        pElement = document.createElement('p');
        pElement.innerHTML = link.title;

        div.appendChild(pElement);

        div.addEventListener('click', function() {
            currentEdit = {
                "type" : "row",
                "coloumn" : index,
                "link" : i
            }
        
            for (let i = 0; i < 3; i++) {
                const input = inputs[i];
                switch (i) {
                    case 0:
                        input.disabled = false;
                        input.value = link.title;
                        break;
                    case 1:
                        input.disabled = false;
                        input.value = link.icon;
                        break;
                    case 2:
                        input.disabled = false;
                        input.value = link.url;
                        break;
                    default:
                        break;
                }
            }

            
        });

        linkContainer.appendChild(div);
    }

    if (links.length < 7) {
        addDiv = document.createElement('div');
        pElement = document.createElement('p');
        pElement.innerHTML = "new link";

        addDiv.addEventListener('click', function() {
            links.push({
                "title" : "new link",
                "icon" : "fas fa-link",
                "url" : "url"
            });
            for (let i = 0; i < 3; i++) {
                const input = inputs[i];
                switch (i) {
                    case 0:
                        input.disabled = false;
                        input.value = "new link";
                        break;
                    case 1:
                        input.disabled = false;
                        input.value = "fas fa-link";
                        break;
                    case 2:
                        input.disabled = false;
                        input.value = "url";
                        break;
                    default:
                        break;
                }
            }
            currentEdit = {
                "type" : "row",
                "coloumn" : index,
                "link" : links.length - 1
            };
        });

        addDiv.appendChild(pElement);
        linkContainer.appendChild(addDiv);
    }

    for (let i = 0; i < 3; i++) {
        const input = inputs[i];
        switch (i) {
            case 0:
                input.disabled = false;
                input.value = tempData.title;
                break;
            case 1:
                input.disabled = false;
                input.value = tempData.icon_fa;
                break;
            case 2:
                input.disabled = true;
                input.value = "";
                break;
            default:
                break;
        }
    }
}

function saveInputData() {
    if (currentEdit == null) {
        return
    }

    inputs = document.getElementsByClassName('input_text');
    newTitle = inputs[0].value;
    newIcon = inputs[1].value;
    newUrl = inputs[2].value;
    var coloumnIndex = currentEdit.coloumn
    coloumn = tempData.menuItems[coloumnIndex]

    if (currentEdit.type == "coloumn") {
        coloumn.title = newTitle;
        coloumn.icon_fa = newIcon;
    } else {
        link = coloumn.links[currentEdit.link]
        link.title = newTitle;
        link.icon = newIcon;
        link.url = newUrl;
    }

    console.log(tempData);

    openColoumnEdit(coloumn, coloumnIndex);
}