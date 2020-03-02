/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

class Facade {
    constructor(data, HTMLElementId) {
        try {
            this.HTMLElementId = HTMLElementId;

            this.data = this.removeDuplicateLinks(data);
            let links = this.data.map(el => {
                return { from: el[DECOMPOSED_ATTRIBUTES.NODE1.ID], to: el[DECOMPOSED_ATTRIBUTES.NODE2.ID] };
            });
            this.Graph = new Graph(links);
        } catch (error) {
            alert(`@facade constructor: ${error}`);
        }

    }
    updateData(data) {
        this.data = this.removeDuplicateLinks(data);
        let links = this.data.map(el => { return { from: el[DECOMPOSED_ATTRIBUTES.NODE1.ID], to: el[DECOMPOSED_ATTRIBUTES.NODE2.ID] }; });
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
            return (availableIDs.includes(el[DECOMPOSED_ATTRIBUTES.NODE1.ID]) || availableIDs.includes(el[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
        });

        this.renderer = new Renderer(dataToUse, this.HTMLElementId);
    }

    showFrom(mainEntityId) {
        try {
            if (typeof mainEntityId !== 'string') return;
            this.deleteDiagram();
            delete this.renderer;

            const currentCluster = this.Graph.findAvailableVertices(mainEntityId);
            if (!currentCluster) {
                throw new Error('findAvailableVertices() returned no data');
            }
            this.currentData = this.data.filter(row => {
                return (currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE1.ID]) && currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
            });

            let currentGraph = new Graph(this.currentData.map(el => { return { from: el[DECOMPOSED_ATTRIBUTES.NODE1.ID], to: el[DECOMPOSED_ATTRIBUTES.NODE2.ID] }; }));
            let nodesToShow = currentGraph.findOneEdgeChildren(mainEntityId);

            nodesToShow.push(mainEntityId);

            let nodesToShowDict = {};
            nodesToShow.forEach(element => {
                nodesToShowDict[element] = true;
            });

            let prioritiesDict = currentGraph.getRelativePriorities(mainEntityId);

            this.renderer = new Renderer(this.currentData, this.HTMLElementId, mainEntityId, nodesToShowDict, prioritiesDict);


        } catch (error) {
            alert(`@showFrom: ${error}`);
        }
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
                console.warn(`[showFromTo] Warning - provided search type (${searchType}) wasn't recognized. Using default search type - BFS.`);
                availableLinks = this.Graph.findAvailableVerticesFromToBFS(mainEntityId, secondEntityId, maxPathCount);
                break;
        }

        // if no avialable links were found/returned
        if (!availableLinks) {
            return Toast.fire({
                icon: 'error',
                title: 'Помилка при виборі осіб'
            });
        }

        let uniqueIDs = [];
        for (let index = 0; index < availableLinks.length; index++) {
            const element = availableLinks[index];
            if (!uniqueIDs.includes(element.from)) {
                uniqueIDs.push(element.from);
            }
            if (!uniqueIDs.includes(element.to)) {
                uniqueIDs.push(element.to);
            }
        }

        let dataToUse = this.data.filter(link => {
            return uniqueIDs.includes(link[DECOMPOSED_ATTRIBUTES.NODE1.ID]) && uniqueIDs.includes(link[DECOMPOSED_ATTRIBUTES.NODE2.ID]);
        });


        this.renderer = new Renderer(dataToUse, this.HTMLElementId);
    }

    deleteDiagram() {
        if (this.renderer) this.renderer.deleteDiagram();
    }


    removeDuplicateLinks(data) {

        if (!data || data.length == 0) {
            console.error(`[removeDuplicateLinks] Passed data array is ${data ? 'empty' : 'undefined'}`);
            return [];
        }

        /* 
            ! Several links between two nodes aren't allowed, direction doesn't matter, 
            ! (a -> b  considered to be same as a <- b)
            ! After finding duplicate links, the one with higher priority stays
            ! Priority is defined by F069 parameter's value. Lesser value means higher priority
        */


        // saving visited links in a dictionary
        let currentState = {};

        // initializing dictionary with the values of 1st element of links data array
        currentState[`${data[0][DECOMPOSED_ATTRIBUTES.NODE1.ID]}${data[0][DECOMPOSED_ATTRIBUTES.NODE2.ID]}`] = { 'F069': data[0][DECOMPOSED_ATTRIBUTES.LINK.TYPE], index: 0 };


        // Iterating through the array of links
        for (let index = 1; index < data.length; index++) {
            const element = data[index];

            // as direction of the links desn't matter, creating two possible string that 
            // can be used as a key for visited links dictionary
            const strStraight = `${element[DECOMPOSED_ATTRIBUTES.NODE1.ID]}${element[DECOMPOSED_ATTRIBUTES.NODE2.ID]}`;
            const strReverse = `${element[DECOMPOSED_ATTRIBUTES.NODE2.ID]}${element[DECOMPOSED_ATTRIBUTES.NODE1.ID]}`;
            // OR operator returns first 'truthful' statement value or 'undefined'
            let res = currentState[strStraight] || currentState[strReverse];

            if (res) { // if similar link has aldeary been added to the the visited dictionary 
                if (res[DECOMPOSED_ATTRIBUTES.LINK.TYPE] <= element[DECOMPOSED_ATTRIBUTES.LINK.TYPE]) { // checking if priority of current links is higher 
                    res[DECOMPOSED_ATTRIBUTES.LINK.TYPE] = element[DECOMPOSED_ATTRIBUTES.LINK.TYPE]; // if so - replacing visited link data with current link data
                    res['index'] = index;
                }
            } else { // othervise - adding new links to the links dictionary
                currentState[strStraight] = {
                    'F069': element[DECOMPOSED_ATTRIBUTES.LINK.TYPE],
                    'index': index
                };
            }
        }

        // as we have to return the filtered data array, and right now we are only having indices of link rows that can stay 
        // we need to iterate throught the 'unique' links indices and push corresponding data array elements to the resulting array
        let toReturn = [];
        for (let key in currentState) {
            const value = currentState[key];
            toReturn.push(data[value.index]);
        }
        return toReturn;
    }

    getNewAutcompleteList(fistId) {
        if (!fistId || typeof fistId !== 'string') {
            retrun;
        }
        const currentCluster = this.Graph.findAvailableVertices(fistId);
        if (!currentCluster) {
            throw new Error('findAvailableVertices() returned no data');
        }
        let newData = this.data.filter(row => {
            return (currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE1.ID]) && currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
        });
        let keyNameArray = findUniqueEntitiesForAutocomplete(newData);
        let autocompleteHelp = [];
        keyNameArray.forEach((el) => {
            autocompleteHelp.push(`${el.key} ⁃ ${el.name}`);
        });
        return autocompleteHelp;
    }
}