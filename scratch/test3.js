const fs = require('fs');
const code1 = fs.readFileSync('buildingData.js', 'utf8');
const code2 = fs.readFileSync('pathfinding.js', 'utf8');
eval(code1 + '\n' + code2 + '\n' + `
const result = pathfinder.findShortestPath('AB 505', 'Exam Room');
console.log('Path:', result ? result.path : 'null');
`);
