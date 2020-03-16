const _ = go.GraphObject.make;
const addBeforeBase64 = "data:image/png;base64,";

class Renderer {
    constructor(data, HTMLElementId, nodesToShow) {
        try {
            this.diagram = _(go.Diagram, HTMLElementId, {
                "undoManager.isEnabled": true,
                initialContentAlignment: go.Spot.Center,
                layout: _(go.ForceDirectedLayout, {
                    maxIterations: 3000,
                    defaultElectricalCharge: 400,
                    isOngoing: false,
                    setsPortSpots: false
                })
            });

            this.diagram.click = function (e) {
                e.diagram.commit(function (d) {
                    d.clearHighlighteds();
                }, "no highlighteds");
            };


            this.diagram.nodeTemplateMap = this.getNodeTemplateMap();
            this.diagram.linkTemplateMap = this.getLinkTemplateMap();

            let linkDataArray = [];
            let nodeDataArray = [];



            data.forEach((obj, index) => {
                let linkCat = getLinkCategory(obj['F069']);
                // adding  the array of links
                linkDataArray.push({
                    from: obj['K0202'],
                    to: obj['K0201'],
                    category: linkCat,
                    f069: obj['F069'],
                    meaning: obj['TXT_1'],
                    fromName: obj['SHORTNAME1'],
                    toName: obj['SHORTNAME2'],
                    T0901: obj['T0901']
                });


                // looking if node has already been added to the node data array
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
                    let category = getNodeCategory(obj['K021_1']);
                    let _visible = nodesToShow ? !!nodesToShow[obj["K0201"]] : true;
                    nodeDataArray.push({
                        key: obj["K0201"],
                        name: obj["SHORTNAME1"],
                        another: obj["SHORTNAME2"],
                        pairedNodeId: obj["K0202"],
                        color: getNodeColor(obj["K060_1"]),
                        category: category,
                        isCollapsed: false,
                        visible: _visible
                    });
                }
                if (!K0202Found) {
                    let category = getNodeCategory(obj['K021_2']);
                    let _visible = nodesToShow ? !!nodesToShow[obj["K0202"]] : true;
                    nodeDataArray.push({
                        key: obj["K0202"],
                        name: obj["SHORTNAME2"],
                        another: obj["SHORTNAME1"],
                        pairedNodeId: obj["K0201"],
                        color: getNodeColor(obj["K060_2"]),
                        category: category,
                        isCollapsed: false,
                        visible: _visible
                    });
                }
            });
            console.log(`Diagram summary: V: ${nodeDataArray.length} E: ${linkDataArray.length}`);
            this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
            this.diagram.commandHandler.zoomToFit();
        } catch (e) {
            let Paragraph = document.createElement("p");
            Paragraph.innerHTML = e.stack;

            let el = document.getElementById(HTMLElementId);
            if (el) el.appendChild(Paragraph);
            alert(`@renderer.js ${e.stack}`);
        }
    }
    deleteDiagram() {
        if (this.diagram) {
            this.diagram.div = null;
            this.diagram = null;
        }
    }


    getNodeTemplateMap() {

        // data = JSON.parse(JSON.stringify(data));
        const GO_JS_COLORS = {
            GREEN: "#057c48",
            LIGHTGREEN: "#89c864",
            YELLOW: "#f9d491",
            VIOLET: "#899dd0"
        };





        /*********************************************************************************************************************************
         ******************************************                    *******************************************************************
         ******************************************   Begin Templates  *******************************************************************    з
         ******************************************                    *******************************************************************
         ********************************************************************************************************************************/

        let nodeClicked = function (e, obj) {
            let adjacent = obj.findNodesConnected();
            while (adjacent.next()) {
                console.log(adjacent.value.part)
            }
        };

        let legalSubjectNode =
            _(go.Node, "Vertical", {
                click: nodeClicked,
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                isShadowed: false
            }, new go.Binding('visible', 'visible'),
                _(go.Panel, "Auto",
                    _(go.Shape, "Rectangle", { fill: "white", stroke: 'grey', strokeWidth: 1 },
                        new go.Binding("fill", "color", (color) => {
                            switch (color) {
                                case "lightgreen":
                                    return GO_JS_COLORS.LIGHTGREEN;
                                case "green":
                                    return GO_JS_COLORS.GREEN;
                                case "yellow":
                                    return GO_JS_COLORS.YELLOW;
                                case "violet":
                                    return GO_JS_COLORS.VIOLET;
                                default:
                                    return "pink";
                            }
                        }),
                        new go.Binding("stroke", "color", (color) => {
                            switch (color) {
                                case "lightgreen":
                                    return GO_JS_COLORS.LIGHTGREEN;
                                case "green":
                                    return GO_JS_COLORS.GREEN;
                                case "yellow":
                                    return GO_JS_COLORS.YELLOW;
                                case "violet":
                                    return GO_JS_COLORS.VIOLET;
                                default:
                                    return "pink";
                            }
                        })
                    ),
                    _(go.TextBlock, {
                        margin: 15,
                        font: 'bold 15px Montserrat, sans-serif'
                    },
                        new go.Binding("text", "name"))
                ),
                _("TreeExpanderButton", {
                    name: 'TREEBUTTON',
                    width: 15,
                    height: 15,
                    alignment: go.Spot.BottomCenter,
                    //alignmentFocus: go.Spot.Center,
                }),
                { // this tooltip shows the name and picture of the kitten
                    toolTip:
                        _("ToolTip",
                            _(go.Panel, "Vertical",
                                _(go.TextBlock, { margin: 3, text: "la-la-la" }
                                )
                            ) // end Panel 
                        )  // end Adornment
                }
            );

        let bankNode =
            _(go.Node, "Spot", {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides
            }, new go.Binding('visible', 'visible'),
                _(go.Picture, {
                    source: "lnkd_prsn_vis_icons/bank_violet.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return addBeforeBase64 + nodeImageStringHelper("bank", "white", false)
                    } else {
                        return addBeforeBase64 + nodeImageStringHelper("bank", color, false)
                    }
                })),
                _(go.Panel, "Vertical", { background: "rgba(255,255,255,0.5)" },
                    _(go.TextBlock, {
                        margin: 8,
                        isMultiline: true,
                        textAlign: "center",
                        font: 'bold 15px Montserrat, sans-serif'
                    }, new go.Binding('text', 'name')),
                ),
                _("TreeExpanderButton", {
                    name: 'TREEBUTTON',
                    width: 10,
                    height: 10,
                    alignment: go.Spot.BottomCenter,
                    alignmentFocus: go.Spot.Center,
                })
            );
        let govNode =
            _(go.Node, "Spot", {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides
            }, new go.Binding('visible', 'visible'),
                _(go.Picture, {
                    desiredSize: new go.Size(100, 130)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return addBeforeBase64 + nodeImageStringHelper("gov", "white", false)
                    } else {
                        return addBeforeBase64 + nodeImageStringHelper("gov", color, false)
                    }
                })),
                _(go.Panel, "Vertical", { background: "rgba(255,255,255,0.5)" },
                    _(go.TextBlock, {
                        margin: 8,
                        isMultiline: true,
                        textAlign: "center",
                        font: 'bold 15px Montserrat, sans-serif'
                    }, new go.Binding('text', 'name')),
                ),
                _("TreeExpanderButton", {
                    name: 'TREEBUTTON',
                    width: 10,
                    height: 10,
                    alignment: go.Spot.BottomCenter,
                    alignmentFocus: go.Spot.Center,
                })
            );
        let foreignBankNode =
            _(go.Node, "Spot", {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides
            }, new go.Binding('visible', 'visible'),
                _(go.Picture, {
                    source: "lnkd_prsn_vis_icons/bank_violet.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return addBeforeBase64 + nodeImageStringHelper("bank", "white", true)
                    } else {
                        return addBeforeBase64 + nodeImageStringHelper("bank", color, true)
                    }
                })),
                _(go.Panel, "Vertical", { background: "rgba(255,255,255,0.5)" },
                    _(go.TextBlock, {
                        margin: 8,
                        isMultiline: true,
                        textAlign: "center",
                        font: 'bold 15px Montserrat, sans-serif'
                    }, new go.Binding('text', 'name')),
                ),
                _("TreeExpanderButton", {
                    name: 'TREEBUTTON',
                    width: 10,
                    height: 10,
                    alignment: go.Spot.BottomCenter,
                    alignmentFocus: go.Spot.Center,
                })
            );
        let physicalSubjectNode =
            _(go.Node, "Vertical", {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides
            }, new go.Binding('visible', 'visible'),
                // the whole node panel
                _(go.Picture, {
                    source: "lnkd_prsn_vis_icons/human.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return addBeforeBase64 + nodeImageStringHelper("human", "white", false)
                    } else {
                        return addBeforeBase64 + nodeImageStringHelper("human", color, false)
                    }
                })),
                _(go.Panel, "Vertical", {
                    background: "rgba(255,255,255,0.5)",
                },
                    _(go.TextBlock, {
                        width: 150,
                        margin: 8,
                        isMultiline: true,
                        textAlign: "center",
                        font: 'bold 15px Arial, sans-serif'
                    }, new go.Binding('text', 'name')),
                ),
                _("TreeExpanderButton", {
                    name: 'TREEBUTTON',
                    width: 15,
                    height: 15,
                    alignment: go.Spot.BottomCenter,
                    alignmentFocus: go.Spot.Center,
                })
            );
        let foreignPhysicalSubjectNode =
            _(go.Node, "Vertical", {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides
            }, new go.Binding('visible', 'visible'),
                // the whole node panel
                _(go.Picture, {
                    source: "lnkd_prsn_vis_icons/human.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return addBeforeBase64 + nodeImageStringHelper("human", "white", true)
                    } else {
                        return addBeforeBase64 + nodeImageStringHelper("human", color, true)
                    }
                })),
                _(go.Panel, "Vertical", {
                    background: "rgba(255,255,255,0.5)",
                },
                    _(go.TextBlock, {
                        width: 150,
                        margin: 8,
                        isMultiline: true,
                        textAlign: "center",
                        font: 'bold 15px Arial, sans-serif'
                    }, new go.Binding('text', 'name')),
                ),
                _("TreeExpanderButton", {
                    name: 'TREEBUTTON',
                    width: 15,
                    height: 15,
                    alignment: go.Spot.BottomCenter,
                    alignmentFocus: go.Spot.Center,
                })
            );

        let testNodeTemplate =
            _(go.Node, "Vertical", {
                fromSpot: go.Spot.AllSides, // coming out from middle-right
                toSpot: go.Spot.AllSides,
                isShadowed: false
            },
                _(go.Panel, "Auto",
                    _(go.Shape, "Rectangle", { fill: "white", stroke: 'grey', strokeWidth: 1 },
                        new go.Binding("fill", "color", (color) => {
                            switch (color) {
                                case "lightgreen":
                                    return GO_JS_COLORS.LIGHTGREEN;
                                case "green":
                                    return GO_JS_COLORS.GREEN;
                                case "yellow":
                                    return GO_JS_COLORS.YELLOW;
                                case "violet":
                                    return GO_JS_COLORS.VIOLET;
                                default:
                                    return "pink";
                            }
                        }),
                        new go.Binding("stroke", "color", (color) => {
                            switch (color) {
                                case "lightgreen":
                                    return GO_JS_COLORS.LIGHTGREEN;
                                case "green":
                                    return GO_JS_COLORS.GREEN;
                                case "yellow":
                                    return GO_JS_COLORS.YELLOW;
                                case "violet":
                                    return GO_JS_COLORS.VIOLET;
                                default:
                                    return "pink";
                            }
                        })
                    ),
                    _(go.Panel, "Vertical",
                        _(go.TextBlock, {
                            margin: 15,
                            font: 'bold 15px Montserrat, sans-serif'
                        }, new go.Binding("text", "name")),
                        _(go.TextBlock, {
                            margin: 15,
                            font: 'bold 12px Montserrat, sans-serif'
                        }, new go.Binding("text", "key")))

                ),
                _("TreeExpanderButton", {
                    name: 'TREEBUTTON',
                    width: 15,
                    height: 15,
                    alignment: go.Spot.BottomCenter,
                    //alignmentFocus: go.Spot.Center,
                })
            );



        /********************************************************************************************************************************
         ******************************************                   *******************************************************************
         ******************************************   Templates Links *******************************************************************    
         ******************************************                   *******************************************************************
         *******************************************************************************************************************************/


        let templateMap = new go.Map();
        templateMap.add("Bank", bankNode);
        templateMap.add("PS", physicalSubjectNode);
        templateMap.add("BankF", foreignBankNode);
        templateMap.add("PSF", foreignPhysicalSubjectNode);
        templateMap.add("LS", legalSubjectNode);
        templateMap.add("LSF", foreignLegalSubjectNode);
        templateMap.add("GOV", govNode);

        return templateMap;
    }

    getLinkTemplateMap() {
        let linkAdorment =
            _(go.Adornment, "Auto",
                _(go.Panel, "Auto",
                    _(go.Shape, "Rectangle", { fill: "white", stroke: "grey" }),
                    _(go.Panel, "Vertical",
                        _(go.TextBlock, { margin: 5 },
                            new go.Binding("text", "meaning", (meaning = "Не вказано") => {
                                return `Пояснення: ${meaning}`
                            })),
                        _(go.TextBlock, { margin: 5 },
                            new go.Binding("text", "f069", (f069 = "Не вказано") => {
                                return `Тип зв'язку: ${f069}`
                            })),
                        _(go.TextBlock, { margin: 5 },
                            new go.Binding("text", "fromName", (fromName = "Не вказано") => {
                                return `Від: ${fromName}`
                            })),
                        _(go.TextBlock, { margin: 5 },
                            new go.Binding("text", "toName", (toName = "Не вказано") => {
                                return `До: ${toName}`
                            })),

                    )
                ) // end Panel 
            )  // end Adornment

        const managerLink =
            _(go.Link,
                {
                    opacity: 1,
                    routing: go.Link.Orthogonal,
                    curve: go.Link.JumpGap,
                    corner: 10,
                    layerName: "Background",
                    toShortLength: 3,
                    fromShortLength: 3,
                },
                _(go.Shape, { strokeWidth: 3 }
                    /*,
                                    // the Shape.stroke color depends on whether Link.isHighlighted is true
                                    new go.Binding("stroke", "isHighlighted", function (h) {
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
                _(go.Shape, { toArrow: "Block" },
                    // the Shape.fill color depends on whether Link.isHighlighted is true
                    new go.Binding("fill", "isHighlighted", function (h) {
                        return h ? "red" : "black";
                    }).ofObject()),
                _(go.Shape, { fromArrow: "BackwardTriangle" }),
                { // this tooltip shows the name and picture of the kitten
                    toolTip: linkAdorment
                }
            );
        let founderLink =
            _(go.Link,
                {
                    opacity: 1,
                    routing: go.Link.Orthogonal,
                    curve: go.Link.JumpOver,
                    corner: 10,
                    layerName: "Background",
                    fromEndSegmentLength: 60,
                    toEndSegmentLength: 60
                },
                new go.Binding("fromShortLength", 'T0901', T0901 => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 7
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 27
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 30
                    }
                    return 1;
                }),
                new go.Binding("fromEndSegmentLength", 'T0901', T0901 => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 10
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 20
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 25
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 40
                    }
                    return 1;
                }),
                new go.Binding("toEndSegmentLength", 'T0901', T0901 => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 10
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 20
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 25
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 40
                    }
                    return 1;
                }),
                _(go.Shape, {
                    opacity: 0.8,
                    strokeWidth: 3,
                    stroke: "#f79d91"
                },
                    new go.Binding('strokeWidth', 'T0901', (T0901 = 4) => {
                        let res = parseInt(T0901, 10) / 4;
                        return res < 1 ? 1 : res;
                    }
                    )),
                _(go.Shape, {
                    toArrow: "",
                    fill: "#f79d91",
                    stroke: "#f79d91",
                }),
                _(go.Shape, {
                    fromArrow: "BackwardTriangle",
                    fill: "#f79d91",
                    stroke: "#f79d91",
                    scale: 2
                }, new go.Binding("scale", 'T0901', (T0901) => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 1
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 2
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 3
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 5
                    }
                    return 1
                })),
                _(go.Panel, "Auto",
                    _(go.Shape, "RoundedRectangle", // the label background, which becomes transparent around the edges
                        {
                            fill: "#f79d91",
                            stroke: null
                        }),
                    _(go.TextBlock, "pr",  // the label text
                        {
                            textAlign: "center",
                            margin: 5
                        },
                        // editing the text automatically updates the model data
                        new go.Binding("text", 'T0901', (t0901) => {
                            if (!t0901) {
                                return "";
                            }
                            return `${t0901}%`
                        }))
                ),
                { // this tooltip shows the name and picture of the kitten
                    toolTip: linkAdorment
                }
            );
        let stakeholderLink =
            _(go.Link,
                {
                    opacity: 1,
                    routing: go.Link.Orthogonal,
                    curve: go.Link.JumpOver,
                    corner: 10,
                    layerName: "Background",
                    fromEndSegmentLength: 60,
                    toEndSegmentLength: 60
                },
                new go.Binding("fromShortLength", 'T0901', T0901 => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 7
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 27
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 30
                    }
                }),
                new go.Binding("fromEndSegmentLength", 'T0901', T0901 => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 10
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 23
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 40
                    }
                }),
                new go.Binding("toEndSegmentLength", 'T0901', T0901 => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 10
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 15
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 23
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 40
                    }
                }),
                _(go.Shape, {
                    opacity: 0.8,
                    strokeWidth: 3,
                    stroke: "#8d9dd0"
                },
                    new go.Binding('strokeWidth', 'T0901', (T0901 = 4) => {
                        let res = parseInt(T0901, 10) / 4;
                        return res < 1 ? 1 : res;
                    }
                    )),
                _(go.Shape, {
                    toArrow: "",
                    fill: "#8d9dd0",
                    stroke: "#8d9dd0",
                }),
                _(go.Shape, {
                    fromArrow: "BackwardTriangle",
                    fill: "#8d9dd0",
                    stroke: "#8d9dd0",
                    scale: 2
                }, new go.Binding("scale", 'T0901', (T0901) => {
                    if (T0901 > 0 && T0901 <= 25) {
                        return 1
                    }
                    if (T0901 > 25 && T0901 <= 50) {
                        return 2
                    }
                    if (T0901 > 50 && T0901 <= 75) {
                        return 3
                    }
                    if (T0901 > 75 && T0901 <= 100) {
                        return 5
                    }
                    return 1
                })),
                _(go.Panel, "Auto",
                    _(go.Shape, "RoundedRectangle", // the label background, which becomes transparent around the edges
                        {
                            fill: "#8d9dd0",
                            stroke: null
                        }),
                    _(go.TextBlock, "pr",  // the label text
                        {
                            textAlign: "center",
                            margin: 5
                        },
                        // editing the text automatically updates the model data
                        new go.Binding("text", 'T0901', (t0901) => {
                            if (!t0901) {
                                return "";
                            }
                            return `${t0901}%`
                        }))
                ),
                { // this tooltip shows the name and picture of the kitten
                    toolTip: linkAdorment
                }
            );
        let familyLink =
            _(go.Link,
                {
                    //routing: go.Link.Orthogonal ,
                    opacity: 1,
                    curve: go.Link.JumpGap,
                    layerName: "Background"
                },
                _(go.Shape, {
                    strokeWidth: 2,
                    stroke: "#f9d491"
                }),
                { // this tooltip shows the name and picture of the kitten
                    toolTip: linkAdorment
                }
                /*,
                            _(go.Shape,
                                {
                                    toArrow: "Block",
                                    fill: "#f9d491",
                                    stroke: "#f9d491",
                                }),
                            _(go.Shape,
                                {
                                    fromArrow: "Block",
                                    fill: "#f9d491",
                                    stroke: "#f9d491"
                                })*/
            );
        let otherLink =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.Orthogonal,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
                _(go.Shape, {
                    strokeWidth: 3,
                    stroke: "#f79d91" // old 
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    toArrow: "Circle",
                    fill: "white",
                    stroke: "#f79d91",
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    fromArrow: "Circle",
                    fill: "white",
                    stroke: "#f79d91"
                }),
                { // this tooltip shows the name and picture of the kitten
                    toolTip: linkAdorment
                }
            );
        let commonContactsLink =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.Orthogonal,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
                _(go.Shape, {
                    strokeWidth: 3,
                    stroke: "#ff78e2"
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    toArrow: "Block",
                    fill: "white",
                    stroke: "#ff78e2",
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    fromArrow: "Block",
                    fill: "white",
                    stroke: "#ff78e2"
                }),
                { // this tooltip shows the name and picture of the kitten
                    toolTip: linkAdorment
                }
            );
        /* 
        --------------------------------------------------------
        --------------------------------------------------------
        --------------------------------------------------------
        */
        const managerLinkOld =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.Orthogonal,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background",
                toShortLength: 3,
                fromShortLength: 3,
            },
                _(go.Shape, {
                    strokeWidth: 4,
                    stroke: "transparent",
                    pathPattern: _(go.Shape,
                        {
                            geometryString: 'M0 0 M20 0 L25 0',
                            fill: "transparent",
                            stroke: "black",
                            strokeWidth: 4,
                            strokeCap: 'square'
                        })
                }
                    /*,
                                    // the Shape.stroke color depends on whether Link.isHighlighted is true
                                    new go.Binding("stroke", "isHighlighted", function (h) {
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
                _(go.Shape, { toArrow: "Block" },
                    // the Shape.fill color depends on whether Link.isHighlighted is true
                    new go.Binding("fill", "isHighlighted", function (h) {
                        return h ? "red" : "black";
                    })
                        .ofObject()),
                _(go.Shape, { fromArrow: "BackwardTriangle" })
            );
        let founderLinkOld =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.Orthogonal,
                curve: go.Link.JumpGap,
                corner: 10,
                toShortLength: 4,
                fromShortLength: 4,
                layerName: "Background"
            },
                _(go.Shape, {
                    strokeWidth: 4,
                    stroke: "transparent",
                    pathPattern: _(go.Shape,
                        {
                            geometryString: 'M0 0 M4 0 L6 0',
                            fill: "transparent",
                            stroke: "#f79d91",
                            strokeWidth: 3,
                            strokeCap: 'square'
                        })
                }),
                _(go.Shape, {
                    toArrow: "Block",
                    fill: "#f79d91",
                    stroke: "#f79d91",
                }),
                _(go.Shape, {
                    fromArrow: "BackwardTriangle",
                    fill: "#f79d91",
                    stroke: "#f79d91",
                    scale: 2
                })
            );
        let stakeholderLinkOld =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.Orthogonal,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
                _(go.Shape, {
                    strokeWidth: 0,
                    stroke: "transparent",
                    pathPattern: _(go.Shape,
                        {
                            geometryString: 'M0 0 M3 0 L6 0',
                            fill: "transparent",
                            stroke: "#8d9dd0",
                            strokeWidth: 1,
                            strokeCap: 'square'
                        })
                }),
                _(go.Shape, {
                    toArrow: "Block",
                    fill: "#8d9dd0",
                    stroke: "#8d9dd0",
                }),
                _(go.Shape, {
                    fromArrow: "BackwardTriangle",
                    fill: "#8d9dd0",
                    stroke: "#8d9dd0",
                    scale: 2
                })
            );
        let familyLinkOld =
            _(go.Link, {
                //routing: go.Link.Orthogonal ,
                opacity: 1,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
                _(go.Shape, {
                    strokeWidth: 4,
                    stroke: "transparent",
                    pathPattern: _(go.Shape,
                        {
                            geometryString: 'M0 0 M3 0 L6 0',
                            fill: "transparent",
                            stroke: "#f9d491",
                            strokeWidth: 1,
                            strokeCap: 'square'
                        })
                })
                /*,
                            _(go.Shape,
                                {
                                    toArrow: "Block",
                                    fill: "#f9d491",
                                    stroke: "#f9d491",
                                }),
                            _(go.Shape,
                                {
                                    fromArrow: "Block",
                                    fill: "#f9d491",
                                    stroke: "#f9d491"
                                })*/
            );
        let otherLinkOld =
            _(go.Link, {
                opacity: 1,
                routing: go.Link.Orthogonal,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
                _(go.Shape, {
                    strokeWidth: 3,
                    stroke: "transparent",
                    pathPattern: _(go.Shape,
                        {
                            geometryString: 'M0 0 M3 0 L6 0',
                            fill: "transparent",
                            stroke: "#f79d91",
                            strokeWidth: 1,
                            strokeCap: 'square'
                        })
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    toArrow: "Circle",
                    fill: "white",
                    stroke: "#f79d91",
                }),
                _(go.Shape, {
                    strokeWidth: 2,
                    fromArrow: "Circle",
                    fill: "white",
                    stroke: "#f79d91"
                })
            );

        let linkTemplateMap = new go.Map();

        linkTemplateMap.add("manager", managerLink);
        linkTemplateMap.add("founder", founderLink);
        linkTemplateMap.add("stakeholder", stakeholderLink);
        linkTemplateMap.add("family", familyLink);
        linkTemplateMap.add("other", otherLink);
        linkTemplateMap.add("common_contacts", commonContactsLink);

        linkTemplateMap.add("manager_old", managerLinkOld);
        linkTemplateMap.add("founder_old", founderLinkOld);
        linkTemplateMap.add("stakeholder_old", stakeholderLinkOld);
        linkTemplateMap.add("family_old", familyLinkOld);
        linkTemplateMap.add("other_old", otherLinkOld);

        return linkTemplateMap;
    }
}
/********************************************************************************************************************************
 ******************************************                   *******************************************************************
 ******************************************   End Templates   *******************************************************************    
 ******************************************                   *******************************************************************
 *******************************************************************************************************************************/
function getNodeCategory(K021) {
    const K = K021,
        NODE_CATEGORIES = {
            BANK: 'Bank',
            PS: 'PS',
            LS: 'LS',
            PSF: 'PSF',
            BANKF: 'BankF',
            GOV: "GOV"
        };

    switch (true) {
        case (K === "3"):
            return NODE_CATEGORIES.BANK;
        case (K === "2" || K === "6" || K === "A" || K === "F" || K === "I"):
            return NODE_CATEGORIES.PS;
        case (K === "4"):
            return NODE_CATEGORIES.BANKF;
        case (K === "G"):
            return NODE_CATEGORIES.GOV;
        case (K === "5" || K === "7" || K === "B" || K === "H" || K === "L"):
            return NODE_CATEGORIES.PSF;
        case (K === "1" || K === "D" || K === "E" || K === "8" || K === "9" || K === "C" || K === "K"):
            return NODE_CATEGORIES.LS;
        default:
            return NODE_CATEGORIES.LS;
    }
}


function getNodeColor(K060) {
    const K = K060;
    const COLORS = { GREEN: "green", LIGHTGREEN: "lightgreen", VIOLET: "violet", YELLOW: "yellow", OCEAN: "ocean", WHITE: "white" };

    switch (true) {
        case (K === "01" || K === "02" || K === "03"):
            return COLORS.GREEN;
        case (K === "04" || K === "05" || K === "06" || K === "F" || K === "I"):
            return COLORS.LIGHTGREEN;
        case (K === "07" || K === "08"):
            return COLORS.VIOLET;
        case (K === "09"):
            return COLORS.YELLOW;
        case (K === "99"):
            return COLORS.OCEAN;
        default:
            console.log('default color for node')
            return COLORS.WHITE;
    }
}

function getLinkCategory(F069) {
    const F = F069,
        LINK_CATEGORIES = {
            MANAGER: "manager",
            FOUNDER: "founder",
            STAKEHOLDER: "stakeholder",
            FAMILY: "family",
            OTHER: "other",
            COMMON_CONTACTS: "common_contacts",
            MANAGER_OLD: "manager_old",
            FOUNDER_OLD: "founder_old",
            STAKEHOLDER_OLD: "stakeholder_old",
            FAMILY_OLD: "family_old",
            OTHER_OLD: "other_old"
        };

    if (F === "01" || F === "02" || F === "07" || F === "08" || F === "10" || F === "11")
        return LINK_CATEGORIES.FOUNDER;
    if (parseInt(F) >= 12 && parseInt(F) <= 15)
        return LINK_CATEGORIES.MANAGER;
    if (F === "68" || F === "69")
        return LINK_CATEGORIES.STAKEHOLDER;
    if (parseInt(F) >= 16 && parseInt(F) <= 40)
        return LINK_CATEGORIES.FAMILY;
    if (F === "06" || F === "09" || F === "41" || F === "99" || F === "60" || F === "65" || F === "66")
        return LINK_CATEGORIES.OTHER;
    if (parseInt(F) >= 61 && parseInt(F) <= 64)
        return LINK_CATEGORIES.COMMON_CONTACTS
    return LINK_CATEGORIES.STAKEHOLDER;
}

/**
 * Accepts parameteres required to decide what image we should use in Node template.
 * Method created to be sure that every node will have the coresponding images 
 * 
 * @param entityType {String} "bank" | "gov" | "human"  
 * @param color {String} "green" | "lightgreen" | "yellow" | "violet" | "ocean" | "white"
 * @param isForeign {Boolean}
 * 
*  @returns {String} Base64 encoded image string 
*/

function nodeImageStringHelper(entityType, color, isForeign) {


    const DEFAULT_RETURN = "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAQAAABecRxxAAAPJHpUWHRSYXcgcHJvZmlsZSB0eXBlIGV4aWYAAHjarZppciM7DoT/8xRzBO4gj8M1Ym4wx58P1GLJkrttv2eFXepaSBBIIBOsNut//93mP/wkl7yJSUquOVt+Yo3VN74Ue/mp56+z8fy9/fjr2afz5n7BcypwDJcL0i5H1zifPh64zeH683lTrld8uQ50m/k6YNCZdar5aCTn/eW8i9eB6rp8ybXIo6n9Yqcd1xuPKdfffh30WGQv/zaPJ6LgpZmYKHi/ggv2/I0XCwLWhRoaf/35m72esXyPwZtzyFdLcMjT8j4c/Oigz853F2e79xc+O9+36/nwyZf5FrX8/oJL751/XPwwcbhb5J8vrOr8y3Kuv3vPsve6rK7FjEfzFVHH2e42DDd2XB7OY5mP8Jv4LudT+RTb7CDk0w7b+QzHxHh8GxfddM1tt85xuIGJ0S8vHL0fPpxzJYivfpzIRf247YUYzlCI4fDLhKDBu9vizrz1zDdcYebpuNU7BtOwf/kxf7r4k4/Ze6iLnC13X2GXV4djhkZO/3IXAXH7Grd0HHz73JPWPgQ2EMF03FxYYLP9MkRP7gNb4cQ5cF/ieEkhZ2ReB8BFzJ0wxgUiYLMLyWVnxXtxDj8WAtSw3IfoOxFwKfmJkT4GssWIL17n5hlx516ffPZ6mtpEIFLIQYgNWUawYkzgR2IBQy2FFFNKOUkqJtXUcsgxp5yzZC1yTYJESZJFpEiVVkKJJZVcpJRSS6u+BmpgqrlKLbXW1rxpTNQYq3F/40z3PfTYU89deum1twF8Rhxp5CGjjDra9DNMysTMU2aZdbblzKJSrLjSyktWWXW1DdZ22HGnnbfssutu96hdo/ry+UHU3DVq/kRK75N71DhrRG5DOC0nSWNGxHx0RFw0AgDaa8xscTF6jZzGzFZPUiSPkUljY6bTiBHCuJxP291j9xG5b8XNpPKtuPm/Rc5o6P6NyBlC9xq3N1GbynPjROyShepTG8g+rq/SjC9NSa1979i7Pioj5JnDkC2YMcOerpu4CksYWyYMlJJdwTv1ZsbAOqi81dXBP7PfRdKyuVeKoOCVEHfMUtogAX0yfdQZZY6yA+lLKvayo6tbwli+rxEnSVo6FU5i6zKpg6PniPtClzRBQq6zz2ioligHqT5uH+uoLGBFaufW2lP4Qg0upYXsmvjcnJRefMaPKcYCCH0s3sU9TOtl7OxgbmGskCb2ucZNDku4mUqelCuaJKX5CQ4Jum2R0VcRQmxHCWkYlt7CAsQFO+J2BHfq3CyOoOK3TIqU2QW6HjWRh13iEmA96opu5d4HkbAmrBBIUxZyDYV1ir+lZ6bnmVqJhRMoZrk0iEUClnHNvPpwqwPUsQiRKaPtPnrSqI2Q1vRt4c/JrVXNWctJHtV1IBW93eSpwxIsJwGJRui7lL6s0XBSHwgnECQnah4Nbkw91Flk7hNNcEA0JYaysTnnYoOmo6IL752juX35p8ePgcLqGOZwfI9TD6BA1nZ59j5TGnPEgt/HGvD+yHBZz2Flt9eubUezQOa2Y0Kqvg9fCWFdCoSwAF4iBH3nNefsqDF83bO42mb6nEDmZNAYwi3I2xkSzpMa0m4x9bZ2bKLFDUIPoVM0kYTEHVVSESZgs8+g1WKYOLMNKW3bcge8pNDou6eEBrQLRdB7XisCm7I2gVY/A4NXP5l/w9EfA4W1sElWs7u1XfyOeIbaX4ESysaRibPB1QIF924RMwE/casre9Ylg1LrkmK4UGRx+RjU30XUMvXWuWlxPwWAxCarG9UPGb9rzZ2nP9llzpdB1S9Z7aGh8DvhJhBfqp9rkHY+zEG40eFExKs95W4PnII9LhmKOY2IWkMStdUhfgp6dhOR6MugkkzGJp1yaIQqNXVElhcnGf8vefs6UEjUYYDoZ8Qt4Gd2gN5SREP2WixF1VVERwDjWs4ipFBgSQuFVArw3qSIgznSoqRRyhgnDnhsa+MASqWk3alde9FvTBnwL7xF9TjRzT2FSCGM0pepWikmN0xqOjm98AseC0VpOYq9gGM2wBuw2u0OEVD1HBBnugxCEhUPFgEdiSt9FHAfOG33GFCmRD+nUKiaTWUPfmlxmnOACjHN05wPRZsf7pRgNrNaKLAsnbt7pqawkg7dLZtmWB5BMUnjTvgH96a+Vi3KpegVt1Mg+vX4qFSFZKZWhzW3UD9dnYEnR8VyNYO6KzBCXYgZr4hUhgNyTbTP3EgSV4yUAWFtmzL4y3iyDhK6FHqHsMMYpEAiRmkVrasqV7S06rOJus/wI7cebDXUZQnTEV7oRtAojtJEtULUkBoUb+HpCTpib7UvnEcaxI5EyQNrd6XFAB3J2FCSG6chRQCl2iEvhjwk9pOj+eqCaBbPruwEY6kX0WCzEo9IRPG4W9vDMK5XRzJb00hVxQPCDtFASXDobhYJpJfFEzDnpMgslt+mhXydVskJQmb3JGOF/FFAaEhc4qkLnXtwbAcOqu1lAtsK4fVKy7s8Kg6Ao+xI3AgtuDB3JSd40KU1QjMxV0R/Q7+kvBugBeoVyhXqEjRRJpUDnae/R2YsQoAvRWvumLrkhUbd0JGgt1wVWLs48STjPAROXgsCbW9yDqWjlG57DXtgvT/ksYPwTIK5tHtSXoNXEV/geCDiWNWmYaz7dKa0+8fTfkU8CX1daoWacjHkboc5hfbBlJshNEsXU94awjM3U652mHeG6EbI1RR7MUb3Fh7NuXnmwzHmn3nmwzHmJ55Bw7crREhgQTPJgQg9QDd52aoyM/gc6tYdAdqNiRV11YkUJOkQ4igfFH9Aq9K1UyBDLvQdtOMJAZh9ntr3l2iBuLZ3UBjVe+epTSapqWJWOrOAJjoSFbMVMVsQsz7mPbEdkqFtlWpNFG/LOKsvzNPW2CpGgDsEah18sLtHtJHN6DxKTIXjtMlpZWSYgHLu00BDCrSFCBOqwPhJD3DvBZCSkPw0CzVIjKAERLKvJCWTVbtZxxhIV873CumQ15yTsPF3tYtijHD2M9O8qZZfhi4oR8pDdMgahmk50qPyA3SqSmDd7qKwfpMgv7ohjE01wmVK+aDF9bnpPVycY6m4wwKaCI2pobBTTuKcnBxaPKgRKpipXT3putD+MU8aHmiN4tEGhqOB0RS+AwDtJj3tpVFdlHQXUMviD45pQ6+Hf7ankqaTtDRddY9ChXcvNzxex1nltmbET4Enc7kUXTGEggaXttPRNYpU8FggM+AGamgvJiLW7UqhDah6LaMOZpu6SdYgL4iQrkDGZCBC7HbOSx9DT9Th8GcfJ+czEhpCROquiTcPkZLePZw2bMCp5xxLYKCLdip/k0Avi3lei/n9Yp7XYn6/mOe1qBglX9opUhomhiFI56Ey72H8w/W/Me3bo2Bko0LSfGYFei/8i65822i+uhgtleua4vuCq7NqxNR93Xrutm6zL8vOFxDqstHOmTszhKlnpOs2BLV4DeT31uYm6rYl09GP6jTN+r/tRKgp3wyAeYjAoynHEGjpw5RjiLUvppwZ2zatyHEPihf38IAP6ruL67649i6XzTeT/Br8dIL/kuFcNZ8uPyb4kv19xxtdbti/xfOf2vVjiLr5B47HEvMnkL1i7NGUa2Zd88ac+qe4fk6s6+Xnq3/KHvO3tNLkfEmsN1fNF6n144Ji/gmeH4/mc2r9Lcu/SnLz0yy/ptZL9hC1PyXX/epfKdO8Ta8M2WeYftLWBbpYEAF508AhtNCBKdqJprLoIN0VgwPWVsqmfe4kmuu0jRUH+Vm08910VuIn7XBDgDa63r59p1UR2q6ebY5oMU83sfhaTCjnBRaIHc03B0013DV7LmuhHQR0FI+lo/oR6S1T0S02bZtjyghL2AdBZcUUOjnazjq1FQnO24QqRYfMQieuuhR7abPpP7Tl1f3O7SpRSbTe2tFuWtGK0jLhTLfRalZWtjyIg2mZ6HggRIfc/QqCasrIqMyC+HMAstS1EHR9ouJoj1DTtmTd7KHbtap1Ua4l6z6sozGFoN9C1XyN1e9DFa9MyohnsahoGH5WJ5E2X9+I+RKR6tk7B6N7tUl908pZayRNtYfcZ+tc4RxNPkvVtlqXakVY6QQ7iOs+gc+I6PvsGyqEy6MIjTYe1NeAbgA7mbT7xMPUBQLdoMdZwXVL0LWhAAwU8OgqApiuouvLB3RHGrsT/Rzdos2hyWyrzYVpLRqw2uvSN1FlRoRK97QIKdG7a98/9BWzblcz6aZdlUWLnEKydBVzRXijxfPEMICSzgPhj1pjUiCNQZM+ItBwpaH7bW0k3aphDAU+nQoQnyTkDAUI0ZRhlhgfPCssPhV98akVzwNAV3+6j2DeltmT9+/LiZbxS6RmrZzSzSQKYjSXijjxBB3Jx1DjYOQhziBan+8RSQ+RvJRj81CP9b3XV+nw+HBO+vCx8HpXT2KmfViV6lNdFEA6i/KdktEvzTDi9GFZL3XeUF3Tsu6XezQfR/OFr99zyM2kBz9rtddgmLd+Ptnzmk8ffn5NYHPL4LunP9PN08M5XR6+e1r9fNxsnvx88fKHjx89/FYpfbjXpH/u58eBfoPlZyib32P5Gcrm91h+hrL5PZafoWz+JV9fB/oVlp+hbH6P5Wcom99j+RnK5vdY/qaq/XZTiQlrzG5aGwFNha7OPTb0TqxSYdWB1ogQpx8VDZMQcDXQdXOywckQTQtKHsiT1R3eMw3X+FoaKiUrXedhK2SKVki6geLchLFPZ7GdbuO7bYOcNwBbysijOeTFWs50q/KrOD/reXHp4bQNYcvaEHNFGNnAzDIveTRp92PNrbo0pJStGznT1TKMUt7QBUB5ZQeHgAsToitbVRIaUOXF2DcbkGUNTl3M2Y8CrPQd+s7bwPfIgN10/xplCatL9aExOSEf+biBkDuRBtE7X2tmlBYRaAWBsZp0CyqtQT/qLv95kYLcAzhzJq9wcLrf2FLXVwN4YVbYeLc8w0pdRWRb4nyODASCojl9z+cQfC8Cfenb/6vrzbPvv+d6VBHOT/jbbn3V4vG7kY5BObFkEbFTlUXXN+djoSnQaSvsmZ3bSAxvdxjo3LOJx9oz6gmJ3AvAyqb0lryuVf8jQPW5hpat1IL/AiFDmqLlccgk2Cmx1JAQefpSqeiLYEm2RkYVI+m8q8w+EuhZ5Ppf4tbQZiLmH7yCDlpsCN//ARROsZQQvum7AAABJWlDQ1BJQ0MgcHJvZmlsZQAAeJydkL9Kw1AUxn+tokUqCIqDOGTQzYKLmVz8g8GhUNsKVqf0JsViEkOSUnyDvok+TAdB8AV8AwVnvxsdHMzihcP343DO9917oe5EJs4X9yFOiszrHg2uBtfO8htN1miwy55v8rTdO+tTeT5fqVl9aVmv6rk/z1IQ5kY6VyUmzQqoHYrdaZFaVrFx1++eiGdiJ4iTQPwk3gniwLLd7cbRxPx42ts0w+SyZ/uqbTzOadPBYciEMREFLWmizikuB1KPDJ8Hcow0IlRvqpmCW1EuJ49jUV+k21TkbZV5HaUM5TGWl024J5anzcP+7/fax0W5Wducp37ml60FVX00gvdHWB3A+jOs3FRkNX6/rWLGLWf++cYvKClQhaL1RBUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfjDBAIKjsZng2mAAAKjUlEQVR4Xu3d25LaShJA0eoT8/+/7Hno6RO2x25uArK013omQKiUWwW0wx+LhB8/Lj3iVx8flx7BGVjmU7t17P9ECs7M4p7UEaP/Mxk4J8t6OkeP/s9k4Gws6Kk8c/i/iMCZWMyTeMXo/0wGzsEynsKrx/+TCOzPEm7vPcP/SQJ2ZwG39s7h/yICO7N425ow/F9EYFcWblOTxn8tCdiVZdvStPFfSwL2ZNG2M3H4v4jAbizYZiaP/1oSsBvLtZXp47+WBOzFYm1kh/FfSwJ2Yqm2scv4ryUB+7BQm9hp/NeSgF1Ypi3sNv5rScAeLNIGdhz/tSRgB5ZovF3Hfy0JmM8CDbfz+K8lAdNZntF2H/+1JGA2izPYGcZ/LQmY7J9LDwDOS5vHOsv9fy17gLkszFBnGv+1JGAqyzLS2cZ/LQmYyXcAEKbKA53x/r+WPcBElmScs47/WhIwj48AEKbIw5z5/r+WPcA0dgAQpsejnP3+v5Y9wCx2ABCmxoMU7v9r2QNMYgcAYQIAYTZjY1Q+AKzlQ8AcdgAQpsRDlO7/a9kDTGEHAGECAGECAGE+iY1Q+wZgLd8CzGAHAGECAGECAGE+hw1Q/AZgLd8CTGAHAGECAGECAGECAGECAGECAGF+iHm76o+Aa/kh8P3sACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACDMP8YYoPrPgfxToPezA4AwAYAwAYAwAYAwAYAwAYAwP8SMUPwh0I+AE9gBQJgAQJgAQJjPYUPUvgXwDcAMdgAQJgAQZiM2RulDgA8AU9gBQJgAQJit2CCVDwE+AMxhBwBhWjxKYQ/g/j+JHQCEqfEwZ98DuP/PYgcAYXo8zpn3AO7/09gBQJgiD3TWPYD7/zx2ABCmySOdcQ/g/j+RRRnqbAkw/jP5CABhujzWmfYA7v9TWZjBzpIA4z+XpRntDAkw/pNZnOF2T4Dxn82XgBCmz+PtvAdw/5/OAm1g1wQY//ks0RZ2TIDx34FF2sRuCTD+e7BM29gpAcZ/FxZqI7skwPjvw1JtZYcEGP+dWKztTI6A4d+NBdvQ1AQY//1Ysi1NTIDx35FF29akCBj+XVm4jU1JgPHfl6Xb3LsjYPj3Zvm2984EGP/dWcBTeEcEDP8ZWMTTeGUEDP9ZWMiTeXYGjP65WM4TelYEDP/5WNLTOjIDRv+sLOzpPRICg392FjjlmhgYegAAAAAAAACAHfmjj4dc84c1PJc/XHqEk3cHYz+TFNzOKbuBwd+DEFzPqbqK0d+PDFzDSbrI8O9LBC5xgr5l+PcnAt9xcv7K8J+HCPyNE/NHhv98ROBPnJT/Y/jPSwR+54T8xvifmwT8yun4hfE/Pwn4mZPxL8PfIQJfnIj/Mf4tEvDJaVhrGf8iCVhLANZaxr9KAgRgGf8yCcifAOPfVk9A/O0bf9oJSL95489a7QSE37rx50s3Adk3bvz5WTUB/1x6AHBe0e65//O75h4g+aaNP39STEDwLRt//qaXAN8BQFiueO7/fKe2B7ADgLBY79z/uaS1B7ADgLBU7dz/uUZpD2AHAGGh1rn/c63OHsAOAMIypXP/5xaVPYAdAIQJAIRFNjo+AHCrxocAOwAIEwAIEwAIS3zO8Q0A9yh8C2AHAGECAGECAGECAGECAGGB7zn9BsC9zv87gB0AhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhAkAhP3n0gO4zaX/SsJ/U/I95++17AAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAgTAAO9fFx6RE8xhk+lgBAmABAmABAWCAAPjVyn8KVEwgA8DcCAGECcKDClvH9nOUjJQLgkuF2jasmEQDgzwTgMI07xgTO9HEiAXDJcJvKFRMJwPNVLpgZnO2jZALgkuF6naslE4DnLuozn5s/eeYZf+ZzTxMKwPOULpg5nPUjpALgkuGy1lWSCsBzFvcZz8k1nnHmn/Gck8UCcPwCH/183OLos3/0882XC8Cxi3zkc3GPI1fgyOfaRTAAxy30Uc/DI45ahaOeZy/JN73WWj9+XHrE9+69XB593bN713m993V3F33bn+6/aO6/XO5/zYZ3nNn7X3N/4bf+6fbL5rHL5fbXa3n12X3s9fYXf/ufrr9sHr9crn+tplee4cdfa39Owb++u3COu1SuvzybXnOmj3uV3TkRL/buAFy69KcfH8dK/gwIfBIACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBMACBOAlI+Pxx/BmQgAhAnAi7nDfsfZeTUBgDABgDABgDABgDBfurzBjx+XHvEc137FNv34OI4dAIQJAITZdL3FOzbZt2ywpx8fR7EDgDDVfZNX32Nvvb9OPz6OYQcAYbr7Nq+8x95zf51+fBzBiX+jV43YveM1/fh4nI8AEKa9b/WKe+wj99fpx8ejnPw3e/aIPTpe04+Pxzj9b/fMETtivKYfH4+wAAM8a8SOGq/px8f9LMEIzxixI8dr+vFxL4swxNEjdvR4TT8+7mMZxjhyxJ4xXtOPj3tYiFGOGLJnDtf04+NWFmOYR0fs2eM1/fi4jeUY6N4he9VwTT8+rmdJxrplzN4xWtOPj2tYmOEujdm7R2v68fG9/wKjmD/aq9pnZgAAAABJRU5ErkJggg==";
    // stands for white human ^^^

    if (!VIS_IMAGES_BASE64) {
        console.error("No base64 image encodings variable. Using default image.");
        return DEFAULT_RETURN;
    }

    const entities = ["human", "gov", "bank"];
    const default_entity = entities[0] // human 
    const colors = ["white", "green", "lightgreen", "yellow", "violet", "ocean"];
    const default_color = colors[0] // white

    let _entityType;
    if (entities.includes(entityType)) {
        _entityType = entityType;
    } else {
        _entityType = default_entity
        console.warn(`[${this.name}] Wrong entity type: ${entityType}, using default one: ${default_entity}`);
    }
    let _color;
    if (colors.includes(color)) {
        _color = color;
    } else {
        _color = default_color;
        console.warn(`[${this.name}] Wrong color: ${color}, using default one: ${default_color}`);
    }

    let properyName = _entityType + "_" + _color + (isForeign ? "_f" : "");

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