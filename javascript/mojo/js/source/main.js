/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function entryPoint(me) {
     
    setStyles(me);
    addStartButton(me);
    addUtilsMenu(me.domNode, me);


    if (window.visType && window.visType.type !== 'canceled') {
        main(me);
    }
}

function main(me, options) {
    function showDiagram(visType) {
        let maxPathCount;
        let searchType;
        let startButton;
        switch (visType.type) {
            case 'singleEntity':
                //window.facade.showAllNodesFrom(visType.mainEntityId);
                //window.facade.showAllNodesFrom(visType.mainEntityId);
                window.facade.showFrom(visType.mainEntityId);
                break;
            case 'chain':
                maxPathCount = 5;
                searchType = 'bfs';
                window.facade.showFromTo(visType.mainEntityId, visType.secondEntityId, maxPathCount, searchType);
                break;
            case 'all':

                window.facade.showAll();
                break;
            case 'canceled':
                startButton = document.getElementById('customStartButton');
                startButton.style.display = 'block';
                return;
        }
    }

    function getMstrData() {
        /*  Get the data from MSTR in JSON format  */
        return me.dataInterface.getRawData(
            mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ROWS_ADV,
            { hasSelection: true, hasTitleName: true });
    }

    function isMstrObjectsEqual(a, b) {
        if (!a.headers || !a.values || !b.headers || !b.values) {
            return false;
        }
        if (a.headers.length !== b.headers.length || a.values.length !== b.values.length) {
            return false;
        }

        for (let i = 0; i < a.headers.length; i++) {
            if (a.headers[i].name !== b.headers[i].name) {
                return false;
            }
        }

        for (let i = 0; i < a.headers.length; i++) {
            if (a.headers[i].rv !== b.headers[i].rv) {
                return false;
            }
        }
        return true;
    }

    try {
        // getting data from mstr
        let dataArr = getMstrData();
        // Since processData() is a expensive function we should only call it in cases when parsedData was never created
        // or has been changed. To compare
        let dataChanged = true;
        if (typeof window.dataSampleToCompareWith !== 'object') {
            window.dataSampleToCompareWith = {
                first: dataArr[0],
                last: dataArr[dataArr.length - 1]
            };
        } else {
            const oldSample = window.dataSampleToCompareWith;
            window.dataSampleToCompareWith = {
                first: dataArr[0],
                last: dataArr[dataArr.length - 1]
            };
            if (dataArr.length == window.facade.rawData.length) {
                dataChanged = (!isMstrObjectsEqual(window.dataSampleToCompareWith.first, oldSample.first) || !isMstrObjectsEqual(window.dataSampleToCompareWith.last, oldSample.last));
            }
        }
        if (typeof window.facade !== 'object') {
            this.parsedData = processData(me, dataArr);
            window.facade = new Facade(parsedData, me.domNode.id, me);
        } else if (dataChanged) {
            this.parsedData = processData(me, dataArr);
            window.facade.updateData(parsedData);
        }
        if (options && options.showAllData) {
            let myVisType = {
                type: 'all'
            };
            window.visType = myVisType;
            return showDiagram(myVisType);
        }
        let keyNameArray = findUniqueEntitiesForAutocomplete(window.facade.rawData);
        let autocompleteHelp = [];
        keyNameArray.forEach((el) => {
            autocompleteHelp.push(`${el.key} ⁃ ${el.name}`);
        });

        if ((options && options.forcedReload) || !window.visType || window.visType.type === 'canceled') {
            scenario(autocompleteHelp, window.facade)
                .then(visType => {
                    if (!(window.visType && window.visType.type !== 'canceled' && visType.type === 'canceled')) {
                        window.visType = visType;
                    }
                    showDiagram(visType);
                });
        } else {
            showDiagram(window.visType);
        }


    } catch (err) {
        alert(`@main.js: ${err}`);
    }
}



function findUniqueEntitiesForAutocomplete(tableData) {

    let uniqueEntities = {};
    let resArr = [];
    tableData.forEach(row => {

        if (!uniqueEntities[row[DECOMPOSED_ATTRIBUTES.NODE1.ID]]) {
            uniqueEntities[row[DECOMPOSED_ATTRIBUTES.NODE1.ID]] = {
                key: row[DECOMPOSED_ATTRIBUTES.NODE1.ID],
                name: row[DECOMPOSED_ATTRIBUTES.NODE1.NAME]
            };
            resArr.push({ key: row[DECOMPOSED_ATTRIBUTES.NODE1.ID], name: row[DECOMPOSED_ATTRIBUTES.NODE1.NAME] });
        }

        if (!uniqueEntities[row[DECOMPOSED_ATTRIBUTES.NODE2.ID]]) {
            uniqueEntities[row[DECOMPOSED_ATTRIBUTES.NODE2.ID]] = {
                key: row[DECOMPOSED_ATTRIBUTES.NODE2.ID],
                name: row[DECOMPOSED_ATTRIBUTES.NODE2.NAME]
            };
            resArr.push({ key: row[DECOMPOSED_ATTRIBUTES.NODE2.ID], name: row[DECOMPOSED_ATTRIBUTES.NODE2.NAME] });
        }
    });
    return resArr;
}

function addStartButton(me) {
    if (!window.button) {
        window.button = document.createElement('button');
        window.button.innerHTML = 'Почати роботу';
        window.button.id = 'customStartButton';
        window.button.classList.add('customStartButton');
        window.button.style = `
            padding: 10px 20px;
            border-radius: 10px;
            background-color: #3b92ed;
            color: white;
            border: none;
            font-weight: bold;
            font-size: 20px;
            transition: 0.5s;
        `;

        window.button.addEventListener('click', () => {
            main(me);
        });

    }

    me.domNode.appendChild(window.button);
}


function setStyles(me) {
    me.domNode.style.display = 'flex';
    me.domNode.style.flexDirection = 'column';
    me.domNode.style.alignItems = 'center';
    me.domNode.style.justifyContent = 'center';
    me.domNode.style.overflowX = 'scroll';
    me.domNode.style.overflowY = 'scroll';
}
