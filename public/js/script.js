var menuInfo = null
var menuHTMLReference = []
var newOrderGlobal = []

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
}
