$ = go.GraphObject.make;

class newRenderer {
    constructor(links, id) {

        let nodeDataArray = [];

        this.diagram = $(go.Diagram, id, {
            "undoManager.isEnabled": true,
            initialContentAlignment: go.Spot.Center,
            layout: $(go.ForceDirectedLayout, {
                maxIterations: 3000,
                defaultElectricalCharge: 400,
                isOngoing: false,
                setsPortSpots: false
            })
        });

        this.diagram.nodeTemplate =
            $(go.Node, "Auto",
                $(go.Shape, "Circle", { stroke: null },
                    new go.Binding("fill", "color")),
                $(go.TextBlock,
                    { margin: 5, stroke: "white" },
                    new go.Binding("text", "key"))
            );
        this.diagram.linkTemplate =
            $(go.Link, {
                //routing: go.Link.AvoidsNodes,
                opacity: 0.8,
                curve: go.Link.JumpGap,
                corner: 10,
                layerName: "Background"
            },
                $(go.Shape, {
                    strokeWidth: 4,
                    stroke: "black"
                }, new go.Binding("stroke", "color"))
            );
        let newLinks = [];
        links.forEach(link => {
            let newLink = new Object(link);
            newLink.color = "black";
            newLinks.push(newLink);
            let tempArr = nodeDataArray.map(el => el.key);
            if (!tempArr.includes(link.from)) {
                nodeDataArray.push(
                    {
                        key: link.from,
                        color: "black"
                    }
                );
            }
            if (!tempArr.includes(link.to)) {
                nodeDataArray.push(
                    {
                        "key": link.to,
                        color: "black"
                    }
                );
            }
        });
        //console.log(` Nodes: ${JSON.stringify(nodeDataArray)}\nLinks:  ${JSON.stringify(links)}`)
        this.diagram.model = new go.GraphLinksModel(nodeDataArray, newLinks);
        this.diagram.commandHandler.zoomToFit();
    }

    changeNodeColor(nodeId, color) {
        this.diagram.model.commit(function (m) {
            var data = m.findNodeDataForKey(nodeId);  // get the first node data
            m.set(data, "color", color);
        }, "changeColor");
    }

    changeLinkColor(from, to, color) {
        for (let it = this.diagram.findLinksByExample({ from: from, to: to }, {to: from, from: to}); it.next();) {
            let n = it.value;
            //console.log(n);
            this.diagram.model.setDataProperty(n.data, "color", color);
        }
    }

    changeNodesColor(color) {

        for (let it = this.diagram.nodes; it.next();) {
            let n = it.value;
            this.diagram.model.setDataProperty(n.data, "color", color);
        }

    }
}