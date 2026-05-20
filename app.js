/**
 * Main Application Logic
 * Handles UI interactions, path visualization, and floor switching
 */

class NavigationApp {
    constructor() {
        this.currentFloor = 1;
        this.currentPath = null;
        this.currentPathDetails = null;
        this.canvas = null;
        this.ctx = null;
        this.floorImage = null;
        this.imageLoaded = false;

        this.initElements();
        this.setupEventListeners();
        this.populateDropdowns();
        this.setupCanvas();
    }

    /**
     * Initialize DOM elements
     */
    initElements() {
        this.elements = {
            startLocation: document.getElementById('startLocation'),
            endLocation: document.getElementById('endLocation'),
            findPathBtn: document.getElementById('findPathBtn'),
            clearBtn: document.getElementById('clearBtn'),
            floorImage: document.getElementById('floorImage'),
            pathCanvas: document.getElementById('pathCanvas'),
            roomLabels: document.getElementById('roomLabels'),
            pathInfo: document.getElementById('pathInfo'),
            pathSteps: document.getElementById('pathSteps'),
            pathStats: document.getElementById('pathStats'),
            errorMsg: document.getElementById('errorMsg'),
            floorButtons: document.querySelectorAll('.floor-btn')
        };

        this.canvas = this.elements.pathCanvas;
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Setup canvas for drawing paths
     */
    setupCanvas() {
        this.floorImage = new Image();
        this.floorImage.onload = () => {
            this.imageLoaded = true;
            this.resizeCanvas();
            this.drawCurrentFloor();
        };
        this.loadFloorImage(this.currentFloor);

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Load floor image
     */
    loadFloorImage(floorNumber) {
        this.floorImage.src = `floor${floorNumber}.jpeg`;
    }

    /**
     * Resize canvas to match image size
     */
    resizeCanvas() {
        if (!this.elements.floorImage.complete) return;
        
        const rect = this.elements.floorImage.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (this.currentPath) {
            this.drawPath();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.elements.findPathBtn.addEventListener('click', () => {
            console.log('Find Path button clicked');
            this.findPath();
        });
        this.elements.clearBtn.addEventListener('click', () => {
            console.log('Clear button clicked');
            this.clearPath();
        });
        
        // Floor buttons
        this.elements.floorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorNum = parseInt(e.target.dataset.floor);
                console.log('Switching to floor:', floorNum);
                this.switchFloor(floorNum);
            });
        });

        // Allow Enter key to find path
        [this.elements.startLocation, this.elements.endLocation].forEach(el => {
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.findPath();
            });
        });
    }

    /**
     * Populate dropdown selects with all rooms
     */
    populateDropdowns() {
        const rooms = getRoomsAsArray();
        console.log('Populating dropdowns with', rooms.length, 'rooms');
        
        rooms.forEach(room => {
            const optionStart = document.createElement('option');
            optionStart.value = room;
            optionStart.textContent = room;
            this.elements.startLocation.appendChild(optionStart);

            const optionEnd = document.createElement('option');
            optionEnd.value = room;
            optionEnd.textContent = room;
            this.elements.endLocation.appendChild(optionEnd);
        });
    }

    /**
     * Switch floor display
     */
    switchFloor(floorNumber) {
        console.log('Switching floor to:', floorNumber);
        this.currentFloor = floorNumber;
        
        // Update active button
        this.elements.floorButtons.forEach(btn => {
            const btnFloor = parseInt(btn.dataset.floor);
            if (btnFloor === floorNumber) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Load floor image
        this.loadFloorImage(floorNumber);
        
        // Redraw
        if (this.currentPath) {
            this.drawPath();
        } else {
            this.displayRoomLabels();
        }
    }

    /**
     * Find shortest path
     */
    findPath() {
        const start = this.elements.startLocation.value;
        const end = this.elements.endLocation.value;

        console.log('Finding path from', start, 'to', end);

        // Validation
        if (!start || !end) {
            this.showError('Please select both start and end locations');
            return;
        }

        if (start === end) {
            this.showError('Start and end locations must be different');
            return;
        }

        // Find path
        const result = pathfinder.findShortestPath(start, end);

        if (!result) {
            this.showError('No path found between selected locations');
            return;
        }

        console.log('Path found:', result);

        this.currentPath = result;
        this.currentPathDetails = pathfinder.getPathDetails(result);
        
        this.hideError();
        this.displayPathInfo();
        this.drawPath();
        
        // Switch to start floor
        const startRoom = getRoom(start);
        if (startRoom) {
            this.switchFloor(startRoom.floor);
        }
    }

    /**
     * Display path information in sidebar
     */
    displayPathInfo() {
        const details = this.currentPathDetails;
        
        // Display steps
        let stepsHTML = '';
        details.steps.forEach((step, index) => {
            const stepClass = step.type === 'stairs' ? 'step stairs' : 'step';
            stepsHTML += `<div class="${stepClass}"><strong>Step ${index + 1}:</strong> ${step.description}</div>`;
        });

        this.elements.pathSteps.innerHTML = stepsHTML;

        // Display statistics
        let statsHTML = '';
        statsHTML += `<div class="stat-item"><span class="stat-label">Start:</span> ${details.start}</div>`;
        statsHTML += `<div class="stat-item"><span class="stat-label">End:</span> ${details.end}</div>`;
        
        if (details.hasMultiFloor) {
            statsHTML += `<div class="stat-item"><span class="stat-label">Floors to traverse:</span> ${details.floorChanges}</div>`;
        } else {
            statsHTML += `<div class="stat-item"><span class="stat-label">Floor:</span> ${getRoom(details.start).floor}</div>`;
        }
        
        statsHTML += `<div class="stat-item"><span class="stat-label">Total distance:</span> ~${details.totalDistance} meters</div>`;
        statsHTML += `<div class="stat-item"><span class="stat-label">Total steps:</span> ${details.steps.length}</div>`;

        this.elements.pathStats.innerHTML = statsHTML;
        
        this.elements.pathInfo.classList.remove('hidden');
    }

    /**
     * Draw path on canvas
     */
    drawPath() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.currentPath) return;

        const path = this.currentPath.path;
        const details = this.currentPathDetails;
        
        // Find rooms that are on current floor
        const currentFloorRooms = [];
        
        for (let i = 0; i < path.length; i++) {
            const room = path[i];
            const roomData = getRoom(room);
            
            if (roomData && roomData.floor === this.currentFloor) {
                currentFloorRooms.push({
                    name: room,
                    index: i,
                    data: roomData
                });
            }
        }

        if (currentFloorRooms.length === 0) return;

        // Draw lines connecting rooms on current floor
        if (currentFloorRooms.length > 1) {
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            // Calculate scale
            const scale = this.canvas.width / this.floorImage.width;

            for (let i = 0; i < currentFloorRooms.length - 1; i++) {
                const room1 = currentFloorRooms[i].data;
                const room2 = currentFloorRooms[i + 1].data;

                this.ctx.beginPath();
                this.ctx.moveTo(room1.x * scale, room1.y * scale);
                this.ctx.lineTo(room2.x * scale, room2.y * scale);
                this.ctx.stroke();
            }
        }

        // Draw points for rooms on current floor
        currentFloorRooms.forEach((room, idx) => {
            const scale = this.canvas.width / this.floorImage.width;
            const x = room.data.x * scale;
            const y = room.data.y * scale;

            // Draw circle
            if (idx === 0) {
                // Start point
                this.ctx.fillStyle = '#4caf50';
            } else if (idx === currentFloorRooms.length - 1) {
                // End point
                this.ctx.fillStyle = '#f44336';
            } else {
                // Middle point
                this.ctx.fillStyle = '#667eea';
            }

            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw outline
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        this.displayRoomLabels();
    }

    /**
     * Display room labels and highlight rooms
     */
    displayRoomLabels() {
        this.elements.roomLabels.innerHTML = '';

        const roomsOnFloor = getRoomsByFloor(this.currentFloor);
        const roomsToDisplay = {};

        // Collect all rooms on current floor
        Object.entries(roomsOnFloor).forEach(([name, coords]) => {
            if (coords && !name.includes('Stairs') && !name.includes('Elevator')) {
                roomsToDisplay[name] = coords;
            }
        });

        // Highlight start and end rooms
        const startRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.start) : null;
        const endRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.end) : null;

        // Calculate scale
        const scale = this.canvas.width / this.floorImage.width;

        Object.entries(roomsToDisplay).forEach(([name, coords]) => {
            const label = document.createElement('div');
            label.className = 'room-label';

            if (startRoom && name === this.currentPathDetails.start && startRoom.floor === this.currentFloor) {
                label.classList.add('start');
                label.style.background = '#4caf50';
            } else if (endRoom && name === this.currentPathDetails.end && endRoom.floor === this.currentFloor) {
                label.classList.add('end');
                label.style.background = '#f44336';
            }

            label.textContent = name;
            label.style.left = (coords.x * scale) + 'px';
            label.style.top = (coords.y * scale) + 'px';

            this.elements.roomLabels.appendChild(label);
        });
    }

    /**
     * Clear path and reset UI
     */
    clearPath() {
        this.currentPath = null;
        this.currentPathDetails = null;
        this.elements.startLocation.value = '';
        this.elements.endLocation.value = '';
        this.elements.pathInfo.classList.add('hidden');
        this.hideError();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.elements.roomLabels.innerHTML = '';
    }

    /**
     * Show error message
     */
    showError(message) {
        this.elements.errorMsg.textContent = message;
        this.elements.errorMsg.classList.remove('hidden');
    }

    /**
     * Hide error message
     */
    hideError() {
        this.elements.errorMsg.classList.add('hidden');
    }

    /**
     * Draw current floor (helper)
     */
    drawCurrentFloor() {
        if (this.currentPath) {
            this.drawPath();
        } else {
            this.displayRoomLabels();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing app...');
    const app = new NavigationApp();
    window.navigationApp = app;
    console.log('🏢 Building Navigation System initialized');
    console.log('Total rooms:', Object.keys(getAllRooms()).length);
});