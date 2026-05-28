const fs = require('fs');
const code1 = fs.readFileSync('buildingData.js', 'utf8');
const code2 = fs.readFileSync('pathfinding.js', 'utf8');
eval(code1 + '\n' + code2 + '\n' + `
const result = pathfinder.dijkstra('AB 505', 'Elevator 2');
console.log('Path:', result ? result.path : 'null');
`);
