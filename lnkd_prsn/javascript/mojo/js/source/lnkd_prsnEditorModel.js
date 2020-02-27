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
            getCustomProperty: function getCustomProperty(){
                
}
})}());
//@ sourceURL=lnkd_prsnEditorModel.js