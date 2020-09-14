/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

class Facade {
    constructor(data, HTMLElementId, props, me) {
        this.me = me;
        this.HTMLElementId = HTMLElementId;
        this.rawData = data;
        this.data = this.removeDuplicateLinks(data);
        let links = this.data.map(el => {
            return { from: el[DECOMPOSED_ATTRIBUTES.NODE1.ID], to: el[DECOMPOSED_ATTRIBUTES.NODE2.ID] };
        });
        this.Graph = new Graph(links);
        this.mainEntityId = '';
        this.props = props;
        if (this.me && this.me.commandsManager) {
            this.me.commandsManager.updateDiagramInfo(
                [
                    {
                        name: 'Зв\'язки',
                        value: numberWithCommas(this.rawData.length)
                    },
                    {
                        name: 'Унікальні зв\'язки',
                        value: numberWithCommas(this.data.length)
                    },
                    {
                        name: 'Особи',
                        value: numberWithCommas(this.Graph.uniqueIds.length)
                    }
                ]
            );
        }
    }
    updateData(data) {
        this.rawData = data;
        this.data = this.removeDuplicateLinks(data);
        let links = this.data.map(el => { return { from: el[DECOMPOSED_ATTRIBUTES.NODE1.ID], to: el[DECOMPOSED_ATTRIBUTES.NODE2.ID] }; });
        this.Graph = new Graph(links);
        if (this.me && this.me.commandsManager) {
            this.me.commandsManager.updateDiagramInfo(
                [
                    {
                        name: 'Зв\'язки',
                        value: numberWithCommas(this.rawData.length)
                    },
                    {
                        name: 'Унікальні зв\'язки',
                        value: numberWithCommas(this.data.length)
                    },
                    {
                        name: 'Особи',
                        value: numberWithCommas(this.Graph.uniqueIds.length)
                    }
                ]
            );
        }
    }

    updateProps(props) {
        this.props = props;
    }
    showAll() {
        this.deleteDiagram();
        delete this.renderer;
        this.renderer = new Renderer(this.data, this.HTMLElementId, null, null, { mode: 'all' });
    }

    showAllNodesFrom(mainEntityId) {
        this.mainEntityId = mainEntityId;
        this.deleteDiagram();
        delete this.renderer;

        let availableIDs = this.Graph.findAvailableVertices(mainEntityId);
        let dataToUse = this.data.filter(el => {
            return (availableIDs.includes(el[DECOMPOSED_ATTRIBUTES.NODE1.ID]) || availableIDs.includes(el[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
        });

        this.renderer = new Renderer(dataToUse, this.HTMLElementId);
    }

    showFrom(mainEntityId, usageHistoryCallback) {


        if (typeof mainEntityId !== 'string') return;
        this.deleteDiagram();
        delete this.renderer;

        this.mainEntityId = mainEntityId;
        const currentCluster = this.Graph.findAvailableVertices(mainEntityId);
        if (!currentCluster) {
            window.visType = null;
            throw new Error('findAvailableVertices() returned no data');
        }
        this.currentData = this.data.filter(row => {
            return (currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE1.ID]) && currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
        });

        let currentGraph = new Graph(this.currentData.map(el => {
            return { from: el[DECOMPOSED_ATTRIBUTES.NODE1.ID], to: el[DECOMPOSED_ATTRIBUTES.NODE2.ID] };
        }));

        let nodesToShow = currentGraph.findOneEdgeChildren(mainEntityId);

        nodesToShow.push(mainEntityId);
        let nodesToShowDict = {};
        nodesToShow.forEach(element => {
            nodesToShowDict[element] = true;
        });


        this.renderer = new Renderer(this.currentData, this.HTMLElementId, mainEntityId, nodesToShowDict, { lookupIds: [mainEntityId] }, usageHistoryCallback);

    }

    showFromTo(mainEntityId, secondEntityId, usageHistoryCallback) {
        this.deleteDiagram();
        this.mainEntityId = mainEntityId;
        delete this.renderer;
        const currentClusterVertices = this.Graph.findAvailableVertices(mainEntityId);
        if (!currentClusterVertices) {
            window.visType = null;
            throw new Error('findAvailableVertices() returned no data');
        }


        this.currentData = this.data.filter(row => {
            return (currentClusterVertices.includes(row[DECOMPOSED_ATTRIBUTES.NODE1.ID]) && currentClusterVertices.includes(row[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
        });
        let currentGraph = new Graph(this.currentData.map(el => { return { from: el[DECOMPOSED_ATTRIBUTES.NODE1.ID], to: el[DECOMPOSED_ATTRIBUTES.NODE2.ID] }; }));
        let dataToUse = this.data.filter(row => {
            return (currentClusterVertices.includes(row[DECOMPOSED_ATTRIBUTES.NODE1.ID]) && currentClusterVertices.includes(row[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
        });
        // ? bfs - Breadth First Search. Graph searching algorithm 
        let includedNodes = currentGraph.findAvailableVerticesFromToNew(mainEntityId, secondEntityId, this.props['maxPathesCount']);
        // if no avialable links were found/returned
        if (!includedNodes) {
            return Toast.fire({
                icon: 'error',
                title: 'Помилка при виборі осіб'
            });
        }
        this.renderer = new Renderer(dataToUse, this.HTMLElementId, mainEntityId, includedNodes, { mode: 'chain', lookupIds: [mainEntityId, secondEntityId] }, usageHistoryCallback);
    }

    deleteDiagram() {
        if (this.renderer) this.renderer.deleteDiagram();
        this.mainEntityId = null;
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

    getNewAutcompleteList(firstId) {
        if (!firstId || typeof firstId !== 'string') {
            retrun;
        }
        const currentCluster = this.Graph.findAvailableVertices(firstId);
        if (!currentCluster) {
            window.visType = null;
            throw new Error('findAvailableVertices() returned no data');
        }
        let newData = this.data.filter(row => {
            return (currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE1.ID]) && currentCluster.includes(row[DECOMPOSED_ATTRIBUTES.NODE2.ID]));
        });
        let keyNameArray = findUniqueEntitiesForAutocomplete(newData);
        // removing firstId Element from the resulting list
        let firstIdElementIndex = -1;
        for (let i = 0; i < keyNameArray.length; i++) {
            const element = keyNameArray[i];
            if (element.key === firstId) {
                firstIdElementIndex = i;
                break;
            }
        }

        if (firstIdElementIndex !== -1) {
            keyNameArray.splice(firstIdElementIndex, 1);
        }

        return keyNameArray.map((el) => {
            return `${el.key} ⁃ ${el.name}`;
        });
    }

    focusOnMainEntity() {
        if (this.renderer) {
            this.renderer.focusOnNode(this.mainEntityId);
        }
    }

    collapseAll() {
        if (this.renderer)
            this.renderer.collapseFrom(this.mainEntityId);
    }
}