/**
 * @author Don (dl90)
 * @date March 21, 2020
 * @note Generate tile map
*/
const { run } = require("./pathfinding");

const [row, column] = [30, 20];
const [blocked, movable] = [0, 1];

const start = { x: 0, y: 0 };
const end = { x: column - 1, y: row - 1 };

const difficulty = 0.2;
const numOfBlocked = (Math.round(row * column * difficulty));

const map = genEmpty(row, column, movable);
const mapWithObstacles = genObstacles(map, numOfBlocked, blocked);
console.log(mapWithObstacles);

try {
  console.log(run(start, end, mapWithObstacles));
} catch (err) {
  console.log(err)
}


/**
 * Generates 2D array populated with value
 * @param {Number} row Number of rows
 * @param {Number} column Number of columns
 * @param {Any} value Value inserted to each cell
 */
function genEmpty(row, column, value) {
  const map = [];
  for (let i = 0; i < row; i++) {
    map.push([]);
    for (let j = 0; j < column; j++) {
      map[i].push(value);
    };
  };
  return map
};


/**
 * 
 * @param {Array} map 2D array representing map
 * @param {Number} numOfObstacles Number of obstacles to add to map
 * @param {*} value 
 */
function genObstacles(map, numOfObstacles, value) {
  const seed = [];

  let i = 0
  while (i <= numOfObstacles) {
    const y = String(Math.round(Math.random() * (row - 2) + 1));
    const x = String(Math.round(Math.random() * (column - 2) + 1));
    if (!seed.includes(`${x} ${y}`)) {
      seed.push(`${x} ${y}`);
      i++
    }
  }

  seed.forEach(val => {
    let [x, y] = val.split(" ");
    x = parseInt(x);
    y = parseInt(y);
    map[y][x] = value;
  })

  return map
}
