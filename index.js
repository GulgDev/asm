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
        this.emulator.mov_RV(REG.IN, Number.parseInt(keyCode));
        this.emulator.exec(this.editor.value);
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
        device.update();
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

document.querySelectorAll("[data-keycode]").forEach((button) => {
    button.addEventListener("click", () => device.input(button.getAttribute("data-keycode")));
});

resumeButton.addEventListener("click", () => {
    const currentBreakpoint = document.getElementsByClassName("breakpoint-current").item(0);
    if (!currentBreakpoint)
        return;
    currentBreakpoint.classList.remove("breakpoint-current");
    resumeButton.disabled = true;
    emulator.resume();
});

const stageDescriptions = document.getElementById("stage-descriptions");

const stages = [
    {
        title: "Вступление",
        description: `
Добро пожаловать в ASM! Это простой эмулятор ассемблера, где вы можете запускать программы на виртуальном калькуляторе.
Эта игра состоит из нескольких этапов. После того, как вы их пройдётё, вы сможете писать другие программы на калькуляторе и изобретать что-то своё.
Нажмите на кнопку <img class="icon" src="run.svg">, чтобы продолжить.
`
    },
    {
        title: "Знакомство с интерфейсом",
        description: `
В этой панели находятся инструкции и задания к этапу. Когда вам кажется, что задание выполнено, нажмите на кнопку <img class="icon" src="run.svg">, чтобы проверить его и перейти на следующий этап.
В центре страницы находится редактор кода. Здесь можно задать программу для калькулятора.
Справа сверху находится сам калькулятор. У него есть дисплей и панель с кнопками. По мере прохождения этапов, вам будет доступно больше кнопок. Кнопка AC сбрасывает состояние калькулятора (обнуляет регистры).
Под ним находятся инструменты отладки, где вы можете посмотреть и изменить значения регистров в таблице.
<b>Задание</b>: Изменить значения регистров A, B, C и D на 1, 2, 3 и 4 соответственно.
`,
        test() {
            return emulator.reg[REG.A] === 1 &&
                emulator.reg[REG.B] === 2 &&
                emulator.reg[REG.C] === 3 &&
                emulator.reg[REG.D] === 4;
        }
    },
    {
        title: "Знакомство с редактором",
        description: `
Отлично, пришло время для освоения редактора кода!
Поставить брейкпоинт можно, нажав на номер соответствующей строки. Когда эмулятор дойдёт до строки с брейкпоинтом, выполнение приостановится. Чтобы возобновить выполнение, необходимо нажать кнопку "Продолжить". Текущий брейкпоинт горит синим цветом.
Если в программе есть ошибки, то номера строк с ошибками будут выделены красным цветом. Чтобы увидеть сообщение об ошибке, необходимо навести на номер строки курсор мыши.
<b>Задание</b>: Написать программу для вывода на дисплей последней нажатой цифры.
<details>
    <summary>Подсказка</summary>
    Умножьте значение регистра OUT на 10 и прибавьте нажатую цифру.
</details>
`,
        buttons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        test() {
            for (let i = 0; i < 10; ++i) {
                device.input(i);
                if (emulator.reg[REG.OUT] !== i)
                    return false;
            }
            return true;
        }
    }
];

function updateStage() {
    //localStorage.setItem("currentStage", currentStage);
    const enabledButtons = new Set();
    for (let i = 0; i <= currentStage; ++i)
        stages[i].buttons?.forEach((button) => enabledButtons.add(button));
    const info = stages[currentStage];
    const description = document.createElement("span");
    description.innerHTML = info.description.trim();
    stageDescriptions.prepend(description);
    const title = document.createElement("h2");
    title.innerText = info.title;
    stageDescriptions.prepend(title);
    document.querySelectorAll("[data-keycode]").forEach((button) => {
        if (enabledButtons.has(Number.parseInt(button.getAttribute("data-keycode"))))
            button.classList.remove("calculator-button-disabled");
        else
            button.classList.add("calculator-button-disabled");
    });
}

let currentStage = Number.parseInt(localStorage.getItem("currentStage") ?? 0);

updateStage();

window.test = () => {
    const callback = stages[currentStage].test;
    if (!callback || callback()) {
        if (callback)
            alert("Этап успешно пройден!");
        ++currentStage;
        updateStage();
    } else
        alert("Выполните задание, чтобы продолжить");
};

window.device = new Calculator(emulator, editor);