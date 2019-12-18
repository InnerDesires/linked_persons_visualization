(function () {
    if (!mstrmojo.plugins.lnkd_prsn) {
        mstrmojo.plugins.lnkd_prsn = {};
    }

    mstrmojo.requiresCls(
        "mstrmojo.vi.models.CustomVisDropZones",
        "mstrmojo.array"
    );

    mstrmojo.plugins.lnkd_prsn.lnkd_prsnDropZones = mstrmojo.declare(
        mstrmojo.vi.models.CustomVisDropZones,
        null,
        {
            scriptClass: "mstrmojo.plugins.lnkd_prsn.lnkd_prsnDropZones",
            cssClass: "lnkd_prsndropzones",
            getCustomDropZones: function getCustomDropZones() {
                return [
                    {
                        name: "Від якого Суб'єкта",
                        title: " (Від якого Суб'єкта) ----> (До якого Суб'єкта)",
                        allowObjectType: 1
                    }, {
                        name: "До якого Суб'єкта",
                        title: " (Від якого Суб'єкта) ----> (До якого Суб'єкта)",
                        allowObjectType: 1
                    }, {
                        name: "Тип зв'язку",
                        maxCapacity: 1,
                        title: "Використовується для форматування ліній зв'язків",
                        allowObjectType: 1
                    }, {
                        name: "Default",
                        title: "Drag Object Here"
                    }
                ];
            },
            shouldAllowObjectsInDropZone: function shouldAllowObjectsInDropZone(zone, dragObjects, idx, edge, context) {


            },
            getActionsForObjectsDropped: function getActionsForObjectsDropped(zone, droppedObjects, idx, replaceObject, extras) {


            },
            getActionsForObjectsRemoved: function getActionsForObjectsRemoved(zone, objects) {


            },
            getDropZoneContextMenuItems: function getDropZoneContextMenuItems(cfg, zone, object, el) {


            }
        })
}());
//@ sourceURL=lnkd_prsnDropZones.js