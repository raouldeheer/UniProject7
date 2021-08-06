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
    const factor = Number(10 / 9);
    return Drillholes.map(elementi => {
        const row = [];
        for (let j = 0; j < Drillholes.length; j++) {
            if (Drillholes[j].index >= elementi.index) break;
            row.push(Math.max(Math.abs(elementi.x - Drillholes[j].x) * factor, Math.abs(elementi.y - Drillholes[j].y)));
        }
        return row;
    });
}
class HoleDistances {
    constructor(matrix) {
        this.doneList = new Set();
        this.doneBuff = new Uint8Array(matrix.length);
        this.distances = matrix;
        this.length = this.distances.length;
    }
    getRow(index) {
        const kleinste = { indexnumber: 0, Dist: Number.MAX_VALUE };
        for (let j = 0; j < this.length; j++) {
            if (this.doneBuff[j] == 1) continue;
            const data = j > index ? this.distances[j][index] : this.distances[index][j];
            if (data < kleinste.Dist) {
                kleinste.Dist = data;
                kleinste.indexnumber = j;
            }
        }
        return kleinste;
    }
    deleteRow = (index) => {
        this.doneList.add(index);
        this.doneBuff[index] = 1;
    }
}
async function solve(dists) {
    let startPos = 0;
    let stepsDistance = 0;
    for (let i = 0; i < dists.length - 1; i++) {
        dists.deleteRow(startPos);
        const { indexnumber, Dist } = dists.getRow(startPos);
        stepsDistance += Dist;
        startPos = indexnumber;
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
    result.totaal.innerText = `${stepsDistance}`;
    result.step.innerText = `[${Array.from(holeDistances.doneList)}]`;
}
startButton.addEventListener("click", ev => run(input.value))