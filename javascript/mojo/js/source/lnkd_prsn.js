/* eslint-disable no-undef */
(function () {
    if (!mstrmojo.plugins.lnkd_prsn) {
        mstrmojo.plugins.lnkd_prsn = {};
    }

    mstrmojo.requiresCls(
        'mstrmojo.CustomVisBase',
        'mstrmojo.models.template.DataInterface',
        'mstrmojo.vi.models.editors.CustomVisEditorModel'
    );

    mstrmojo.plugins.lnkd_prsn.lnkd_prsn = mstrmojo.declare(
        mstrmojo.CustomVisBase,
        null,
        {
            scriptClass: 'mstrmojo.plugins.lnkd_prsn.lnkd_prsn',
            cssClass: 'lnkd_prsn',
            errorMessage: 'Недостатньо даних для формування візуалізації або під час виконання скрипта сталася помилка ',
            errorDetails: 'Для роботи необхідно додати принаймні 1 атрибут та 1 метрику  ',
            externalLibraries: [{ url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/go.js', forceReload: false },
            { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/searchbox.js' },
            { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/3rdParty/swal.js' },
            { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/images.js' },
            { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/commandsManager.js' },
            { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/dataProcessor.js' },
            { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/facade.js' }, { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/main.js' }, { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/graph.js' }, { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/attributes.js' }, { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/scenario.js' }, { url: 'file://../plugins/lnkd_prsn/javascript/mojo/js/source/renderer.js' }],
            useRichTooltip: false,
            reuseDOMNode: false,
            supportNEE: true,
            plot: function () {

                try {
                    this.addThresholdMenuItem();
                    g_mstr_api = this;
                    entryPoint(this);
                } catch (error) {
                    this.domNode.innerHTML = '';
                    this.domNode.parentNode.style.userSelect = '';
                    this.domNode.style.userSelect = 'all';
                    let err = document.createElement('p');
                    err.innerHTML = 'Помилка: ' + error;
                    let stack = document.createElement('p');
                    stack.innerHTML = error.stack;
                    this.domNode.appendChild(err);
                    this.domNode.appendChild(stack);
                }
            }
        });
}());
//@ sourceURL=lnkd_prsn.js