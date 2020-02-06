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
            getCustomDropZones: function getCustomDropZones(){
  return [ 
 { 
name: "Від якої сутності", 
maxCapacity:20, 
title:"Drag Object Here"
 }, { 
name: "Код типу сутності батьківської сутності", 
maxCapacity:1, 
title:"K021_1", 
allowObjectType:1
 }, { 
name: "До якої сутності ", 
maxCapacity:1, 
title:"K0202", 
allowObjectType:1
 }, { 
name: "Код типу сутності дочірньої сутності", 
maxCapacity:1, 
title:"Drag Attribute Here", 
allowObjectType:1
 }, { 
name: "Тип зв'язку", 
maxCapacity:1, 
title:"F069, Використовується для стилізації ліній зв'язку", 
allowObjectType:1
 }, { 
name: "Доля участі ", 
maxCapacity:1, 
title:"PR", 
allowObjectType:2
 }
 ];},
            shouldAllowObjectsInDropZone: function shouldAllowObjectsInDropZone(zone, dragObjects, idx, edge, context) {
 
 
 


            





},
            getActionsForObjectsDropped: function getActionsForObjectsDropped(zone, droppedObjects, idx, replaceObject, extras) {
 
 
 


            





},
            getActionsForObjectsRemoved: function getActionsForObjectsRemoved(zone, objects) { 
  
  
 


            





},
            getDropZoneContextMenuItems: function getDropZoneContextMenuItems(cfg, zone, object, el) {
 
 
 


            





}
})}());
//@ sourceURL=lnkd_prsnDropZones.js