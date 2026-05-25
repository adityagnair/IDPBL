## 🏢 Building Navigation System

An interactive web-based navigation system for multi-floor buildings with pathfinding between any two locations.

### Features

✅ **Interactive Floor Plans** - View all 5 floors of your building
✅ **Shortest Path Algorithm** - Uses Dijkstra's algorithm to find optimal routes
✅ **Multi-Floor Navigation** - Automatically routes through stairs/elevators between floors
✅ **Visual Path Display** - See the path highlighted directly on the floor plan image
✅ **Room Search** - Find any room in the building from dropdown
✅ **Step-by-Step Directions** - Clear instructions for navigating between locations
✅ **Responsive Design** - Works on desktop and mobile devices

### Getting Started

1. **Update Room Coordinates** in `buildingData.js`:
   - Open each floor image (floor1.jpeg through floor5.jpeg)
   - Identify room names and their pixel coordinates
   - Update the coordinates in `buildingData.js` for each floor
   - Each room needs `{x, y, floor}` coordinates

2. **Open in Browser**:
   ```bash
   # Simply open index.html in your web browser
   # Or serve with a local server:
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Use the App**:
   - Select a start location from the dropdown
   - Select an end location
   - Click "Find Shortest Path"
   - View the highlighted path on the floor plan
   - Follow the step-by-step directions

### File Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # Styling for the UI
├── app.js              # Main application logic
├── buildingData.js     # Building structure and room definitions
├── pathfinding.js      # Dijkstra's algorithm implementation
├── floor1.jpeg         # Floor 1 image
├── floor2.jpeg         # Floor 2 image
├── floor3.jpeg         # Floor 3 image
├── floor4.jpeg         # Floor 4 image
├── floor5.jpeg         # Floor 5 image
└── README.md           # This file
```

### How to Configure Your Building

#### Step 1: Analyze Floor Plans
Open each floor image and identify:
- Room names (visible in image)
- Staircase locations
- Elevator locations
- Approximate pixel coordinates for each room

#### Step 2: Update buildingData.js

For each floor, update the room coordinates:

```javascript
2: {
    name: "Floor 2",
    rooms: {
        "Office 201": { x: 100, y: 150, floor: 2 },
        "Office 202": { x: 250, y: 150, floor: 2 },
        "Lab 201": { x: 350, y: 150, floor: 2 },
        // ... more rooms
    }
}
```

**Coordinate Tips:**
- `x` = horizontal distance in pixels from left edge
- `y` = vertical distance in pixels from top edge
- Use browser developer tools to measure pixel positions
- Be as accurate as possible for better pathfinding

#### Step 3: Update Stairs/Elevator Positions

Update the stairs and elevator locations (ensure they're on all floors):

```javascript
stairs: [
    { x: 550, y: 200, floors: [1, 2, 3, 4, 5] }
],

elevators: [
    { x: 520, y: 250, floors: [1, 2, 3, 4, 5] }
]
```

### Algorithm Details

#### Dijkstra's Algorithm
- Finds the shortest path between two locations
- Considers distance between rooms
- Weights stairs/elevators differently

#### Multi-Floor Navigation
1. Find path to stairs/elevator on current floor
2. Navigate up/down through staircase
3. Find path to destination on target floor

#### Room Connectivity
- Rooms on the same floor are connected if within 400 pixels
- All rooms connect to nearby stairs/elevators
- Stairs/elevators connect all floors they serve

### Path Display

The system displays:
- **Green point** - Starting location
- **Red point** - Destination
- **Blue line** - Path to follow
- **Blue points** - Intermediate waypoints
- **Step-by-step directions** - In the sidebar

### Customization

#### Change Colors
Edit `styles.css`:
```css
.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

#### Add More Features
- Add wheelchair accessibility indicators
- Add time estimates
- Add real-time updates
- Integrate with wayfinding kiosks

### Troubleshooting

**Path not found?**
- Check that rooms are properly connected in buildingData.js
- Ensure stairs/elevators span all floors
- Verify room coordinates are accurate

**Coordinates not matching?**
- Use browser inspector (F12) to check image dimensions
- Remember coordinates are relative to image size
- Test with a simple path first

**Canvas not displaying path?**
- Check browser console for errors
- Ensure image is loaded before drawing
- Verify floor image files are in correct location

### Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

### Future Enhancements

- [ ] Real-time location tracking
- [ ] Integration with beacons/WiFi
- [ ] Accessible routes for wheelchairs
- [ ] Multiple building support
- [ ] Time-based scheduling (avoid busy times)
- [ ] 3D building visualization
- [ ] Print directions

### License

This project is open source and available under the MIT License.

---

**Need help?** Check the browser console (F12) for detailed debug information.
