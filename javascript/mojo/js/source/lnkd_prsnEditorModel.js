(function () {
    if (!mstrmojo.plugins.lnkd_prsn) {
        mstrmojo.plugins.lnkd_prsn = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.vi.models.editors.CustomVisEditorModel",
        "mstrmojo.array"
    );

    mstrmojo.plugins.lnkd_prsn.lnkd_prsnEditorModel = mstrmojo.declare(
        mstrmojo.vi.models.editors.CustomVisEditorModel,
        null,
        {
            scriptClass: "mstrmojo.plugins.lnkd_prsn.lnkd_prsnEditorModel",
            cssClass: "lnkd_prsneditormodel",
            getCustomProperty: function getCustomProperty() {
                var $WT = mstrmojo.vi.models.editors.CustomVisEditorModel.WIDGET_TYPE;
                let props = [
                    {
                        name: 'Налаштування візуацізації',
                        value: [
                            {
                                style: $WT.EDITORGROUP,
                                items: [
                                    {
                                        style: $WT.LABEL,
                                        labelText: "Максимальна кількість найкоротших шляхів між сутностями"
                                    },
                                    {
                                        style: $WT.STEPPER,
                                        propertyName: "maxPathesCount",
                                        min: 1,
                                        max: 1000
                                    }
                                ]
                            }
                        ]
                    }
                ];
                return props;
            }
        })
}());
//@ sourceURL=lnkd_prsnEditorModel.js