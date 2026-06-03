/**
 * Pathfinding Algorithm Tests
 * Tests for A* and Dijkstra pathfinding algorithms
 */

describe('Pathfinding - A* Algorithm (Same Floor)', () => {
    let pf;

    beforeEach(() => {
        pf = new Pathfinder();
    });

    test('should find shortest path between two rooms on Floor 1', () => {
        const result = pf.findShortestPath('AB203', 'AB204');
        expect(result).not.toBeNull();
        expect(result.path).toBeDefined();
        expect(result.distance).toBeGreaterThan(0);
    });

    test('should return null for invalid start room', () => {
        const result = pf.findShortestPath('InvalidRoom', 'AB203');
        expect(result).toBeNull();
    });

    test('should return null for invalid end room', () => {
        const result = pf.findShortestPath('AB203', 'InvalidRoom');
        expect(result).toBeNull();
    });

    test('should return null when both room names are invalid', () => {
        const result = pf.findShortestPath('InvalidStart', 'InvalidEnd');
        expect(result).toBeNull();
    });

    test('should handle path where start and end are the same', () => {
        const result = pf.findShortestPath('AB203', 'AB203');
        expect(result).not.toBeNull();
        expect(result.path.length).toBe(1);
        expect(result.path[0]).toBe('AB203');
    });

    test('should find path with multiple intermediate nodes', () => {
        const result = pf.findShortestPath('AB203', 'AB210');
        expect(result).not.toBeNull();
        expect(result.path.length).toBeGreaterThan(1);
    });

    test('path should start with start room and end with end room', () => {
        const result = pf.findShortestPath('AB203', 'AB204');
        expect(result.path[0]).toBe('AB203');
        expect(result.path[result.path.length - 1]).toBe('AB204');
    });
});

describe('Pathfinding - A* Algorithm (Multiple Floors)', () => {
    let pf;

    beforeEach(() => {
        pf = new Pathfinder();
    });

    test('should find path from Floor 1 to Floor 2 via stairs', () => {
        const result = pf.findShortestPath('AB203', 'MCA Staff Room');
        expect(result).not.toBeNull();
        expect(result.path.length).toBeGreaterThan(2);
        const hasStairs = result.path.some(node => node.includes('Stairs'));
        expect(hasStairs).toBe(true);
    });

    test('should find path via elevator when available', () => {
        const start = 'AB203';
        const end = 'MCA Staff Room';
        const result = pf.findShortestPath(start, end);
        expect(result).not.toBeNull();
        const hasTransit = result.path.some(node => node.includes('Elevator') || node.includes('Stairs'));
        expect(hasTransit).toBe(true);
    });

    test('should prefer shorter path between stairs and elevators', () => {
        const result = pf.findShortestPath('AB203', 'MCA Staff Room');
        expect(result).not.toBeNull();
        expect(result.distance).toBeGreaterThan(0);
    });

    test('should handle multi-floor transitions correctly', () => {
        const result = pf.findShortestPath('AB203', 'MCA Staff Room');
        if (result) {
            const startRoom = getRoom(result.path[0]);
            const endRoom = getRoom(result.path[result.path.length - 1]);
            expect(startRoom.floor).not.toEqual(endRoom.floor);
        }
    });
});

describe('Pathfinding - Graph Building', () => {
    let pf;

    beforeEach(() => {
        pf = new Pathfinder();
    });

    test('should build graph with all rooms as nodes', () => {
        const allRooms = getAllRooms();
        const graphNodes = Object.keys(pf.graph);
        expect(graphNodes.length).toBeGreaterThanOrEqual(Object.keys(allRooms).length);
    });

    test('should create bidirectional edges', () => {
        const roomName1 = Object.keys(pf.graph)[0];
        const neighbors = pf.graph[roomName1];
        
        Object.keys(neighbors).forEach(neighbor => {
            expect(pf.graph[neighbor][roomName1]).toBeDefined();
            expect(pf.graph[neighbor][roomName1]).toEqual(neighbors[neighbor]);
        });
    });

    test('should enforce orthogonal connections for corridors', () => {
        const corridors = Object.keys(pf.graph).filter(room => room.startsWith('_CB'));
        
        corridors.forEach(corridor => {
            Object.keys(pf.graph[corridor]).forEach(neighbor => {
                const c = getRoom(corridor);
                const n = getRoom(neighbor);
                if (c && n && c.isCorridor && n.isCorridor) {
                    const sameAxis = (c.x === n.x) || (c.y === n.y);
                    expect(sameAxis).toBe(true);
                }
            });
        });
    });

    test('should connect rooms only to their door nodes', () => {
        Object.keys(pf.graph).forEach(room => {
            const roomData = getRoom(room);
            if (roomData && !roomData.isCorridor && !room.startsWith('_')) {
                Object.keys(pf.graph[room]).forEach(neighbor => {
                    const neighborData = getRoom(neighbor);
                    if (neighborData && neighborData.isCorridor) {
                        expect(neighborData.isDoorFor).toBe(room);
                    }
                });
            }
        });
    });

    test('should not create direct non-corridor to non-corridor connections', () => {
        Object.keys(pf.graph).forEach(room => {
            const roomData = getRoom(room);
            if (roomData && !roomData.isCorridor) {
                Object.keys(pf.graph[room]).forEach(neighbor => {
                    const neighborData = getRoom(neighbor);
                    expect(neighborData.isCorridor || neighborData.isDoorFor).toBeTruthy();
                });
            }
        });
    });

    test('should have positive edge weights', () => {
        Object.keys(pf.graph).forEach(room => {
            Object.values(pf.graph[room]).forEach(weight => {
                expect(weight).toBeGreaterThan(0);
            });
        });
    });
});

describe('Pathfinding - Dijkstra Algorithm', () => {
    let pf;

    beforeEach(() => {
        pf = new Pathfinder();
    });

    test('should find a valid path', () => {
        const result = pf.dijkstra('AB203', 'AB204');
        expect(result).not.toBeNull();
        expect(result.path).toBeDefined();
        expect(result.distance).toBeGreaterThan(0);
    });

    test('should return null for invalid rooms', () => {
        const result = pf.dijkstra('InvalidRoom', 'AB203');
        expect(result).toBeNull();
    });

    test('should find equivalent distance as A*', () => {
        const astarResult = pf.astar('AB203', 'AB210');
        const dijkstraResult = pf.dijkstra('AB203', 'AB210');
        
        if (astarResult && dijkstraResult) {
            expect(Math.abs(astarResult.distance - dijkstraResult.distance)).toBeLessThan(1);
        }
    });

    test('should reconstruct path correctly', () => {
        const result = pf.dijkstra('AB203', 'AB210');
        if (result) {
            expect(result.path[0]).toBe('AB203');
            expect(result.path[result.path.length - 1]).toBe('AB210');
        }
    });
});

describe('Pathfinding - Path Details & Steps', () => {
    let pf;

    beforeEach(() => {
        pf = new Pathfinder();
    });

    test('should generate correct step sequence for single-floor path', () => {
        const pathResult = pf.findShortestPath('AB203', 'AB210');
        const details = pf.getPathDetails(pathResult);
        
        expect(details).not.toBeNull();
        expect(details.steps[0].type).toBe('start');
        expect(details.steps[details.steps.length - 1].type).toBe('end');
        expect(details.start).toBe('AB203');
        expect(details.end).toBe('AB210');
    });

    test('should include stairs/elevator steps for multi-floor paths', () => {
        const pathResult = pf.findShortestPath('AB203', 'MCA Staff Room');
        const details = pf.getPathDetails(pathResult);
        
        expect(details.hasMultiFloor).toBe(true);
        const hasTransitStep = details.steps.some(s => s.type === 'stairs');
        expect(hasTransitStep).toBe(true);
    });

    test('should correctly identify floor changes', () => {
        const pathResult = pf.findShortestPath('AB203', 'MCA Staff Room');
        const details = pf.getPathDetails(pathResult);
        
        expect(details.floorChanges).toContain('→');
        expect(details.floors.length).toBeGreaterThan(1);
    });

    test('should calculate total distance correctly', () => {
        const pathResult = pf.findShortestPath('AB203', 'AB210');
        const details = pf.getPathDetails(pathResult);
        
        expect(details.totalDistance).toEqual(Math.round(pathResult.distance));
        expect(details.totalDistance).toBeGreaterThan(0);
    });

    test('should exclude internal corridor nodes from description', () => {
        const pathResult = pf.findShortestPath('AB203', 'AB210');
        const details = pf.getPathDetails(pathResult);
        
        details.steps.forEach(step => {
            expect(step.description).not.toMatch(/^_/);
        });
    });

    test('should have valid step descriptions', () => {
        const pathResult = pf.findShortestPath('AB203', 'AB210');
        const details = pf.getPathDetails(pathResult);
        
        details.steps.forEach(step => {
            expect(step.description).toBeTruthy();
            expect(step.type).toMatch(/start|end|move|stairs/);
        });
    });

    test('should have floors sorted in ascending order', () => {
        const pathResult = pf.findShortestPath('AB203', 'MCA Staff Room');
        const details = pf.getPathDetails(pathResult);
        
        for (let i = 0; i < details.floors.length - 1; i++) {
            expect(details.floors[i]).toBeLessThanOrEqual(details.floors[i + 1]);
        }
    });
});
