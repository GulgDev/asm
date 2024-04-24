import { REG } from "./const.js";
import Emulator from "./emulator.js";
import Editor from "./editor.js";
import Calculator from "./calculator.js";
import { stages } from "./tutorial.js";

const debugButtons = document.getElementById("debug-buttons");
const resumeButton = document.getElementById("resume-button");
const stepButton = document.getElementById("step-button");

const regTBody = document.getElementById("reg-table").createTBody();
for (const [name, reg] of Object.entries(REG)) {
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
        const val = BigInt(valueCell.innerText);
        valueCell.innerText = val;
        emulator.mov_RV(reg, val);
        device.update();
    });
}

function updateRegTable() {
    for (const [reg, val] of Object.entries(emulator.reg))
        regTBody.rows.item(reg).lastElementChild.innerText = val;
}

function clearErrors() {
    for (const error of document.getElementsByClassName("line-error"))
        error.classList.remove("line-error");
}

window.reset = () => {
    device.reset();
    updateRegTable();
};

const emulator = new Emulator();
emulator.addEventListener("error", ({ detail: { msg, lineno } }) => {
    const line = editor.getLine(lineno);
    line.classList.add("line-error");
    line.setAttribute("title", msg);
});
emulator.addEventListener("breakpoint", ({ detail: lineno }) => {
    updateRegTable();
    device.update();
    const line = editor.getLine(lineno);
    line.classList.add("breakpoint-current");
    line.scrollIntoViewIfNeeded();
    debugButtons.classList.remove("debug-buttons-disabled");
    editor.highlightLine(lineno);
});
emulator.addEventListener("done", () => {
    updateRegTable();
    device.update();
    debugButtons.classList.add("debug-buttons-disabled");
    editor.removeHighlighting();
    editor.readOnly = false;
});

const editor = new Editor(document.getElementById("editor"));
editor.addEventListener("change", clearErrors);
editor.addEventListener("lineclick", ({ detail: { line, lineno } }) => {
    line.classList.toggle("line-breakpoint");
    emulator.toggleBreakpoint(lineno);
});
editor.addEventListener("lineremove", ({ detail: lineno }) => {
    emulator.removeBreakpoint(lineno);
});

window.device = new Calculator(emulator, editor, document.getElementById("device"));

resumeButton.addEventListener("click", () => {
    document.getElementsByClassName("breakpoint-current").item(0)?.classList.remove("breakpoint-current");
    debugButtons.classList.add("debug-buttons-disabled");
    editor.removeHighlighting();
    emulator.resume();
});

stepButton.addEventListener("click", () => {
    document.getElementsByClassName("breakpoint-current").item(0)?.classList.remove("breakpoint-current");
    emulator.step();
    updateRegTable();
    device.update();
    editor.highlightLine(emulator.ip + 1);
});

const stageDescriptions = document.getElementById("stage-descriptions");

const lastStage = stages.length - 1;

function updateStage() {
    localStorage.setItem("currentStage", currentStage);
    const info = stages[currentStage];
    const description = document.createElement("span");
    description.innerHTML = info.description.trim();
    stageDescriptions.prepend(description);
    const title = document.createElement("h2");
    title.innerText = info.title;
    stageDescriptions.prepend(title);
    info.buttons?.forEach((button) => device.enableButton(button));
}

const savedStage = Number.parseInt(localStorage.getItem("currentStage") ?? 0);
let currentStage = -1;

while (currentStage < savedStage) {
    ++currentStage;
    updateStage();
}

window.test = async () => {
    if (emulator.isRunning || currentStage === lastStage)
        return;
    const callback = stages[currentStage].test;
    if (!callback || await callback()) {
        if (callback)
            alert("Этап успешно пройден!");
        ++currentStage;
        updateStage();
    } else
        alert("Выполните задание, чтобы продолжить");
};

window.skipTutorial = () => {
    if (!confirm("Вы уверены, что хотите пропустить обучение?"))
        return;
    currentStage = lastStage;
    updateStage();
};