async function LoadData(data) {
    let lines = data.split(/\r?\n|\r/g);
    lines.pop();
    lines.pop();
    lines.shift();
    return lines;
}
async function GetDrillholes(lines) {
    let holes = [{ index: 0, x: 0, y: 0 }];
    lines.forEach(e => {
        const [index, x, y] = e.split(" ");
        holes.push({
            index: Number(index),
            x: Number(x),
            y: Number(y)
        });
    });
    return holes;
}
async function timeMatrix(Drillholes) {
    let matrix = [];
    const factor = (10 / 9);
    Drillholes.forEach(elementi => {
        let row = [];
        Drillholes.every(elementj => {
            if (elementj.index < elementi.index) {
                row.push(Math.max(Math.abs(elementi.x - elementj.x) * factor, Math.abs(elementi.y - elementj.y)));
                return true;
            } else return false;
        });
        matrix.push(row);
    });
    return matrix;
}
class HoleDistances {
    constructor(matrix) {
        this.doneList = new Set();
        this.distances = matrix;
    }
    getRow(index) {
        const i = index;
        let row = [];
        for (let j = 0; j < this.distances.length; j++) {
            if (this.doneList.has(j)) continue;
            const data = this.getData(i, j);
            if (data == null) continue;
            row.push({ indexnumber: j, Dist: data });
        }
        return row;
    }
    getData = (x, y) => y > x ? this.distances[y][x] : y < x ? this.distances[x][y] : null;
    deleteRow = (index) => this.doneList.add(index);
}
async function solve(dists) {
    let startPos = 0;
    let stepsDistance = [];
    for (let i = 0; i < dists.length - 1; i++) {
        const kleinste = dists.getRow(startPos).reduce((prev, curr) => prev.Dist > curr.Dist ? curr : prev);
        stepsDistance.push(kleinste.Dist);
        dists.deleteRow(startPos);
        startPos = kleinste.indexnumber;
    }
    dists.deleteRow(startPos);
    return stepsDistance;
}

const getId = (id) => document.getElementById(id);
const addText = (text) => progressText.innerHTML = progressText.innerHTML + text + "<br>";
const [input, startButton, progressText] = [getId("input"), getId("startButton"), getId("ProgressText")];
const result = { time: getId("timeResult"), totaal: getId("totaalResult"), step: getId("stepResult") };
async function run(data) {
    const time1 = Date.now();
    progressText.innerHTML = "";
    const lines = await LoadData(data);
    addText("Loaded lines.");
    const holes = await GetDrillholes(lines);
    addText("Made 'hole 0' the bitholder/start position.<br>Made Drillholes.");
    const distances = await timeMatrix(holes);
    addText("Calculated distance matrix.");
    const holeDistances = new HoleDistances(distances);
    addText("Saved distance matrix.");
    const stepsDistance = await solve(holeDistances);
    addText("Solved shortest route.");
    result.time.innerText = `${(Date.now() - time1) / 1000} Seconden`;
    result.totaal.innerText = `${stepsDistance.reduce((prev, curr) => prev + curr)}`;
    result.step.innerText = `[${Array.from(holeDistances.doneList)}]`;
}
startButton.addEventListener("click", ev => run(input.value))