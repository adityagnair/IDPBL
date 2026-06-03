# 🏢 SmartNav: Indoor Building Navigation System

SmartNav is a lightweight, interactive, client-side indoor navigation system designed for multi-floor buildings. Using custom coordinate mapping and pathfinding algorithms, it helps users locate rooms and guides them step-by-step through corridors, staircases, and elevators.

---

## 🛠️ Tech Stack

The application is built entirely using vanilla web technologies, requiring no compile steps, external database, or server dependencies.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas API](https://img.shields.io/badge/Canvas_API-000000?style=for-the-badge&logo=html5&logoColor=white)
![Font Awesome](https://img.shields.io/badge/Font_Awesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white)

*   **Structure:** Semantic HTML5
*   **Styling:** Custom CSS3 with responsive layout, linear gradients, and a cohesive dark/glassmorphic interface.
*   **Fonts & Icons:** Google Fonts (Outfit) and Font Awesome 6.4.0.
*   **Logic:** Clean ES6 Object-Oriented JavaScript.
*   **Drawing & Map Rendering:** HTML5 Canvas API for real-time path overlays and dynamic scaling.

---

## ✨ Key Features

*   🔄 **Multi-Floor Routing:** Seamlessly computes paths that change floors, routing through available vertical transit nodes (stairs and elevators).
*   🚀 **A\* & Dijkstra Pathfinding:** Uses an optimized **A\*** (A-Star) pathfinding algorithm (with Euclidean distance heuristics) to calculate routes, keeping a fallback **Dijkstra** implementation for verification.
*   🔍 **Interactive Floor Map:** A zoomable, pannable floor plan viewer utilizing mouse drag/wheel controls or touch gestures.
*   🏷️ **Dynamic Room Labels:** Interactive map pins that double as clickable destination selectors.
*   📝 **Step-by-Step Directions:** Generates a list of instructions detailing start points, corridor transits, stair/elevator floor transitions, and arrival states.
*   🛠️ **Integrated Creator Utilities:** Includes built-in developer tools to pick coordinates on floor images and lay out corridor waypoint nodes.

---

## 📂 Repository File Structure

```text
.
├── index.html              # Main application user interface
├── styles.css              # Custom styles and responsive layouts
├── app.js                  # Main UI controller, canvas renderer, and event handlers
├── pathfinding.js          # A* / Dijkstra pathfinder and route details builder
├── buildingData.js         # Map coordinate nodes, rooms, stairs, and elevators
├── coord_picker.html       # Utility to map pixel positions on floor plan images
├── corridor_editor.html    # Utility to layout corridor nodes and orthogonal lines
├── grid_view.html          # Utility that overlays a 200px coordinate grid onto floors
├── view_floors.html        # Simple preview layout of all floor image assets
├── floor1.jpeg             # Background floor plan image for Floor 1
├── floor2.jpeg             # Background floor plan image for Floor 2
├── floor3.jpeg             # Background floor plan image for Floor 3
├── floor4.jpeg             # Background floor plan image for Floor 4
└── floor5.jpeg             # Background floor plan image for Floor 5
```

---

## 🚀 Getting Started

Since the project is completely serverless and dependency-free, it doesn't use package managers (like npm or pip). You can run it locally in seconds:

### Option A: Local File System (Double-click)
1. Clone or download this repository.
2. Double-click the [index.html](file:///d:/Programing%20class/github/IDT/IDPBL%20%281%29/IDPBL/index.html) file to open the application directly in your web browser.

### Option B: Local Web Server (Recommended)
To prevent local CORS warnings in some browsers when loading assets:
*   **Python:** Run `python -m http.server 8000` in the directory, then visit `http://localhost:8000`.
*   **Node.js:** Run `npx serve` or install `live-server`, then navigate to the hosted port.
*   **VS Code:** Install the **Live Server** extension and click **Go Live**.

---

## 💻 Usage & Code Snippets

### 1. Finding the Shortest Path Programmatically
You can compute routes in JavaScript using the `Pathfinder` class:

```javascript
// Ensure buildingData.js and pathfinding.js are loaded
const pf = new Pathfinder();

// Compute the shortest route between Floor 1 and Floor 2 rooms
const startRoom = "AB203";              // Floor 1 room
const endRoom = "MCA Staff Room";       // Floor 2 room

const pathResult = pf.findShortestPath(startRoom, endRoom);

if (pathResult) {
    console.log("Path Nodes:", pathResult.path);
    // Output: ["AB203", "_DOOR_AB203", "_CB_1_519", ..., "MCA Staff Room"]
    console.log("Calculated Distance:", pathResult.distance, "pixels");
} else {
    console.warn("No valid route found.");
}
```

### 2. Extracting Step-by-Step Directions
Format the coordinate array path output into user-friendly instructions:

```javascript
const routeDetails = pf.getPathDetails(pathResult);

console.log("Start Room Floor:", routeDetails.floors[0]);
console.log("End Room Floor:", routeDetails.floors[routeDetails.floors.length - 1]);
console.log("Floor Sequence:", routeDetails.floorChanges); // e.g. "1 → 2"

routeDetails.steps.forEach((step, idx) => {
    // Type can be: 'start', 'move', 'stairs', or 'end'
    console.log(`${idx + 1}. [${step.type.toUpperCase()}] ${step.description}`);
});
/* Output:
   1. [START] Start at AB203
   2. [STAIRS] Take Main Staircase up to Floor 2
   3. [END] Arrive at MCA Staff Room
*/
```

### 3. Adding New Rooms in `buildingData.js`
Room coordinates can be appended directly within the `BUILDING_DATA` object:

```javascript
const BUILDING_DATA = {
    1: {
        name: "Floor 1",
        rooms: {
            "New Lab Office": { x: 480, y: 320, floor: 1 },
            // Add additional rooms with their pixel coordinates...
        }
    },
    // ...
};
```

---

## 🛠️ Map Configuration & Creator Utilities

To customize or expand this mapping system for your own buildings:

1.  **Grid View Layout (`grid_view.html`):** Open this helper page to view all floor plans overlaid with a 200px red grid. Helpful for estimating room pixel coordinates.
2.  **Room Coordinate Picker (`coord_picker.html`):** Load your floor plans, click on room names in the sidebar, and click on the floor image to accurately pinpoint room locations. Press **📋 Copy buildingData.js** to generate the JavaScript configuration file.
3.  **Corridor Path Editor (`corridor_editor.html`):** Place waypoints, connect them, and export corridor path strings to keep corridor navigation restricted to right angles (orthogonal layouts).

---

## 📜 License

This project is open-source and released under the [MIT License](https://opensource.org/licenses/MIT).
