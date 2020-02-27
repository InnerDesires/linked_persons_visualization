/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function entryPoint(me) {
    setStyles(me);
    addStartButton(me);
    addUtilsMenu(me.domNode, me);


    if (window.visType && window.visType.type !== 'canceled') {
        main(me.dataInterface, me.domNode, me);
    }
}

function main(dataInterface, domNode, me, forcedReload = false, showAllData = false) {
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
    try {
        // getting data from mstr
        let dataArr = getMstrData();
        dataArr = processData(me, dataArr);
        if (!window.facade) {
            window.facade = new Facade(dataArr, domNode.id, me);
        } else {
            window.facade.updateData(dataArr);
        }
        if (showAllData) {
            let myVisType = {
                type: 'all'
            };
            window.visType = myVisType;
            return showDiagram({ type: 'all' });
        }
        let keyNameArray = findUniqueEntitiesForAutocomplete(dataArr);
        let autocompleteHelp = [];
        keyNameArray.forEach((el) => {
            autocompleteHelp.push(`${el.key} ⁃ ${el.name}`);
        });

        if (forcedReload || !window.visType || window.visType.type === 'canceled') {
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
            main(me.dataInterface, me.domNode, me);
        });

    }

    me.domNode.appendChild(window.button);
}

function addUtilsMenu(domNode, me) {
    removeElement('customUtils');
    removeElement('hider');
    let newDiv = document.createElement('div');
    newDiv.id = 'customUtils';

    let buttons = [
        {
            innerHTML: 'Інша діаграма',
            onClick: () => {
                main(me.dataInterface, me.domNode, me, true);
            }
        }, {
            className: 'customUtilsButton',
            innerHTML: 'Зберегти вигляд для експорту',
            onClick: () => {
                alert('raising event');
                me.raiseEvent({
                    name: 'renderFinished',
                    id: me.k
                });
            }
        }, {
            innerHTML: 'Відобразити всі дані',
            onClick: () => {
                Swal.fire({
                    title: 'Відображення всього масиву даних є часозатратним та може призвести до зависання ПЗ, Ви впевнені?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Зрозуміло',
                    cancelButtonText: 'Відміна'
                }).then((result) => {
                    if (result.value) {
                        main(me.dataInterface, me.domNode, me, true, true);
                    }
                });

            }
        }
    ];

    buttons.forEach(el => {
        let button = document.createElement('button');
        button.className = el.className || 'customUtilsButton';
        button.innerHTML = el.innerHTML;
        button.addEventListener('click', el.onClick);
        newDiv.appendChild(button);
    });

    newDiv.style =
        `
        position: absolute;
        top: 10px;
        display: flex;
        flex-direction: row;
        box-sizing: content-box;
        z-index: 999;
        transition: 0.9s;
        `;

    let expander = document.createElement('div');
    expander.innerHTML = '<span>&nbsp;&nbsp;</span>';
    expander.style = `
        background-color: rgb(230,230,230);
        color: black;
        border: 1px solid rgb(212, 212, 212);
        border-radius: 0px 50% 50% 0px;
    `;
    expander.id = 'expander';
    newDiv.appendChild(expander);


    let hider = document.createElement('div');
    let hiderButton = document.createElement('button');
    hider.id = 'hider';
    hider.style = `
        position: absolute;
        top: -17px;
        left: 0;
        
        box-sizing: content-box;
        display: flex;
        flex-direction: row;
        max-height: 80px;
        z-index: 998;
    `;
    hiderButton.innerHTML = 'Гарного дня!';
    hiderButton.style = `
        background-color: white;
        border: 1px solid white;
        padding: 0px;
        margin-right: 1px;
        color: white;
        width: 177px;
        height: 85px;
        cursor: default;
        
    `;
    hider.appendChild(hiderButton);
    //domNode.parentElement.appendChild(hider);
    domNode.parentElement.appendChild(newDiv);
    domNode.parentElement.appendChild(hider);

    let offset = document.getElementById('expander').getBoundingClientRect().left - document.getElementById('customUtils').getBoundingClientRect().left - 3;
    newDiv.style.left = `${-offset}px`;

    let css = `
    #customUtils:hover { 
        margin-left: ${offset}px;
        }
    #customUtils.hover { 
        margin-left: ${offset}px;
        }
       
    `;
    var style = document.createElement('style');
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
    let customUtils = document.getElementById('customUtils');
    customUtils.classList.add('hover');
    setTimeout(() => {
        customUtils.classList.remove('hover');
    }, 500);
}

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function setStyles(me) {
    me.domNode.style.display = 'flex';
    me.domNode.style.flexDirection = 'column';
    me.domNode.style.alignItems = 'center';
    me.domNode.style.justifyContent = 'center';
    me.domNode.style.overflowX = 'scroll';
    me.domNode.style.overflowY = 'scroll';
}

function getMstrData() {
    /*  Get the data from MSTR in JSON format  */
    return me.dataInterface.getRawData(mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ROWS_ADV, { hasSelection: true });
}
