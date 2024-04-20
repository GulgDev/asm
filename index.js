import { REG, CONST } from "./const.js";
import Emulator from "./emulator.js";
import Editor from "./editor.js";

class Calculator {
    constructor(emulator, editor) {
        this.emulator = emulator;
        this.editor = editor;
        this.output = document.getElementById("calculator-output");
    }

    reset() {
        if (emulator.isRunning)
            return;
        this.emulator.reset();
        this.output.innerText = 0;
    }

    input(keyCode) {
        if (emulator.isRunning)
            return;
        this.editor.readOnly = true;
        this.emulator.mov_RV(REG.IN, BigInt(keyCode));
        this.emulator.exec(this.editor.value);
    }

    update() {
        let output = this.emulator.reg[REG.OUT];
        for (const [name, value] of Object.entries(CONST))
            if (output === value) {
                output = name;
                break;
            }
        this.output.innerText = output;
    }
}

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

document.querySelectorAll("[data-keycode]").forEach((button) => {
    button.addEventListener("click", () => device.input(button.getAttribute("data-keycode")));
    button.classList.add("calculator-button-disabled");
});

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
        async test() {
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
Программа запускается каждый раз, когда нажимается кнопка на калькуляторе. В регистре IN содержится код нажатой клавиши:
<table>
    <tr>
        <td>Цифры</td>
        <td>0-9</td>
    </tr>
    <tr>
        <td>=</td>
        <td>10</td>
    </tr>
    <tr>
        <td>+</td>
        <td>11</td>
    </tr>
    <tr>
        <td>-</td>
        <td>12</td>
    </tr>
    <tr>
        <td>*</td>
        <td>13</td>
    </tr>
    <tr>
        <td>/</td>
        <td>14</td>
    </tr>
    <tr>
        <td>C</td>
        <td>15</td>
    </tr>
</table>
Чтобы вывести значение на экран, необходимо записать его в регистр OUT.
Поставить брейкпоинт можно, нажав на номер соответствующей строки. Когда эмулятор дойдёт до строки с брейкпоинтом, выполнение приостановится. Чтобы возобновить выполнение, необходимо нажать кнопку "Продолжить". Текущий брейкпоинт горит синим цветом.
Если в программе есть ошибки, то номера строк с ошибками будут выделены красным цветом. Чтобы увидеть сообщение об ошибке, необходимо навести на номер строки курсор мыши.
Программа состоит из последовательности команд, производящих различные операции с регистрами:
<code>mov a, b ; Переместить из регистра A в регистр B
mov a, 123 ; Поместить 123 в регистр A
</code>
<b>Задание</b>: Написать программу для вывода на дисплей последней нажатой цифры.
`,
        buttons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        async test() {
            for (let i = 0; i < 10; ++i) {
                device.input(i);
                await emulator.finish();
                if (emulator.reg[REG.OUT] !== BigInt(i))
                    return false;
            }
            return true;
        }
    },
    {
        title: "Ввод чисел",
        description: `
Замечательно, пришло время для чего-то посложнее.
Над регистрами также можно производить различные арифметические операции:
<code>add a, b ; Вычесть из регистра A значение регистра B
sub a, b ; Прибавить к регистру A значение регистра B
shl a, b ; Битовый сдвиг влево регистра A на количество бит, указанное в регистре B
shr a, b ; Битовый сдвиг вправо регистра A на количество бит, указанное в регистре B

; Побитовые операции
or a, b ; Побитовое ИЛИ
xor a, b ; Побитовое исключающее ИЛИ
and a, b ; Побитовое И

; Вторым аргументом каждой из этих команд также может быть число:
add a, 741
or b, 147
</code>
В зависимости от результатов последнего выполненного вычисления можно совершать переходы:
<code>jmp lbl ; Безусловный переход
jz lbl ; Перейти, если результат равен нулю
jnz lbl ; Перейти, если результат не равен нулю
jlz lbl ; Перейти, если результат меньше нуля
jgz lbl ; Перейти, если результат больше нуля

.lbl ; Метка, к которой будет осуществлён переход
</code>
<b>mov не обновляет флаги!</b> Чтобы обновить флаги без выполнения операции можно использовать команду tst:
<code>tst a</code>
<b>Задание</b>: Написать программу для ввода числа в калькулятор. При нажатии клавиши с цифрой, цифра должна вставляться в конец числа.
<details>
    <summary>Подсказка</summary>
    Умножьте значение регистра OUT на 10 и прибавьте нажатую цифру.
</details>
`,
        buttons: [],
        async test() {
            let n = 0;
            device.reset();
            const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (let i = 0; i < 10; ++i) {
                const d = digits[Math.floor(Math.random() * digits.length)];
                digits.splice(d, 1);
                n *= 10;
                n += d;
                device.input(d);
                await emulator.finish();
                if (emulator.reg[REG.OUT] !== BigInt(n))
                    return false;
            }
            return true;
        }
    },
    {
        title: "Сложение",
        description: `
Теперь, когда можно вводить любые числа в калькулятор, пришло время для операции сложения.
В калькуляторе все операции происходят так: когда нажата кнопка операции (в этом задании только "+"), если любая кнопка операции была нажата до этого, то произвести операцию и вывести результат на дислей, иначе — ничего не делать. Когда нажата клавиша "=", то вывести результат операции на экран.
<b>Задание</b>: Написать программу для операции сложения.
<details>
    <summary>Подсказка</summary>
    Запишите код клавиши и введённое число (или результат последней операции) в регистры, чтобы потом можно было произвести операцию.
</details>
`,
        buttons: [10, 11],
        async test() {
            let n, sum;
            device.reset();
            for (let i = 0; i < 3; ++i) {
                sum += n;
                n = 0;
                for (let i = 0; i < 8; ++i) {
                    const d = Math.floor(Math.random() * 10);
                    n *= 10;
                    n += d;
                    device.input(d);
                    await emulator.finish();
                }
                device.input(i === 2 ? 10 : 15);
                if (emulator.reg[REG.OUT] !== BigInt(sum))
                    return false;
            }
            return true;
        }
    },
    {
        title: "Конец обучения",
        description: `
Поздравляем, ваше обучение окнчено! Теперь вы можете сами писать любые программы, которые хотите. Дайте волю своему воображению!
`
    }
];

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
    document.querySelectorAll("[data-keycode]").forEach((button) => {
        if (currentStage === lastStage || stages[currentStage].buttons?.includes(Number.parseInt(button.getAttribute("data-keycode"))))
            button.classList.remove("calculator-button-disabled");
    });
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

window.device = new Calculator(emulator, editor);