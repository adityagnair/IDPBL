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
        // State
        this.selectedDestination = null;
        this.selectedStart = null;
        this.allRoomsList = [];

        // Pan & Zoom State
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.hasDragged = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        this.initElements();
        this.setupCanvas();
        this.setupPanZoom();
        this.loadData();
        this.setupEventListeners();
    }

    initElements() {
        this.elements = {
            introOverlay: document.getElementById('introOverlay'),
            startNavBtn: document.getElementById('startNavBtn'),
            
            searchInput: document.getElementById('searchInput'),
            clearSearchBtn: document.getElementById('clearSearchBtn'),
            searchResults: document.getElementById('searchResults'),
            
            floorButtons: document.querySelectorAll('.floor-btn'),
            
            floorImage: document.getElementById('floorImage'),
            pathCanvas: document.getElementById('pathCanvas'),
            roomLabels: document.getElementById('roomLabels'),
            imageWrapper: document.getElementById('imageWrapper'),
            
            locationPanel: document.getElementById('locationPanel'),
            locName: document.getElementById('locName'),
            locDetails: document.getElementById('locDetails'),
            startLocationSelect: document.getElementById('startLocationSelect'),
            navigateBtn: document.getElementById('navigateBtn'),
            errorMsg: document.getElementById('errorMsg'),
            
            stepsPanel: document.getElementById('stepsPanel'),
            pathSteps: document.getElementById('pathSteps')
        };

        this.canvas = this.elements.pathCanvas;
        this.ctx = this.canvas.getContext('2d');
    }

    setupCanvas() {
        this.floorImage = new Image();
        this.floorImage.onload = () => {
            this.imageLoaded = true;
            this.resizeCanvas();
            this.centerAndFitMap();
            this.drawCurrentFloor();
        };
        this.loadFloorImage(this.currentFloor);
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    loadFloorImage(floorNumber) {
        const imageSrc = `floor${floorNumber}.jpeg`;
        this.floorImage.src = imageSrc;
        if (this.elements.floorImage) {
            this.elements.floorImage.src = imageSrc;
        }
    }

    resizeCanvas() {
        if (!this.imageLoaded) return;
        const imgEl = this.elements.floorImage;
        const width = imgEl.naturalWidth;
        const height = imgEl.naturalHeight;

        if (!width || !height) return;

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Ensure wrapper takes size of image
        this.elements.imageWrapper.style.width = width + 'px';
        this.elements.imageWrapper.style.height = height + 'px';
        
        this.drawCurrentFloor();
    }

    centerAndFitMap() {
        const viewer = document.getElementById('floorViewer');
        const img = this.elements.floorImage;
        
        if (!img.naturalWidth || !viewer.clientWidth) return;
        
        const scaleX = viewer.clientWidth / img.naturalWidth;
        const scaleY = viewer.clientHeight / img.naturalHeight;
        
        this.scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some padding
        
        const scaledWidth = img.naturalWidth * this.scale;
        const scaledHeight = img.naturalHeight * this.scale;
        
        this.translateX = (viewer.clientWidth - scaledWidth) / 2;
        this.translateY = (viewer.clientHeight - scaledHeight) / 2;
        
        this.updateTransform();
    }

    setupPanZoom() {
        const viewer = document.getElementById('floorViewer');

        // Mouse Drag
        viewer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Left click only
            this.isDragging = true;
            this.hasDragged = false;
            this.dragStartX = e.clientX - this.translateX;
            this.dragStartY = e.clientY - this.translateY;
            viewer.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            // Check if actual movement occurred (more than 3px) to avoid tiny jitters counting as drag
            if (Math.abs(e.clientX - this.dragStartX - this.translateX) > 3 || 
                Math.abs(e.clientY - this.dragStartY - this.translateY) > 3) {
                this.hasDragged = true;
            }
            
            this.translateX = e.clientX - this.dragStartX;
            this.translateY = e.clientY - this.dragStartY;
            this.updateTransform();
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            viewer.style.cursor = 'grab';
        });

        // Zoom (Mouse Wheel)
        viewer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const rect = viewer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const zoomDirection = e.deltaY > 0 ? -1 : 1;
            const zoomSpeed = 0.15;
            const newScale = Math.min(Math.max(0.1, this.scale + zoomDirection * zoomSpeed * this.scale), 5);

            if (newScale !== this.scale) {
                const scaleRatio = newScale / this.scale;
                this.translateX = mouseX - (mouseX - this.translateX) * scaleRatio;
                this.translateY = mouseY - (mouseY - this.translateY) * scaleRatio;
                this.scale = newScale;
                this.updateTransform();
            }
        }, { passive: false });
    }

    updateTransform() {
        this.elements.imageWrapper.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }

    loadData() {
        // Wait for dependencies if necessary
        setTimeout(() => {
            if (typeof getRoomsAsArray !== 'undefined') {
                this.allRoomsList = getRoomsAsArray().filter(r => !r.startsWith('_'));
                this.populateStartDropdown();
            }
        }, 100);
    }

    populateStartDropdown() {
        const select = this.elements.startLocationSelect;
        this.allRoomsList.forEach(room => {
            const opt = document.createElement('option');
            opt.value = room;
            opt.textContent = room;
            select.appendChild(opt);
        });
    }

    setupEventListeners() {
        // Intro
        this.elements.startNavBtn.addEventListener('click', () => {
            this.elements.introOverlay.classList.add('hidden');
        });

        // Floor Buttons
        this.elements.floorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const floorNum = parseInt(e.target.dataset.floor);
                this.switchFloor(floorNum);
            });
        });

        // Search
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.elements.searchInput.addEventListener('focus', (e) => this.handleSearch(e.target.value));
        
        this.elements.clearSearchBtn.addEventListener('click', () => {
            this.elements.searchInput.value = '';
            this.elements.clearSearchBtn.classList.add('hidden');
            this.elements.searchResults.classList.add('hidden');
            this.closeLocationPanel();
            this.clearPath();
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.elements.searchResults.classList.add('hidden');
            }
        });

        // Navigate
        this.elements.navigateBtn.addEventListener('click', () => this.startNavigation());
    }

    handleSearch(query) {
        if (query.length > 0) {
            this.elements.clearSearchBtn.classList.remove('hidden');
        } else {
            this.elements.clearSearchBtn.classList.add('hidden');
            this.elements.searchResults.classList.add('hidden');
            return;
        }

        const q = query.toLowerCase();
        const results = this.allRoomsList.filter(room => room.toLowerCase().includes(q)).slice(0, 5);
        
        this.elements.searchResults.innerHTML = '';
        
        if (results.length > 0) {
            results.forEach(room => {
                const div = document.createElement('div');
                div.className = 'search-item';
                div.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${room}`;
                div.addEventListener('click', () => this.selectDestination(room));
                this.elements.searchResults.appendChild(div);
            });
            this.elements.searchResults.classList.remove('hidden');
        } else {
            this.elements.searchResults.classList.add('hidden');
        }
    }

    selectDestination(roomName) {
        this.selectedDestination = roomName;
        this.elements.searchInput.value = roomName;
        this.elements.searchResults.classList.add('hidden');
        
        const roomData = getRoom(roomName);
        if (!roomData) return;

        this.elements.locName.textContent = roomName;
        this.elements.locDetails.innerHTML = `Floor ${roomData.floor}`;
        
        this.elements.locationPanel.classList.remove('hidden');
        this.elements.errorMsg.classList.add('hidden');

        // Switch to that floor so user sees where it is
        this.switchFloor(roomData.floor);
        this.clearPath(); // Clear any existing path
        this.drawCurrentFloor();
    }

    closeLocationPanel() {
        this.elements.locationPanel.classList.add('hidden');
    }

    closeStepsPanel() {
        this.elements.stepsPanel.classList.add('hidden');
    }

    startNavigation() {
        const start = this.elements.startLocationSelect.value;
        const end = this.selectedDestination;

        if (!start) {
            this.showError('Please select a starting point');
            return;
        }

        if (start === end) {
            this.showError('Start and destination must be different');
            return;
        }

        const result = pathfinder.findShortestPath(start, end);
        if (!result) {
            this.showError('No path found between selected locations');
            return;
        }

        this.currentPath = result;
        this.currentPathDetails = pathfinder.getPathDetails(result);
        
        this.hideError();
        this.displaySteps();
        
        // Go to start floor
        const startRoom = getRoom(start);
        if (startRoom) {
            this.switchFloor(startRoom.floor);
        }
    }

    showError(msg) {
        this.elements.errorMsg.textContent = msg;
        this.elements.errorMsg.classList.remove('hidden');
    }

    hideError() {
        this.elements.errorMsg.classList.add('hidden');
    }

    displaySteps() {
        const details = this.currentPathDetails;
        if (!details) return;

        let html = '';
        details.steps.forEach((step, index) => {
            let typeClass = '';
            if (step.type === 'start') typeClass = 'start';
            else if (step.type === 'end') typeClass = 'end';
            else if (step.type === 'stairs') typeClass = 'stairs';

            html += `
                <div class="step-card ${typeClass}">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">${step.description}</div>
                </div>
            `;
        });

        this.elements.pathSteps.innerHTML = html;
        this.elements.stepsPanel.classList.remove('hidden');
    }

    switchFloor(floorNumber) {
        this.currentFloor = floorNumber;
        this.elements.floorButtons.forEach(btn => {
            if (parseInt(btn.dataset.floor) === floorNumber) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.loadFloorImage(floorNumber);
        setTimeout(() => {
            this.resizeCanvas();
        }, 50);
    }

    clearPath() {
        this.currentPath = null;
        this.currentPathDetails = null;
        this.elements.stepsPanel.classList.add('hidden');
        this.drawCurrentFloor();
    }

    drawCurrentFloor() {
        if (!this.imageLoaded) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentPath) {
            this.drawPath();
        } else {
            this.displayRoomLabels();
        }
    }

    drawPath() {
        const path = this.currentPath.path;
        const scaleX = this.canvas.width / this.floorImage.width;
        const scaleY = this.canvas.height / this.floorImage.height;

        const onFloor = [];
        for (let i = 0; i < path.length; i++) {
            const roomData = getRoom(path[i]);
            const isOnFloor = roomData && (
                roomData.floor === this.currentFloor ||
                (roomData.floors && roomData.floors.includes(this.currentFloor))
            );
            if (isOnFloor) onFloor.push({ name: path[i], data: roomData });
        }

        if (onFloor.length === 0) {
            this.displayRoomLabels();
            return;
        }

        // Draw line
        this.ctx.strokeStyle = 'rgba(67, 97, 238, 0.9)';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap  = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.setLineDash([15, 10]);

        this.ctx.beginPath();
        onFloor.forEach((node, i) => {
            const x = node.data.x * scaleX;
            const y = node.data.y * scaleY;
            if (i === 0) this.ctx.moveTo(x, y);
            else         this.ctx.lineTo(x, y);
        });
        this.ctx.stroke();

        // Draw dots
        onFloor.forEach((node) => {
            if (node.name.startsWith('_')) return;
            const x = node.data.x * scaleX;
            const y = node.data.y * scaleY;

            const isStart = node.name === this.currentPathDetails.start;
            const isEnd   = node.name === this.currentPathDetails.end;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 14, 0, 2 * Math.PI);
            this.ctx.fillStyle = isStart ? 'rgba(76,175,80,0.3)'
                               : isEnd   ? 'rgba(247,37,133,0.3)'
                                         : 'rgba(67,97,238,0.2)';
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = isStart ? '#4caf50' : isEnd ? '#f72585' : '#4361ee';
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        });

        this.displayRoomLabels();
    }

    displayRoomLabels() {
        this.elements.roomLabels.innerHTML = '';
        if (!this.imageLoaded) return;

        const roomsOnFloor = getRoomsByFloor(this.currentFloor);
        const scaleX = this.canvas.width / this.floorImage.width;
        const scaleY = this.canvas.height / this.floorImage.height;

        const startRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.start) : null;
        const endRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.end) : null;

        Object.entries(roomsOnFloor).forEach(([name, coords]) => {
            if (coords && !name.includes('Stairs') && !name.includes('Elevator') && !name.startsWith('_')) {
                
                // If path is active, maybe only show start/end or just style them differently
                const label = document.createElement('div');
                label.className = 'room-label';

                if (this.currentPath) {
                    if (startRoom && name === this.currentPathDetails.start && startRoom.floor === this.currentFloor) {
                        label.classList.add('start');
                    } else if (endRoom && name === this.currentPathDetails.end && endRoom.floor === this.currentFloor) {
                        label.classList.add('end');
                    } else {
                        // Optional: hide other labels when navigating for cleaner UI, like Google Maps
                        // label.style.opacity = '0.4';
                    }
                } else if (this.selectedDestination === name && coords.floor === this.currentFloor) {
                    // Highlight selected destination even before navigating
                    label.classList.add('end');
                }

                label.textContent = name;
                label.style.left = (coords.x * scaleX) + 'px';
                label.style.top = (coords.y * scaleY) + 'px';
                
                // Add click listener for map selection
                label.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!this.hasDragged) {
                        this.selectDestination(name);
                    }
                });
                label.style.cursor = 'pointer';

                this.elements.roomLabels.appendChild(label);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new NavigationApp();
});
