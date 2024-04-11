export class Reg {
    static IP = 0;
    static A = 1;
    static B = 2;
    static C = 3;
    static D = 4;
    static IN = 5;
    static OUT = 6;
}


export class Emulator {
    pos = 0;
    reg = Object.fromEntries(Object.keys(Reg).map((reg) => [reg, 0]));

    get ip() {
        return this.reg[Reg.IP];
    }

    mov_RR(regA, regB) {
        this.reg[regA] = this.reg[regB];
    }

    mov_RV(regA, val) {
        this.reg[regA] = val;
    }

    jmp(pos) {
        this.mov_RV(Reg.IP, pos);
    }

    exec(code) {
        const program = [];
        const programSize = program.length;

        while (this.ip < programSize) {
            const cmd = program[++this.ip];
            
        }

        this.postExec?.();
    }
}