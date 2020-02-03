class Facade {
    constructor(data, HTMLElementId) {
        this.HTMLElementId = HTMLElementId;
        console.log(`[Facade] data.length = ${data.length}`)

        this.data = this.removeDuplicateLinks(data);
        console.log(`[Facade] this.data.length = ${this.data.length}`)
        let links = this.data.map(el => { return { from: el["K0201"], to: el["K0202"] } });
        this.Graph = new Graph(links);
    }

    showAll() {
        this.deleteDiagram();
        delete this.renderer;
        this.renderer = new Renderer(this.data, this.HTMLElementId);
    } 

    showAllNodesFrom(mainEntityId) {
        this.deleteDiagram();
        delete this.renderer;

        let availableIDs = this.Graph.findAvailableVertices(mainEntityId);
        let dataToUse = this.data.filter(el => {
            return (availableIDs.includes(el['K0201']) || availableIDs.includes(el['K0202']));
        });

        this.renderer = new Renderer(dataToUse, this.HTMLElementId);
    }

    showFrom(mainEntityId) {
        if (!mainEntityId) return;
        let log = new TimeLogger('Show From One Node');
        this.deleteDiagram();
        delete this.renderer;
        log.label("Diagram deletion");

        const currentCluster = this.Graph.findAvailableVertices(mainEntityId);
        log.label('Current cluster creation');

        this.currentData = this.data.filter(row => {
            return (currentCluster.includes(row['K0201']) && currentCluster.includes(row['K0202']))
        });

        log.label('Table Data filtering');
        let currentGraph = new Graph(this.currentData.map(el => { return { from: el["K0201"], to: el["K0202"] } }));
        log.label('New graph Creation');
        let nodesToShow = currentGraph.findOneEdgeChildren(mainEntityId);
        nodesToShow.push(mainEntityId);
        log.label('Looking for nodes to show');

        let nodesToShowDict = {};
        nodesToShow.forEach(element => {
            nodesToShowDict[element] = true;
        });
        log.label('NodesToShow dictionary creation');
        log.showReport(5);
        this.renderer = new Renderer(this.currentData, this.HTMLElementId, nodesToShowDict);

    }

    showFromTo(mainEntityId, secondEntityId, maxPathCount = 5, searchType = 'bfs') {
        this.deleteDiagram();
        delete this.renderer;
        let availableLinks;

        // ? dfs - Deep First Search. Graph searching algorithm
        // ? bfs - Breadth First Search. Graph searching algorithm 
        switch (searchType) {
            case 'dfs':
                availableLinks = this.Graph.findAvailableVerticesFromTo(mainEntityId, secondEntityId, maxPathCount);
                break;
            case 'bfs':
                availableLinks = this.Graph.findAvailableVerticesFromToBFS(mainEntityId, secondEntityId, maxPathCount);
                break;
            default:
                console.warn(`[showFromTo] Warning - provided search type (${searchType}) wasn't recognized.
                                                                            Using default search type - BFS.`)
                availableLinks = this.Graph.findAvailableVerticesFromToBFS(mainEntityId, secondEntityId, maxPathCount);
                break;
        }

        // if no avialable links were found/returned
        if (!availableLinks) {
            return Toast.fire({
                icon: 'error',
                title: 'Помилка при виборі осіб'
            })
        }

        let uniqueIDs = [];
        for (let index = 0; index < availableLinks.length; index++) {
            const element = availableLinks[index];
            if (!uniqueIDs.includes(element.from)) {
                uniqueIDs.push(element.from)
            }
            if (!uniqueIDs.includes(element.to)) {
                uniqueIDs.push(element.to)
            }
        }

        let dataToUse = this.data.filter(link => {
            return uniqueIDs.includes(link['K0201']) && uniqueIDs.includes(link['K0202']);
        });


        this.renderer = new Renderer(dataToUse, this.HTMLElementId);
    }

    deleteDiagram() {
        if (this.renderer) this.renderer.deleteDiagram();
    }


    removeDuplicateLinks(data) {

        if (!data || data.length == 0) {
            console.error(`[removeDuplicateLinks] Passed data array is ${data ? "empty" : "undefined"}`)
            return [];
        }

        /* 
            ! Several links between two nodes aren't allowed, direction doesn't matter, 
            ! (a -> b  considered to be same as a <- b)
            ! After finding duplicate links, the one with higher priority stays
            ! Priority is defined by F069 parameter's value. Lesser value means higher priority
        */

        let log = new TimeLogger("Remove duplicated links");

        // saving visited links in a dictionary
        let currentState = {}

        // initializing dictionary with the values of 1st element of links data array
        currentState[`${data[0]["K0201"]}${data[0]["K0202"]}`] = { "F069": data[0]["F069"], index: 0 };


        // Iterating through the array of links
        for (let index = 1; index < data.length; index++) {
            const element = data[index];

            // as direction of the links desn't matter, creating two possible string that 
            // can be used as a key for visited links dictionary
            const strStraight = `${element["K0201"]}${element["K0202"]}`
            const strReverse = `${element["K0202"]}${element["K0201"]}`
            // OR operator returns first "truthful" statement value or "undefined"
            let res = currentState[strStraight] || currentState[strReverse];

            if (res) { // if similar link has aldeary been added to the the visited dictionary 
                if (res['F069'] <= element['F069']) { // checking if priority of current links is higher 
                    res['F069'] = element['F069']; // if so - replacing visited link data with current link data
                    res['index'] = index;
                }
            } else { // othervise - adding new links to the links dictionary
                currentState[strStraight] = {
                    "F069": element["F069"],
                    "index": index
                }
            }
        }

        // as we have to return filtered data array, and right now we are only having indces of link rows that can stay 
        // we need to iterate throught the "unique" links indices and push corresponding data array elements to the resulting array
        let toReturn = [];
        for (let key in currentState) {
            const value = currentState[key]
            toReturn.push(data[value.index])
        }
        log.showReport();
        return toReturn;
    }
}