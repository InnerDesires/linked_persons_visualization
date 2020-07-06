/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function entryPoint(me) {
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
            innerHTML: 'Інша діаграма',
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
                        main(me, {
                            forcedReload: true,
                            showAllData: true
                        });
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
    addUtilsMenu(me.domNode, buttons);


    if (window.visType && window.visType.type !== 'canceled') {
        main(me, { type: 'autoload' });
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
                maxPathCount = 10;
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
        try {
            return me.dataInterface.getRawData(
                mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ROWS_ADV,
                { hasSelection: true, hasTitleName: true, hasThreshold: true });
        } catch (e) {
            return -1;
        }
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

        for (let i = 0; i < a.values.length; i++) {
            if (a.values[i].rv !== b.values[i].rv) {
                return false;
            }
            if (a.values[i].threshold !== b.values[i].threshold) {
                return false;
            }
        }
        return true;
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


    alert(typeof PROPS['maxPathesCount']);
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
                text: 'Переконайтеся що було перетягнуто хоча б 2 атрибути та 2 метрики'
            });
        return;
    }
    let parsedData = processData(me, dataArr);
    if (!checkForObligatoryParams(parsedData[0])) {
        resolveError();
        return;
    }
    if (typeof window.facade !== 'object') {
        window.facade = new Facade(parsedData, me.domNode.id, PROPS);
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
    } else {
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
