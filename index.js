import { REG } from "./const.js";
import { Emulator } from "./emulator.js";

class Calculator {
    constructor(emulator) {
        this.emulator = emulator;
    }

    reset() {
        this.emulator.reset();
        document.getElementById("calculator-display").innerText = 0;
    }

    input(keyCode) {
        this.emulator.mov_RV(REG.IN, keyCode);
        this.emulator.exec(document.getElementById("editor").value);
        document.getElementById("calculator-display").innerText = this.emulator.reg[REG.OUT];
    }
}

window.calc = new Calculator(new Emulator());