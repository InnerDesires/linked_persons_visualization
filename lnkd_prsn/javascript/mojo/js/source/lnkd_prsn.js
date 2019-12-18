(function () {
    if (!mstrmojo.plugins.lnkd_prsn) {
        mstrmojo.plugins.lnkd_prsn = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.CustomVisBase",
        "mstrmojo.models.template.DataInterface",
        "mstrmojo.vi.models.editors.CustomVisEditorModel"
    );

    mstrmojo.plugins.lnkd_prsn.lnkd_prsn = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: "mstrmojo.plugins.lnkd_prsn.lnkd_prsn",
            cssClass: "lnkd_prsn",
            errorMessage: "Недостатньо даних для формування візуалізації або під час виконання скрипта сталася помилка ",
            errorDetails: "Для роботи необхідно додати принаймні 1 атрибут та 1 метрику  ",
            externalLibraries: [
                {url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/go.js"},
                {url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/searchbox.js"},
                {url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/swal.js"},
                {url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/scenario.js"},
                {url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/renderer.js"}
            ],
            useRichTooltip: false,
            reuseDOMNode: false,
            supportNEE: true,
            plot: function () {
                try {
                    const di = this.dataInterface;
                    let dataArr = di.getRawData(mstrmojo.models.template.DataInterface.ENUM_RAW_DATA_FORMAT.ROWS);
                    /*this.domNode.style.backgroundColor = 'rgb(150,150,150)';*/
                    let nodeDataArray = [];
                    dataArr.forEach((obj) => {
                        // looking if node has been already added to the node data array
                        let K0201Found = false;
                        let K0202Found = false;
                        let K0201Str = obj["K0201"];
                        let K0202Str = obj["K0202"];
                        for (let i = 0; i < nodeDataArray.length; i++) {
                            if (K0201Str === nodeDataArray[i]['key'])
                                K0201Found = true;
                            if (K0202Str === nodeDataArray[i]['key'])
                                K0202Found = true;
                        }

                        // if node wasn't found in preceding links - adding it to the Node Data Array
                        if (!K0201Found) {
                            nodeDataArray.push({
                                key: obj["K0201"],
                                name: obj["NAME1"],
                                another: obj["NAME2"],
                                pairedNodeId: obj["K0202"]
                            });
                        }
                        if (!K0202Found) {
                            nodeDataArray.push({
                                key: obj["K0202"],
                                name: obj["NAME2"],
                                another: obj["NAME1"],
                                    pairedNodeId: obj["K0201"]
                            });
                        }
                    });

                    let autocompleteHelp = nodeDataArray.map(el => {
                        return el.key + " - " + el.name
                    });

                    scenario(autocompleteHelp)
                        .then((visType) => {
                            renderer(dataArr, this.domNode.id);
                            setTimeout(() => {

                            }, 500)
                        });


                    /* let DROP_ZONES = {
                         FROM: "Від якого Суб'єкта",
                         TO: "До якого Суб'єкта",
                         LINK_TYPE: "Тип зв'язку"
                     };*/


                } catch (err) {
                    alert(err);
                }
            }
        })
}());
//@ sourceURL=lnkd_prsn.js