function renderer(data, HTMLElementId) {

    const COLORS = {
        GREEN: "#057c48",
        LIGHTGREEN: "#89c864",
        YELLOW: "#f9d491",
        VIOLET: "#899dd0"
    };
    const $ = go.GraphObject.make;
    const legalSubjectNode =
        $(go.Node, "Vertical", {
                fromSpot: go.Spot.AllSides,  // coming out from middle-right
                toSpot: go.Spot.AllSides,
                isShadowed: true
            },
            $(go.Panel, "Auto",
                $(go.Shape, "Rectangle", {fill: "white", stroke: 'grey', strokeWidth: 1},
                    new go.Binding("fill", "color", (color) => {
                        switch (color) {
                            case "lightgreen":
                                return COLORS.LIGHTGREEN;
                            case "green":
                                return COLORS.GREEN;
                            case "yellow":
                                return COLORS.YELLOW;
                            case "violet":
                                return COLORS.VIOLET;
                            default:
                                return "pink";
                        }
                    }),
                    new go.Binding("stroke", "color", (color) => {
                        switch (color) {
                            case "lightgreen":
                                return COLORS.LIGHTGREEN;
                            case "green":
                                return COLORS.GREEN;
                            case "yellow":
                                return COLORS.YELLOW;
                            case "violet":
                                return COLORS.VIOLET;
                            default:
                                return "pink";
                        }
                    })
                ),
                $(go.TextBlock, {
                        margin: 15,
                        font: 'bold 15px Montserrat, sans-serif'
                    },
                    new go.Binding("text", "name"))
            ),
            $("TreeExpanderButton", {
                name: 'TREEBUTTON',
                width: 15, height: 15,
                alignment: go.Spot.BottomCenter,
                //alignmentFocus: go.Spot.Center,
            })
        )
    ;

    const bankNode =
        $(go.Node, "Spot", {
                fromSpot: go.Spot.AllSides,  // coming out from middle-right
                toSpot: go.Spot.AllSides
            },  // the whole node panel
            $(go.Picture,
                {
                    source: "file:///D:/dev/lnkd_prsn_vis_icons/bank_violet.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/bank_violet.png";
                    } else {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/bank_" + color + ".png"
                    }
                })),
            $(go.Panel, "Vertical", {background: "rgba(255,255,255,0.5)"},
                $(go.TextBlock, {
                    margin: 8,
                    isMultiline: true,
                    textAlign: "center",
                    font: 'bold 15px Montserrat, sans-serif'
                }, new go.Binding('text', 'name')),
            ),
            $("TreeExpanderButton", {
                name: 'TREEBUTTON',
                width: 10, height: 10,
                alignment: go.Spot.BottomCenter,
                alignmentFocus: go.Spot.Center,
            })
        );
    const foreignBankNode =
        $(go.Node, "Spot", {
                fromSpot: go.Spot.AllSides,  // coming out from middle-right
                toSpot: go.Spot.AllSides
            },  // the whole node panel
            $(go.Picture,
                {
                    source: "file:///D:/dev/lnkd_prsn_vis_icons/bank_violet.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/bank_violet_f.png";
                    } else {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/bank_" + color + "_f.png"
                    }
                })),
            $(go.Panel, "Vertical", {background: "rgba(255,255,255,0.5)"},
                $(go.TextBlock, {
                    margin: 8,
                    isMultiline: true,
                    textAlign: "center",
                    font: 'bold 15px Montserrat, sans-serif'
                }, new go.Binding('text', 'name')),
            ),
            $("TreeExpanderButton", {
                name: 'TREEBUTTON',
                width: 10, height: 10,
                alignment: go.Spot.BottomCenter,
                alignmentFocus: go.Spot.Center,
            })
        );
    const physicalSubjectNode =
        $(go.Node, "Vertical", {
                fromSpot: go.Spot.AllSides,  // coming out from middle-right
                toSpot: go.Spot.AllSides
            },
            // the whole node panel
            $(go.Picture,
                {
                    source: "file:///D:/dev/lnkd_prsn_vis_icons/human.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/human_green.png";
                    } else {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/human_" + color + ".png"
                    }
                })),
            $(go.Panel, "Vertical", {
                    background: "rgba(255,255,255,0.5)",
                },
                $(go.TextBlock, {
                    width: 150,
                    margin: 8,
                    isMultiline: true,
                    textAlign: "center",
                    font: 'bold 15px Arial, sans-serif'
                }, new go.Binding('text', 'name')),
            ),
            $("TreeExpanderButton", {
                name: 'TREEBUTTON',
                width: 15, height: 15,
                alignment: go.Spot.BottomCenter,
                alignmentFocus: go.Spot.Center,
            })
        );
    const foreignPhysicalSubjectNode =
        $(go.Node, "Vertical", {
                fromSpot: go.Spot.AllSides,  // coming out from middle-right
                toSpot: go.Spot.AllSides
            },
            // the whole node panel
            $(go.Picture,
                {
                    source: "file:///D:/dev/lnkd_prsn_vis_icons/human.png",
                    desiredSize: new go.Size(100, 100)
                }, new go.Binding("source", "color", (color) => {
                    if (!color) {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/human_green_f.png";
                    } else {
                        return "file:///D:/dev/lnkd_prsn_vis_icons/human_" + color + "_f.png"
                    }
                })),
            $(go.Panel, "Vertical", {
                    background: "rgba(255,255,255,0.5)",
                },
                $(go.TextBlock, {
                    width: 150,
                    margin: 8,
                    isMultiline: true,
                    textAlign: "center",
                    font: 'bold 15px Arial, sans-serif'
                }, new go.Binding('text', 'name')),
            ),
            $("TreeExpanderButton", {
                name: 'TREEBUTTON',
                width: 15, height: 15,
                alignment: go.Spot.BottomCenter,
                alignmentFocus: go.Spot.Center,
            })
        );

    let testNodeTemplate =
        $(go.Node, "Auto",
            { // when the user clicks on a Node, highlight all Links coming out of the node
                // and all of the Nodes at the other ends of those Links.

                click: function (e, node) {
                    // highlight all Links and Nodes coming out of a given Node
                    var diagram = node.diagram;
                    diagram.startTransaction("highlight");
                    // remove any previous highlighting
                    diagram.clearHighlighteds();
                    // for each Link coming out of the Node, set Link.isHighlighted
                    node.findLinksOutOf().each(function (l) {
                        l.isHighlighted = true;
                    });
                    node.findLinksInto().each(function (l) {
                        l.isHighlighted = true;
                    });
                    // for each Node destination for the Node, set Node.isHighlighted
                    node.findNodesOutOf().each(function (n) {
                        n.isHighlighted = true;
                    });
                    node.findNodesInto().each(function (n) {
                        n.isHighlighted = true;
                    });
                    diagram.commitTransaction("highlight");
                }
            },
            $(go.Shape, "Rectangle",
                {strokeWidth: 2, stroke: null, fill: "black"},

                // the Shape.stroke color depends on whether Node.isHighlighted is true
                new go.Binding("stroke", "isHighlighted", function (h) {
                    return h ? "red" : "black";
                })
                    .ofObject()),
            $(go.Panel, go.Panel.Vertical,
                $(go.TextBlock,
                    {margin: 10, font: "bold 18px Verdana", stroke: "white"},
                    new go.Binding("text", "name", n => `txt: ${n}`)),
                $(go.TextBlock,
                    {margin: 10, font: "bold 18px Verdana", stroke: "white"},
                    new go.Binding("text", "key", k => `key: ${k}`))
            ),
            $("TreeExpanderButton")
        );
//diagram.nodeTemplate = legalSubjectNode;
// define the Link template
    let managerLink =
        $(go.Link, {
                opacity: 0.8,
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
            $(go.Shape, {strokeWidth: 5},
                // the Shape.stroke color depends on whether Link.isHighlighted is true
                new go.Binding("stroke", "isHighlighted", function (h) {
                    return h ? "red" : "black";
                })
                    .ofObject(),
                // the Shape.strokeWidth depends on whether Link.isHighlighted is true
                new go.Binding("strokeWidth", "isHighlighted", function (h) {
                    return h ? 3 : 1;
                })
                    .ofObject()),
            $(go.Shape,
                {toArrow: "Block"},
                // the Shape.fill color depends on whether Link.isHighlighted is true
                new go.Binding("fill", "isHighlighted", function (h) {
                    return h ? "red" : "black";
                })
                    .ofObject()),
            $(go.Shape,
                {fromArrow: "Backward"})
        );
    let founderLink =
        $(go.Link, {
                opacity: 0.8,
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpGap,
                corner: 10,
                toShortLength: 4,
                fromShortLength: 4,
                layerName: "Background"
            },
            $(go.Shape, {
                strokeWidth: 4,
                stroke: "#f79d91"
            }),
            $(go.Shape,
                {
                    toArrow: "Block",
                    fill: "#f79d91",
                    stroke: "#f79d91",
                }),
            $(go.Shape,
                {
                    fromArrow: "Backward",
                    fill: "#f79d91",
                    stroke: "#f79d91",
                    scale: 2
                })
        );
    let stakeholderLink =
        $(go.Link, {
                opacity: 0.8,
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
            $(go.Shape, {
                strokeWidth: 3,
                stroke: "#8d9dd0"
            }),
            $(go.Shape,
                {
                    toArrow: "Block",
                    fill: "#8d9dd0",
                    stroke: "#8d9dd0",
                }),
            $(go.Shape,
                {
                    fromArrow: "Backward",
                    fill: "#8d9dd0",
                    stroke: "#8d9dd0",
                    scale: 2
                })
        );
    let familyLink =
        $(go.Link, {
                //routing: go.Link.AvoidsNodes,
                opacity: 0.8,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
            $(go.Shape, {
                strokeWidth: 2,
                stroke: "#f9d491"
            })/*,
            $(go.Shape,
                {
                    toArrow: "Block",
                    fill: "#f9d491",
                    stroke: "#f9d491",
                }),
            $(go.Shape,
                {
                    fromArrow: "Block",
                    fill: "#f9d491",
                    stroke: "#f9d491"
                })*/
        );
    let otherLink =
        $(go.Link, {
                opacity: 0.8,
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
            $(go.Shape, {
                strokeWidth: 3,
                stroke: "#f79d91"
            }),
            $(go.Shape,
                {
                    strokeWidth: 2,
                    toArrow: "Circle",
                    fill: "white",
                    stroke: "#f79d91",
                }),
            $(go.Shape,
                {
                    strokeWidth: 2,
                    fromArrow: "Circle",
                    fill: "white",
                    stroke: "#f79d91"
                })
        );


    let templateMap = new go.Map();

    templateMap.add("Bank", bankNode);
    templateMap.add("PS", physicalSubjectNode);
    templateMap.add("BankF", foreignBankNode);
    templateMap.add("PSF", foreignPhysicalSubjectNode);
    templateMap.add("LS", legalSubjectNode);

    let linkTemplateMap = new go.Map();
    linkTemplateMap.add("manager", managerLink);
    linkTemplateMap.add("founder", founderLink);
    linkTemplateMap.add("stakeholder", stakeholderLink);
    linkTemplateMap.add("family", familyLink);
    linkTemplateMap.add("other", otherLink);

    let diagram = $(go.Diagram, HTMLElementId, {
        "undoManager.isEnabled": true,
        initialContentAlignment: go.Spot.Center,
        layout: $(go.ForceDirectedLayout, {
            maxIterations: 3000,
            defaultElectricalCharge: 400,
            isOngoing: false,
            setsPortSpots: false
        })
    });

    diagram.click = function (e) {
        e.diagram.commit(function (d) {
            d.clearHighlighteds();
        }, "no highlighteds");
    };

    diagram.nodeTemplateMap = templateMap;
    diagram.linkTemplateMap = linkTemplateMap;
    //diagram.linkTemplate = founderLink;

    let linkDataArray = [];
    let nodeDataArray = [];

    let colors = ["green", "lightgreen", "violet", "yellow", ""];
    alert(`Data rows: ${data.length}`);
    data.forEach((obj, index) => {
        let linkCat = getLinkCategory(obj['F069']);
        // adding link to the array of links
        linkDataArray.push({from: obj['K0202'], to: obj['K0201'], category: linkCat});
        /*linkDataArray.push({to: obj['K0202'], from: obj['K0201']});*/


        // looking if node has been already added to the node data array
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

        let colorID = Math.floor(Math.random() * colors.length);
        // if node wasn't found in preceding links - adding it to the Node Data Array
        if (!K0201Found) {
            let category = getNodeCategory(obj['K021 1']);
            nodeDataArray.push({
                key: obj["K0201"],
                name: obj["NAME1"],
                another: obj["NAME2"],
                pairedNodeId: obj["K0202"],
                color: colors[colorID],
                category: category
            });
        }
        if (!K0202Found) {
            let category = getNodeCategory(obj['K021 2']);
            nodeDataArray.push({
                key: obj["K0202"],
                name: obj["NAME2"],
                another: obj["NAME1"],
                pairedNodeId: obj["K0201"],
                color: colors[colorID],
                category: category
            });
        }

    });

    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    diagram.commandHandler.zoomToFit();
}

function getNodeCategory(K021) {
    const NODE_CATEGORIES = {
        BANK: 'Bank',
        PS: 'PS',
        LS: 'LS',
        PSF: 'PSF',
        BANKF: 'BankF'
    };
    let K = K021;
    switch (true) {
        case(K === "3"):
            return NODE_CATEGORIES.BANK;
        case(K === "2" || K === "6" || K === "A" || K === "F" || K === "I"):
            return NODE_CATEGORIES.PS;
        case(K === "4"):
            return NODE_CATEGORIES.BANKF;
        case(K === "5" || K === "7" || K === "B" || K === "H" || K === "L"):
            return NODE_CATEGORIES.PSF;
        case(K === "1" || K === "D" || K === "E" || K === "8" || K === "9" || K === "C" || K === "K"):
            return NODE_CATEGORIES.LS;
        default:
            return "";
    }
}

function getNodeColor() {

}

function getLinkCategory(F069) {
    let F = F069;
    let LINK_CATEGORIES = {
        MANAGER: "manager",
        FOUNDER: "founder",
        STAKEHOLDER: "stakeholder",
        FAMILY: "family",
        OTHER: "other"
    };
    switch (true) {
        case(F === "01" || F === "02" || F === "07" || F === "08" || F === "10" || F === "11"):
            return LINK_CATEGORIES.FOUNDER;
        case(parseInt(F) >= 12 && parseInt(F) <= 15):
            return LINK_CATEGORIES.MANAGER;
        case(F === "68"):
            return LINK_CATEGORIES.STAKEHOLDER;
        case(parseInt(F) >= 16 && parseInt(F) <= 40):
            return LINK_CATEGORIES.FAMILY;
        case(F === "06" || F === "09" || F === "41" || F === "99"):
            return LINK_CATEGORIES.OTHER;
        default:
            return "";
    }
}


