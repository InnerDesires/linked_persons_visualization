/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
(function () {
    if (!mstrmojo.plugins.lnkd_prsn) {
        mstrmojo.plugins.lnkd_prsn = {};
    }

    mstrmojo.requiresCls(
        'mstrmojo.vi.models.CustomVisDropZones',
        'mstrmojo.array'
    );

    mstrmojo.plugins.lnkd_prsn.lnkd_prsnDropZones = mstrmojo.declare(
        mstrmojo.vi.models.CustomVisDropZones,
        null,
        {
            scriptClass: 'mstrmojo.plugins.lnkd_prsn.lnkd_prsnDropZones',
            cssClass: 'lnkd_prsndropzones',
            getCustomDropZones: function getCustomDropZones() {
                return [
                    {
                        name: 'Код першої сутності',
                        maxCapacity: 1,
                        title: 'TRELP16_K021 Код Особи 1 + SHORTNAME1',
                        allowObjectType: 1
                    }, {
                        name: 'Тип пов\'язаності першої сутності',
                        maxCapacity: 1,
                        title: 'K060_1 Тип пов\'язаних з банком осіб (alias1) + STATUS1',
                        allowObjectType: 1
                    }, {
                        name: 'Колір першої сутності',
                        maxCapacity: 1,
                        title: 'K060_1_NodeColor',
                        allowObjectType: 2
                    }, {
                        name: 'Категорія першої сутності',
                        maxCapacity: 1,
                        title: 'K021_1_NodeCategory',
                        allowObjectType: 2
                    }, {
                        name: 'Код другої сутності',
                        maxCapacity: 1,
                        title: 'TRELP16_K021 Код Особи 2 + SHORTNAME1',
                        allowObjectType: 1
                    }, {
                        name: 'Тип пов\'язаності другої сутності',
                        maxCapacity: 1,
                        title: 'K060_2 Тип пов\'язаних з банком осіб (alias2) + STATUS2',
                        allowObjectType: 1
                    }, {
                        name: 'Колір другої сутності',
                        maxCapacity: 1,
                        title: 'K060_2_NodeColor',
                        allowObjectType: 2
                    }, {
                        name: 'Категорія другої сутності',
                        maxCapacity: 1,
                        title: 'K021_2_NodeCategory',
                        allowObjectType: 2
                    }, {
                        name: 'Код сутності зв\'язку',
                        maxCapacity: 1,
                        title: 'F069 Код сутності зв’язку',
                        allowObjectType: 1
                    }, {
                        name: 'Частка прямої участі',
                        maxCapacity: 1,
                        title: 'T0901',
                        allowObjectType: 2
                    }, {
                        name: 'Дати початку (та закінчення)',
                        maxCapacity: 1,
                        title: 'TRELP16_Data',
                        allowObjectType: 1
                    }, {
                        name: 'Категорія зв\'язку',
                        maxCapacity: 1,
                        title: 'F069_LinkCategory',
                        allowObjectType: 2
                    }, {
                        name: 'Банк',
                        maxCapacity: 1,
                        title: 'NKB + TXT',
                        allowObjectType: 1
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
        });
}());
//@ sourceURL=lnkd_prsnDropZones.js