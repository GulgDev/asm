import { REG } from "./const.js";
import { parse } from "./parser.js";

export class Emulator {
    pos = 0;
    reg = Object.fromEntries(Object.values(REG).map((reg) => [reg, 0]));
    flags = { zero: false, sign: false };

    mov_RR(reg1, reg2) {
        this.reg[reg1] = this.reg[reg2];
    }

    mov_RV(reg, val) {
        this.reg[reg] = val;
    }

    add_RR(reg1, reg2) {
        this.reg[reg1] += this.reg[reg2];
        this.updateFlags(reg1);
    }

    add_RV(reg, val) {
        this.reg[reg] += val;
        this.updateFlags(reg);
    }

    sub_RR(reg1, reg2) {
        this.reg[reg1] -= this.reg[reg2];
        this.updateFlags(reg1);
    }

    sub_RV(reg, val) {
        this.reg[reg] -= val;
        this.updateFlags(reg);
    }

    shl_RR(reg1, reg2) {
        this.reg[reg1] <<= this.reg[reg2];
        this.updateFlags(reg1);
    }

    shl_RV(reg, val) {
        this.reg[reg] <<= val;
        this.updateFlags(reg);
    }

    shr_RR(reg1, reg2) {
        this.reg[reg1] >>= this.reg[reg2];
        this.updateFlags(reg1);
    }

    shr_RV(reg, val) {
        this.reg[reg] >>= val;
        this.updateFlags(reg);
    }

    jmp(pos) {
        this.mov_RV(REG.IP, pos);
    }

    jz(pos) {
        if (this.flags.zero)
            this.mov_RV(REG.IP, pos);
    }

    jnz(pos) {
        if (!this.flags.zero)
            this.mov_RV(REG.IP, pos);
    }

    jlz(pos) {
        if (this.flags.sign)
            this.mov_RV(REG.IP, pos);
    }

    updateFlags(reg) {
        const val = this.reg[reg];
        this.flags.zero = val === 0;
        this.flags.sign = val < 0;
    }

    reset() {
        for (const reg in this.reg)
            this.reg[reg] = 0;
        for (const flag in this.flags)
            this.flags[flag] = false;
    }

    exec(code) {
        this.reg[REG.IP] = 0;

        const program = parse(code);
        const programSize = program.length;

        const errors = program.map((cmd, i) => ({ ...cmd, line: i + 1 })).filter(({ op }) => op === "err");
        if (errors.length > 0) {
            for (const error of errors)
                alert(`Error at line ${error.line}: ${error.msg}`);
            return;
        }

        while (this.reg[REG.IP] < programSize) {
            const { op, args } = program[this.reg[REG.IP]++];
            if (op !== "nop" && op !== "err")
                this[op].apply(this, args);
        }
    }
}