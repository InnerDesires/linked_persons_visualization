/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function entryPoint(me) {
    if (!window.usageHistory) {
        window.usageHistory = [];
    }
    function prepareVisOptions() {
        let is10Point2 = true;
        if (typeof me.addThresholdMenuItem == 'function') {
            is10Point2 = false;
        }

        if (!is10Point2) {
            let obj = {};
            CUSTOM_PROPS.forEach(el => {
                obj[el.str] = el.default;
            });
            me.setDefaultPropertyValues(obj);
        }
        let result = {};
        CUSTOM_PROPS.forEach((el) => {
            result[el.str] = me.getProperty(el.str);
        });
        return result;
    }
    let CUSTOM_PROPS = [
        {
            str: 'maxPathesCount',
            default: 12
        }
    ];
    PROPS = prepareVisOptions();
    setStyles(me);
    addStartButton(me);

    let buttons = [
        {
            innerHTML: 'Нова діаграма',
            onClick: () => {
                main(me, { forcedReload: true });
            }
        },
        {
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
                        try {
                            main(me, {
                                forcedReload: true,
                                showAllData: true
                            });
                        } catch (error) {
                            me.domNode.innerHTML = '';
                            me.domNode.parentNode.style.userSelect = '';
                            me.domNode.style.userSelect = 'all';
                            let err = document.createElement('p');
                            err.innerHTML = 'Помилка: ' + error;
                            let stack = document.createElement('p');
                            stack.innerHTML = error.stack;
                            me.domNode.appendChild(err);
                            me.domNode.appendChild(stack);
                        }
                    }
                });

            }
        }, {
            innerHTML: 'Фокус на основну сутність',
            onClick: () => {
                if (window.facade) {
                    window.facade.focusOnMainEntity();
                }
            }
        }, {
            innerHTML: 'Згорнути все',
            onClick: () => {
                if (window.facade) {
                    window.facade.collapseAll();
                }
            }
        }];
    me.commandsManager = new commandsManager(me.domNode, buttons);
    me.commandsManager.getButton(2).deactivate();
    me.commandsManager.getButton(3).deactivate();
    me.commandsManager.updateHistory();
    let dataLength;
    try {
        dataLength = me.dataInterface.getRawData(
            mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ROWS_ADV,
            { hasSelection: true, hasTitleName: true, hasThreshold: true }).length;
    } catch (e) {
        dataLength = 0;
    }
    me.commandsManager.updateDiagramInfo(
        [
            {
                name: 'Зв\'язки',
                value: numberWithCommas(dataLength)
            }
        ]
    );

    if (window.visType && window.visType.type !== 'canceled') {
        main(me, { type: 'autoload' });
    }
}

function main(me, options) {
    function showDiagram(visType) {
        let startButton;
        toggleButtons(true);
        switch (visType.type) {
            case 'singleEntity':
                /*
                    While having only main entity id, we have to get the image string for this entity and it's name and type.
                    These values are being calculated inside Renderer class for each required id. 
                */
                window.facade.showFrom(visType.mainEntityId, (res) => {
                    if (options && (options.type === 'autoload')) {
                        return;
                    }
                    window.usageHistory.unshift({
                        time: getTime(),
                        entities: [
                            {
                                imageString: res[visType.mainEntityId].imageString,
                                displayName: res[visType.mainEntityId].displayName,
                            }
                        ],
                        visType
                    });
                });
                me.commandsManager.updateHistory();
                break;
            case 'chain':
                window.facade.showFromTo(visType.mainEntityId, visType.secondEntityId, res => {
                    if (options && (options.type === 'autoload')) {
                        return;
                    }
                    window.usageHistory.unshift({
                        time: getTime(),
                        entities: [
                            {
                                imageString: res[visType.mainEntityId].imageString,
                                displayName: res[visType.mainEntityId].displayName
                            }, {
                                imageString: res[visType.secondEntityId].imageString,
                                displayName: res[visType.secondEntityId].displayName
                            }
                        ],
                        visType
                    });
                });
                me.commandsManager.updateHistory();
                break;
            case 'all':
                window.facade.showAll();
                break;
            case 'canceled':
                toggleButtons(false);
                startButton = document.getElementById('customStartButton');
                startButton.style.display = 'block';
                return;
        }
    }

    function getTime() {
        let time = new Date();
        return ('0' + time.getHours()).slice(-2) + ':' +
            ('0' + time.getMinutes()).slice(-2);
    }

    function getMstrData() {
        /*  Get the data from MSTR in JSON format  */
        try {
            return me.dataInterface.getRawData(
                mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ROWS_ADV,
                { hasSelection: true, hasTitleName: true, hasThreshold: true });
        } catch (e) {
            return -1;
        }
    }

    function resolveError() {
        Swal.fire(
            {
                icon: 'error',
                title: 'Відсутній мінімальний набір параметрів',
                text: 'Перетягніть у зони "Код першої/другої сутності" атрибути із ID та SHORTNAME для відповідної сутності '
            });
        window.visType = null;
        return;
    }
    function checkForObligatoryParams(obj) {
        function undef(a) {
            return typeof a === 'undefined';
        }
        let obligatoryParams = [DECOMPOSED_ATTRIBUTES.NODE1.ID, DECOMPOSED_ATTRIBUTES.NODE2.ID, DECOMPOSED_ATTRIBUTES.NODE1.NAME, DECOMPOSED_ATTRIBUTES.NODE2.NAME];
        for (let i = 0; i < obligatoryParams.length; i++) {
            if (undef(obj[obligatoryParams[i]])) {
                return false;
            }
        }
        return true;
    }

    function toggleButtons(state) {
        if (state) {
            me.commandsManager.getButton(2).activate();
            me.commandsManager.getButton(3).activate();
        } else {
            me.commandsManager.getButton(2).deactivate();
            me.commandsManager.getButton(3).deactivate();
        }
    }

    // getting data from mstr
    let dataArr = getMstrData();

    if (dataArr === -1) {
        if (window.visType && window.visType.type !== 'canceled') {
            window.visType = null;
            return;
        }
        Swal.fire(
            {
                title: 'Помилка при отриманні даних від Microstrategy',
                text: 'Переконайтеся, що було перетягнуто ідентифікатори сутностей та, хоча б, 1 метрику'
            });
        return;
    }
    let parsedData = processData(me, dataArr);

    if (!checkForObligatoryParams(parsedData[0])) {
        resolveError();
        return;
    }
    if (typeof window.facade !== 'object') {
        window.facade = new Facade(parsedData, me.domNode.id, PROPS, me);
    } else if (window.facade && window.facade.updateData) {
        window.facade.updateProps(PROPS);
        window.facade.updateData(parsedData);
    } else {
        window.visType = null;
        return;
    }
    if (options && options.showAllData) {
        let myVisType = {
            type: 'all'
        };
        window.visType = myVisType;
        showDiagram(myVisType);
        return;
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
    } else if (options && options.buttonRestore && options.visType) {
        window.visType = options.visType;
        showDiagram(window.visType);
    } else if (window.visType) {
        showDiagram(window.visType);
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
