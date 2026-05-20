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
        this.imageWrapper = null;

        // Check dependencies first
        if (!this.checkDependencies()) {
            console.error('❌ Dependencies not loaded, aborting initialization');
            return;
        }

        this.initElements();
        if (!this.validateElements()) {
            console.error('❌ DOM elements not found, aborting initialization');
            return;
        }

        this.populateDropdowns();
        this.setupEventListeners();
        this.setupCanvas();
    }

    /**
     * Check if all required dependencies are loaded
     */
    checkDependencies() {
        const checks = {
            'getRoomsAsArray': typeof getRoomsAsArray === 'function',
            'getAllRooms': typeof getAllRooms === 'function',
            'getRoom': typeof getRoom === 'function',
            'pathfinder': typeof pathfinder !== 'undefined'
        };

        let allGood = true;
        for (const [name, loaded] of Object.entries(checks)) {
            if (!loaded) {
                console.error(`❌ ${name} not available`);
                allGood = false;
            }
        }

        if (allGood) {
            console.log('✅ All dependencies loaded');
        }
        return allGood;
    }

    /**
     * Validate all required DOM elements exist
     */
    validateElements() {
        const requiredIds = [
            'startLocation', 'endLocation', 'findPathBtn', 'clearBtn',
            'floorImage', 'pathCanvas', 'roomLabels', 'pathInfo',
            'pathSteps', 'pathStats', 'errorMsg'
        ];

        let allFound = true;
        for (const id of requiredIds) {
            const el = document.getElementById(id);
            if (!el) {
                console.error(`❌ Element not found: #${id}`);
                allFound = false;
            }
        }

        if (allFound) {
            console.log('✅ All DOM elements found');
        }
        return allFound;
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
            floorButtons: document.querySelectorAll('.floor-btn'),
            imageWrapper: document.querySelector('.image-wrapper')
        };

        this.canvas = this.elements.pathCanvas;
        this.ctx = this.canvas.getContext('2d');
        this.imageWrapper = this.elements.imageWrapper;

        console.log('✅ DOM elements initialized');
    }

    /**
     * Setup canvas for drawing paths
     */
    setupCanvas() {
        this.floorImage = new Image();
        this.floorImage.onload = () => {
            console.log('✅ Image loaded:', this.floorImage.width, 'x', this.floorImage.height);
            this.imageLoaded = true;
            this.resizeCanvas();
            this.drawCurrentFloor();
        };
        this.floorImage.onerror = () => {
            console.error('❌ Failed to load image:', this.floorImage.src);
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
        if (!this.imageLoaded) return;
        
        // Get the actual image dimensions
        const imgWidth = this.floorImage.width;
        const imgHeight = this.floorImage.height;
        
        // Get the displayed size
        const displayWidth = this.elements.floorImage.offsetWidth;
        const displayHeight = this.elements.floorImage.offsetHeight;
        
        // Set canvas to match displayed image size
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        
        // Position canvas over image
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        
        if (this.currentPath) {
            this.drawPath();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('✅ Setting up event listeners');
        
        // Find Path button
        if (this.elements.findPathBtn) {
            this.elements.findPathBtn.addEventListener('click', (e) => {
                console.log('🔍 Find Path button clicked');
                e.preventDefault();
                this.findPath();
            });
        }
        
        // Clear button
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', (e) => {
                console.log('🗑️ Clear button clicked');
                e.preventDefault();
                this.clearPath();
            });
        }
        
        // Floor buttons
        this.elements.floorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorNum = parseInt(e.target.dataset.floor);
                console.log('🏢 Switching to floor:', floorNum);
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
        try {
            const rooms = getRoomsAsArray();
            console.log('📋 Populating dropdowns with', rooms.length, 'rooms');
            
            if (rooms.length === 0) {
                console.error('❌ No rooms found');
                return;
            }

            // Clear existing options (except the default one)
            while (this.elements.startLocation.options.length > 1) {
                this.elements.startLocation.remove(1);
            }
            while (this.elements.endLocation.options.length > 1) {
                this.elements.endLocation.remove(1);
            }

            // Add rooms to dropdowns
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

            console.log('✅ Dropdowns populated successfully');
        } catch (error) {
            console.error('❌ Error populating dropdowns:', error);
        }
    }

    /**
     * Switch floor display
     */
    switchFloor(floorNumber) {
        console.log('🏢 Switching floor to:', floorNumber);
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
        
        // Wait for image to load before redrawing
        setTimeout(() => {
            this.resizeCanvas();
            if (this.currentPath) {
                this.drawPath();
            } else {
                this.displayRoomLabels();
            }
        }, 100);
    }

    /**
     * Find shortest path
     */
    findPath() {
        const start = this.elements.startLocation.value;
        const end = this.elements.endLocation.value;

        console.log('🔍 Finding path from "' + start + '" to "' + end + '"');

        // Validation
        if (!start || !end) {
            this.showError('Please select both start and end locations');
            console.warn('⚠️ Validation failed: start or end is empty');
            return;
        }

        if (start === end) {
            this.showError('Start and end locations must be different');
            console.warn('⚠️ Start and end are the same');
            return;
        }

        // Check if pathfinder exists
        if (typeof pathfinder === 'undefined') {
            this.showError('Navigation system not initialized. Please refresh the page.');
            console.error('❌ Pathfinder is not defined');
            return;
        }

        // Find path
        const result = pathfinder.findShortestPath(start, end);
        console.log('📍 Pathfinding result:', result);

        if (!result) {
            this.showError('No path found between selected locations');
            console.error('❌ No path found between', start, 'and', end);
            return;
        }

        this.currentPath = result;
        this.currentPathDetails = pathfinder.getPathDetails(result);
        
        console.log('✅ Path found. Details:', this.currentPathDetails);
        
        this.hideError();
        this.displayPathInfo();
        
        // Switch to start floor and draw path
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
        
        if (!details) return;
        
        // Display steps
        let stepsHTML = '';
        details.steps.forEach((step, index) => {
            const stepClass = step.type === 'stairs' ? 'step stairs' : 'step';
            stepsHTML += `<div class="${stepClass}"><strong>Step ${index + 1}:</strong> ${step.description}</div>`;
        });

        this.elements.pathSteps.innerHTML = stepsHTML || '<p>No steps available</p>';

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
        console.log('🎨 Drawing path on canvas');
        
        if (!this.currentPath || !this.imageLoaded) {
            console.log('⚠️ Cannot draw: path=' + !!this.currentPath + ', imageLoaded=' + this.imageLoaded);
            return;
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

        console.log('📍 Current floor rooms:', currentFloorRooms.length);

        if (currentFloorRooms.length === 0) {
            console.log('ℹ️ No rooms on current floor in path');
            return;
        }

        // Calculate scale
        const scaleX = this.canvas.width / this.floorImage.width;
        const scaleY = this.canvas.height / this.floorImage.height;

        // Draw lines connecting rooms on current floor
        if (currentFloorRooms.length > 1) {
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            for (let i = 0; i < currentFloorRooms.length - 1; i++) {
                const room1 = currentFloorRooms[i].data;
                const room2 = currentFloorRooms[i + 1].data;

                const x1 = room1.x * scaleX;
                const y1 = room1.y * scaleY;
                const x2 = room2.x * scaleX;
                const y2 = room2.y * scaleY;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        }

        // Draw points for rooms on current floor
        currentFloorRooms.forEach((room, idx) => {
            const x = room.data.x * scaleX;
            const y = room.data.y * scaleY;

            // Determine color
            if (idx === 0) {
                this.ctx.fillStyle = '#4caf50'; // Green for start
            } else if (idx === currentFloorRooms.length - 1) {
                this.ctx.fillStyle = '#f44336'; // Red for end
            } else {
                this.ctx.fillStyle = '#667eea'; // Blue for middle
            }

            // Draw circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw outline
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        console.log('✅ Path drawn successfully');
        this.displayRoomLabels();
    }

    /**
     * Display room labels
     */
    displayRoomLabels() {
        this.elements.roomLabels.innerHTML = '';

        if (!this.imageLoaded) return;

        const roomsOnFloor = getRoomsByFloor(this.currentFloor);
        const roomsToDisplay = {};

        // Collect all rooms on current floor (excluding stairs/elevators)
        Object.entries(roomsOnFloor).forEach(([name, coords]) => {
            if (coords && !name.includes('Stairs') && !name.includes('Elevator')) {
                roomsToDisplay[name] = coords;
            }
        });

        // Calculate scale
        const scaleX = this.canvas.width / this.floorImage.width;
        const scaleY = this.canvas.height / this.floorImage.height;

        // Highlight start and end rooms
        const startRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.start) : null;
        const endRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.end) : null;

        Object.entries(roomsToDisplay).forEach(([name, coords]) => {
            const label = document.createElement('div');
            label.className = 'room-label';

            if (startRoom && name === this.currentPathDetails.start && startRoom.floor === this.currentFloor) {
                label.style.background = '#4caf50';
            } else if (endRoom && name === this.currentPathDetails.end && endRoom.floor === this.currentFloor) {
                label.style.background = '#f44336';
            }

            label.textContent = name;
            label.style.left = (coords.x * scaleX) + 'px';
            label.style.top = (coords.y * scaleY) + 'px';

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
        console.error('❌ Error:', message);
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
    console.log('\n========== DOM Content Loaded ==========');
    
    // Add a small delay to ensure all scripts are loaded
    setTimeout(() => {
        const app = new NavigationApp();
        if (app && app.elements && app.elements.startLocation) {
            window.navigationApp = app;
            console.log('\n✅ Building Navigation System Ready!');
            console.log('Total rooms:', Object.keys(getAllRooms()).length);
            console.log('========================================\n');
        } else {
            console.error('❌ Failed to initialize navigation app');
        }
    }, 100);
});
