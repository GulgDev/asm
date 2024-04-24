import { CONST, REG } from "./const.js";
import { createElement, createSpan } from "./dom.js";
import Editor from "./editor.js";
import Emulator from "./emulator.js";

/**  */
export default class Calculator {
    /**
     * Button layout of calculator
     * @type {[number[], { text: string, keyCode: number?, action: string? }[]][]}
     * @private
     */
    layout = [
        [
            [1, 2, 3],
            [
                { text: "C", keyCode: 15 },
                { text: "AC", action: "reset" }
            ]
        ],
        [
            [4, 5, 6],
            [
                { text: "+", keyCode: 11 },
                { text: "-", keyCode: 12 }
            ]
        ],
        [
            [7, 8, 9],
            [
                { text: "*", keyCode: 13 },
                { text: "/", keyCode: 14 }
            ]
        ],
        [
            [0],
            [{ text: "=", keyCode: 10 }]
        ]
    ];

    /**
     * Object to map key codes to buttons
     * @type {Object.<string, HTMLElement>}
     * @private
     */
    buttons = {};

    /**
     * 
     * @param {Emulator} emulator 
     * @param {Editor} editor 
     * @param {HTMLElement} parent 
     */
    constructor(emulator, editor, parent) {
        this.emulator = emulator;
        this.editor = editor;
        parent.appendChild(this.buildDOM());
        this.update();
    }

    buildDOM() {
        return createElement("div", "calculator",
            createElement("div", "calculator-display",
                this.output = createElement("span", "calculator-output")
            ),
            createElement("table", "calculator-buttons",
                this.layout.map(([digits, special]) =>
                    createElement("tr", null,
                        createElement("td", null,
                            createElement("div", null,
                                ...digits.map((digit) => this.buildButtonDOM(digit, digit, false, () => this.input(digit)))
                            )
                        ),
                        createElement("td", null,
                            createElement("div", null,
                                ...special.map(({ text, keyCode, action }) =>
                                    this.buildButtonDOM(text, keyCode, true,
                                        action == null ?
                                            () => this.input(keyCode) :
                                            () => this[action]()
                                    )
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    buildButtonDOM(text, keyCode, special, onClick) {
        let className = "calculator-button";
        if (special)
            className += " calculator-button-special";
        const button = createElement("div", className, createSpan(text));
        button.addEventListener("click", onClick);
        if (keyCode != null) {
            this.buttons[keyCode] = button;
            button.classList.add("calculator-button-disabled");
        }
        return button;
    }

    enableButton(keyCode) {
        this.buttons[keyCode].classList.remove("calculator-button-disabled");
    }

    reset() {
        if (this.emulator.isRunning)
            return;
        this.emulator.reset();
        this.output.innerText = 0;
    }

    input(keyCode) {
        if (this.emulator.isRunning)
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