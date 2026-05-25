/**
 * Pathfinding Algorithm
 * Uses Dijkstra's algorithm to find the shortest path between two rooms
 */

class Pathfinder {
    constructor() {
        this.graph = this.buildGraph();
    }

    /**
     * Build a graph of all rooms and their connections
     */
    buildGraph() {
        const graph = {};
        const allRooms = getAllRooms();
        const threshold = getConnectivityThreshold();

        // Add all rooms as nodes
        Object.keys(allRooms).forEach(roomName => {
            graph[roomName] = {};
        });

        // Connect rooms on the same floor
        for (let floor = 1; floor <= 5; floor++) {
            const roomsOnFloor = getRoomsByFloor(floor);
            const roomNames = Object.keys(roomsOnFloor);

            for (let i = 0; i < roomNames.length; i++) {
                for (let j = i + 1; j < roomNames.length; j++) {
                    const room1Name = roomNames[i];
                    const room2Name = roomNames[j];
                    const room1 = roomsOnFloor[room1Name];
                    const room2 = roomsOnFloor[room2Name];

                    if (room1 && room2) {
                        const isCorridor1 = room1.isCorridor;
                        const isCorridor2 = room2.isCorridor;
                        const isNonCorridor1 = !isCorridor1;
                        const isNonCorridor2 = !isCorridor2;

                        // Prevent direct non-corridor to non-corridor connections
                        if (isNonCorridor1 && isNonCorridor2) {
                            continue;
                        }

                        // Rooms, Stairs, and Elevators ONLY connect to their dedicated door nodes
                        if (isNonCorridor1 && isCorridor2) {
                            if (room2.isDoorFor !== room1Name) continue;
                        }
                        if (isNonCorridor2 && isCorridor1) {
                            if (room1.isDoorFor !== room2Name) continue;
                        }

                        let maxDist = threshold;
                        // Enforce orthogonal connections for corridors
                        if (isCorridor1 && isCorridor2) {
                            if (room1.x !== room2.x && room1.y !== room2.y) {
                                continue;
                            }
                        } else {
                            // It's a connection between a room and its door node. Bypass threshold.
                            maxDist = Infinity;
                        }

                        const distance = getDistance(room1, room2);
                        
                        if (distance < maxDist) {
                            graph[room1Name][room2Name] = distance;
                            graph[room2Name][room1Name] = distance;
                        }
                    }
                }
            }
        }

        return graph;
    }

    /**
     * Find shortest path using Dijkstra's algorithm
     */
    findShortestPath(startName, endName) {
        const start = getRoom(startName);
        const end = getRoom(endName);

        if (!start || !end) {
            console.error('Invalid room names:', startName, endName);
            return null;
        }

        // Special handling for rooms on different floors
        if (start.floor !== end.floor) {
            return this.findPathMultiFloor(startName, endName);
        }

        // Same floor - use regular Dijkstra
        return this.dijkstra(startName, endName);
    }

    /**
     * Find path across multiple floors
     */
    findPathMultiFloor(startName, endName) {
        const start = getRoom(startName);
        const end = getRoom(endName);
        const stairs = getStairs();
        const elevators = getElevators();

        let bestPath = null;
        let shortestDistance = Infinity;

        // Try each staircase
        for (const stair of stairs) {
            if (stair.floors.includes(start.floor) && stair.floors.includes(end.floor)) {
                // Find path: start -> stairs on start floor
                const path1 = this.dijkstra(startName, stair.name);
                if (!path1) continue;

                // Find path: stairs on end floor -> end
                const path2 = this.dijkstra(stair.name, endName);
                if (!path2) continue;

                // Combine paths
                const fullPath = [...path1.path.slice(0, -1), ...path2.path];
                const totalDistance = path1.distance + path2.distance;

                if (totalDistance < shortestDistance) {
                    shortestDistance = totalDistance;
                    bestPath = { path: fullPath, distance: totalDistance };
                }
            }
        }

        // Try each elevator
        for (const elevator of elevators) {
            if (elevator.floors.includes(start.floor) && elevator.floors.includes(end.floor)) {
                // Find path: start -> elevator on start floor
                const path1 = this.dijkstra(startName, elevator.name);
                if (!path1) continue;

                // Find path: elevator on end floor -> end
                const path2 = this.dijkstra(elevator.name, endName);
                if (!path2) continue;

                // Combine paths
                const fullPath = [...path1.path.slice(0, -1), ...path2.path];
                const totalDistance = path1.distance + path2.distance;

                if (totalDistance < shortestDistance) {
                    shortestDistance = totalDistance;
                    bestPath = { path: fullPath, distance: totalDistance };
                }
            }
        }

        return bestPath;
    }

    /**
     * Dijkstra's algorithm implementation
     */
    dijkstra(startName, endName) {
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        const graph = this.graph;

        // Initialize
        Object.keys(graph).forEach(node => {
            distances[node] = Infinity;
            previous[node] = null;
            unvisited.add(node);
        });

        distances[startName] = 0;

        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let current = null;
            let minDistance = Infinity;

            unvisited.forEach(node => {
                if (distances[node] < minDistance) {
                    minDistance = distances[node];
                    current = node;
                }
            });

            if (current === null || distances[current] === Infinity) {
                break; // No path exists
            }

            if (current === endName) {
                // Path found - reconstruct it
                const path = [];
                let node = endName;
                while (node !== null) {
                    path.unshift(node);
                    node = previous[node];
                }
                return { path, distance: distances[endName] };
            }

            unvisited.delete(current);

            // Check neighbors
            Object.keys(graph[current]).forEach(neighbor => {
                if (unvisited.has(neighbor)) {
                    const alt = distances[current] + graph[current][neighbor];
                    if (alt < distances[neighbor]) {
                        distances[neighbor] = alt;
                        previous[neighbor] = current;
                    }
                }
            });
        }

        return null; // No path found
    }

    /**
     * Get detailed path information
     */
    getPathDetails(pathResult) {
        if (!pathResult) return null;

        const path = pathResult.path;
        const startName = path[0];
        const endName = path[path.length - 1];

        const steps = [];
        const floors = new Set();
        let lastKnownFloor = null;

        // Analyze path and create step descriptions
        for (let i = 0; i < path.length; i++) {
            const currentName = path[i];
            const currentRoom = getRoom(currentName);

            if (currentRoom && currentRoom.floor !== undefined) {
                floors.add(currentRoom.floor);
                lastKnownFloor = currentRoom.floor;
            }

            if (currentName.startsWith('_')) {
                continue;
            }

            // Check if we're at a staircase or elevator
            if (currentName.includes('Stairs') || currentName.includes('Elevator')) {
                if (i < path.length - 1) {
                    const nextName = path[i + 1];
                    const nextRoom = getRoom(nextName);
                    
                    if (nextRoom && lastKnownFloor !== null && nextRoom.floor !== undefined) {
                        if (nextRoom.floor > lastKnownFloor) {
                            steps.push({
                                type: 'stairs',
                                description: `Take ${currentName} up to Floor ${nextRoom.floor}`
                            });
                        } else if (nextRoom.floor < lastKnownFloor) {
                            steps.push({
                                type: 'stairs',
                                description: `Take ${currentName} down to Floor ${nextRoom.floor}`
                            });
                        }
                    }
                }
            } else {
                // Regular room
                if (i === 0) {
                    steps.push({
                        type: 'start',
                        description: `Start at ${currentName}`
                    });
                } else if (i === path.length - 1) {
                    steps.push({
                        type: 'end',
                        description: `Arrive at ${currentName}`
                    });
                } else {
                    steps.push({
                        type: 'move',
                        description: `Go to ${currentName}`
                    });
                }
            }
        }

        const hasMultiFloor = floors.size > 1;
        const floorChanges = Array.from(floors).sort().join(' → ');

        return {
            start: startName,
            end: endName,
            path: path,
            steps: steps,
            totalDistance: Math.round(pathResult.distance),
            hasMultiFloor: hasMultiFloor,
            floorChanges: floorChanges,
            floors: Array.from(floors).sort((a, b) => a - b)
        };
    }
}

// Initialize pathfinder
const pathfinder = new Pathfinder();

console.log('✅ Pathfinding system initialized');
console.log(`📡 Graph nodes: ${Object.keys(pathfinder.graph).length}`);