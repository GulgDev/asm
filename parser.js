import { REG } from "./const.js";

const ARG = {
    REG: 0,
    VAL: 1,
    LBL: 2
};

const commands = {
    mov: {
        mov_RR: [ARG.REG, ARG.REG],
        mov_RV: [ARG.REG, ARG.VAL]
    },
    add: {
        add_RR: [ARG.REG, ARG.REG],
        add_RV: [ARG.REG, ARG.VAL]
    },
    sub: {
        sub_RR: [ARG.REG, ARG.REG],
        sub_RV: [ARG.REG, ARG.VAL]
    },
    shl: {
        shl_RR: [ARG.REG, ARG.REG],
        shl_RV: [ARG.REG, ARG.VAL]
    },
    shr: {
        shr_RR: [ARG.REG, ARG.REG],
        shr_RV: [ARG.REG, ARG.VAL]
    },
    or: {
        or_RR: [ARG.REG, ARG.REG],
        or_RV: [ARG.REG, ARG.VAL]
    },
    and: {
        and_RR: [ARG.REG, ARG.REG],
        and_RV: [ARG.REG, ARG.VAL]
    },
    jmp: {
        jmp: [ARG.LBL]
    },
    jz: {
        jz: [ARG.LBL]
    },
    jnz: {
        jnz: [ARG.LBL]
    },
    jlz: {
        jlz: [ARG.LBL]
    },
    jgz: {
        jgz: [ARG.LBL]
    }
};

const LABEL_REGEX = /^[a-z0-9_]+$/;

function parseArg(type, arg) {
    switch (type) {
        case ARG.REG:
            return REG[arg.toUpperCase()];
        case ARG.VAL:
            return /^-?[0-9]+$/.test(arg) ? BigInt(arg) : parseArg(ARG.REG, arg);
        case ARG.LBL:
            if (LABEL_REGEX.test(arg))
                return arg;
            break;
    }
}

export default function parse(code) {
    const program = [];
    const labels = {};
    const unresolvedJumps = [];
    const lines = code.split("\n");
    for (const lineNumber in lines) {
        let line = lines[lineNumber].replace(/;.*$/, "").trim();
        if (line.endsWith(":")) {
            const label = line.slice(0, -1);
            if (LABEL_REGEX.test(label) && !labels[label]) {
                labels[label] = lineNumber;
                program.push({ op: "nop" });
                continue;
            } else {
                program.push({ op: "err", msg: `Метка уже объявлена в строке ${labels[label]}` });
                continue;
            }
        }
        if (line.length === 0) {
            program.push({ op: "nop" });
            continue;
        }
        const cmd = line.match(/^[a-z]+/)?.[0];
        const info = commands[cmd];
        if (!info) {
            program.push({ op: "err", msg: "Неизвестная команда" });
            continue;
        }
        let op;
        const args = line.slice(cmd.length).split(",").map((arg) => arg.trim());
        const argc = args.length;
        let parsedArgs;
        parseArgs: for (const decl in info) {
            const argTypes = info[decl];
            if (argTypes.length !== argc)
                continue;
            parsedArgs = [];
            for (let i = 0; i < argc; ++i) {
                const arg = parseArg(argTypes[i], args[i]);
                if (arg === undefined)
                    continue parseArgs;
                parsedArgs.push(arg);
            }
            op = decl;
            break;
        }
        if (op) {
            const labelArgs = info[op].map((argType, i) => ({ argType, i })).filter(({ argType }) => argType === ARG.LBL).map(({ i }) => i);
            if (labelArgs.length > 0)
                unresolvedJumps.push({ i: program.length, labelArgs });
            program.push({ op, args: parsedArgs });
        } else
            program.push({ op: "err", msg: "Неверные аргументы" });
    }
    for (const { i, labelArgs } of unresolvedJumps) {
        const { args } = program[i];
        for (const j of labelArgs) {
            const arg = args[j];
            if (labels[arg])
                args[j] = labels[arg];
            else {
                program[i] = { op: "err", msg: "Неизвестная метка" };
                break;
            }
        }
    }
    return program;
}