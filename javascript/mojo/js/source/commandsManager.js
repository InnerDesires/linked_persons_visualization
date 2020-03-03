/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function addUtilsMenu(domNode, me) {
    removeElement('customUtils');
    removeElement('hider');
    let newDiv = document.createElement('div');
    newDiv.id = 'customUtils';
    /* {
                    className: 'customUtilsButton',
                    innerHTML: 'Зберегти вигляд для експорту',
                    onClick: () => {
                        alert('raising event');
                        me.raiseEvent({
                            name: 'renderFinished',
                            id: me.k
                        });
                    }
                } */
    let buttons = [
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
        }
        ,
        {
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
        },
        {
            innerHTML: 'Інша діаграма',
            onClick: () => {
                main(me, { forcedReload: true });
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