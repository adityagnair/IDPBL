/**
 * Main Application Logic
 * Handles UI interactions, path visualization, and floor switching
 */

class NavigationApp {
    constructor() {
        this.currentFloor = 1;
        this.currentPath = null;
        this.currentPathDetails = null;
        
        // State
        this.selectedDestination = null;
        this.selectedStart = null;
        this.allRoomsList = [];
        this.stepsCollapsed = false;

        // Viewers state
        this.viewers = {
            1: { scale: 1, translateX: 0, translateY: 0, isDragging: false, hasDragged: false, dragStartX: 0, dragStartY: 0, floor: 1 },
            2: { scale: 1, translateX: 0, translateY: 0, isDragging: false, hasDragged: false, dragStartX: 0, dragStartY: 0, floor: 1 }
        };

        this.initElements();
        this.initTheme();
        this.setupCanvas();
        this.setupPanZoom();
        this.loadData();
        this.setupEventListeners();
    }

    initElements() {
        this.elements = {
            introOverlay: document.getElementById('introOverlay'),
            startNavBtn: document.getElementById('startNavBtn'),
            
            searchContainer: document.getElementById('searchContainer'),
            searchBox: document.getElementById('searchBox'),
            routeBox: document.getElementById('routeBox'),
            destBadge: document.getElementById('destBadge'),
            cancelNavBtn: document.getElementById('cancelNavBtn'),
            
            searchInput: document.getElementById('searchInput'),
            clearSearchBtn: document.getElementById('clearSearchBtn'),
            searchResults: document.getElementById('searchResults'),
            
            floorButtons: document.querySelectorAll('.floor-btn'),
            
            startLocationSelect: document.getElementById('startLocationSelect'),
            navigateBtn: document.getElementById('navigateBtn'),
            errorToast: document.getElementById('errorToast'),
            
            menuBtn: document.getElementById('menuBtn'),
            dropdownMenu: document.getElementById('dropdownMenu'),
            collapseStepsBtn: document.getElementById('collapseStepsBtn'),
            themeToggleBtn: document.getElementById('themeToggleBtn'),
            
            stepsPanel: document.getElementById('stepsPanel'),
            pathSteps: document.getElementById('pathSteps')
        };

        // For backward compatibility
        this.canvas = document.getElementById('pathCanvas1');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    initTheme() {
        this.theme = localStorage.getItem('theme') || 'light';
        const body = document.body;
        const btnIcon = this.elements.themeToggleBtn ? this.elements.themeToggleBtn.querySelector('i') : null;
        
        this.pathColor = this.theme === 'dark' ? '#4cc9f0' : 'rgba(67, 97, 238, 0.9)';

        if (this.theme === 'dark') {
            body.classList.add('dark-mode');
            if (btnIcon) {
                btnIcon.className = 'fa-solid fa-sun';
            }
            if (this.elements.themeToggleBtn) {
                this.elements.themeToggleBtn.title = 'Toggle Theme (Light Mode)';
            }
        } else {
            body.classList.remove('dark-mode');
            if (btnIcon) {
                btnIcon.className = 'fa-solid fa-moon';
            }
            if (this.elements.themeToggleBtn) {
                this.elements.themeToggleBtn.title = 'Toggle Theme (Dark Mode)';
            }
        }
    }

    toggleTheme() {
        const body = document.body;
        const btnIcon = this.elements.themeToggleBtn ? this.elements.themeToggleBtn.querySelector('i') : null;
        
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            this.theme = 'light';
            this.pathColor = 'rgba(67, 97, 238, 0.9)';
            if (btnIcon) {
                btnIcon.className = 'fa-solid fa-moon';
            }
            if (this.elements.themeToggleBtn) {
                this.elements.themeToggleBtn.title = 'Toggle Theme (Dark Mode)';
            }
        } else {
            body.classList.add('dark-mode');
            this.theme = 'dark';
            this.pathColor = '#4cc9f0';
            if (btnIcon) {
                btnIcon.className = 'fa-solid fa-sun';
            }
            if (this.elements.themeToggleBtn) {
                this.elements.themeToggleBtn.title = 'Toggle Theme (Light Mode)';
            }
        }
        localStorage.setItem('theme', this.theme);
        
        // Redraw canvas contents for theme updates
        this.drawFloorContent(1);
        this.drawFloorContent(2);
    }

    setupCanvas() {
        this.floorImages = {
            1: new Image(),
            2: new Image()
        };
        this.imageLoaded = {
            1: false,
            2: false
        };
        
        this.floorImages[1].onload = () => {
            this.imageLoaded[1] = true;
            this.resizeCanvas(1);
            this.centerAndFitMap(1);
        };
        
        this.floorImages[2].onload = () => {
            this.imageLoaded[2] = true;
            this.resizeCanvas(2);
            this.centerAndFitMap(2);
        };

        this.loadFloorImage(1, this.currentFloor);
        this.loadFloorImage(2, this.currentFloor);
        
        window.addEventListener('resize', () => {
            this.resizeCanvas(1);
            this.resizeCanvas(2);
        });
    }

    loadFloorImage(id, floorNumber) {
        this.viewers[id].floor = floorNumber;
        const imageSrc = `floor${floorNumber}.jpeg`;
        this.floorImages[id].src = imageSrc;
        
        const imgEl = document.getElementById(`floorImage${id}`);
        if (imgEl) {
            imgEl.src = imageSrc;
        }
        
        const badge = document.getElementById(`floorBadge${id}`);
        if (badge) {
            badge.textContent = `Floor ${floorNumber}`;
        }
    }

    resizeCanvas(id) {
        if (!this.imageLoaded[id]) return;
        const imgEl = document.getElementById(`floorImage${id}`);
        const canvas = document.getElementById(`pathCanvas${id}`);
        const wrapper = document.getElementById(`imageWrapper${id}`);
        
        if (!imgEl || !canvas || !wrapper) return;
        
        const width = imgEl.naturalWidth;
        const height = imgEl.naturalHeight;

        if (!width || !height) return;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        
        wrapper.style.width = width + 'px';
        wrapper.style.height = height + 'px';
        
        this.drawFloorContent(id);
    }

    centerAndFitMap(id) {
        const viewer = document.getElementById(`floorViewer${id}`);
        const img = this.floorImages[id];
        const state = this.viewers[id];
        
        if (!img || !img.naturalWidth || !viewer || !viewer.clientWidth) return;
        
        const scaleX = viewer.clientWidth / img.naturalWidth;
        const scaleY = viewer.clientHeight / img.naturalHeight;
        
        state.scale = Math.min(scaleX, scaleY) * 0.9;
        
        const scaledWidth = img.naturalWidth * state.scale;
        const scaledHeight = img.naturalHeight * state.scale;
        
        state.translateX = (viewer.clientWidth - scaledWidth) / 2;
        state.translateY = (viewer.clientHeight - scaledHeight) / 2;
        
        this.updateTransform(id);
    }

    setupPanZoom() {
        this.setupPanZoomForViewer(1);
        this.setupPanZoomForViewer(2);
    }

    setupPanZoomForViewer(id) {
        const viewer = document.getElementById(`floorViewer${id}`);
        if (!viewer) return;
        
        const state = this.viewers[id];

        viewer.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            state.isDragging = true;
            state.hasDragged = false;
            state.dragStartX = e.clientX - state.translateX;
            state.dragStartY = e.clientY - state.translateY;
            viewer.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            
            if (Math.abs(e.clientX - state.dragStartX - state.translateX) > 3 || 
                Math.abs(e.clientY - state.dragStartY - state.translateY) > 3) {
                state.hasDragged = true;
            }
            
            state.translateX = e.clientX - state.dragStartX;
            state.translateY = e.clientY - state.dragStartY;
            this.updateTransform(id);
        });

        window.addEventListener('mouseup', () => {
            state.isDragging = false;
            viewer.style.cursor = 'grab';
        });

        viewer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = viewer.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const zoomDirection = e.deltaY > 0 ? -1 : 1;
            const zoomSpeed = 0.15;
            const newScale = Math.min(Math.max(0.1, state.scale + zoomDirection * zoomSpeed * state.scale), 5);

            if (newScale !== state.scale) {
                const scaleRatio = newScale / state.scale;
                state.translateX = mouseX - (mouseX - state.translateX) * scaleRatio;
                state.translateY = mouseY - (mouseY - state.translateY) * scaleRatio;
                state.scale = newScale;
                this.updateTransform(id);
            }
        }, { passive: false });
    }

    updateTransform(id) {
        const state = this.viewers[id];
        const wrapper = document.getElementById(`imageWrapper${id}`);
        if (wrapper) {
            wrapper.style.transform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`;
        }
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
            this.resetSearch();
        });

        this.elements.cancelNavBtn.addEventListener('click', () => {
            this.resetSearch();
        });

        // Menu toggling
        if (this.elements.menuBtn && this.elements.dropdownMenu) {
            this.elements.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.elements.dropdownMenu.classList.toggle('hidden');
            });
        }

        // Steps panel collapsibility
        if (this.elements.collapseStepsBtn) {
            this.elements.collapseStepsBtn.addEventListener('click', () => {
                this.toggleStepsCollapse();
            });
        }

        // Theme toggle
        if (this.elements.themeToggleBtn) {
            this.elements.themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Hide dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.elements.searchResults.classList.add('hidden');
            }
            if (this.elements.dropdownMenu && !e.target.closest('.menu-container')) {
                this.elements.dropdownMenu.classList.add('hidden');
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
        this.elements.searchResults.classList.add('hidden');
        
        const roomData = getRoom(roomName);
        if (!roomData) return;

        // Transition top bar to Route Mode
        this.elements.destBadge.textContent = roomName;
        this.elements.searchBox.classList.add('hidden');
        this.elements.routeBox.classList.remove('hidden');
        this.elements.searchContainer.classList.add('route-mode');
        this.elements.startLocationSelect.value = ''; // reset start point

        this.hideError();

        // Switch to that floor so user sees where it is
        this.switchFloor(roomData.floor);
        this.clearPath(); // Clear any existing path
        this.drawCurrentFloor();
    }

    resetSearch() {
        this.selectedDestination = null;
        this.elements.searchInput.value = '';
        this.elements.clearSearchBtn.classList.add('hidden');
        this.elements.searchResults.classList.add('hidden');
        
        // Reset top bar to Search Mode
        this.elements.searchContainer.classList.remove('route-mode');
        this.elements.routeBox.classList.add('hidden');
        this.elements.searchBox.classList.remove('hidden');
        this.elements.startLocationSelect.value = '';
        
        this.hideError();
        this.clearPath();
    }

    closeLocationPanel() {
        this.resetSearch();
    }

    closeStepsPanel() {
        this.elements.stepsPanel.classList.add('hidden');
        this.stepsCollapsed = false;
        this.elements.stepsPanel.classList.remove('collapsed');
        const btnIcon = this.elements.collapseStepsBtn.querySelector('i');
        if (btnIcon) {
            btnIcon.className = 'fa-solid fa-chevron-right';
        }
        
        // Hide dual view
        const wrapper = document.getElementById('mapViewersWrapper');
        const viewer2 = document.getElementById('floorViewer2');
        if (wrapper && viewer2) {
            wrapper.classList.remove('dual-view');
            viewer2.classList.add('hidden');
        }

        setTimeout(() => {
            this.resizeCanvas(1);
            this.centerAndFitMap(1);
        }, 300);
    }

    toggleStepsCollapse() {
        const panel = this.elements.stepsPanel;
        const btnIcon = this.elements.collapseStepsBtn.querySelector('i');
        
        this.stepsCollapsed = !this.stepsCollapsed;
        
        if (this.stepsCollapsed) {
            panel.classList.add('collapsed');
            if (btnIcon) {
                if (window.innerWidth <= 768) {
                    btnIcon.className = 'fa-solid fa-chevron-up';
                } else {
                    btnIcon.className = 'fa-solid fa-chevron-left';
                }
            }
        } else {
            panel.classList.remove('collapsed');
            if (btnIcon) {
                if (window.innerWidth <= 768) {
                    btnIcon.className = 'fa-solid fa-chevron-down';
                } else {
                    btnIcon.className = 'fa-solid fa-chevron-right';
                }
            }
        }
        
        setTimeout(() => {
            this.resizeCanvas(1);
            this.centerAndFitMap(1);
            this.resizeCanvas(2);
            this.centerAndFitMap(2);
        }, 300);
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
        
        // Reset collapse state on starting new navigation
        this.stepsCollapsed = false;
        this.elements.stepsPanel.classList.remove('collapsed');
        const btnIcon = this.elements.collapseStepsBtn.querySelector('i');
        if (btnIcon) {
            btnIcon.className = 'fa-solid fa-chevron-right';
        }

        this.displaySteps();
        
        // Go to start floor on viewer 1
        const startRoom = getRoom(start);
        const endRoom = getRoom(end);
        if (startRoom) {
            this.switchFloor(startRoom.floor);
        }

        // Handle dual floor layout
        const wrapper = document.getElementById('mapViewersWrapper');
        const viewer2 = document.getElementById('floorViewer2');
        if (startRoom && endRoom && startRoom.floor !== endRoom.floor) {
            // Show dual view
            wrapper.classList.add('dual-view');
            viewer2.classList.remove('hidden');
            
            // Set end floor to viewer 2
            this.loadFloorImage(2, endRoom.floor);
            
            // Re-fit maps
            setTimeout(() => {
                this.resizeCanvas(1);
                this.centerAndFitMap(1);
                this.resizeCanvas(2);
                this.centerAndFitMap(2);
            }, 300);
        } else {
            // Hide dual view
            if (wrapper && viewer2) {
                wrapper.classList.remove('dual-view');
                viewer2.classList.add('hidden');
            }
        }
    }

    showError(msg) {
        this.elements.errorToast.textContent = msg;
        this.elements.errorToast.classList.remove('hidden');
        
        if (this.errorTimeout) clearTimeout(this.errorTimeout);
        this.errorTimeout = setTimeout(() => {
            this.hideError();
        }, 3000);
    }

    hideError() {
        this.elements.errorToast.classList.add('hidden');
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
        
        setTimeout(() => {
            this.resizeCanvas(1);
            this.centerAndFitMap(1);
            this.resizeCanvas(2);
            this.centerAndFitMap(2);
        }, 300);
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

        this.loadFloorImage(1, floorNumber);
        setTimeout(() => {
            this.resizeCanvas(1);
        }, 50);
    }

    clearPath() {
        this.currentPath = null;
        this.currentPathDetails = null;
        this.elements.stepsPanel.classList.add('hidden');
        
        // Hide dual view
        const wrapper = document.getElementById('mapViewersWrapper');
        const viewer2 = document.getElementById('floorViewer2');
        if (wrapper && viewer2) {
            wrapper.classList.remove('dual-view');
            viewer2.classList.add('hidden');
        }

        this.drawFloorContent(1);
    }

    drawFloorContent(id) {
        if (!this.imageLoaded[id]) return;
        const canvas = document.getElementById(`pathCanvas${id}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.currentPath) {
            this.drawPathForViewer(id, canvas, ctx);
        } else {
            this.displayRoomLabelsForViewer(id);
        }
    }

    drawPathForViewer(id, canvas, ctx) {
        const path = this.currentPath.path;
        const scaleX = canvas.width / this.floorImages[id].width;
        const scaleY = canvas.height / this.floorImages[id].height;
        const viewerFloor = this.viewers[id].floor;

        const onFloor = [];
        for (let i = 0; i < path.length; i++) {
            const roomData = getRoom(path[i]);
            const isOnFloor = roomData && (
                roomData.floor === viewerFloor ||
                (roomData.floors && roomData.floors.includes(viewerFloor))
            );
            if (isOnFloor) onFloor.push({ name: path[i], data: roomData });
        }

        if (onFloor.length === 0) {
            this.displayRoomLabelsForViewer(id);
            return;
        }

        // Draw line
        ctx.strokeStyle = this.pathColor || 'rgba(67, 97, 238, 0.9)';
        ctx.lineWidth = 6;
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([15, 10]);

        ctx.beginPath();
        onFloor.forEach((node, i) => {
            const x = node.data.x * scaleX;
            const y = node.data.y * scaleY;
            if (i === 0) ctx.moveTo(x, y);
            else         ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw dots
        onFloor.forEach((node) => {
            if (node.name.startsWith('_')) return;
            const x = node.data.x * scaleX;
            const y = node.data.y * scaleY;

            const isStart = node.name === this.currentPathDetails.start;
            const isEnd   = node.name === this.currentPathDetails.end;

            ctx.beginPath();
            ctx.arc(x, y, 14, 0, 2 * Math.PI);
            ctx.fillStyle = isStart ? 'rgba(76,175,80,0.3)'
                               : isEnd   ? 'rgba(247,37,133,0.3)'
                                         : (this.theme === 'dark' ? 'rgba(76, 201, 240, 0.3)' : 'rgba(67,97,238,0.2)');
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = isStart ? '#4caf50' : isEnd ? '#f72585' : (this.theme === 'dark' ? '#4cc9f0' : '#4361ee');
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
        });

        this.displayRoomLabelsForViewer(id);
    }

    displayRoomLabelsForViewer(id) {
        const labelsContainer = document.getElementById(`roomLabels${id}`);
        const canvas = document.getElementById(`pathCanvas${id}`);
        if (!labelsContainer || !canvas) return;

        labelsContainer.innerHTML = '';
        if (!this.imageLoaded[id]) return;

        const viewerFloor = this.viewers[id].floor;
        const roomsOnFloor = getRoomsByFloor(viewerFloor);
        const scaleX = canvas.width / this.floorImages[id].width;
        const scaleY = canvas.height / this.floorImages[id].height;

        const startRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.start) : null;
        const endRoom = this.currentPathDetails ? getRoom(this.currentPathDetails.end) : null;

        Object.entries(roomsOnFloor).forEach(([name, coords]) => {
            if (coords && !name.includes('Stairs') && !name.includes('Elevator') && !name.startsWith('_')) {
                
                const label = document.createElement('div');
                label.className = 'room-label';

                if (this.currentPath) {
                    if (startRoom && name === this.currentPathDetails.start && startRoom.floor === viewerFloor) {
                        label.classList.add('start');
                    } else if (endRoom && name === this.currentPathDetails.end && endRoom.floor === viewerFloor) {
                        label.classList.add('end');
                    }
                } else if (this.selectedDestination === name && coords.floor === viewerFloor) {
                    label.classList.add('end');
                }

                label.textContent = name;
                label.style.left = (coords.x * scaleX) + 'px';
                label.style.top = (coords.y * scaleY) + 'px';
                
                label.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (!this.viewers[id].hasDragged) {
                        this.selectDestination(name);
                    }
                });
                label.style.cursor = 'pointer';

                labelsContainer.appendChild(label);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new NavigationApp();
});
