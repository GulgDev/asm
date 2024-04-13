import { REG } from "./const.js";
import Emulator from "./emulator.js";
import Editor from "./editor.js";

class Calculator {
    constructor(emulator, editor) {
        this.emulator = emulator;
        this.editor = editor;
        this.display = document.getElementById("calculator-display");
    }

    reset() {
        this.emulator.reset();
        this.display.innerText = 0;
    }

    input(keyCode) {
        this.emulator.mov_RV(REG.IN, keyCode);
        this.emulator.exec(this.editor.value);
        this.update();
    }

    update() {
        this.display.innerText = this.emulator.reg[REG.OUT];
    }
}

const resumeButton = document.getElementById("resume-button");

const regTBody = document.getElementById("reg-table").createTBody();
for (const [name, reg] of Object.entries(REG)) {
    if (reg === REG.IP)
        continue;
    const row = regTBody.insertRow();
    row.insertCell().innerText = name;
    const valueCell = row.insertCell();
    valueCell.contentEditable = true;
    valueCell.innerText = 0;
    valueCell.addEventListener("keydown", (e) => {
        if (e.code === "Enter") {
            valueCell.blur();
            e.preventDefault();
        }
    });
    valueCell.addEventListener("blur", () => {
        if (!/^-?[0-9]+$/.test(valueCell.innerText) || emulator.isRunning) {
            valueCell.innerText = emulator.reg[reg];
            return;
        }
        const val = Number.parseInt(valueCell.innerText);
        valueCell.innerText = val;
        emulator.mov_RV(reg, val);
        device.update();
    });
}

function updateRegTable() {
    for (const [reg, val] of Object.entries(emulator.reg))
        if (reg != REG.IP)
            regTBody.rows.item(reg - 1).lastElementChild.innerText = val;
}

function clearErrors() {
    for (const error of document.getElementsByClassName("line-error"))
        error.classList.remove("line-error");
}

const emulator = new Emulator(
    (msg, i) => {
        const line = editor.getLine(i);
        line.classList.add("line-error");
        line.setAttribute("title", msg);
    },
    (i) => {
        updateRegTable();
        device.update();
        const line = editor.getLine(i);
        line.classList.add("breakpoint-current");
        line.scrollIntoViewIfNeeded();
        resumeButton.disabled = false;
    },
    () => {
        updateRegTable();
    }
);
const editor = new Editor(document.getElementById("editor"),
    () => {
        clearErrors();
    },
    (line, i) => {
        line.classList.toggle("line-breakpoint");
        emulator.toggleBreakpoint(i);
    }
);

resumeButton.addEventListener("click", () => {
    const currentBreakpoint = document.getElementsByClassName("breakpoint-current").item(0);
    if (!currentBreakpoint)
        return;
    currentBreakpoint.classList.remove("breakpoint-current");
    resumeButton.disabled = true;
    emulator.resume();
});

window.device = new Calculator(emulator, editor);