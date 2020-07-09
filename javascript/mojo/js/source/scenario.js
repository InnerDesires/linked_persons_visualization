/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

async function scenario(autocompleteHelp, facade) {
    async function getK20(title, propertyToChange, searchHelp) {
        return await Swal.fire({
            title: title,
            icon: 'question',
            input: 'text',
            confirmButtonText: 'Продовжити',
            showCancelButton: true,
            cancelButtonText: 'Відмінити та почати спочатку',
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    let res = (autocompleteHelp.includes(value));
                    if (res) {
                        resolve();
                    } else {
                        resolve('Оберіть елемент з випадаючого списку');
                    }
                });
            },
            onOpen: () => {
                autocomplete(document.getElementsByClassName('swal2-input')[0], searchHelp);
            },
            onClose: () => {
                let customInput = document.getElementsByClassName('swal2-input')[0];
                scenario[propertyToChange] = customInput ? customInput.value : '';
            },
        });
    }

    const CUSTOM_INPUT_ID = 'eoijgp[q34jihv89yu59hjegpuuh';
    let scenario = {
        typeOneSelected: false,
        typeTwoSelected: false,
        mainEntityEntered: false,
        secondEntityEntered: false,
        mainEntityId: '',
        secondEntityId: '',
        setAllToFalse: function () {
            this.typeOneSelected = false;
            this.typeTwoSelected = false;
            this.mainEntityEntered = false;
            this.secondEntityEntered = false;
            this.mainEntityId = '';
            this.secondEntityId = '';
        }
    };

    while (!((scenario.typeOneSelected && scenario.mainEntityEntered) || (scenario.typeTwoSelected && scenario.mainEntityEntered && scenario.secondEntityEntered))) {
        scenario.setAllToFalse();
        const res = await Swal.fire({
            icon: 'info',
            title: 'Оберіть тип діаграми',
            input: 'radio',
            inputOptions: {
                'singleEntity': 'Діаграма навколо однієї ключової сутності',
                'chain': 'Побудова ланцюга звязків між двома сутностями'
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'Оберіть значення';
                }
            },
            confirmButtonText: 'Продовжити',
            showCancelButton: true,
            cancelButtonText: 'Відміна побудови візуалізації',

        });

        let visType = res.value;

        if (res.dismiss === 'cancel') {
            break;
        } else if (!res.value) {
            continue;
        }



        while (!scenario.mainEntityId) {
            let res = await getK20('Ідентифікатор K020 основної особи діаграми', 'mainEntityId', autocompleteHelp);
            if (res.dismiss === 'cancel' || res.dismiss === 'backdrop') {
                scenario.mainEntityId = ''; // in case input contained a string before user pressed cancel or backdrop
                break;
            }
        }

        if (scenario.mainEntityId)
            scenario.mainEntityEntered = true;

        if (visType === 'singleEntity' && scenario.mainEntityEntered) {
            scenario.typeOneSelected = true;
            let visualizationBuildingConfirmation = await Swal.fire({
                title: 'Тип діаграми:\n єдина особа',
                html: `Введене значення: <br> ${scenario.mainEntityId}`,
                icon: 'success',
                confirmButtonText: 'Почати побудову візуалізації',
                showCancelButton: true,
                cancelButtonText: 'Відміна',

            });
            if (visualizationBuildingConfirmation.value === true) {
                return {
                    type: 'singleEntity',
                    mainEntityId: scenario.mainEntityId.split(' ⁃', 1)[0]
                };
            } else {
                scenario.setAllToFalse();
            }
        } else if (visType === 'chain' && scenario.mainEntityEntered) {
            let newAutocompleteHelp = facade.getNewAutcompleteList(scenario.mainEntityId.split(' ⁃', 1)[0]);
            if (!newAutocompleteHelp || !newAutocompleteHelp.length) {
                scenario.secondEntityId = ''; // in case input contained a string before user pressed cancel or backdrop
                break;
            }
            while (!scenario.secondEntityId) {
                let res = await getK20('Ідентифікатор K020 особи, до якої формуватиметься ланцюг звязків', 'secondEntityId', newAutocompleteHelp);
                if (res.dismiss === 'cancel' || res.dismiss === 'backdrop') {
                    scenario.secondEntityId = ''; // in case input contained a string before user pressed cancel or backdrop
                    break;
                }
            }

            if (scenario.secondEntityId) {
                scenario.secondEntityEntered = true;
                let visualizationBuildingConfirmation = await Swal.fire({
                    icon: 'success',
                    title: 'Тип діаграми:\n Зв\'язок між двома сутностями',
                    html: `Введені ідентифікатори: <br> ${scenario.mainEntityId}, ${scenario.secondEntityId}`,
                    confirmButtonText: 'Почати побудову візуалізації',
                    showCancelButton: true,
                    cancelButtonText: 'Відмінити та почати спочатку',
                });
                // If user pressed Continue
                if (visualizationBuildingConfirmation.value === true) {
                    return {
                        type: 'chain',
                        mainEntityId: scenario.mainEntityId.split(' ⁃', 1)[0],
                        secondEntityId: scenario.secondEntityId.split(' ⁃', 1)[0]
                    };
                } else {
                    scenario.setAllToFalse();
                }
            }
        }
    }
    return {
        type: 'canceled',
        mainEntityId: null,
        secondEntityId: null
    };
}