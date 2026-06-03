/**
 * NavigationApp UI Tests
 * Tests for UI interactions, theme management, and navigation flow
 */

describe('NavigationApp - Initialization', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introOverlay"></div>
            <button id="startNavBtn"></button>
            <div id="searchContainer"></div>
            <input id="searchBox" />
            <input id="searchInput" />
            <button id="clearSearchBtn" class="hidden"></button>
            <div id="searchResults" class="hidden"></div>
            <div id="routeBox" class="hidden"></div>
            <div id="destBadge"></div>
            <button id="cancelNavBtn"></button>
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
            <select id="startLocationSelect"></select>
            <button id="navigateBtn"></button>
            <div id="errorToast" class="hidden"></div>
            <button id="menuBtn"></button>
            <div id="dropdownMenu" class="hidden"></div>
            <button id="collapseStepsBtn"><i class="fa-solid fa-chevron-right"></i></button>
            <button id="themeToggleBtn"><i class="fa-solid fa-moon"></i></button>
            <div id="stepsPanel" class="hidden"></div>
            <div id="pathSteps"></div>
            <div id="floorViewer1"></div>
            <div id="floorViewer2" class="hidden"></div>
            <div id="imageWrapper1"></div>
            <div id="imageWrapper2"></div>
            <canvas id="pathCanvas1"></canvas>
            <canvas id="pathCanvas2"></canvas>
            <img id="floorImage1" />
            <img id="floorImage2" />
            <div id="roomLabels1"></div>
            <div id="roomLabels2"></div>
            <div id="floorBadge1">Floor 1</div>
            <div id="floorBadge2">Floor 2</div>
            <div id="mapViewersWrapper"></div>
        `;
        localStorage.clear();
        app = new NavigationApp();
    });

    test('should initialize with correct default values', () => {
        expect(app.currentFloor).toBe(1);
        expect(app.currentPath).toBeNull();
        expect(app.currentPathDetails).toBeNull();
        expect(app.selectedDestination).toBeNull();
        expect(app.selectedStart).toBeNull();
    });

    test('should initialize theme', () => {
        expect(app.theme).toBeDefined();
        expect(['light', 'dark']).toContain(app.theme);
    });

    test('should load all elements on init', () => {
        expect(app.elements.introOverlay).toBeDefined();
        expect(app.elements.searchContainer).toBeDefined();
        expect(app.elements.floorButtons).toBeDefined();
    });
});

describe('NavigationApp - Theme Management', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introOverlay"></div>
            <button id="startNavBtn"></button>
            <div id="searchContainer"></div>
            <input id="searchBox" />
            <input id="searchInput" />
            <button id="clearSearchBtn" class="hidden"></button>
            <div id="searchResults" class="hidden"></div>
            <div id="routeBox" class="hidden"></div>
            <div id="destBadge"></div>
            <button id="cancelNavBtn"></button>
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
            <select id="startLocationSelect"></select>
            <button id="navigateBtn"></button>
            <div id="errorToast" class="hidden"></div>
            <button id="menuBtn"></button>
            <div id="dropdownMenu" class="hidden"></div>
            <button id="collapseStepsBtn"><i class="fa-solid fa-chevron-right"></i></button>
            <button id="themeToggleBtn"><i class="fa-solid fa-moon"></i></button>
            <div id="stepsPanel" class="hidden"></div>
            <div id="pathSteps"></div>
            <div id="floorViewer1"></div>
            <div id="floorViewer2" class="hidden"></div>
            <div id="imageWrapper1"></div>
            <div id="imageWrapper2"></div>
            <canvas id="pathCanvas1"></canvas>
            <canvas id="pathCanvas2"></canvas>
            <img id="floorImage1" />
            <img id="floorImage2" />
            <div id="roomLabels1"></div>
            <div id="roomLabels2"></div>
            <div id="floorBadge1">Floor 1</div>
            <div id="floorBadge2">Floor 2</div>
            <div id="mapViewersWrapper"></div>
        `;
        localStorage.clear();
        app = new NavigationApp();
    });

    test('should initialize with stored theme or default to light', () => {
        localStorage.clear();
        const newApp = new NavigationApp();
        expect(newApp.theme).toBe('light');
    });

    test('should toggle between light and dark themes', () => {
        const initialTheme = app.theme;
        app.toggleTheme();
        expect(app.theme).not.toBe(initialTheme);
    });

    test('should update path color based on theme', () => {
        app.theme = 'light';
        app.pathColor = 'rgba(67, 97, 238, 0.9)';
        
        app.toggleTheme();
        expect(app.theme).toBe('dark');
        expect(app.pathColor).toBe('#80e2ff');
    });

    test('should persist theme choice to localStorage', () => {
        localStorage.clear();
        app.toggleTheme();
        expect(localStorage.getItem('theme')).toBe(app.theme);
    });

    test('should update button icon when toggling theme', () => {
        const btnIcon = app.elements.themeToggleBtn.querySelector('i');
        const initialClass = btnIcon.className;
        
        app.toggleTheme();
        expect(btnIcon.className).not.toBe(initialClass);
    });
});

describe('NavigationApp - Search & Room Selection', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introOverlay"></div>
            <button id="startNavBtn"></button>
            <div id="searchContainer" class="search-container"></div>
            <input id="searchBox" />
            <input id="searchInput" />
            <button id="clearSearchBtn" class="hidden"></button>
            <div id="searchResults" class="hidden"></div>
            <div id="routeBox" class="hidden"></div>
            <div id="destBadge"></div>
            <button id="cancelNavBtn"></button>
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
            <select id="startLocationSelect"></select>
            <button id="navigateBtn"></button>
            <div id="errorToast" class="hidden"></div>
            <button id="menuBtn"></button>
            <div id="dropdownMenu" class="hidden" class="menu-container"></div>
            <button id="collapseStepsBtn"><i class="fa-solid fa-chevron-right"></i></button>
            <button id="themeToggleBtn"><i class="fa-solid fa-moon"></i></button>
            <div id="stepsPanel" class="hidden"></div>
            <div id="pathSteps"></div>
            <div id="floorViewer1"></div>
            <div id="floorViewer2" class="hidden"></div>
            <div id="imageWrapper1"></div>
            <div id="imageWrapper2"></div>
            <canvas id="pathCanvas1"></canvas>
            <canvas id="pathCanvas2"></canvas>
            <img id="floorImage1" />
            <img id="floorImage2" />
            <div id="roomLabels1"></div>
            <div id="roomLabels2"></div>
            <div id="floorBadge1">Floor 1</div>
            <div id="floorBadge2">Floor 2</div>
            <div id="mapViewersWrapper"></div>
        `;
        localStorage.clear();
        app = new NavigationApp();
        app.allRoomsList = ['AB203', 'AB204', 'CD105', 'MCA Staff Room', 'Conference Room'];
    });

    test('should filter rooms by search query', () => {
        app.handleSearch('AB2');
        const items = document.querySelectorAll('.search-item');
        expect(items.length).toBeGreaterThan(0);
    });

    test('should limit search results to 5 items', () => {
        app.allRoomsList = Array.from({length: 20}, (_, i) => `Room${i}`);
        app.handleSearch('Room');
        const items = document.querySelectorAll('.search-item');
        expect(items.length).toBeLessThanOrEqual(5);
    });

    test('should show clear button when search is active', () => {
        app.handleSearch('AB');
        expect(app.elements.clearSearchBtn.classList.contains('hidden')).toBe(false);
    });

    test('should hide clear button when search is empty', () => {
        app.handleSearch('');
        expect(app.elements.clearSearchBtn.classList.contains('hidden')).toBe(true);
    });

    test('should select destination and update UI', () => {
        app.selectDestination('AB203');
        expect(app.selectedDestination).toBe('AB203');
        expect(app.elements.destBadge.textContent).toBe('AB203');
    });

    test('should switch to destination floor on selection', () => {
        app.selectDestination('AB203');
        expect(app.currentFloor).toBeDefined();
    });

    test('should hide search results on destination selection', () => {
        app.selectDestination('AB203');
        expect(app.elements.searchResults.classList.contains('hidden')).toBe(true);
    });

    test('should reset search on cancel', () => {
        app.selectedDestination = 'AB203';
        app.elements.searchInput.value = 'AB';
        app.resetSearch();
        
        expect(app.selectedDestination).toBeNull();
        expect(app.elements.searchInput.value).toBe('');
        expect(app.elements.searchBox.classList.contains('hidden')).toBe(false);
    });
});

describe('NavigationApp - Floor Navigation', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introOverlay"></div>
            <button id="startNavBtn"></button>
            <div id="searchContainer"></div>
            <input id="searchBox" />
            <input id="searchInput" />
            <button id="clearSearchBtn" class="hidden"></button>
            <div id="searchResults" class="hidden"></div>
            <div id="routeBox" class="hidden"></div>
            <div id="destBadge"></div>
            <button id="cancelNavBtn"></button>
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
            <select id="startLocationSelect"></select>
            <button id="navigateBtn"></button>
            <div id="errorToast" class="hidden"></div>
            <button id="menuBtn"></button>
            <div id="dropdownMenu" class="hidden"></div>
            <button id="collapseStepsBtn"><i class="fa-solid fa-chevron-right"></i></button>
            <button id="themeToggleBtn"><i class="fa-solid fa-moon"></i></button>
            <div id="stepsPanel" class="hidden"></div>
            <div id="pathSteps"></div>
            <div id="floorViewer1"></div>
            <div id="floorViewer2" class="hidden"></div>
            <div id="imageWrapper1"></div>
            <div id="imageWrapper2"></div>
            <canvas id="pathCanvas1"></canvas>
            <canvas id="pathCanvas2"></canvas>
            <img id="floorImage1" />
            <img id="floorImage2" />
            <div id="roomLabels1"></div>
            <div id="roomLabels2"></div>
            <div id="floorBadge1">Floor 1</div>
            <div id="floorBadge2">Floor 2</div>
            <div id="mapViewersWrapper"></div>
        `;
        localStorage.clear();
        app = new NavigationApp();
    });

    test('should switch to selected floor', () => {
        app.switchFloor(3);
        expect(app.currentFloor).toBe(3);
    });

    test('should update floor button active state', () => {
        app.switchFloor(2);
        const activeBtn = Array.from(app.elements.floorButtons).find(btn => 
            parseInt(btn.dataset.floor) === 2
        );
        expect(activeBtn.classList.contains('active')).toBe(true);
    });

    test('should remove active class from previous floor button', () => {
        app.switchFloor(1);
        app.switchFloor(2);
        
        const floor1Btn = Array.from(app.elements.floorButtons).find(btn => 
            parseInt(btn.dataset.floor) === 1
        );
        expect(floor1Btn.classList.contains('active')).toBe(false);
    });
});

describe('NavigationApp - Navigation Flow', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introOverlay"></div>
            <button id="startNavBtn"></button>
            <div id="searchContainer"></div>
            <input id="searchBox" />
            <input id="searchInput" />
            <button id="clearSearchBtn" class="hidden"></button>
            <div id="searchResults" class="hidden"></div>
            <div id="routeBox" class="hidden"></div>
            <div id="destBadge"></div>
            <button id="cancelNavBtn"></button>
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
            <select id="startLocationSelect"></select>
            <button id="navigateBtn"></button>
            <div id="errorToast" class="hidden"></div>
            <button id="menuBtn"></button>
            <div id="dropdownMenu" class="hidden"></div>
            <button id="collapseStepsBtn"><i class="fa-solid fa-chevron-right"></i></button>
            <button id="themeToggleBtn"><i class="fa-solid fa-moon"></i></button>
            <div id="stepsPanel" class="hidden"></div>
            <div id="pathSteps"></div>
            <div id="floorViewer1"></div>
            <div id="floorViewer2" class="hidden"></div>
            <div id="imageWrapper1"></div>
            <div id="imageWrapper2"></div>
            <canvas id="pathCanvas1"></canvas>
            <canvas id="pathCanvas2"></canvas>
            <img id="floorImage1" />
            <img id="floorImage2" />
            <div id="roomLabels1"></div>
            <div id="roomLabels2"></div>
            <div id="floorBadge1">Floor 1</div>
            <div id="floorBadge2">Floor 2</div>
            <div id="mapViewersWrapper"></div>
        `;
        localStorage.clear();
        app = new NavigationApp();
    });

    test('should show error if start location not selected', () => {
        app.selectedDestination = 'AB203';
        app.elements.startLocationSelect.value = '';
        app.startNavigation();
        
        expect(app.elements.errorToast.classList.contains('hidden')).toBe(false);
    });

    test('should show error if start and destination are the same', () => {
        app.selectedDestination = 'AB203';
        app.elements.startLocationSelect.value = 'AB203';
        app.startNavigation();
        
        expect(app.elements.errorToast.classList.contains('hidden')).toBe(false);
        expect(app.elements.errorToast.textContent).toContain('must be different');
    });

    test('should show error message for 3 seconds then hide', (done) => {
        app.showError('Test error');
        expect(app.elements.errorToast.classList.contains('hidden')).toBe(false);
        
        setTimeout(() => {
            expect(app.elements.errorToast.classList.contains('hidden')).toBe(true);
            done();
        }, 3500);
    });
});

describe('NavigationApp - Steps Panel', () => {
    let app;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introOverlay"></div>
            <button id="startNavBtn"></button>
            <div id="searchContainer"></div>
            <input id="searchBox" />
            <input id="searchInput" />
            <button id="clearSearchBtn" class="hidden"></button>
            <div id="searchResults" class="hidden"></div>
            <div id="routeBox" class="hidden"></div>
            <div id="destBadge"></div>
            <button id="cancelNavBtn"></button>
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
            <select id="startLocationSelect"></select>
            <button id="navigateBtn"></button>
            <div id="errorToast" class="hidden"></div>
            <button id="menuBtn"></button>
            <div id="dropdownMenu" class="hidden"></div>
            <button id="collapseStepsBtn"><i class="fa-solid fa-chevron-right"></i></button>
            <button id="themeToggleBtn"><i class="fa-solid fa-moon"></i></button>
            <div id="stepsPanel" class="hidden"></div>
            <div id="pathSteps"></div>
            <div id="floorViewer1"></div>
            <div id="floorViewer2" class="hidden"></div>
            <div id="imageWrapper1"></div>
            <div id="imageWrapper2"></div>
            <canvas id="pathCanvas1"></canvas>
            <canvas id="pathCanvas2"></canvas>
            <img id="floorImage1" />
            <img id="floorImage2" />
            <div id="roomLabels1"></div>
            <div id="roomLabels2"></div>
            <div id="floorBadge1">Floor 1</div>
            <div id="floorBadge2">Floor 2</div>
            <div id="mapViewersWrapper"></div>
        `;
        localStorage.clear();
        app = new NavigationApp();
    });

    test('should collapse steps panel', () => {
        app.elements.stepsPanel.classList.remove('hidden');
        app.toggleStepsCollapse();
        
        expect(app.stepsCollapsed).toBe(true);
        expect(app.elements.stepsPanel.classList.contains('collapsed')).toBe(true);
    });

    test('should expand steps panel', () => {
        app.elements.stepsPanel.classList.remove('hidden');
        app.toggleStepsCollapse();
        app.toggleStepsCollapse();
        
        expect(app.stepsCollapsed).toBe(false);
        expect(app.elements.stepsPanel.classList.contains('collapsed')).toBe(false);
    });

    test('should close steps panel and hide dual view', () => {
        app.elements.stepsPanel.classList.remove('hidden');
        app.closeStepsPanel();
        
        expect(app.elements.stepsPanel.classList.contains('hidden')).toBe(true);
        expect(app.stepsCollapsed).toBe(false);
    });
});
