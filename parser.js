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
    jmp: {
        jmp: [ARG.LBL]
    }
};

function parseArg(labels, type, arg) {
    switch (type) {
        case ARG.REG:
            if (/^[abcd]|in|out$/.test(arg))
                return REG[arg.toUpperCase()];
            break;
        case ARG.VAL:
            return Number.parseInt(arg) ?? parseArg(ARG.REG, arg);
        case ARG.LBL:
            return labels[arg];
    }
}

export function parse(code) {
    const program = [];
    const labels = {};
    const lines = code.split("\n");
    for (const lineNumber in lines) {
        let line = lines[lineNumber].replace(/;.+$/, "").trim();
        if (line.startsWith(".")) {
            const label = line.slice(1);
            if (/^[a-z_][a-z0-9_]*$/.test(label) && !labels[label]) {
                labels[label] = lineNumber;
                program.push({ op: "nop" });
                continue;
            } else {
                program.push({ op: "err", msg: "Label already defined" });
                continue;
            }
        }
        if (line.length === 0) {
            program.push({ op: "nop" });
            continue;
        }
        const cmd = line.match(/^[a-z]+/)[0];
        const info = commands[cmd];
        if (!info) {
            program.push({ op: "err", msg: "Command not found" });
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
                const arg = parseArg(labels, argTypes[i], args[i]);
                if (arg === undefined)
                    continue parseArgs;
                parsedArgs.push(arg);
            }
            op = decl;
            break;
        }
        if (op)
            program.push({ op, args: parsedArgs });
        else
            program.push({ op: "err", msg: "Wrong arguments" });
    }
    return program;
}