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
    LSF: 'LSF',
    /** Foreign Physical Subject Node */
    PSF: 'PSF',
    /** Foreign Bank Node*/
    BANKF: 'BankF',
    /** Goverment Node*/
    GOV: 'GOV',
    default: 'default'
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
 * Helper function that accepts a number and returns NodeCategory
 * @param {number} nodeCategoryCode 
 * @return {NODE_CATEGORIES} Node Category
 */
function getNodeCategory(nodeCategoryCode) {
    switch (nodeCategoryCode) {
        case (1):
            return NODE_CATEGORIES.BANK;
        case (2):
            return NODE_CATEGORIES.PS;
        case (3):
            return NODE_CATEGORIES.BANKF;
        case (4):
            return NODE_CATEGORIES.GOV;
        case (5):
            return NODE_CATEGORIES.PSF;
        case (6):
            return NODE_CATEGORIES.LS;
        case (7):
            return NODE_CATEGORIES.LSF;
        default:
            return NODE_CATEGORIES.default;
    }
}

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
function createNodeTooltip(obj, node, category) {
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
                    Категорія: ${category}
                    `;
    } catch (e) {

        return 'Помилка при створенні підказки';
    }
}

/**
 * Helper function that accepts a number and returns node color that will be used inside a Node's template to color itself 
 * @param {number} nodeColorCode 
 * @return {NODE_COLORS} Node Color that will be used inside a template
 */
function getNodeColor(nodeColorCode) {
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

/**
     * Accepts parameteres required to decide what image we should use in Node template. Method created to be sure that every node will have the coresponding images 
     * @param {string} entityType  "bank" | "gov" | "human" | "question" | "legal"
     * @param {string} color  "green" | "lightgreen" | "yellow" | "violet" | "ocean" | "white"
     * @param {boolean} isForeign If isForeign == true, image with red contour will be returned 
     * 
    *  @return {string} Base64 encoded image string 
    */
function nodeImageStringHelper(entityType, color, isForeign = false) {
    const DEFAULT_RETURN = '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';
    // stands for black question mark ^^^

    if (!VIS_IMAGES_BASE64) {
        console.error('No base64 image encodings variable. Using default image.');
        return DEFAULT_RETURN;
    }

    const entities = ['human', 'gov', 'bank', 'question', 'legal'];
    const default_entity = entities[3]; // question 
    const colors = ['white', 'green', 'lightgreen', 'yellow', 'violet', 'ocean', 'black'];
    const default_color = colors[2];

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
        throw new Error(`[${this.name}] Coresponding image string hasn't been found for property ${properyName}, using default style`);
    }
    if (!VIS_IMAGES_BASE64[properyName].str) {
        throw new Error(`[${this.name}] "Str" property hasn't been found for ${properyName}, using default style`);
    }
    return VIS_IMAGES_BASE64[properyName].str;
}

/**
 * Class responsible for creation, manipulation and appearance of the GoJS visualization
 */
class Renderer {
    /** Creates Renderer Object
     * @param {Object[]} data Parsed Microstrategy data
     * @param {string} HTMLElementId Id of the element where go.js visualization will be located
     * @param {Object} mainEntityId ID of the main diagram Node
     * @param {Object} nodesToShowDict If nodeToShowDict[NodeId] equals to true, we show it in the diagram initialy
     * @param {Object} options Required display options
     * @param {Object} usageHistoryCallback 
     */
    constructor(data, HTMLElementId, mainEntityId, nodesToShow, options = {}, usageHistoryCallback) {
        /**
         * @property {diagram} diagram GoJS diagram object
         */
        this.diagram = _(go.Diagram, HTMLElementId, {
            'undoManager.isEnabled': true,
            'toolManager.hoverDelay': 200,
            'toolManager.toolTipDuration': 60000,
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

        let usageHistoryData = {};

        function createNodeObject(obj, node) {
            if (!(node === 'NODE1' || node === 'NODE2')) {
                window.visType = null;
                throw new Error('@renderer.constructor.createNodeObject: Error, recieved wrong node string');
            }
            let anotherNode = (node === 'NODE1') ? 'NODE2' : 'NODE1';
            let category = getNodeCategory(obj[DECOMPOSED_ATTRIBUTES[node].CATEGORY]);
            let tooltip = createNodeTooltip(obj, node, category);
            return {
                key: obj[DECOMPOSED_ATTRIBUTES[node].ID],
                name: obj[DECOMPOSED_ATTRIBUTES[node].NAME],
                another: obj[DECOMPOSED_ATTRIBUTES[anotherNode].NAME],
                pairedNodeId: obj[DECOMPOSED_ATTRIBUTES[anotherNode].ID],
                color: getNodeColor(obj[DECOMPOSED_ATTRIBUTES[node].COLOR]),
                category: category,
                isCollapsed: true,
                visible: false,
                showButton: false,
                tooltip: tooltip
            };
        }

        data.forEach((obj) => {
            let linkCat = this.getLinkCategory(obj[DECOMPOSED_ATTRIBUTES.LINK.CATEGORY]);
            let linkToolTip = createLinkTooltipString(obj);

            linkDataArray.push({
                from: obj[DECOMPOSED_ATTRIBUTES.NODE2.ID],
                to: obj[DECOMPOSED_ATTRIBUTES.NODE1.ID],
                category: linkCat,
                f069: obj[DECOMPOSED_ATTRIBUTES.LINK.CATEGORY],
                meaning: obj[DECOMPOSED_ATTRIBUTES.LINK.TYPE_EXPLANATION],
                fromName: obj[DECOMPOSED_ATTRIBUTES.NODE1.NAME],
                toName: obj[DECOMPOSED_ATTRIBUTES.NODE2.NAME],
                T0901: obj[DECOMPOSED_ATTRIBUTES.LINK.SHARE] || false,
                tooltip: linkToolTip,
                color: obj[DECOMPOSED_ATTRIBUTES.LINK.COLOR]
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

            function addNode(nodeNumber) {
                let nodeObject = createNodeObject(obj, nodeNumber);
                nodeDataArray.push(nodeObject);
                if (options.lookupIds.includes(nodeObject.key)) {
                    if (!usageHistoryData[nodeObject.key]) {
                        let displayName = nodeObject.name;
                        let imageString;
                        switch (nodeObject.category) {
                            case NODE_CATEGORIES.BANK:
                                imageString = nodeImageStringHelper('bank', nodeObject.color, false);
                                break;
                            case NODE_CATEGORIES.PS:
                                imageString = nodeImageStringHelper('human', nodeObject.color, false);
                                break;
                            case NODE_CATEGORIES.BANKF:
                                imageString = nodeImageStringHelper('bank', nodeObject.color, true);
                                break;
                            case NODE_CATEGORIES.PSF:
                                imageString = nodeImageStringHelper('human', nodeObject.color, true);
                                break;
                            case NODE_CATEGORIES.LS:
                                imageString = nodeImageStringHelper('legal', nodeObject.color, false);
                                break;
                            case NODE_CATEGORIES.LSF:
                                imageString = nodeImageStringHelper('legal', nodeObject.color, true);
                                break;
                            case NODE_CATEGORIES.GOV:
                                imageString = nodeImageStringHelper('gov', nodeObject.color, false);
                                break;
                            case NODE_CATEGORIES.default:
                                imageString = nodeImageStringHelper('question', nodeObject.color, false);
                                break;
                            default:
                                imageString = nodeImageStringHelper('question', nodeObject.color, false);
                                break;
                        }
                        usageHistoryData[nodeObject.key] = {
                            displayName,
                            imageString
                        };
                    }
                }
            }

            // if node wasn't found in preceding rows - adding it to the Node Data Array
            if (!K0201Found) {
                addNode('NODE1');
            }
            if (!K0202Found) {
                addNode('NODE2');
            }
        });

        if (usageHistoryCallback) {
            usageHistoryCallback(usageHistoryData);
        }
        if (options.mode === 'chain') {
            this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
            this.diagram.startTransaction();

            nodesToShow.forEach(nodeID => {
                let node = this.diagram.findNodeForKey(nodeID);
                if (!node) {
                    return;
                }
                node.diagram.model.setDataProperty(node.data, 'visible', true);
            });
            this.diagram.commitTransaction('toggled visibility');

            this.diagram.startTransaction();
            nodesToShow.forEach(nodeID => {
                let node = this.diagram.findNodeForKey(nodeID);
                if (!node) {
                    return;
                }
                let children = node.findNodesConnected();
                while (children.next()) {
                    if (!children.value.data.visible) {
                        node.diagram.model.setDataProperty(node.data, 'showButton', true);
                        break;
                    }
                }
            });
            this.diagram.commitTransaction('toggled showButton');
            this.diagram.commandHandler.zoomToFit();
            return this;
        }
        if (options.mode === 'all') {
            for (let i = 0; i < nodeDataArray.length; i++) {
                nodeDataArray[i].visible = true;
            }
            this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
            this.diagram.commandHandler.zoomToFit();
            return this;
        }

        this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
        this.diagram.startTransaction();
        let mainNode = this.diagram.findNodeForKey(mainEntityId);
        if (!mainNode) {
            window.visType = null;
            throw new Error('@renderer.constructor: Error, mainNode wasn\'t found');
        } else {
            mainNode.diagram.model.setDataProperty(mainNode.data, 'visible', true);
            mainNode.diagram.model.setDataProperty(mainNode.data, 'showButton', true);
            this.expandFrom(mainNode);
        }
        this.diagram.commitTransaction('toggled visibility of dependencies');
        this.diagram.commandHandler.zoomToFit();
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
            OCEAN: '#46aee6'
        };

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
        let foreignLegalSubjectNode =
            _(go.Node, 'Vertical', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                isShadowed: false,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                _(go.Panel, 'Auto',
                    _(go.Shape, 'Rectangle', { strokeWidth: 5, stroke: 'red' },
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

                        desiredSize: new go.Size(100, 100)
                    }, new go.Binding('source', 'color', (color) => {
                        if (!color) {
                            return addBeforeBase64 + nodeImageStringHelper('bank', 'white', false);
                        } else {
                            return addBeforeBase64 + nodeImageStringHelper('bank', color, false);
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
                            return addBeforeBase64 + nodeImageStringHelper('gov', 'white', false);
                        } else {
                            return addBeforeBase64 + nodeImageStringHelper('gov', color, false);
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
        let defaultNode =
            _(go.Node, 'Spot', {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                doubleClick: toggleNode,
            }, new go.Binding('visible'),
                _(go.Panel, 'Vertical', { background: 'rgba(255,255,255,0.5)' },
                    _(go.Picture, {
                        desiredSize: new go.Size(100, 100)
                    }, new go.Binding('source', 'color', (color) => {
                        if (!color) {
                            return addBeforeBase64 + nodeImageStringHelper('question', 'black', false);
                        } else {
                            return addBeforeBase64 + nodeImageStringHelper('question', color, false);
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
                            return addBeforeBase64 + nodeImageStringHelper('bank', 'white', true);
                        } else {
                            return addBeforeBase64 + nodeImageStringHelper('bank', color, true);
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
                        return addBeforeBase64 + nodeImageStringHelper('human', 'white', false);
                    } else {
                        return addBeforeBase64 + nodeImageStringHelper('human', color, false);
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
                        return addBeforeBase64 + nodeImageStringHelper('human', 'white', true);
                    } else {
                        return addBeforeBase64 + nodeImageStringHelper('human', color, true);
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
        templateMap.add('LSF', foreignLegalSubjectNode);
        templateMap.add('GOV', govNode);
        templateMap.add('default', defaultNode);

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
                            new go.Binding('text', 'tooltip'))
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
                _(go.Shape, { strokeWidth: 3 }, new go.Binding('fill', 'color'), new go.Binding('stroke', 'color')
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
                _(go.Shape, { toArrow: 'Block' }, new go.Binding('fill', 'color'), new go.Binding('stroke', 'color'),
                    // the Shape.fill color depends on whether Link.isHighlighted is true
                    new go.Binding('fill', 'color'), new go.Binding('stroke', 'color')),
                _(go.Shape, { fromArrow: 'BackwardTriangle' }, new go.Binding('fill', 'color'), new go.Binding('stroke', 'color')),
                {
                    toolTip: getLinkAdorment()
                }, new go.Binding('fill', 'color'), new go.Binding('stroke', 'color')
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
                    ), new go.Binding('stroke', 'color')),
                _(go.Shape, {
                    toArrow: '',
                    fill: '#f79d91',
                    stroke: '#f79d91',
                }), new go.Binding('fill', 'color'), new go.Binding('stroke', 'color'),
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
                }), new go.Binding('fill', 'color'), new go.Binding('stroke', 'color')),
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
                        }),
                        new go.Binding('fill', 'color')),
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
                    ), new go.Binding('stroke', 'color')),
                _(go.Shape, {
                    toArrow: '',
                    fill: '#8d9dd0',
                    stroke: '#8d9dd0',
                }), new go.Binding('fill', 'color'), new go.Binding('stroke', 'color'),
                _(go.Shape, {
                    fromArrow: 'BackwardTriangle',
                    fill: '#8d9dd0',
                    stroke: '#8d9dd0',
                    scale: 2
                }, new go.Binding('stroke', 'color'), new go.Binding('fill', 'color'), new go.Binding('scale', 'T0901', (T0901) => {
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
                        }, new go.Binding('fill', 'color'), new go.Binding('visible', 'T0901', (t) => {
                            if (parseFloat(t)) {
                                return true;
                            }
                            return false;
                        })),
                    _(go.TextBlock,   // the label text
                        {
                            textAlign: 'center',
                            margin: 5,
                        },
                        // editing the text automatically updates the model data
                        new go.Binding('text', 'T0901', (t0901) => {
                            if (!t0901) {
                                return '';
                            }
                            return `${t0901}%`;
                        })),
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
                }, new go.Binding('stroke', 'color')),
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
                }, new go.Binding('stroke', 'color')),
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
                }, new go.Binding('stroke', 'color')),
                _(go.Shape, {
                    strokeWidth: 2,
                    toArrow: 'Circle',
                    fill: 'white',
                    stroke: '#f79d91',
                }, new go.Binding('stroke', 'color')),
                _(go.Shape, {
                    strokeWidth: 2,
                    fromArrow: 'Circle',
                    fill: 'white',
                    stroke: '#f79d91'
                }, new go.Binding('stroke', 'color')),
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
                    stroke: '#a3417c'
                }, new go.Binding('stroke', 'color')),
                _(go.Shape, {
                    strokeWidth: 2,
                    toArrow: 'Block',
                    fill: 'white',
                    stroke: '#a3417c',
                }, new go.Binding('stroke', 'color')),
                _(go.Shape, {
                    strokeWidth: 2,
                    fromArrow: 'Block',
                    fill: 'white',
                    stroke: '#a3417c'
                }, new go.Binding('stroke', 'color')),
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
                if (child.data.key === rootNode.data.key) {
                    continue;
                }
                if (!child.data.visible) {
                    return _node.diagram.model.setDataProperty(_node.data, 'showButton', true);
                }
            }
            _node.diagram.model.setDataProperty(_node.data, 'showButton', false);
        });
        rootNode.diagram.layoutDiagram();

    }

    focusOnNode(nodeID) {
        let node = this.diagram.findNodeForKey(nodeID);
        if (node) {
            this.diagram.commandHandler.scrollToPart(node);
        }
    }
}
