import { File } from "mylas";

interface Drillhole {
    index: number,
    x: number,
    y: number
}
interface DistanceIndex {
    indexnumber: number,
    Dist: number
}

/**
 * loadfile loads the data file
 * @param filename path to file
 * @returns lines of the file
 */
function LoadFile(filename: string): string[] {
    let lines: string[] = File.loadS(filename).split(/\r?\n|\r/g);
    lines.pop();
    lines.pop();
    lines.shift();
    return lines;
}

/**
 * this function converts data lines to Drillholes
 * @param lines lines of data
 * @returns list of drilholes
 */
function GetDrillholes(lines: string[]): Drillhole[] {
    let holes: Drillhole[] = [];
    holes.push({
        index: 0,
        x: 0,
        y: 0
    })
    lines.forEach(e => {
        const [index, x, y] = e.split(" ");
        holes.push({
            index: Number(index),
            x: Number(x),
            y: Number(y)
        })
    })
    return holes;
}

function timeMatrix(Drillholes: Drillhole[]) {
    let matrix: number[][] = [];
    const factor = (10 / 9);
    Drillholes.every(elementi => {
        let row: number[] = [];
        Drillholes.every(elementj => {
            if (elementj.index >= elementi.index) {
                return false;
            } else {
                row.push(Math.max(Math.abs(elementi.x - elementj.x) * factor, Math.abs(elementi.y - elementj.y)));
                return true;
            }
        })
        matrix.push(row);
        return true;
    })
    return matrix;
}

class HoleDistances {
    public distances: number[][];
    public length: number;
    public doneList: Set<number>;

    constructor(matrix: number[][]) {
        this.doneList = new Set();
        this.distances = matrix;
        this.length = this.distances.length;
    }

    public getRow(index: number): DistanceIndex[] {
        const i = index;
        let row: DistanceIndex[] = [];
        for (let j = 0; j < this.length; j++) {
            if (this.doneList.has(j)) {
                continue;
            }
            const data = this.getData(i, j);
            if (data == null)
                continue;
            row.push({ indexnumber: j, Dist: data });
        }
        return row;
    }

    public getData(x: number, y: number): number {
        if (y > x) {
            return this.distances[y][x];
        } else if (y < x) {
            return this.distances[x][y];
        } else {
            return null;
        }
    }

    public deleteRow(index: number): void {
        this.doneList.add(index);
    }
}

function solve(dists: HoleDistances) {
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

const time1 = Date.now();

const lines = LoadFile("./e3795.dat");
const holes = GetDrillholes(lines);
const distances = timeMatrix(holes);

// console.log(distances);

const holeDistances = new HoleDistances(distances);
const stepsDistance = solve(holeDistances);
const steps2 = holeDistances.doneList;
const totaal = stepsDistance.reduce((prev, curr) => prev + curr);

const time2 = Date.now();
const diff = time2 - time1;


// console.log(steps2);
console.log(totaal);

console.log(`${diff/1000} Seconden`);
