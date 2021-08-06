import { File } from "mylas";

interface Drillhole {
    index: number,
    x: number,
    y: number;
}
interface DistanceIndex {
    indexnumber: number,
    Dist: number;
}

/**
 * loadfile loads the data file
 * @param filename path to file
 * @returns lines of the file
 */
function LoadFile(filename: string): string[] {
    const lines: string[] = File.loadS(filename).split(/\r?\n|\r/g);
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
    const holes: Drillhole[] = [];
    holes.push({ index: 0, x: 0, y: 0 });
    lines.forEach(e => {
        const [i, x, y] = e.split(" ");
        holes.push({
            index: Number(i),
            x: Number(x),
            y: Number(y)
        });
    });
    return holes;
}

function timeMatrix(Drillholes: Drillhole[]) {
    const factor = Number(10 / 9);
    return Drillholes.map(elementi => {
        const row: number[] = [];
        for (let j = 0; j < Drillholes.length; j++) {
            if (Drillholes[j].index >= elementi.index) break;
            row.push(Math.max(Math.abs(elementi.x - Drillholes[j].x) * factor, Math.abs(elementi.y - Drillholes[j].y)));
        }
        return row;
    });
}

class HoleDistances {
    private distances: number[][];
    public length: number;
    public doneList: Set<number>;
    private doneBuff: Uint8Array;

    constructor(matrix: number[][]) {
        this.doneList = new Set();
        this.doneBuff = new Uint8Array(matrix.length);
        this.distances = matrix;
        this.length = this.distances.length;
    }

    public getRow(index: number): DistanceIndex {
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

    public deleteRow(index: number): void {
        this.doneList.add(index);
        this.doneBuff[index] = 1;
    }
}

function solve(dists: HoleDistances) {
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

const time1 = Date.now();

const lines = LoadFile("./e3795.dat");
const holes = GetDrillholes(lines);
const distances = timeMatrix(holes);

// console.log(distances);

const holeDistances = new HoleDistances(distances);
const stepsDistance = solve(holeDistances);
const steps2 = holeDistances.doneList;
const totaal = stepsDistance;

const time2 = Date.now();
const diff = time2 - time1;


// console.log(steps2);
console.log(totaal);

console.log(`${diff / 1000} Seconden`);
