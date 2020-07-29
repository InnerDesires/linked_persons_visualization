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

    }

    setStyles() {
        this.buttonsContainer.style = `
            width: 100%;
            padding-top: 20px;
            display: flex; 
            flex-direction: column;
            height: 100%;
            box-shadow: 2px 0px 5px 0px rgba(100,100,100,0.6);
            background: white;`;

        this.customUtils.style = `
            align-items: center;
            position: absolute;
            top: 10px;
            display: flex;
            flex-direction: row;
            height: ${this.root.style.height};
            z-index: 15000;
            transition: 0.9s;`;


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
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
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