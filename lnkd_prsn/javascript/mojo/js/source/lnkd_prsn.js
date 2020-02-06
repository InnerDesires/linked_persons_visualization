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
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/go.js", forceReload: false },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/searchbox.js" },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/swal.js", forceReload: false },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/images.js", forceReload: false },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/facade.js" },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/main.js" },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/graph.js" },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/scenario.js" },
                { url: "file://../plugins/lnkd_prsn/javascript/mojo/js/source/renderer.js" }
            ],

            useRichTooltip: false,
            reuseDOMNode: false,
            supportNEE: true,
            plot: function () {
                try {

                    /**
                     * this.dataInterface provides acces to the data, loaded my the user
                     */

                    this.domNode.style.display = "flex";
                    this.domNode.style.flexDirection = "column";
                    this.domNode.style.alignItems = "center";
                    this.domNode.style.justifyContent = "center";

                    window.button = document.createElement("button");
                    window.button.innerHTML = "Почати роботу";
                    window.button.id = "customStartButton";
                    window.button.style.maxWidth = "300px";

                    this.domNode.appendChild(window.button)
                    
                    window.button.addEventListener("click", () => {
                        main(this.dataInterface, this.domNode);
                        window.button.style.display = "none";
                    });


                } catch (e) {
                    alert(e)
                }
            }
        })
}());
//@ sourceURL=lnkd_prsn.js