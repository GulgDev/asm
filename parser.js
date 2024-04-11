const commands = {
    "mov": [
        /^[abcd]|out$/,
        /^[abcd]|in$/
    ]
};

export function parse(code) {
    const errors = [];
    const program = [];
    const labels = {};
    let lineNumber = 0;
    parse: for (let line of code.split("\n")) {
        lineNumber++;
        line = line.replace(/;.+$/, "").trim();
        if (line.length === 0)
            continue;
        const cmd = line.match(/^[a-z]/)[0];
        const args = line.slice(cmd.length).split(",").map((arg) => arg.trim());
        const argc = args.length;
        for (let i = 0; i < argc; ++i)
            if (!commands[cmd][i].test(args[i])) {
                errors.push(lineNumber);
                continue parse;
            }
        program.push({ cmd, args });
    }
    return {
        errors,
        program,
        labels
    };
}