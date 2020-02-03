async function scenario(autocompleteHelp) {
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
                    return 'Оберіть значення'
                }
            },
            confirmButtonText: 'Продовжити',
            showCancelButton: true,
            cancelButtonText: 'Відміна побудови візуалізації',
            showClass: {
                popup: 'animated fadeInRight faster'
            },
            hideClass: {
                popup: 'animated fadeOutLeft faster'
            }
        });

        let visType = res.value;

        if (res.dismiss === 'cancel') {
            break;
        } else if (!res.value) {
            continue;
        }

        async function getK20(title, propertyToChange, searchHelp) {
            return await Swal.fire({
                title: title,
                icon: 'question',
                html: `<input type="text" id="customId" class="swal2-input">`,
                confirmButtonText: "Продовжити",
                showCancelButton: true,
                cancelButtonText: 'Відмінити та почати спочатку',
                showClass: {
                    popup: 'animated fadeIn'
                },
                onOpen: () => {
                    autocomplete(document.getElementById('customId'), searchHelp)
                },
                onClose: () => {
                    let customInput = document.getElementById('customId');
                    scenario[propertyToChange] = customInput ? customInput.value : '';
                },
            });
        }

        while (!scenario.mainEntityId) {
            let res = await getK20('Ідентифікатор K020 основної особи діаграми', 'mainEntityId', autocompleteHelp);
            if (res.dismiss === "cancel" || res.dismiss === "backdrop") {
                scenario.mainEntityId = ''; // in case input contained a string before user pressed cancel or backdrop
                break;
            }
        }

        if (scenario.mainEntityId)
            scenario.mainEntityEntered = true;

        if (visType === 'singleEntity' && scenario.mainEntityEntered) {
            scenario.typeOneSelected = true;
            let visualizationBuildingConfirmation = await Swal.fire({
                title: `Тип діаграми:\n єдина особа`,
                html: `Введене значення: <br> ${scenario.mainEntityId}`,
                icon: 'success',
                confirmButtonText: 'Почати побудову візуалізації',
                showCancelButton: true,
                cancelButtonText: 'Відміна',
                showClass: {
                    popup: 'animated fadeIn'
                },
                hideClass: {
                    popup: 'animated fadeOutLeft'
                }
            });
            if (visualizationBuildingConfirmation.value === true) {
                return {
                    type: 'singleEntity',
                    mainEntityId: scenario.mainEntityId.substring(0,10)
                }
            } else {
                scenario.setAllToFalse();
            }
        } else if (visType === 'chain' && scenario.mainEntityEntered) {

            while (!scenario.secondEntityId) {
                let res = await getK20('Ідентифікатор K020 особи, до якої формуватиметься ланцюг звязків', 'secondEntityId', autocompleteHelp);
                if (res.dismiss === "cancel" || res.dismiss === "backdrop") {
                    scenario.secondEntityId = ''; // in case input contained a string before user pressed cancel or backdrop
                    break;
                }
            }

            if (scenario.secondEntityId) {
                scenario.secondEntityEntered = true;
                let visualizationBuildingConfirmation = await Swal.fire({
                    icon: 'success',
                    title: `Тип діаграми:\n Зв'язок між двома сутностями`,
                    html: `Введені ідентифікатори: <br> ${scenario.mainEntityId}, ${scenario.secondEntityId}`,
                    confirmButtonText: 'Почати побудову візуалізації',
                    showCancelButton: true,
                    cancelButtonText: 'Відмінити та почати спочатку',
                    showClass: {
                        popup: 'animated fadeIn'
                    },
                    hideClass: {
                        popup: 'animated fadeOutLeft faster'
                    }
                });
                // If user pressed Continue
                if (visualizationBuildingConfirmation.value === true) {
                    return {
                        type: 'chain',
                        mainEntityId: scenario.mainEntityId.substring(0,10),
                        secondEntityId: scenario.secondEntityId.substring(0,10)
                    }
                } else {
                    scenario.setAllToFalse();
                }
            }
        }
    }
    return  {
        type: 'canceled',
        mainEntityId: null,
        secondEntityId: null
    }
}