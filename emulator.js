import { REG } from "./const.js";
import { parse } from "./parser.js";

export class Emulator {
    pos = 0;
    reg = Object.fromEntries(Object.values(REG).map((reg) => [reg, 0]));

    mov_RR(regA, regB) {
        this.reg[regA] = this.reg[regB];
    }

    mov_RV(regA, val) {
        this.reg[regA] = val;
    }

    jmp(pos) {
        this.mov_RV(REG.IP, pos);
    }

    reset() {
        for (const reg in this.reg)
            this.reg[reg] = 0;
    }

    exec(code) {
        const program = parse(code);
        const programSize = program.length;
        this.reg[REG.IP] = 0;
        while (this.reg[REG.IP] < programSize) {
            const { op, args } = program[this.reg[REG.IP]++];
            if (op !== "nop" && op !== "err")
                this[op].apply(this, args);
        }
    }
}