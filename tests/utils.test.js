/**
 * Utility Functions Tests
 * Tests for distance calculations and helper functions
 */

describe('Utility Functions - Distance Calculation', () => {
    test('should calculate Euclidean distance between two points', () => {
        const point1 = { x: 0, y: 0 };
        const point2 = { x: 3, y: 4 };
        const distance = getDistance(point1, point2);
        expect(distance).toBe(5); // 3-4-5 triangle
    });

    test('should calculate distance for identical points', () => {
        const point = { x: 10, y: 20 };
        const distance = getDistance(point, point);
        expect(distance).toBe(0);
    });

    test('should calculate distance symmetrically', () => {
        const point1 = { x: 1, y: 1 };
        const point2 = { x: 4, y: 5 };
        const d1 = getDistance(point1, point2);
        const d2 = getDistance(point2, point1);
        expect(d1).toBe(d2);
    });

    test('should handle negative coordinates', () => {
        const point1 = { x: -3, y: -4 };
        const point2 = { x: 0, y: 0 };
        const distance = getDistance(point1, point2);
        expect(distance).toBe(5);
    });

    test('should handle large coordinates', () => {
        const point1 = { x: 1000, y: 2000 };
        const point2 = { x: 1003, y: 2004 };
        const distance = getDistance(point1, point2);
        expect(distance).toBe(5);
    });
});

describe('Utility Functions - Room Retrieval', () => {
    test('getRoomsAsArray should return array of room names', () => {
        const rooms = getRoomsAsArray();
        expect(Array.isArray(rooms)).toBe(true);
        expect(rooms.length).toBeGreaterThan(0);
        rooms.forEach(roomName => {
            expect(typeof roomName).toBe('string');
        });
    });

    test('getRoomsByFloor should return object with floor rooms', () => {
        for (let floor = 1; floor <= 5; floor++) {
            const rooms = getRoomsByFloor(floor);
            expect(typeof rooms).toBe('object');
            Object.entries(rooms).forEach(([name, data]) => {
                expect(typeof name).toBe('string');
                expect(data.floor).toBe(floor);
            });
        }
    });
});

describe('Utility Functions - Vertical Transit', () => {
    test('getStairs should return array', () => {
        const stairs = getStairs();
        expect(Array.isArray(stairs)).toBe(true);
    });

    test('getElevators should return array', () => {
        const elevators = getElevators();
        expect(Array.isArray(elevators)).toBe(true);
    });

    test('getConnectivityThreshold should return positive number', () => {
        const threshold = getConnectivityThreshold();
        expect(typeof threshold).toBe('number');
        expect(threshold).toBeGreaterThan(0);
    });
});
