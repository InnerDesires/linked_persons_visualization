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
                let displayType = typeof entity.displayType == 'string' ? entity.displayType : 'Тип не вказаний';
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
                `;

                entityImageCol.style = `
                    padding: 5px;
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
                `;
                subjectsColumn.appendChild(entityContainer);
            });
            entryContainer.appendChild(subjectsColumn);
            restoreButtonContainer.appendChild(restoreButton);
            entryContainer.appendChild(restoreButtonContainer);

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
            this.usageHistory.style = `
                padding: 17px;
            `;
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