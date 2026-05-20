/**
 * Pathfinding Algorithm
 * Uses Dijkstra's algorithm to find shortest path between two rooms
 */

class Pathfinder {
    constructor() {
        this.distanceMultiplier = 1; // pixels to meters conversion
        this.stairPenalty = 50; // penalty for using stairs
        this.elevatorPenalty = 30; // penalty for using elevators
    }

    /**
     * Find shortest path between two rooms
     */
    findShortestPath(startRoomName, endRoomName) {
        const startRoom = getRoom(startRoomName);
        const endRoom = getRoom(endRoomName);

        if (!startRoom || !endRoom) {
            console.error('Invalid room names:', startRoomName, endRoomName);
            return null;
        }

        // If on same floor, simple pathfinding
        if (startRoom.floor === endRoom.floor) {
            return this.findPathSameFloor(startRoomName, endRoomName);
        }

        // Different floors - need to use stairs/elevators
        return this.findPathMultiFloor(startRoomName, endRoomName);
    }

    /**
     * Find path on the same floor
     */
    findPathSameFloor(startRoomName, endRoomName) {
        const startRoom = getRoom(startRoomName);
        const endRoom = getRoom(endRoomName);
        const floor = startRoom.floor;

        // Build graph of rooms on this floor
        const roomsOnFloor = Object.keys(BUILDING_DATA[floor].rooms || {});
        const graph = this.buildGraph(roomsOnFloor, floor);

        // Dijkstra's algorithm
        const distances = {};
        const previous = {};
        const unvisited = new Set(roomsOnFloor);

        // Initialize distances
        roomsOnFloor.forEach(room => {
            distances[room] = Infinity;
            previous[room] = null;
        });
        distances[startRoomName] = 0;

        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let minRoom = null;
            let minDistance = Infinity;

            unvisited.forEach(room => {
                if (distances[room] < minDistance) {
                    minDistance = distances[room];
                    minRoom = room;
                }
            });

            if (minRoom === null || minDistance === Infinity) break;
            if (minRoom === endRoomName) break;

            unvisited.delete(minRoom);

            // Check neighbors
            if (graph[minRoom]) {
                Object.entries(graph[minRoom]).forEach(([neighbor, dist]) => {
                    if (unvisited.has(neighbor)) {
                        const newDist = distances[minRoom] + dist;
                        if (newDist < distances[neighbor]) {
                            distances[neighbor] = newDist;
                            previous[neighbor] = minRoom;
                        }
                    }
                });
            }
        }

        // Reconstruct path
        const path = [];
        let current = endRoomName;

        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }

        if (path[0] !== startRoomName) {
            console.error('No path found on same floor');
            return null;
        }

        return {
            path: path,
            distance: distances[endRoomName],
            floors: [floor]
        };
    }

    /**
     * Find path across multiple floors
     */
    findPathMultiFloor(startRoomName, endRoomName) {
        const startRoom = getRoom(startRoomName);
        const endRoom = getRoom(endRoomName);
        const startFloor = startRoom.floor;
        const endFloor = endRoom.floor;

        // Find nearest stairs/elevators on start floor
        const startTransport = this.findNearestTransport(startRoomName, startFloor);
        if (!startTransport) {
            console.error('No stairs/elevators found on start floor');
            return null;
        }

        // Find path to stairs/elevators on end floor
        const endTransport = this.findNearestTransport(endRoomName, endFloor);
        if (!endTransport) {
            console.error('No stairs/elevators found on end floor');
            return null;
        }

        // Build complete path
        const path = [];

        // 1. Path on start floor to transport
        const startPath = this.findPathSameFloor(startRoomName, startTransport.name);
        if (startPath) {
            path.push(...startPath.path);
        } else {
            console.error('Cannot reach transport on start floor');
            return null;
        }

        // 2. Travel through intermediate floors
        const intermediateFloors = Math.abs(endFloor - startFloor) - 1;
        for (let i = 0; i < intermediateFloors; i++) {
            const floor = startFloor < endFloor ? startFloor + i + 2 : startFloor - i - 2;
            path.push(`${startTransport.name} (Floor ${floor})`);
        }

        // 3. Travel to destination on end floor
        const endPath = this.findPathSameFloor(endTransport.name, endRoomName);
        if (endPath) {
            path.push(...endPath.path.slice(1)); // Skip first element (transport) to avoid duplication
        } else {
            console.error('Cannot reach destination from transport on end floor');
            return null;
        }

        return {
            path: path,
            distance: this.calculateTotalDistance(path),
            floors: [startFloor, endFloor]
        };
    }

    /**
     * Find nearest stairs or elevators
     */
    findNearestTransport(roomName, floor) {
        const room = getRoom(roomName);
        if (!room) return null;

        let nearest = null;
        let minDistance = Infinity;

        // Check stairs
        const stairs = getStairs();
        stairs.forEach(stair => {
            if (stair.floors.includes(floor)) {
                const dist = getDistance(room, stair);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = { name: stair.name, x: stair.x, y: stair.y, type: 'stairs' };
                }
            }
        });

        // Check elevators
        const elevators = getElevators();
        elevators.forEach(elev => {
            if (elev.floors.includes(floor)) {
                const dist = getDistance(room, elev);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearest = { name: elev.name, x: elev.x, y: elev.y, type: 'elevator' };
                }
            }
        });

        return nearest;
    }

    /**
     * Build connectivity graph for rooms on a floor
     */
    buildGraph(rooms, floor) {
        const graph = {};
        const threshold = getConnectivityThreshold();

        rooms.forEach(room1 => {
            graph[room1] = {};
            const room1Data = getRoom(room1);

            rooms.forEach(room2 => {
                if (room1 !== room2) {
                    const room2Data = getRoom(room2);
                    const dist = getDistance(room1Data, room2Data);

                    // Connect if within threshold distance
                    if (dist <= threshold) {
                        graph[room1][room2] = dist;
                    }
                }
            });

            // Connect to stairs and elevators
            const stairs = getStairs();
            stairs.forEach(stair => {
                if (stair.floors.includes(floor)) {
                    const dist = getDistance(room1Data, stair);
                    if (dist <= threshold) {
                        graph[room1][stair.name] = dist + this.stairPenalty;
                    }
                }
            });

            const elevators = getElevators();
            elevators.forEach(elev => {
                if (elev.floors.includes(floor)) {
                    const dist = getDistance(room1Data, elev);
                    if (dist <= threshold) {
                        graph[room1][elev.name] = dist + this.elevatorPenalty;
                    }
                }
            });
        });

        return graph;
    }

    /**
     * Calculate total distance of a path
     */
    calculateTotalDistance(path) {
        let totalDistance = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const room1 = getRoom(path[i]);
            const room2 = getRoom(path[i + 1]);

            if (room1 && room2) {
                const dist = getDistance(room1, room2);
                totalDistance += dist;
            }
        }

        return Math.round(totalDistance / 100); // Convert to approximate meters
    }

    /**
     * Get detailed step-by-step directions
     */
    getPathDetails(pathResult) {
        const path = pathResult.path;
        const startRoom = getRoom(path[0]);
        const endRoom = getRoom(path[path.length - 1]);

        const steps = [];
        const floorChanges = [];

        for (let i = 0; i < path.length; i++) {
            const currentRoom = getRoom(path[i]);
            const nextRoom = i < path.length - 1 ? getRoom(path[i + 1]) : null;

            if (currentRoom && nextRoom) {
                // Check if floor changed
                if (currentRoom.floor !== nextRoom.floor) {
                    const direction = nextRoom.floor > currentRoom.floor ? 'up' : 'down';
                    const floorDiff = Math.abs(nextRoom.floor - currentRoom.floor);
                    steps.push({
                        type: 'stairs',
                        description: `Use stairs or elevator to go ${direction} ${floorDiff} floor(s) to Floor ${nextRoom.floor}`
                    });
                    floorChanges.push({ from: currentRoom.floor, to: nextRoom.floor });
                } else {
                    const dist = Math.round(getDistance(currentRoom, nextRoom) / 100);
                    steps.push({
                        type: 'walk',
                        description: `Walk from ${path[i]} to ${path[i + 1]} (~${dist}m)`
                    });
                }
            }
        }

        return {
            start: path[0],
            end: path[path.length - 1],
            steps: steps,
            totalDistance: this.calculateTotalDistance(path),
            floorChanges: floorChanges.length > 0 ? floorChanges.length : 0,
            hasMultiFloor: floorChanges.length > 0
        };
    }
}

// Initialize pathfinder
const pathfinder = new Pathfinder();

console.log('🔍 Pathfinding module loaded');
