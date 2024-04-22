import { REG } from "./const.js";
import parse from "./parser.js";

export default class Emulator extends EventTarget {
    pos = 0;
    swap = 0n;
    reg = Object.fromEntries(Object.values(REG).map((reg) => [reg, 0n]));
    flags = { zero: false, sign: false };
    breakpoints = new Set();
    isRunning = false;

    mov_RR(reg1, reg2) {
        this.reg[reg1] = this.reg[reg2];
    }

    mov_RV(reg, val) {
        this.reg[reg] = val;
    }

    swp(reg) {
        [this.reg[reg], this.swap] = [this.swap, this.reg[reg]];
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

    xor_RR(reg1, reg2) {
        this.reg[reg1] ^= this.reg[reg2];
        this.updateFlags(reg1);
    }

    xor_RV(reg, val) {
        this.reg[reg] ^= val;
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

    tst(reg) {
        this.updateFlags(reg);
    }

    jmp(pos) {
        this.ip = pos;
    }

    jz(pos) {
        if (this.flags.zero)
            this.ip = pos;
    }

    jnz(pos) {
        if (!this.flags.zero)
            this.ip = pos;
    }

    jlz(pos) {
        if (this.flags.sign)
            this.ip = pos;
    }

    jgz(pos) {
        if (!this.flags.sign && !this.flags.zero)
            this.ip = pos;
    }

    updateFlags(reg) {
        const val = this.reg[reg];
        this.flags.zero = val === 0n;
        this.flags.sign = val < 0n;
    }

    reset() {
        this.swap = 0n;
        for (const reg in this.reg)
            this.reg[reg] = 0n;
        for (const flag in this.flags)
            this.flags[flag] = false;
    }

    exec(code) {
        this.ip = 0;

        this.program = parse(code);

        const errors = this.program.map((cmd, i) => ({ ...cmd, lineno: i + 1 })).filter(({ op }) => op === "err");
        if (errors.length > 0) {
            for (const error of errors)
                this.dispatchEvent(new CustomEvent("error", { detail: error }));
            return;
        }

        this.isRunning = true;
        if (!this.checkBreakpoint())
            this.resume();
    }

    toggleBreakpoint(i) {
        if (this.breakpoints.has(i))
            this.breakpoints.delete(i);
        else
            this.breakpoints.add(i);
    }

    removeBreakpoint(i) {
        this.breakpoints.delete(i);
    }

    checkBreakpoint() {
        const lineno = this.ip + 1;
        if (this.breakpoints.has(lineno)) {
            this.dispatchEvent(new CustomEvent("breakpoint", { detail: lineno }));
            return true;
        }
        return false;
    }

    resume() {
        while (this.step()) { }
    }

    step() {
        if (!this.isRunning)
            return false;
        this.skipBreakpoint = false;
        const { op, args } = this.program[this.ip++];
        if (op !== "nop" && op !== "err")
            this[op].apply(this, args);
        if (this.ip >= this.program.length) {
            this.dispatchEvent(new Event("done"));
            this.isRunning = false;
            return false;
        }
        if (this.checkBreakpoint())
            return false;
        return true;
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