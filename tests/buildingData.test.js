/**
 * Building Data Tests
 * Tests for room data management and building structure
 */

describe('Building Data - Room Management', () => {
    test('should retrieve room by name', () => {
        const room = getRoom('AB203');
        expect(room).toBeDefined();
        expect(room.x).toBeDefined();
        expect(room.y).toBeDefined();
        expect(room.floor).toBeDefined();
    });

    test('should return null for non-existent room', () => {
        const room = getRoom('NonExistentRoom12345');
        expect(room).toBeNull();
    });

    test('should get all rooms as array', () => {
        const rooms = getRoomsAsArray();
        expect(Array.isArray(rooms)).toBe(true);
        expect(rooms.length).toBeGreaterThan(0);
    });

    test('should get rooms filtered by floor', () => {
        for (let floor = 1; floor <= 5; floor++) {
            const floorRooms = getRoomsByFloor(floor);
            expect(typeof floorRooms).toBe('object');
            
            Object.values(floorRooms).forEach(room => {
                expect(room.floor).toBe(floor);
            });
        }
    });

    test('should have rooms on each floor', () => {
        for (let floor = 1; floor <= 5; floor++) {
            const floorRooms = getRoomsByFloor(floor);
            expect(Object.keys(floorRooms).length).toBeGreaterThan(0);
        }
    });

    test('should have valid room coordinates', () => {
        const rooms = getRoomsAsArray();
        rooms.forEach(roomName => {
            const room = getRoom(roomName);
            if (room) {
                expect(typeof room.x).toBe('number');
                expect(typeof room.y).toBe('number');
                expect(room.x).toBeGreaterThanOrEqual(0);
                expect(room.y).toBeGreaterThanOrEqual(0);
            }
        });
    });
});

describe('Building Data - Vertical Transit', () => {
    test('should retrieve stairs information', () => {
        const stairs = getStairs();
        expect(Array.isArray(stairs)).toBe(true);
        expect(stairs.length).toBeGreaterThan(0);
        
        stairs.forEach(stair => {
            expect(stair.name).toBeDefined();
            expect(stair.floors).toBeDefined();
            expect(Array.isArray(stair.floors)).toBe(true);
            expect(stair.floors.length).toBeGreaterThanOrEqual(2);
        });
    });

    test('should retrieve elevators information', () => {
        const elevators = getElevators();
        expect(Array.isArray(elevators)).toBe(true);
        
        elevators.forEach(elevator => {
            expect(elevator.name).toBeDefined();
            expect(elevator.floors).toBeDefined();
            expect(Array.isArray(elevator.floors)).toBe(true);
            expect(elevator.floors.length).toBeGreaterThanOrEqual(2);
        });
    });

    test('stairs should connect multiple floors', () => {
        const stairs = getStairs();
        stairs.forEach(stair => {
            expect(stair.floors.length).toBeGreaterThanOrEqual(2);
            const sortedFloors = [...stair.floors].sort();
            for (let i = 0; i < sortedFloors.length - 1; i++) {
                expect(sortedFloors[i] < sortedFloors[i + 1]).toBe(true);
            }
        });
    });

    test('elevators should connect multiple floors', () => {
        const elevators = getElevators();
        elevators.forEach(elevator => {
            expect(elevator.floors.length).toBeGreaterThanOrEqual(2);
        });
    });

    test('stairs and elevators should be accessible rooms', () => {
        const stairs = getStairs();
        stairs.forEach(stair => {
            const stairRoom = getRoom(stair.name);
            expect(stairRoom).not.toBeNull();
        });
        
        const elevators = getElevators();
        elevators.forEach(elevator => {
            const elevatorRoom = getRoom(elevator.name);
            expect(elevatorRoom).not.toBeNull();
        });
    });
});

describe('Building Data - Connectivity', () => {
    test('should get connectivity threshold', () => {
        const threshold = getConnectivityThreshold();
        expect(typeof threshold).toBe('number');
        expect(threshold).toBeGreaterThan(0);
    });

    test('should calculate distance between rooms correctly', () => {
        const room1 = getRoom('AB203');
        const room2 = getRoom('AB204');
        
        if (room1 && room2) {
            const distance = getDistance(room1, room2);
            expect(distance).toBeGreaterThan(0);
            
            // Verify Euclidean distance formula
            const expectedDistance = Math.sqrt(
                Math.pow(room2.x - room1.x, 2) + Math.pow(room2.y - room1.y, 2)
            );
            expect(Math.abs(distance - expectedDistance)).toBeLessThan(0.01);
        }
    });

    test('distance between room and itself should be zero', () => {
        const room = getRoom('AB203');
        if (room) {
            const distance = getDistance(room, room);
            expect(distance).toBe(0);
        }
    });

    test('distance should be symmetric', () => {
        const room1 = getRoom('AB203');
        const room2 = getRoom('AB204');
        
        if (room1 && room2) {
            const distance1 = getDistance(room1, room2);
            const distance2 = getDistance(room2, room1);
            expect(Math.abs(distance1 - distance2)).toBeLessThan(0.01);
        }
    });
});

describe('Building Data - Data Integrity', () => {
    test('all rooms should have unique names', () => {
        const rooms = getRoomsAsArray();
        const uniqueRooms = new Set(rooms);
        expect(uniqueRooms.size).toBe(rooms.length);
    });

    test('all rooms should be within valid floor range', () => {
        const rooms = getRoomsAsArray();
        rooms.forEach(roomName => {
            const room = getRoom(roomName);
            if (room && room.floor) {
                expect(room.floor).toBeGreaterThanOrEqual(1);
                expect(room.floor).toBeLessThanOrEqual(5);
            }
        });
    });

    test('all stairs should connect existing floors', () => {
        const stairs = getStairs();
        stairs.forEach(stair => {
            stair.floors.forEach(floor => {
                expect(floor).toBeGreaterThanOrEqual(1);
                expect(floor).toBeLessThanOrEqual(5);
            });
        });
    });

    test('all elevators should connect existing floors', () => {
        const elevators = getElevators();
        elevators.forEach(elevator => {
            elevator.floors.forEach(floor => {
                expect(floor).toBeGreaterThanOrEqual(1);
                expect(floor).toBeLessThanOrEqual(5);
            });
        });
    });
});
