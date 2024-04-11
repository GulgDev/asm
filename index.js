import { Reg, Emulator } from "./emulator.js";

class Lexer {

}

class Calculator {
    constructor(emulator) {
        this.emulator = emulator;
    }

    input(keyCode) {
        this.emulator.mov_RV(Reg.IN, keyCode);
        this.emulator.exec(document.getElementById("editor").value);
        document.getElementById("calculator-display").innerText = this.emulator.reg[Reg.OUT];
    }
}

window.calc = new Calculator(new Emulator());