/* eslint-disable no-inner-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const _ = go.GraphObject.make;
/**
 * Additional string we need to add before base64 content before passing it to the go.js graphObject
 * @type {string} 
 */
const addBeforeBase64 = 'data:image/png;base64,';
/**
 * Enum for node categories values
 * @readonly
 * @enum {string}
 */
const NODE_CATEGORIES = {
    /** Bank Node*/
    BANK: 'Bank',
    /** Physical Subject Node */
    PS: 'PS',
    /** Legal Subject Node */
    LS: 'LS',
    /** Foreign Physical Subject Node */
    PSF: 'PSF',
    /** Foreign Bank Node*/
    BANKF: 'BankF',
    /** Goverment Node*/
    GOV: 'GOV'
};

/**
 * Enum for node color values
 * @readonly
 * @enum {string}
 */
const NODE_COLORS = {
    GREEN: 'green',
    LIGHTGREEN: 'lightgreen',
    VIOLET: 'violet',
    YELLOW: 'yellow',
    OCEAN: 'ocean',
    WHITE: 'white'
};

/**
 * Enum that represents a link categories
 * @readonly
 * @enum {string}
 */
const LINK_CATEGORIES = {
    OLD: 'old',
    MANAGER: 'manager',
    FOUNDER: 'founder',
    STAKEHOLDER: 'stakeholder',
    FAMILY: 'family',
    OTHER: 'other',
    COMMON_CONTACTS: 'common_contacts',
};

/**
 * Class responsible for creation, manipulation and appearance of the GoJS visualization
 */
class Renderer {
    /** Creates Renderer Object
     * @param {Object[]} data Parsed Microstrategy data
     * @param {string} HTMLElementId Id of the element where go.js visualization will be located
     * @param {Object} [mainEntityId] ID of the main diagram Node
     * @param {Object} [nodesToShowDict] If nodeToShowDict[NodeId] equals to true, we show it in the diagram initialy
     * @param {Object} [prioritiesDict] Holds ids of the nodes as a properties names, there are values of node's priorities behind each key 
     */
    constructor(data, HTMLElementId, mainEntityId, nodesToShowDict, prioritiesDict, options = {}) {
        try {
            /**
             * @property {diagram} diagram GoJS diagram object
             */
            this.diagram = _(go.Diagram, HTMLElementId, {
                'undoManager.isEnabled': true,
                initialContentAlignment: go.Spot.Center,
                layout: _(go.ForceDirectedLayout, {
                    maxIterations: 3000,
                    defaultElectricalCharge: 600,
                    isOngoing: true,
                    setsPortSpots: false
                })
            });


            this.diagram.nodeTemplateMap = this.getNodeTemplateMap();
            this.diagram.linkTemplateMap = this.getLinkTemplateMap();

            let linkDataArray = [];
            let nodeDataArray = [];
            /**
             * Used inside a Renderer contructor as a helper method.
             * Accepts Row object, creates tooltip string for the Node using requied parameters. Fills in the error information 
             * if required parameters are missing
             * @function
             * @name Renderer->constructor->createNodeTooltip
             * @param {Object} obj Parsed Microstrategy data array element 
             * @param {string} node "NODE1" || "NODE2"
             * 
             * @returns {string} String to be putted inside the Node's tooltip 
             */
            function createNodeTooltip(obj, node) {
                if (!obj || typeof node !== 'string') {
                    return;
                }
                try {
                    return `
                    Назва / Ім'я: ${typeof obj[DECOMPOSED_ATTRIBUTES[node].NAME] === 'undefined' ? 'Поле відсутнє' : obj[DECOMPOSED_ATTRIBUTES[node].NAME]}
                    K020: ${typeof obj[DECOMPOSED_ATTRIBUTES[node].ID] === 'undefined' ? 'Поле відсутнє' : obj[DECOMPOSED_ATTRIBUTES[node].ID]}
                    Пов'язаність: ${typeof obj[DECOMPOSED_ATTRIBUTES[node].RELATION] === 'undefined' ? 'Поле відсутнє' : obj[DECOMPOSED_ATTRIBUTES[node].RELATION]}
                    Пояснення пов'язаності: ${typeof obj[DECOMPOSED_ATTRIBUTES[node].RELATION_EXPLANATION] === 'undefined' ? 'Поле відсутнє' : obj[DECOMPOSED_ATTRIBUTES[node].RELATION_EXPLANATION]}
                    Код категорії сутності: ${typeof obj[DECOMPOSED_ATTRIBUTES[node].CATEGORY] === 'undefined' ? 'Поле відсутнє' : obj[DECOMPOSED_ATTRIBUTES[node].CATEGORY]}
                    Код кольору: ${typeof obj[DECOMPOSED_ATTRIBUTES[node].COLOR] === 'undefined' ? 'Поле відсутнє' : obj[DECOMPOSED_ATTRIBUTES[node].COLOR]}
                    `;
                } catch (e) {
                    //alert(`@createNodeTooltip - ${e}`);
                    return 'Помилка при створенні підказки';
                }

            }

            /**
             * Used inside a Renderer contructor as a helper method.
             * Accepts Row object, creates tooltip string for the Link using requied parameters. Fills in the error information 
             * if required parameters are missing
             * @function
             * @name Renderer->constructor->createLinkTooltip
             * @param {Row} obj Parsed Microstrategy data array element 
             * @return {string} Link's tooltip string  
             */
            function createLinkTooltipString(obj) {
                if (!obj) {
                    return 'Помилка при створенні підказки';
                }
                const type = (typeof obj[DECOMPOSED_ATTRIBUTES.LINK.TYPE_EXPLANATION] !== 'undefined') ? obj[DECOMPOSED_ATTRIBUTES.LINK.TYPE_EXPLANATION] : 'Тип не вказаний';
                const begin = (typeof obj[DECOMPOSED_ATTRIBUTES.LINK.BEGIN] !== 'undefined') ? obj[DECOMPOSED_ATTRIBUTES.LINK.BEGIN] : 'Дата відсутня';
                const end = obj[DECOMPOSED_ATTRIBUTES.LINK.END] ? obj[DECOMPOSED_ATTRIBUTES.LINK.END] : 'Зв\'язок актуальний';
                const code = (typeof obj[DECOMPOSED_ATTRIBUTES.LINK.TYPE] !== 'undefined') ? obj[DECOMPOSED_ATTRIBUTES.LINK.TYPE] : 'Код типу не вказаний';
                const category = (typeof obj[DECOMPOSED_ATTRIBUTES.LINK.CATEGORY] !== 'undefined') ? obj[DECOMPOSED_ATTRIBUTES.LINK.CATEGORY] : 'Категорія не вказана';
                const from = (typeof obj[DECOMPOSED_ATTRIBUTES.NODE1.NAME] !== 'undefined') ? obj[DECOMPOSED_ATTRIBUTES.NODE1.NAME] : 'Помилка';
                const to = (typeof obj[DECOMPOSED_ATTRIBUTES.NODE2.NAME] !== 'undefined') ? obj[DECOMPOSED_ATTRIBUTES.NODE2.NAME] : 'Помилка';

                return `
                    Тип зв'язку: ${type}
                    Дата виникнення: ${begin}
                    Дата зникнення: ${end}
                    Код типу зв'язку: ${code}
                    Код категорії зв'язку: ${category}
                    Від: ${from}
                    До: ${to}
                `;
            }
            data.forEach((obj) => {
                let linkCat = this.getLinkCategory(obj[DECOMPOSED_ATTRIBUTES.LINK.CATEGORY]);
                let linkToolTip = createLinkTooltipString(obj);
                // adding  the array of links
                linkDataArray.push({
                    from: obj[DECOMPOSED_ATTRIBUTES.NODE2.ID],
                    to: obj[DECOMPOSED_ATTRIBUTES.NODE1.ID],
                    category: linkCat,
                    f069: obj[DECOMPOSED_ATTRIBUTES.LINK.CATEGORY],
                    meaning: obj[DECOMPOSED_ATTRIBUTES.LINK.TYPE_EXPLANATION],
                    fromName: obj[DECOMPOSED_ATTRIBUTES.NODE1.NAME],
                    toName: obj[DECOMPOSED_ATTRIBUTES.NODE2.NAME],
                    T0901: obj[DECOMPOSED_ATTRIBUTES.LINK.SHARE],
                    tooltip: linkToolTip
                });


                // looking if node has already been added to the node data array
                let K0201Found = false;
                let K0202Found = false;
                let K0201Str = obj[DECOMPOSED_ATTRIBUTES.NODE1.ID];
                let K0202Str = obj[DECOMPOSED_ATTRIBUTES.NODE2.ID];
                for (let i = 0; i < nodeDataArray.length; i++) {
                    if (K0201Str === nodeDataArray[i]['key'])
                        K0201Found = true;
                    if (K0202Str === nodeDataArray[i]['key'])
                        K0202Found = true;
                }

                // if node wasn't found in preceding links - adding it to the Node Data Array
                if (!K0201Found) {
                    let category = this.getNodeCategory(obj[DECOMPOSED_ATTRIBUTES.NODE1.CATEGORY]);
                    let visible = nodesToShowDict ? !!nodesToShowDict[obj[DECOMPOSED_ATTRIBUTES.NODE1.ID]] : true;
                    let priority = prioritiesDict ? prioritiesDict[obj[DECOMPOSED_ATTRIBUTES.NODE1.ID]] : 1;
                    let tooltip = createNodeTooltip(obj, 'NODE1');
                    nodeDataArray.push({
                        key: obj[DECOMPOSED_ATTRIBUTES.NODE1.ID],
                        name: obj[DECOMPOSED_ATTRIBUTES.NODE1.NAME],
                        another: obj[DECOMPOSED_ATTRIBUTES.NODE2.NAME],
                        pairedNodeId: obj[DECOMPOSED_ATTRIBUTES.NODE2.ID],
                        color: this.getNodeColor(obj[DECOMPOSED_ATTRIBUTES.NODE1.COLOR]),
                        category: category,
                        isCollapsed: options.mode === 'chain' ? true : (priority === 1 ? false : true),
                        'visible': visible,
                        'priority': priority,
                        tooltip: tooltip
                    });
                }
                if (!K0202Found) {

                    let category = this.getNodeCategory(obj[DECOMPOSED_ATTRIBUTES.NODE2.CATEGORY]);
                    let visible = nodesToShowDict ? !!nodesToShowDict[obj[DECOMPOSED_ATTRIBUTES.NODE2.ID]] : true;
                    let priority = prioritiesDict ? prioritiesDict[obj[DECOMPOSED_ATTRIBUTES.NODE2.ID]] : 1;
                    let tooltip = createNodeTooltip(obj, 'NODE2');
                    nodeDataArray.push({
                        key: obj[DECOMPOSED_ATTRIBUTES.NODE2.ID],
                        name: obj[DECOMPOSED_ATTRIBUTES.NODE2.NAME],
                        another: obj[DECOMPOSED_ATTRIBUTES.NODE1.NAME],
                        pairedNodeId: obj[DECOMPOSED_ATTRIBUTES.NODE1.ID],
                        color: this.getNodeColor(obj[DECOMPOSED_ATTRIBUTES.NODE2.COLOR]),
                        category: category,
                        isCollapsed: options.mode === 'chain' ? true : (priority === 1 ? false : true),
                        'visible': visible,
                        'priority': priority,
                        tooltip: tooltip
                    });
                }
            });


            this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

            if (options.mode === 'chain') {
                this.diagram.startTransaction();
                Object.keys(nodesToShowDict).forEach(nodeID => {
                    let node = this.diagram.findNodeForKey(nodeID);
                    if (!node) {
                        return;
                    }
                    let children = node.findNodesConnected();
                    while (children.next()) {
                        if (!children.value.data.visible) {
                            return node.diagram.model.setDataProperty(node.data, 'showButton', true);
                        }
                    }
                    node.diagram.model.setDataProperty(node.data, 'showButton', false);
                });
                this.diagram.commitTransaction('toggled visibility');
                this.diagram.commandHandler.zoomToFit();
                return this;
            }
            this.diagram.startTransaction();
            this.diagram.nodes.each((node) => {
                let priority = node.data.priority;
                let visible = prioritiesDict ? (node.data.priority < 3) : true;
                node.diagram.model.setDataProperty(node.data, 'visible', visible);
                let children = node.findNodesConnected();
                let toShow = false;
                while (children.next()) {
                    let child = children.value;
                    if (child.data.priority > priority) {
                        toShow = true;
                        break;
                    }
                }
                node.diagram.model.setDataProperty(node.data, 'showButton', toShow);
                if (priority === 2) {
                    node.diagram.model.setDataProperty(node.data, 'expandedBy', mainEntityId);
                }
            });
            this.diagram.commitTransaction('toggled visibility of dependencies');

            this.diagram.commandHandler.zoomToFit();
        } catch (e) {
            let Paragraph = document.createElement('p');
            Paragraph.innerHTML = e.stack;

            let el = document.getElementById(HTMLElementId);
            if (el) el.appendChild(Paragraph);
            alert(`@renderer.js ${e.stack}`);
        }
    }
    /**
     * Deletes a GoJS diagram
     * @return {null}
     */
    deleteDiagram() {
        if (this.diagram) {
            this.diagram.div = null;
            this.diagram = null;
        }
    }

    /**
     * Creates every Node template, adds it to the template map and returns it
     * @return { Object } GoJS Nodes Template Map
     */
    getNodeTemplateMap() {
        const GO_JS_COLORS = {
            GREEN: '#057c48',
            LIGHTGREEN: '#89c864',
            YELLOW: '#f9d491',
            VIOLET: '#899dd0',
            OCEAN: '#e1ffff'
        };

        function getImageColorHandler(node_form) {
            return new go.Binding('source', 'color', (color) => {
                if (!color) {
                    return addBeforeBase64 + this.nodeImageStringHelper(node_form, 'white', false);
                } else {
                    return addBeforeBase64 + this.nodeImageStringHelper(node_form, color, false);
                }
            });
        }


        let expandFrom = this.expandFrom;
        let collapseFrom = this.collapseFrom;
        function toggleNode(e, obj) {
            e.diagram.startTransaction();
            var node = obj.part;
            if (node.data.isCollapsed) {
                expandFrom(node, node);
            } else {
                collapseFrom(node, node);
            }
            e.diagram.commitTransaction('toggled visibility of dependencies');
        }

        function getNodeToolTip() {
            return _('ToolTip',
                _(go.Panel, 'Vertical',
                    _(go.TextBlock, { margin: 3, text: 'error', isMultiline: true, width: 300 }
                        , new go.Binding('text', 'tooltip'))
                ) // end Panel 
            );
        }

        function getExpanderButton() {
            return _('Button',  // a replacement for 'TreeExpanderButton' that works for non-tree-structured graphs
                // assume initially not visible because there are no links coming out
                {},
                // bind the button visibility to whether it's not a leaf node
                _(go.Shape,
                    {
                        name: 'ButtonIcon',
                        figure: 'MinusLine',
                        desiredSize: new go.Size(6, 6)
                    },
                    new go.Binding('figure', 'isCollapsed',  // data.isCollapsed remembers 'collapsed' or 'expanded'
                        function (collapsed) { return collapsed ? 'PlusLine' : 'MinusLine'; })),
                {
                    click: toggleNode
                },
                new go.Binding('visible', 'showButton'));
        }
        let legalSubjectNode =
            _(go.Node, 'Vertical', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                isShadowed: false,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                _(go.Panel, 'Auto',
                    _(go.Shape, 'Rectangle', { strokeWidth: 5 },
                        new go.Binding('fill', 'color', (color) => {
                            switch (color) {
                                case 'lightgreen':
                                    return GO_JS_COLORS.LIGHTGREEN;
                                case 'green':
                                    return GO_JS_COLORS.GREEN;
                                case 'yellow':
                                    return GO_JS_COLORS.YELLOW;
                                case 'violet':
                                    return GO_JS_COLORS.VIOLET;
                                case 'ocean':
                                    return GO_JS_COLORS.OCEAN;
                                default:
                                    return 'white';
                            }
                        }),
                        /* new go.Binding('stroke', 'color', (color) => {
                            switch (color) {
                                case 'lightgreen':
                                    return GO_JS_COLORS.LIGHTGREEN;
                                case 'green':
                                    return GO_JS_COLORS.GREEN;
                                case 'yellow':
                                    return GO_JS_COLORS.YELLOW;
                                case 'violet':
                                    return GO_JS_COLORS.VIOLET;
                                default:
                                    return 'pink';
                            }
                        }) */
                    ),
                    _(go.TextBlock, {
                        margin: 15,
                        font: 'bold 15px Montserrat, sans-serif', width: 200,
                        wrap: go.TextBlock.WrapFit, textAlign: 'center'

                    },
                        new go.Binding('text', 'name'))
                ),
                {
                    toolTip: getNodeToolTip()
                },
                getExpanderButton()
            );

        let bankNode =
            _(go.Node, 'Spot', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                _(go.Panel, 'Vertical', { background: 'rgba(255,255,255,0.5)' },
                    _(go.Picture, {
                        source: 'lnkd_prsn_vis_icons/bank_violet.png',
                        desiredSize: new go.Size(100, 100)
                    }, new go.Binding('source', 'color', (color) => {
                        if (!color) {
                            return addBeforeBase64 + this.nodeImageStringHelper('bank', 'white', false);
                        } else {
                            return addBeforeBase64 + this.nodeImageStringHelper('bank', color, false);
                        }
                    })),

                    _(go.TextBlock, {
                        margin: 8,
                        isMultiline: true,
                        font: 'bold 15px Montserrat, sans-serif', width: 200,
                        wrap: go.TextBlock.WrapFit, textAlign: 'center'
                    }, new go.Binding('text', 'name')),
                    getExpanderButton()
                ), {
                toolTip: getNodeToolTip()
            }

            );
        let govNode =
            _(go.Node, 'Spot', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                _(go.Panel, 'Vertical', { background: 'rgba(255,255,255,0.5)' },
                    _(go.Picture, {
                        desiredSize: new go.Size(100, 145)
                    }, new go.Binding('source', 'color', (color) => {
                        if (!color) {
                            return addBeforeBase64 + this.nodeImageStringHelper('gov', 'white', false);
                        } else {
                            return addBeforeBase64 + this.nodeImageStringHelper('gov', color, false);
                        }
                    })),

                    _(go.TextBlock, {
                        margin: 8,
                        isMultiline: true,
                        textAlign: 'center',
                        font: 'bold 15px Montserrat, sans-serif', width: 200,
                        wrap: go.TextBlock.WrapFit
                    }, new go.Binding('text', 'name')),
                    getExpanderButton()
                ), {
                toolTip: getNodeToolTip()
            }

            );
        let foreignBankNode =
            _(go.Node, 'Spot', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                _(go.Panel, 'Vertical', { background: 'rgba(255,255,255,0.5)' },
                    _(go.Picture, {
                        source: 'lnkd_prsn_vis_icons/bank_violet.png',
                        desiredSize: new go.Size(100, 100)
                    }, new go.Binding('source', 'color', (color) => {
                        if (!color) {
                            return addBeforeBase64 + this.nodeImageStringHelper('bank', 'white', true);
                        } else {
                            return addBeforeBase64 + this.nodeImageStringHelper('bank', color, true);
                        }
                    })),

                    _(go.TextBlock, {
                        margin: 8,
                        isMultiline: true,
                        textAlign: 'center',
                        font: 'bold 15px Montserrat, sans-serif', width: 200,
                        wrap: go.TextBlock.WrapFit
                    }, new go.Binding('text', 'name')),
                    getExpanderButton()
                ), {
                toolTip: getNodeToolTip()
            });
        let physicalSubjectNode =
            _(go.Node, 'Vertical', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                // the whole node panel
                _(go.Picture, {
                    source: 'lnkd_prsn_vis_icons/human.png',
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding('source', 'color', (color) => {
                    if (!color) {
                        return addBeforeBase64 + this.nodeImageStringHelper('human', 'white', false);
                    } else {
                        return addBeforeBase64 + this.nodeImageStringHelper('human', color, false);
                    }
                })),
                _(go.Panel, 'Vertical', {
                    background: 'rgba(255,255,255,0.5)',
                },
                    _(go.TextBlock, {
                        width: 150,
                        margin: 8,
                        isMultiline: true,
                        textAlign: 'center',
                        font: 'bold 15px Arial, sans-serif',
                        wrap: go.TextBlock.WrapFit
                    }, new go.Binding('text', 'name')),
                ), {
                toolTip: getNodeToolTip()
            },
                getExpanderButton()
            );
        let foreignPhysicalSubjectNode =
            _(go.Node, 'Vertical', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                // the whole node panel
                _(go.Picture, {
                    source: 'lnkd_prsn_vis_icons/human.png',
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding('source', 'color', (color) => {
                    if (!color) {
                        return addBeforeBase64 + this.nodeImageStringHelper('human', 'white', true);
                    } else {
                        return addBeforeBase64 + this.nodeImageStringHelper('human', color, true);
                    }
                })),
                _(go.Panel, 'Vertical', {
                    background: 'rgba(255,255,255,0.5)',
                },
                    _(go.TextBlock, {
                        width: 150,
                        margin: 8,
                        isMultiline: true,
                        textAlign: 'center',
                        font: 'bold 15px Arial, sans-serif',
                        wrap: go.TextBlock.WrapFit
                    }, new go.Binding('text', 'name')),
                ), {
                toolTip: getNodeToolTip()
            },
                getExpanderButton()
            );


        let templateMap = new go.Map();
        templateMap.add('Bank', bankNode);
        templateMap.add('PS', physicalSubjectNode);
        templateMap.add('BankF', foreignBankNode);
        templateMap.add('PSF', foreignPhysicalSubjectNode);
        templateMap.add('LS', legalSubjectNode);
        templateMap.add('GOV', govNode);

        return templateMap;
    }


    /**
     * Creates every Link template, adds it to the template map and returns it
     * @return { Object } GoJS Links Template Map
     */
    getLinkTemplateMap() {
        function getLinkAdorment() {
            return _(go.Adornment, 'Auto',
                _(go.Panel, 'Auto',
                    _(go.Shape, 'Rectangle', { fill: 'white', stroke: 'black' }),
                    _(go.Panel, 'Vertical',
                        _(go.TextBlock, { margin: 5, width: 300 },
                            new go.Binding('text', 'tooltip', (tooltip = 'Помилка при створенні підказки') => tooltip))
                    )
                ) // end Panel 
            );  // end Adornment 
        }
        const managerLink =
            _(go.Link,
                {
                    opacity: 1,
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpGap,
                    corner: 10,
                    layerName: 'Background',
                    toShortLength: 3,
                    fromShortLength: 3,
                },
                _(go.Shape, { strokeWidth: 3 }
                    /*,
                                    // the Shape.stroke color depends on whether Link.isHighlighted is true
                                    new go.Binding('stroke", "isHighlighted", function (h) {
                                        return h ? "red" : "black";
                                    })
                                        .ofObject(),
                                    // the Shape.strokeWidth depends on whether Link.isHighlighted is true
                                    new go.Binding("strokeWidth", "isHighlighted", function (h) {
                                        return h ? 3 : 1;
                                    })
                                        .ofObject()
                    */
                ),
                _(go.Shape, { toArrow: 'Block' },
                    // the Shape.fill color depends on whether Link.isHighlighted is true
                    new go.Binding('fill', 'isHighlighted', function (h) {
                        return h ? 'red' : 'black';
                    }).ofObject()),
                _(go.Shape, { fromArrow: 'BackwardTriangle' }),
                {
                    toolTip: getLinkAdorment()
                }
            );

        let founderLink =
            _(go.Link,
                {
                    opacity: 1,
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 10,
                    layerName: 'Background',
                    fromEndSegmentLength: 60,
                    toEndSegmentLength: 60
                },
                new go.Binding('fromShortLength', 'T0901', T0901 => {
                    if (T0901 <= 25) {
                        return 7;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 27;
                    }
                    if (T0901 > 75) {
                        return 30;
                    }
                    return 1;
                }),
                new go.Binding('fromEndSegmentLength', 'T0901', T0901 => {
                    if (T0901 <= 25) {
                        return 10;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 20;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 25;
                    }
                    if (T0901 > 75) {
                        return 40;
                    }
                    return 1;
                }),
                new go.Binding('toEndSegmentLength', 'T0901', T0901 => {
                    if (T0901 <= 25) {
                        return 10;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 20;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 25;
                    }
                    if (T0901 > 75) {
                        return 40;
                    }
                    return 1;
                }),
                _(go.Shape, {
                    opacity: 0.8,
                    strokeWidth: 3,
                    stroke: '#f79d91'
                },
                    new go.Binding('strokeWidth', 'T0901', (T0901 = 4) => {
                        T0901 = T0901 > 100 ? 100 : T0901;
                        let res = parseInt(T0901, 10) / 4;
                        return res < 1 ? 1 : res;
                    }
                    )),
                _(go.Shape, {
                    toArrow: '',
                    fill: '#f79d91',
                    stroke: '#f79d91',
                }),
                _(go.Shape, {
                    fromArrow: 'BackwardTriangle',
                    fill: '#f79d91',
                    stroke: '#f79d91',
                    scale: 2
                }, new go.Binding('scale', 'T0901', (T0901) => {

                    if (T0901 <= 25) {

                        return 1;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 2;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 3;
                    }
                    if (T0901 > 75) {
                        return 5;
                    }
                    return 1;
                })),
                _(go.Panel, 'Auto',
                    _(go.Shape, 'RoundedRectangle', // the label background, which becomes transparent around the edges
                        {
                            fill: '#f79d91',
                            stroke: null
                        }, new go.Binding('visible', 'T0901', (t) => {
                            if (parseFloat(t)) {
                                return true;
                            }
                            return false;
                        })),
                    _(go.TextBlock, 'pr',  // the label text
                        {
                            textAlign: 'center',
                            margin: 5
                        },
                        // editing the text automatically updates the model data
                        new go.Binding('text', 'T0901', (t0901) => {
                            if (!t0901) {
                                return '';
                            }
                            return `${t0901}%`;
                        }))
                ),
                {
                    toolTip: getLinkAdorment()
                }
            );
        let stakeholderLink =
            _(go.Link,
                {
                    opacity: 1,
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 10,
                    layerName: 'Background',
                    fromEndSegmentLength: 60,
                    toEndSegmentLength: 60
                },
                new go.Binding('fromShortLength', 'T0901', T0901 => {
                    if (T0901 <= 25) {
                        return 7;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 27;
                    }
                    if (T0901 > 75) {
                        return 30;
                    }
                }),
                new go.Binding('fromEndSegmentLength', 'T0901', T0901 => {
                    if (T0901 <= 25) {
                        return 10;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 23;
                    }
                    if (T0901 > 75) {
                        return 40;
                    }
                    return 10;
                }),
                new go.Binding('toEndSegmentLength', 'T0901', T0901 => {
                    if (T0901 <= 25) {
                        return 10;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 23;
                    }
                    if (T0901 > 75) {
                        return 40;
                    }
                    return 10;
                }),
                _(go.Shape, {
                    opacity: 0.8,
                    strokeWidth: 3,
                    stroke: '#8d9dd0'
                },
                    new go.Binding('strokeWidth', 'T0901', (T0901 = 4) => {
                        T0901 = T0901 > 100 ? 100 : T0901;
                        let res = parseInt(T0901, 10) / 4;
                        return res < 1 ? 1 : res;
                    }
                    )),
                _(go.Shape, {
                    toArrow: '',
                    fill: '#8d9dd0',
                    stroke: '#8d9dd0',
                }),
                _(go.Shape, {
                    fromArrow: 'BackwardTriangle',
                    fill: '#8d9dd0',
                    stroke: '#8d9dd0',
                    scale: 2
                }, new go.Binding('scale', 'T0901', (T0901) => {
                    if (T0901 <= 25) {
                        return 1;
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 2;
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 3;
                    }
                    if (T0901 > 75) {
                        return 5;
                    }
                    return 1;
                })),
                _(go.Panel, 'Auto',
                    _(go.Shape, 'RoundedRectangle', // the label background, which becomes transparent around the edges
                        {
                            fill: '#8d9dd0',
                            stroke: null
                        }, new go.Binding('visible', 'T0901', (t) => {
                            if (parseFloat(t)) {
                                return true;
                            }
                            return false;
                        })),
                    _(go.TextBlock, 'pr',  // the label text
                        {
                            textAlign: 'center',
                            margin: 5
                        },
                        // editing the text automatically updates the model data
                        new go.Binding('text', 'T0901', (t0901) => {
                            if (!t0901) {
                                return '';
                            }
                            return `${t0901}%`;
                        }))
                ),
                {
                    toolTip: getLinkAdorment()
                }
            );
        let familyLink =
            _(go.Link,
                {
                    //routing: go.Link.AvoidsNodes ,
                    opacity: 1,
                    curve: go.Link.JumpGap,
                    layerName: 'Background'
                },
                _(go.Shape, {
                    strokeWidth: 2,
                    stroke: '#f9d491'
                }),
                {
                    toolTip: getLinkAdorment()
                }
            );
        let oldLink =
            _(go.Link,
                {
                    //routing: go.Link.AvoidsNodes ,
                    opacity: 1,
                    curve: go.Link.JumpGap,
                    layerName: 'Background'
                },
                _(go.Shape, {
                    strokeWidth: 3,
                    stroke: '#bbbbbb'
                }),
                {
                    toolTip: getLinkAdorment()
                }
            );
        let otherLink =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: 'Background'
            },
                _(go.Shape, {
                    strokeWidth: 3,
                    stroke: '#f79d91' // old 
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    toArrow: 'Circle',
                    fill: 'white',
                    stroke: '#f79d91',
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    fromArrow: 'Circle',
                    fill: 'white',
                    stroke: '#f79d91'
                }),
                {
                    toolTip: getLinkAdorment()
                }
            );
        let commonContactsLink =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: 'Background'
            },
                _(go.Shape, {
                    strokeWidth: 3,
                    stroke: '#ff78e2'
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    toArrow: 'Block',
                    fill: 'white',
                    stroke: '#ff78e2',
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    fromArrow: 'Block',
                    fill: 'white',
                    stroke: '#ff78e2'
                }),
                {
                    toolTip: getLinkAdorment()
                }
            );



        let linkTemplateMap = new go.Map();

        linkTemplateMap.add('old', oldLink);
        linkTemplateMap.add('manager', managerLink);
        linkTemplateMap.add('founder', founderLink);
        linkTemplateMap.add('stakeholder', stakeholderLink);
        linkTemplateMap.add('family', familyLink);
        linkTemplateMap.add('other', otherLink);
        linkTemplateMap.add('common_contacts', commonContactsLink);

        return linkTemplateMap;
    }

    /**
     * Helper function that accepts a number and returns NodeCategory
     * @param {number} nodeCategoryCode 
     * @return {NODE_CATEGORIES} Node Category
     */
    getNodeCategory(nodeCategoryCode) {
        switch (true) {
            case (nodeCategoryCode === 1):
                return NODE_CATEGORIES.BANK;
            case (nodeCategoryCode === 2):
                return NODE_CATEGORIES.PS;
            case (nodeCategoryCode === 3):
                return NODE_CATEGORIES.BANKF;
            case (nodeCategoryCode === 4):
                return NODE_CATEGORIES.GOV;
            case (nodeCategoryCode === 5):
                return NODE_CATEGORIES.PSF;
            case (nodeCategoryCode === 6):
                return NODE_CATEGORIES.LS;
            default:
                return NODE_CATEGORIES.LS;
        }
    }

    /**
     * Helper function that accepts a number and returns node color that will be used inside a Node's template to color itself 
     * @param {number} nodeColorCode 
     * @return {NODE_COLORS} Node Color that will be used inside a template
     */
    getNodeColor(nodeColorCode) {
        switch (true) {
            case (nodeColorCode === 1):
                return NODE_COLORS.GREEN;
            case (nodeColorCode === 2):
                return NODE_COLORS.LIGHTGREEN;
            case (nodeColorCode === 3):
                return NODE_COLORS.VIOLET;
            case (nodeColorCode === 4):
                return NODE_COLORS.YELLOW;
            case (nodeColorCode === 5):
                return NODE_COLORS.OCEAN;
            default:
                return NODE_COLORS.WHITE;
        }
    }
    /**
     * Helper function that accepts a number and returns node color that will be used inside a Node's template to color itself 
     * @param {number} linkCategoryCode Code for link category from the parsed MicroStrategy Data
     * @return {LINK_CATEGORIES} Node Color that will be used inside a template
     */
    getLinkCategory(linkCategoryCode) {
        if (linkCategoryCode === 0) // old link
            return LINK_CATEGORIES.OLD;
        if (linkCategoryCode === 1)
            return LINK_CATEGORIES.FOUNDER;
        if (linkCategoryCode === 2)
            return LINK_CATEGORIES.MANAGER;
        if (linkCategoryCode === 3)
            return LINK_CATEGORIES.STAKEHOLDER;
        if (linkCategoryCode === 4)
            return LINK_CATEGORIES.FAMILY;
        if (linkCategoryCode === 5)
            return LINK_CATEGORIES.OTHER;
        if (linkCategoryCode === 6)
            return LINK_CATEGORIES.COMMON_CONTACTS;
        // "" stands for no styling
        return '';
    }

    /**
     * Accepts parameteres required to decide what image we should use in Node template. Method created to be sure that every node will have the coresponding images 
     * @param {string} entityType  "bank" | "gov" | "human"  
     * @param {string} color  "green" | "lightgreen" | "yellow" | "violet" | "ocean" | "white"
     * @param {boolean} isForeign If isForeign == true, image with red contour will be returned 
     * 
    *  @return {string} Base64 encoded image string 
    */
    nodeImageStringHelper(entityType, color, isForeign = false) {

        const DEFAULT_RETURN = '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/gwIfBIACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBOAlI+Pxx/BmQgAhAnAi7nDfsfZeTUBgDABgDABgDABgDBfurzBjx+XHvEc137FNv34OI4dAIQJAITZdL3FOzbZt2ywpx8fR7EDgDDVfZNX32Nvvb9OPz6OYQcAYbr7Nq+8x95zf51+fBzBiX+jV43YveM1/fh4nI8AEKa9b/WKe+wj99fpx8ejnPw3e/aIPTpe04+Pxzj9b/fMETtivKYfH4+wAAM8a8SOGq/px8f9LMEIzxixI8dr+vFxL4swxNEjdvR4TT8+7mMZxjhyxJ4xXtOPj3tYiFGOGLJnDtf04+NWFmOYR0fs2eM1/fi4jeUY6N4he9VwTT8+rmdJxrplzN4xWtOPj2tYmOEujdm7R2v68fG9/wKjmD/aq9pnZgAAAABJRU5ErkJggg==';
        // stands for white human ^^^

        if (!VIS_IMAGES_BASE64) {
            console.error('No base64 image encodings variable. Using default image.');
            return DEFAULT_RETURN;
        }

        const entities = ['human', 'gov', 'bank'];
        const default_entity = entities[0]; // human 
        const colors = ['white', 'green', 'lightgreen', 'yellow', 'violet', 'ocean'];
        const default_color = colors[0]; // white

        let _entityType;
        if (entities.includes(entityType)) {
            _entityType = entityType;
        } else {
            _entityType = default_entity;
            console.warn(`[${this.name}] Wrong entity type: ${entityType}, using default one: ${default_entity}`);
        }
        let _color;
        if (colors.includes(color)) {
            _color = color;
        } else {
            _color = default_color;
            console.warn(`[${this.name}] Wrong color: ${color}, using default one: ${default_color}`);
        }

        let properyName = _entityType + '_' + _color + (isForeign ? '_f' : '');
        if (!VIS_IMAGES_BASE64[properyName]) {
            console.error(`[${this.name}] Coresponding image string hasn't been found for property ${properyName}, using default style`);
            return DEFAULT_RETURN;
        }
        if (!VIS_IMAGES_BASE64[properyName].str) {
            console.error(`[${this.name}] "Str" property hasn't been found for ${properyName}, using default style`);
            return DEFAULT_RETURN;
        }
        return VIS_IMAGES_BASE64[properyName].str;
    }

    collapseFrom(rootNode) {
        if (typeof rootNode === 'string') {
            rootNode = this.diagram.findNodeForKey(rootNode);
        }
        rootNode.diagram.model.setDataProperty(rootNode.data, 'isCollapsed', true);

        let queue = getNewNodes(rootNode);

        while (queue.length > 0) {
            let newQueue = [];
            queue.forEach((currNode) => {
                if (!currNode.data.visible) {
                    return;
                }
                currNode.diagram.model.setDataProperty(currNode.data, 'visible', false);
                currNode.diagram.model.setDataProperty(currNode.data, 'isCollapsed', true);
                currNode.diagram.model.setDataProperty(currNode.data, 'expandedBy', false);
                getNewNodes(currNode).forEach(foundNode => newQueue.push(foundNode));
            });
            queue = newQueue;
        }
        function getNewNodes(node) {
            let res = [];
            node.findNodesConnected().each(_node => {
                if (_node.data.expandedBy === node.data.key) {
                    res.push(_node);
                }
            });
            return res;
        }

        rootNode.diagram.layoutDiagram();
    }

    expandFrom(rootNode) {

        rootNode.diagram.model.setDataProperty(rootNode.data, 'isCollapsed', false);
        let adjacent = rootNode.findNodesConnected();

        adjacent.each((_node) => {
            if (_node.data.visible) {
                return;
            }
            _node.diagram.model.setDataProperty(_node.data, 'visible', true);
            if (!_node.data.expandedBy) {
                _node.diagram.model.setDataProperty(_node.data, 'expandedBy', rootNode.data.key);
            }
            let children = _node.findNodesConnected();

            while (children.next()) {
                let child = children.value;
                if (!child.data.visible) {
                    _node.diagram.model.setDataProperty(_node.data, 'showButton', true);
                    break;
                }
            }
            _node.diagram.model.setDataProperty(_node.data, 'showButton', false);
        });
        rootNode.diagram.layoutDiagram();

    }

    focusOnNode(nodeID) {
        let node = this.diagram.findNodeForKey(nodeID);
        if (node)
            this.diagram.commandHandler.scrollToPart(node);
    }
}
