/* eslint-disable no-unused-vars */

/**
 * Class representing a Graph
 */
class Graph {

    /** 
     * @typedef Link Object representing a link
     * @property {string} from Link's from key
     * @property {string} to Link's to key
     * 
     * @constructor
     * @param {Link[]} linksArray
     */
    constructor(linksArray) {
        this.uniqueIds = [];
        linksArray.forEach(link => {
            if (!this.uniqueIds.includes(link.from))
                this.uniqueIds.push(link.from);

            if (!this.uniqueIds.includes(link.to))
                this.uniqueIds.push(link.to);
        });

        this.nodes = {};
        let initialDictionary = [];
        this.dict = {};

        this.uniqueIds.forEach((id, index) => {
            this.dict[id] = index;
            initialDictionary.push(false);
        });
        this.uniqueIds.forEach(id => {
            this.nodes[this.dict[id]] = initialDictionary.slice(); //copy of the initialDictionary
        });
        linksArray.forEach(link => {
            this.nodes[this.dict[link.from]][this.dict[link.to]] = true;
            this.nodes[this.dict[link.to]][this.dict[link.from]] = true;
        });
    }

    /**
     * @param {string} initialVertexId
     * @return {string[]} Array of IDs of available Vertexs
     */

    findAvailableVertices(initialVertexId) {
        if (!initialVertexId || typeof initialVertexId !== 'string' || !this.uniqueIds.includes(initialVertexId)) {
            alert('@findAvailableVertices: error - returning undefined');
            return;
        }

        let visited = [];
        let uniqueIds = this.uniqueIds;
        let nodes = this.nodes;
        let dict = this.dict;

        function traverse(Vertex) {
            visited.push(Vertex);
            uniqueIds.forEach(id => {
                if (nodes[dict[Vertex]][dict[id]] && !visited.includes(id)) {
                    traverse(id);
                }
            });
        }


        traverse(initialVertexId);

        return visited;
    }

    getRelativePriorities(mainEntityId) {
        if (typeof mainEntityId !== 'string') {
            return [];
        }

        let nodes = this.nodes;
        let dict = this.dict;
        let uniqueIds = this.uniqueIds;

        let priority = 1;
        let prioritiesDict = {
            [mainEntityId]: priority++
        };
        let queue = oneEdgeForPriority(mainEntityId);


        while (priority < 2000) {
            uniqueIds = arr_diff(queue, uniqueIds);
            //var newArray = oldArray.slice();
            let newQueue = [];
            queue.forEach(el => {
                prioritiesDict[el] = priority;
                oneEdgeForPriority(el).forEach(newNode => {
                    newQueue.push(newNode);
                });
            });

            if (newQueue.length == 0) {
                return prioritiesDict;
            }
            queue = newQueue.slice();
            priority++;
        }
        function oneEdgeForPriority(mainEntityId) {
            let resultIDs = [];
            const mainEntityIndex = dict[mainEntityId];
            if (typeof mainEntityIndex == 'undefined') {
                alert('typeofundef');
                return [];
            }
            const mainEntityRow = nodes[mainEntityIndex];
            if (!mainEntityRow) {
                alert('norow');
                return [];
            }

            uniqueIds.forEach(id => {
                if (prioritiesDict[id]) {
                    return;
                }
                if (mainEntityRow[dict[id]] && (typeof prioritiesDict[dict[id]] == 'undefined')) {
                    resultIDs.push(id);
                }
            });
            return resultIDs;
        }

        return prioritiesDict;
    }



    findAvailableVerticesFromTo(initialVertexId, endingVertexId, maxPathCount = 5) {
        const set1 = this.findAvailableVertices(initialVertexId);
        const set2 = this.findAvailableVertices(endingVertexId);
        if (set1.length !== set2.length) {
            console.log('Sets lengthes aren\'t equal'); // means that initial vertex and ending vertex are the part of different subgraphs and can't be reachable from each other
            return undefined;
        }

        // even if the lengthes of subgraphs are equal we have to check if theese subGraphs are same 
        // sorting the elements before performing iterative elements comparison 

        set1.sort(function (a, b) {
            return a.localeCompare(b);
        });
        set2.sort(function (a, b) {
            return a.localeCompare(b);
        });

        for (let i = 0; i < set1.length; i++) {
            if (set1[i] !== set2[i]) {
                return undefined;
            }
        }

        let resLinks = [];
        let pathes = [];
        let visited = [];
        let uniqueIds = set1;
        const nodes = this.nodes;
        const dict = this.dict;
        let pathesCount = 0;

        function traverse(vertex) {
            if (pathesCount > maxPathCount) return;
            visited.push(vertex);
            if (vertex == endingVertexId) {
                pathes.push([...visited]);
                pathesCount++;
                resLinks = addNewLinks(resLinks, visited);
                visited.pop();
            } else {
                let neighbors = uniqueIds.filter(id => nodes[dict[vertex]][dict[id]]);
                neighbors.forEach(neighbor => {
                    if (!visited.includes(neighbor)) {
                        traverse(neighbor);
                    }
                });
                visited.pop();
            }
        }

        traverse(initialVertexId);

        return resLinks;

    }

    findAvailableVerticesFromToBFS(initialVertexId, endingVertexId, maxPathCount = 5) {

        const set1 = this.findAvailableVertices(initialVertexId);
        const set2 = this.findAvailableVertices(endingVertexId);

        if (set1.length !== set2.length) {
            // means that initial vertex and ending vertex are the part of different subgraphs and can't be reachable from each other
            console.log('Sets lengthes aren\'t equal');
            return undefined;
        }

        /* 
            even if the lengthes of subgraphs are equal, we have to check if theese subGraphs are same.
            Sorting arrays before performing iterative elements comparison
        */

        set1.sort(function (a, b) {
            return a.localeCompare(b);
        });

        set2.sort(function (a, b) {
            return a.localeCompare(b);
        });

        for (let i = 0; i < set1.length; i++) {
            if (set1[i] !== set2[i]) {
                console.log('Sets aren\'t equal');
                return undefined;
            }
        }

        let toAvoid = [];
        let links = [];
        let visited = [];
        let iterations = 0;
        do {
            iterations++;
            visited = bfsHelper(initialVertexId, endingVertexId, this.nodes, this.dict, set1, toAvoid);
            let vertex = visited[visited.length - 1];
            let newLinks = [];
            while (vertex.parent) {
                toAvoid.push({ id: vertex.id, parent: vertex.parent.id });
                newLinks.push({ to: vertex.id, from: vertex.parent.id });
                vertex = vertex.parent;
            }

            links = links.concat(newLinks);
        } while (visited.length > 1 && iterations < maxPathCount);
        let uniqueIds = {};
        links.forEach(link => {
            if (!uniqueIds[link.from]) {
                uniqueIds[link.from] = true;
            }
            if (!uniqueIds[link.to]) {
                uniqueIds[link.to] = true;
            }
        });
        return uniqueIds;
    }

    findOneEdgeChildren(mainEntityId) {
        let resultIDs = [];
        const mainEntityIndex = this.dict[mainEntityId];
        if (typeof mainEntityIndex == 'undefined') {
            return;
        }
        const mainEntityRow = this.nodes[mainEntityIndex];
        if (!mainEntityRow) {
            return;
        }
        this.uniqueIds.forEach(id => {
            if (mainEntityRow[this.dict[id]]) {
                resultIDs.push(id);
            }
        });
        return resultIDs;
    }
}

function addNewLinks(arr1, arr2) {
    for (let index = 0; index < arr2.length - 1; index++) {
        const link = { to: arr2[index], from: arr2[index + 1] };
        const linkReverse = { to: arr2[index + 1], from: arr2[index] };
        let foundSame = false;
        for (let k = 0; k < arr1.length; k++) {
            if ((arr1[k].to == link.to && arr1[k].from == link.from) ||
                (arr1[k].to == linkReverse.to && arr1[k].from == linkReverse.from)) {
                foundSame = true;
                break;
            }
        }
        if (!foundSame) {
            arr1.push(link);
        }
    }

    return arr1;
}

function bfsHelper(initialVertexId, endingVertexId, nodes, dict, set, toAvoid) {
    /* 
        Storage for visited nodes represented as array of objects with following structure: 
        [  { id: {String}, parent: {String} }, ... ]
    */
    let visited = [];

    /* 
        BFS is implemented using queue. For algorithm explanation visit https://en.wikipedia.org/wiki/Breadth-first_search 
    */
    let queque = [];

    /*
        Flag to indicate that destination node was reached and there is no need
        to continue traversing the graph inside the recursive function    
    */
    let destinationReached = false;

    function traverse(vertex) {
        if (destinationReached) {
            return;
        }

        visited.push(vertex);

        if (vertex.id == endingVertexId) {
            destinationReached = true;
            return;
        }

        set.forEach(child => {
            if (child === vertex.id) return;


            for (let i = 0; i < visited.length; i++) {
                if (visited[i].id === child) {
                    return;
                }
            }

            for (let i = 0; i < toAvoid.length; i++) {
                if ((toAvoid[i].id === child && toAvoid[i].parent === vertex.id) || (toAvoid[i].id === vertex.id && toAvoid[i].parent === child)) {
                    return;
                }
                //console.log(avoidFlag);
            }
            if ((nodes[dict[vertex.id]][dict[child]] || nodes[dict[child]][dict[vertex.id]])) {
                queque.push({ id: child, parent: vertex });
            }
        });
        if (queque.length == 0) {
            return;
        }
        traverse(queque.shift());
    }

    traverse({ id: initialVertexId, parent: null });

    return visited;
}

function arr_diff(a1, a2) {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    return diff;
}