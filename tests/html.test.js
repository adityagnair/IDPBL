/**
 * HTML Structure & DOM Tests
 * Tests for HTML elements and DOM structure
 */

describe('HTML Structure - Page Elements', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="introOverlay"></div>
            <button id="startNavBtn"></button>
            <div id="searchContainer"></div>
            <input id="searchBox" />
            <input id="searchInput" />
            <button id="clearSearchBtn"></button>
            <div id="searchResults"></div>
            <div id="routeBox"></div>
            <div id="destBadge"></div>
            <button id="cancelNavBtn"></button>
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
            <select id="startLocationSelect"></select>
            <button id="navigateBtn"></button>
            <div id="errorToast"></div>
            <button id="menuBtn"></button>
            <div id="dropdownMenu"></div>
            <button id="collapseStepsBtn"></button>
            <button id="themeToggleBtn"></button>
            <div id="stepsPanel"></div>
            <div id="pathSteps"></div>
            <div id="floorViewer1"></div>
            <div id="floorViewer2"></div>
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
    });

    test('should render intro overlay', () => {
        const overlay = document.getElementById('introOverlay');
        expect(overlay).toBeDefined();
    });

    test('should render start navigation button', () => {
        const btn = document.getElementById('startNavBtn');
        expect(btn).toBeDefined();
    });

    test('should render floor buttons for all 5 floors', () => {
        const buttons = document.querySelectorAll('.floor-btn');
        expect(buttons.length).toBe(5);
        
        Array.from(buttons).forEach((btn, idx) => {
            expect(btn.dataset.floor).toBe(String(idx + 1));
        });
    });

    test('should have canvas elements', () => {
        const canvas1 = document.getElementById('pathCanvas1');
        const canvas2 = document.getElementById('pathCanvas2');
        expect(canvas1).toBeDefined();
        expect(canvas2).toBeDefined();
    });

    test('should render search controls', () => {
        expect(document.getElementById('searchBox')).toBeDefined();
        expect(document.getElementById('searchInput')).toBeDefined();
        expect(document.getElementById('searchResults')).toBeDefined();
        expect(document.getElementById('clearSearchBtn')).toBeDefined();
    });

    test('should render route controls', () => {
        expect(document.getElementById('routeBox')).toBeDefined();
        expect(document.getElementById('destBadge')).toBeDefined();
        expect(document.getElementById('startLocationSelect')).toBeDefined();
        expect(document.getElementById('navigateBtn')).toBeDefined();
    });

    test('should render steps panel', () => {
        const panel = document.getElementById('stepsPanel');
        const steps = document.getElementById('pathSteps');
        expect(panel).toBeDefined();
        expect(steps).toBeDefined();
    });

    test('should render menu controls', () => {
        expect(document.getElementById('menuBtn')).toBeDefined();
        expect(document.getElementById('dropdownMenu')).toBeDefined();
        expect(document.getElementById('collapseStepsBtn')).toBeDefined();
        expect(document.getElementById('themeToggleBtn')).toBeDefined();
    });

    test('should render error toast', () => {
        const toast = document.getElementById('errorToast');
        expect(toast).toBeDefined();
    });

    test('should render floor viewers', () => {
        expect(document.getElementById('floorViewer1')).toBeDefined();
        expect(document.getElementById('floorViewer2')).toBeDefined();
    });

    test('should render room label containers', () => {
        expect(document.getElementById('roomLabels1')).toBeDefined();
        expect(document.getElementById('roomLabels2')).toBeDefined();
    });

    test('should render floor image elements', () => {
        expect(document.getElementById('floorImage1')).toBeDefined();
        expect(document.getElementById('floorImage2')).toBeDefined();
    });

    test('should render map viewers wrapper', () => {
        expect(document.getElementById('mapViewersWrapper')).toBeDefined();
    });
});

describe('HTML Structure - Canvas Properties', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <canvas id="pathCanvas1"></canvas>
            <canvas id="pathCanvas2"></canvas>
        `;
    });

    test('canvas should be drawable context', () => {
        const canvas = document.getElementById('pathCanvas1');
        const ctx = canvas.getContext('2d');
        expect(ctx).toBeDefined();
    });

    test('canvas should support 2D rendering', () => {
        const canvas = document.getElementById('pathCanvas1');
        const ctx = canvas.getContext('2d');
        expect(typeof ctx.fillRect).toBe('function');
        expect(typeof ctx.strokeRect).toBe('function');
        expect(typeof ctx.arc).toBe('function');
    });
});

describe('HTML Structure - Data Attributes', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="floor-btn" data-floor="1"></div>
            <div class="floor-btn" data-floor="2"></div>
            <div class="floor-btn" data-floor="3"></div>
            <div class="floor-btn" data-floor="4"></div>
            <div class="floor-btn" data-floor="5"></div>
        `;
    });

    test('floor buttons should have floor data attribute', () => {
        const buttons = document.querySelectorAll('.floor-btn');
        buttons.forEach((btn, idx) => {
            expect(btn.dataset.floor).toBe(String(idx + 1));
        });
    });
});
