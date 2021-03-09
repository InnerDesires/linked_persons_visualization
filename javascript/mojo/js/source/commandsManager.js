/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */


class commandsManager {
    constructor(domNode, buttons) {
        removeElement('customUtils');
        removeElement('hider');
        this.root = domNode;
        addHider(domNode);
        removeElement('customUtils');
        this.customUtils = document.createElement('div');
        this.customUtils.id = 'customUtils';
        this.buttonsContainer = document.createElement('div');
        buttons.forEach(el => {
            let sign = document.createElement('p');
            sign.className = el.className || 'commandSign';
            sign.innerText = el.innerHTML;
            sign.style = `
                border: none;
                padding: 17px;
                margin: 0;
                font-size: 1.5em;
            `;
            sign.addEventListener('click', el.onClick);
            this.buttonsContainer.appendChild(sign);
        });

        this.expander = document.createElement('div');
        this.expander.id = 'expander';

        this.customUtils.appendChild(this.buttonsContainer);
        this.customUtils.appendChild(this.expander);
        this.root.parentElement.appendChild(this.customUtils);

        this.setStyles();

        let offset = document.getElementById('expander').getBoundingClientRect().left - document.getElementById('customUtils').getBoundingClientRect().left - 3;
        this.customUtils.style.left = `${-offset}px`;
        let css = `
        #customUtils:hover { 
            margin-left: ${offset}px;
            }
        #customUtils.hover { 
            margin-left: ${offset}px;
            }`;
        var style = document.createElement('style');
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.getElementsByTagName('head')[0].appendChild(style);
        this.customUtils.classList.add('hover');
        setTimeout(() => {
            this.customUtils.classList.remove('hover');
        }, 500);


        this.diagramInfo = document.createElement('div');
        this.diagramInfo.id = 'diagramInfo';
        this.buttonsContainer.prepend(this.diagramInfo);

        this.usageHistory = document.createElement('div');
        this.usageHistory.id = 'usageHistory';
        this.usageHistory.style = `
                padding: 17px;
                padding-top: 0;
            `;
        this.buttonsContainer.appendChild(this.usageHistory);
    }

    setStyles() {
        this.buttonsContainer.style = `
            width: 100%;
            display: flex; 
            flex-direction: column;
            height: 100%;
            box-shadow: 2px 0px 5px 0px rgba(100,100,100,0.6);
            background: white;
            
            overflow-y: scroll;
            `;
        this.buttonsContainer.classList.add('disable-scrollbars');
        this.customUtils.style = `
            align-items: center;
            position: absolute;
            top: 10px;
            display: flex;
            flex-direction: row;
            height: ${this.root.style.height};
            z-index: 15000;
            transition: 0.9s;
            `;


        this.expander.innerHTML = '<span>&nbsp;>&nbsp;</span>';
        this.expander.style = `
            background-color: rgb(255,255,255);
            color: rgb(150,150,150);
            padding: 10px 2px;
            transform: translateX(-1px);
            box-shadow: 4px 0px 5px -2px rgba(100,100,100,0.6);
            border-radius: 0px 50% 50% 0px;
            display: flex;
            align-items: center;
            line-height: 1em;
            position: relative;`;

    }

    getButton(index) {
        let button = this.buttonsContainer.getElementsByClassName('commandSign')[index];
        return {
            activate: function () {
                if (button && button.classList) {
                    button.classList.remove('inactive');
                }
            },
            deactivate: function () {
                if (button && button.classList) {
                    button.classList.add('inactive');
                }
            }
        };
    }

    updateDiagramInfo(entriesArray) {
        if (!entriesArray) {
            return;
        }
        this.diagramInfo.innerHTML = '';
        entriesArray.forEach(entry => {
            let newEl = document.createElement('div');
            newEl.classList.add('infoElement');
            let newValue = document.createElement('p');
            let newName = document.createElement('p');
            newValue.classList.add('diagramInfoVal');
            newName.classList.add('diagramInfoName');
            newValue.innerText = entry.value || 'Не вказано';
            newName.innerText = entry.name || 'Не вказано';
            newEl.appendChild(newValue);
            newEl.appendChild(newName);
            this.diagramInfo.appendChild(newEl);
        });
    }

    updateHistory() {
        if (!window.usageHistory || !window.usageHistory.forEach) {
            return;
        }
        this.usageHistory.innerHTML = '';
        if (window.usageHistory && window.usageHistory.length > 0) {
            let historyIconSrc = 'data:image/png;base64,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';
            let historyIconImage = document.createElement('img');
            historyIconImage.src = historyIconSrc;
            historyIconImage.style = `
            width: 40px;
            height: 40px;
            padding: 0;
            margin 0;
        `;
            let historyIconContainer = document.createElement('div');
            historyIconContainer.appendChild(historyIconImage);
            historyIconContainer.style = `
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 0;
            margin 0;
            margin-bottom: 15px;
        `;
            this.usageHistory.appendChild(historyIconContainer);
        }
        window.usageHistory.forEach(viewEntry => {
            let entryContainer = document.createElement('div');
            let subjectsColumn = document.createElement('div');
            let restoreButtonContainer = document.createElement('div');
            let restoreButton = document.createElement('button');
            restoreButton.innerText = 'Відновити';
            viewEntry.entities.forEach((entity, index) => {

                /*   Creating blank separate Elements first   */
                let entityContainer = document.createElement('div');
                let timeToAddAfterFirstEntityTypeString = '';
                // if current element isn't first - we add chain element to the entityContainer before it
                if (index !== 0) {
                    let chainSrc = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKWSURBVGhD7ZhLyE1RFMcvA/JIjJSIueRVjJWJUhgRJkYm8kiSGEuMkEh9ZaZkYuCRxABl5DEiJSIG8kooA4/f/5y1srvd757rnn2+u0/tX/1a++x7O+111t7n7n07mUwmGSZbbCXTcDPew7f4CR/iKVyErWAhXsU/fdyNSTMbn6AP+COexRN42/rcLZgsx9AHehqVWMgK/IH6/CsmOc006PeoQd7C6diL9ejJ7lNHaqxBH+BGdfThJep7D4qrGjTxSpxvUWig/fAE5lkcmqbf7b8sjoeqIX5bHJomEvHBDcIki7VpuiJV9/dEao+jiUTCp1xVnf+pXl+arsigieQ14jRdkar7eyK1E8prZEA00GV4AHvtpzyR2glNxBo5h8fxGWr7EpLcGtmPN3BlcfUP3f9a2exMRW0itfN1oq2RGCzBz6hKHMXt1pb6TGxA79N5xLmI6ntVXNUgRkW0HdfWXb8FN/EbOjMtXsELZbOYXr5efIuvM8nI8ePso+KqTMqf/kl1GKvR+3egjsJeyfNYixgVWWBRhynxBe+UzeJM7gv8nUUxAzehnxwvWRyamG+tcJuxy6LQmtiJ3Qta0/AFnkG9BEaO/8ngbydnHfpUeo6qnF+HiUYhZkW6n/h1XI76D+sIKgEnbEchRiL9fgMe4x7UGgi/F/13I2ZFqog++JAYifg0qZou0adTyERWpDVrpGrq5DUyCHmNDEHyifjWpOpeUyyKnxajESMRP0ussjgevrkUHyxGI0Yidy3OwbVlsyfbLH5H3/InhbbimipaAzpfdFdGU+og6nN5GZNlK/pA5RgeQiWgp+/9b3AuJs1hDJPp9ikuxVawGFWN16i3mabafdyLfhpsHfpjYVbZzGQyo6XT+Quao59ipH6tkQAAAABJRU5ErkJggg=='
                    let chainDiv = document.createElement('div');
                    let chainImage = document.createElement('img');
                    chainImage.src = chainSrc;
                    chainDiv.appendChild(chainImage);

                    chainImage.style = `
                        width: 20px;
                        height: 20px;
                    `;
                    chainDiv.style = `
                        width: 100%;
                        display: flex; 
                        justify-content: space-around;
                        padding: 5px 0;
                    `;

                    subjectsColumn.appendChild(chainDiv);
                } else {
                    timeToAddAfterFirstEntityTypeString = typeof viewEntry.time == 'string' ? '   ' + viewEntry.time : '   Час не вказаний';
                }

                const displayImageSrcAttribute = typeof entity.imageString == 'string' ? entity.imageString : 'Час не вказаний';
                const displayName = typeof entity.displayName == 'string' ? entity.displayName : 'Ім\'я не вказане';
                let displayType = typeof entity.displayType == 'string' ? '' : '';
                displayType += timeToAddAfterFirstEntityTypeString;

                let entityImageCol = document.createElement('div');
                let entityImageElement = document.createElement('img');

                let entityInfoCol = document.createElement('div');
                let entityInfoType = document.createElement('p');
                let entityInfoName = document.createElement('p');

                /*  Creating corresponding Elements tree by using appendChild() in required order  */
                entityInfoCol.appendChild(entityInfoType);
                entityInfoCol.appendChild(entityInfoName);

                entityImageCol.appendChild(entityImageElement);

                entityContainer.appendChild(entityImageCol);
                entityContainer.appendChild(entityInfoCol);

                /* Filling Elements with corresponding values */
                entityImageElement.src = 'data:image/png;base64, ' + displayImageSrcAttribute;
                entityInfoName.innerText = displayName;
                entityInfoType.innerText = displayType;

                /*  Applying styles  */
                entityContainer.style = `
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                `;

                entityImageCol.style = `
                    padding: 10px;
                    margin-right: 10px;
                    background-color: white;
                    border-radius: 10px;
                `;
                entityImageElement.style = `
                    width: 55px;
                    height: 55px;
                `;

                entityInfoCol.style = `
                    display: flex;
                    flex-direction: column;
                `;
                entityInfoType.style = `
                    margin: 0;
                    padding: 0;
                    font-size: 11px;
                `;
                entityInfoName.style = `
                    margin: 0;
                    padding: 0;
                    font-size: 16px;
                    max-width: 250px;
                `;
                subjectsColumn.appendChild(entityContainer);
            });
            entryContainer.appendChild(subjectsColumn);
            restoreButtonContainer.appendChild(restoreButton);
            entryContainer.appendChild(restoreButtonContainer);
            restoreButton.addEventListener('click', () => {
                try {
                    main(g_mstr_api, { buttonRestore: true, visType: viewEntry.visType });

                } catch (error) {
                    catchError(error);
                }
            });

            entryContainer.style = `
                display: flex;
                flex-direction: column;
                padding: 10px;
                margin-bottom: 20px;
                border-radius: 10px;
                background-color: #F0F0F0;
            `;

            subjectsColumn.style = `
                display: flex;
                flex-direction: column;
                margin-right: 10px;
            `;

            restoreButtonContainer.style = `
                margin-top: 10px;
                height: 100%;
                display: flex;
            `;
            restoreButton.style = `
                margin-left: auto;
                font-size: 16px;
                padding: 10px;
                border: none;
                background-color: white;
                border-radius: 10px;
            `;
            this.usageHistory.appendChild(entryContainer);

        });
        let offset = document.getElementById('expander').getBoundingClientRect().left - document.getElementById('customUtils').getBoundingClientRect().left - 3;
        this.customUtils.style.left = `${-offset}px`;
        let css = `
        #customUtils:hover { 
            margin-left: ${offset}px;
            }
        #customUtils.hover { 
            margin-left: ${offset}px;
            }`;
        var style = document.createElement('style');
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.getElementsByTagName('head')[0].appendChild(style);
    }

}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
}
function addHider(domNode) {
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
    domNode.parentElement.appendChild(hider);
}

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}