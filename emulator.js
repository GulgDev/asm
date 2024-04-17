import { REG } from "./const.js";
import parse from "./parser.js";

export default class Emulator extends EventTarget {
    pos = 0;
    reg = Object.fromEntries(Object.values(REG).map((reg) => [reg, 0]));
    flags = { zero: false, sign: false };
    breakpoints = new Set();
    isRunning = false;

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

    or_RR(reg1, reg2) {
        this.reg[reg1] |= this.reg[reg2];
        this.updateFlags(reg1);
    }

    or_RV(reg, val) {
        this.reg[reg] |= val;
        this.updateFlags(reg);
    }

    and_RR(reg1, reg2) {
        this.reg[reg1] &= this.reg[reg2];
        this.updateFlags(reg1);
    }

    and_RV(reg, val) {
        this.reg[reg] &= val;
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

        this.program = parse(code);

        const errors = this.program.map((cmd, i) => ({ msg: cmd.msg, lineno: i + 1 })).filter(({ op }) => op === "err");
        if (errors.length > 0) {
            for (const error of errors)
                this.dispatchEvent(new CustomEvent("error", { detail: error }));
            return;
        }

        this.skipBreakpoint = false;
        this.resume();
    }

    toggleBreakpoint(i) {
        if (this.breakpoints.has(i))
            this.breakpoints.delete(i);
        else
            this.breakpoints.add(i);
    }

    resume() {
        this.isRunning = true;
        const programSize = this.program.length;
        let i;
        while ((i = this.reg[REG.IP]) < programSize) {
            if (!this.skipBreakpoint && this.breakpoints.has(++i)) {
                this.skipBreakpoint = true;
                this.dispatchEvent(new CustomEvent("breakpoint", { detail: i }));
                this.isRunning = false;
                return;
            }
            this.skipBreakpoint = false;
            const { op, args } = this.program[this.reg[REG.IP]++];
            if (op !== "nop" && op !== "err")
                this[op].apply(this, args);
        }
        this.dispatchEvent(new Event("done"));
        this.isRunning = false;
    }

    finish() {
        return new Promise((resolve) => {
            if (this.isRunning)
                this.addEventListener("done", resolve, { once: true });
            else
                resolve();
        });
    }
}