( function (){


// * specifying buttons events
$(document).ready(()=> {
    loadData();
    $("#beginScenario").click( () => {
        beginScenario();
    })
    $("#showAll").click( () => {
        showAll();
    })
    $("#deleteDiagram").click( () => {
        deleteDiagram();
    })
    $("#dataInfo").click( () => {
        dataInfo();
    })


})

let facade = null;
let autocompleteHelp = null;
let selectedData = data_new;

function loadData() {
    let t1 = performance.now();

    facade = new Facade(selectedData, 'gojs');
    autocompleteHelp = findUniqueEntitiesForAutocomplete(selectedData).map(el => {
        return el.key + " - " + el.name
    });

    Toast.fire({
        icon: 'success',
        title: `Підготовка даних зайняла ${duration(t1, performance.now())}`
    })
}



function showAll() {
    if (!facade) return showError();
    facade.showAll();
}

// * starting a SwetAlert2 chaining windows scenario
function beginScenario() {

    if (!facade) return showError();
    scenario(autocompleteHelp)
        .then((visType) => {
            switch (visType.type) {
                case "singleEntity":
                    //facade.showAllNodesFrom(visType.mainEntityId);
                    let onePersonType = $('#oneNodeShowType>option:selected').attr("name");
                    if( onePersonType == "all"){
                        facade.showAllNodesFrom(visType.mainEntityId);
                    } else if( onePersonType = "oneEdge"){
                        facade.showFrom(visType.mainEntityId);
                    }
                    break;
                case "chain":
                    let maxPathCount = parseInt($('#maxPathCount').val()),
                        searchType = $('#searchType>option:selected').attr("name");
                    facade.showFromTo(visType.mainEntityId, visType.secondEntityId, maxPathCount, searchType);
                    break;
                case "canceled":
                    return;
            }
        });
}

function deleteDiagram() {
    if (!facade) return showError();
    facade.deleteDiagram();
    Toast.fire({
        icon: 'warning',
        title: ' Діаграму очищено'
    })
}

// * modal window to show loading time information
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true
});


function duration(t1, t2) {
    return `${((t2 - t1) / 1000).toFixed(3)} сек.`
}

function showError() {
    Toast.fire({
        icon: 'error',
        title: 'Зачекайте, дані ще не завантажено'
    })
}


function findUniqueEntitiesForAutocomplete(tableData) {
    let uniqueEntities = {};
    tableData.forEach(row => {

        if (!uniqueEntities[row['K0201']]) {
            uniqueEntities[row['K0201']] = {
                key: row['K0201'],
                name: row['SHORTNAME1']
            };
        }

        if (!uniqueEntities[row['K0202']]) {
            uniqueEntities[row['K0202']] = {
                key: row['K0202'],
                name: row['SHORTNAME2']
            };
        }
    });

    let resArr = [];
    for (let entity in uniqueEntities) {
        resArr.push({ key: uniqueEntities[entity].key, name: uniqueEntities[entity].name })
    }
    return resArr;
}


$(function () {
    // on page load, set the text of the label based the value of the range
    $('#maxPathCountLabel').text(`Макс. шляхів (пошук у ширину):  ${$('#maxPathCount').val()}`);

    // setup an event handler to set the text when the range value is dragged (see event for input) or changed (see event for change)
    $('#maxPathCount').on('input change', function () {
        $('#maxPathCountLabel').val($('#maxPathCount').val());
    });

    $('#maxPathCountLabel').on('input change', function () {
        $('#maxPathCount').val($('#maxPathCountLabel').val());
    });
});
})();


/* function dataInfo() {
    let uniqueF069 = [];
    let uniqueK021 = [];
    const definedF069Values = ["01", "02", "07", "08", "10", "11", "68", "06", "09", "41", "99"];
    const definedK021Values = ["3", "2", "6", "A", "F", "I", "1", "D", "E", "G", "4", "5", "7", "B", "H", "L", "8", "9", "C", "K"];
    const definedF069Ranges = [
        {
            from: 12,
            to: 15
        },
        {
            from: 16,
            to: 40
        },
    ];

    selectedData.forEach(row => {
        if (!uniqueF069.includes(row['F069'])) {
            uniqueF069.push(row['F069']);
        }
        if (!uniqueK021.includes(row['K021_1'])) {
            uniqueK021.push(row['K021_1']);
        }
        if (!uniqueK021.includes(row['K021_2'])) {
            uniqueK021.push(row['K021_2']);
        }
    });
    let index = uniqueF069.length - 1;
    while (index >= 0) {
        if (definedF069Values.includes(uniqueF069[index])) {
            uniqueF069.splice(index, 1);
        } else {
            for (rangeIndex = 0; rangeIndex < definedF069Ranges.length; rangeIndex++) {
                if (uniqueF069[index] >= definedF069Ranges[rangeIndex].from && uniqueF069[index] <= definedF069Ranges[rangeIndex].to) {
                    uniqueF069.splice(index, 1);
                    break;
                }
            }
        }
        index--;
    }
    index = uniqueK021.length - 1;
    while (index >= 0) {
        if (definedK021Values.includes(uniqueK021[index])) {
            uniqueK021.splice(index, 1);
        }
        index--;
    }

    //let oneEdgeChildren = facade.Graph.getOneEdgeChildren('');
    //console.log(oneEdgeChildren);
} */