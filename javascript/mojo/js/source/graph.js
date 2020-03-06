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

    findAvailableVerticesFromToNew(initialVertexId, endingVertexId, maxPathCount = 5) {
        let cluster = this.findAvailableVertices(initialVertexId);
        if (!(cluster.includes(initialVertexId) && cluster.includes(endingVertexId)))
            throw new Error('Vertices dont belong to the same cluster');

        function backtrace(start, end, path) {
            let res = [end];

            let maxIterations = 2000;
            let i = 0;
            while (res[res.length - 1] !== start) {
                if (i++ > maxIterations) {
                    return [];
                }
                res.push(path[res[res.length - 1]]);
            }
            return res;
        }

        function doAvoid(pathesToAvoid, node, child) {
            for (let k = 0; k < pathesToAvoid.length; k++) {
                for (let i = 0; i < pathesToAvoid[k].length - 1; i++) {
                    if ((node == pathesToAvoid[k][i] && child == pathesToAvoid[k][i + 1]) || (node == pathesToAvoid[k][i + 1] && child == pathesToAvoid[k][i])) {
                        return true;
                    }
                }
                return false;
            }
        }

        function getNewNeighbours(node, am, v, idToUse, nodesToAvoid, pathesToAvoid) {
            let result = []; // array with neighbours IDs
            idToUse.forEach(id => {
                if (nodesToAvoid[id]) {
                    return;
                }
                if (am[v[node]][v[id]] && !doAvoid(pathesToAvoid, node, id)) {
                    result.push(id);
                }
            });
            return result;
        }

        function findPath(idToUse, am, vocabulary, pathesToAvoid) {
            let queue = [initialVertexId];
            let nodesToAvoid = {};
            nodesToAvoid[initialVertexId] = true;
            let path = {};
            const maxIterations = 20000;
            let iterations = 0;
            while (queue.length && maxIterations > iterations++) {
                let currentNode = queue.shift();
                if (currentNode == endingVertexId) {
                    return backtrace(initialVertexId, endingVertexId, path);
                }
                nodesToAvoid[currentNode] = true;
                let newNeighbours = getNewNeighbours(currentNode, am, vocabulary, idToUse, nodesToAvoid, pathesToAvoid);
                newNeighbours.forEach(el => {
                    if (nodesToAvoid[el]) {
                        return;
                    }
                    path[el] = currentNode;
                    nodesToAvoid[el] = true;
                    queue.push(el);
                });
            }
            return [];
        }
        Array.prototype.remove = function () {
            var what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        };

        let pathesCount = 0;
        let resIds = [];
        let pathesToAvoid = [];
        while (pathesCount++ < maxPathCount) {
            let newIds = findPath(cluster, this.nodes, this.dict, pathesToAvoid);
            if (newIds.length === 0) {
                return resIds;
            }
            newIds.forEach(id => {
                if (id === initialVertexId || id === endingVertexId) {
                    return;
                }
                cluster.remove(id);
            });
            pathesToAvoid.push(newIds);
            resIds = resIds.concat(newIds);
        }
        return resIds;
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