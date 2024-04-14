const INDENT = "    ";

export default class Editor {
    constructor(container, onChange, onLineClick) {
        this.container = container;
        container.classList.add("editor");
        this.linesContainer = document.createElement("div");
        this.linesContainer.className = "editor-lines";
        container.appendChild(this.linesContainer);
        this.textarea = document.createElement("textarea");
        this.textarea.className = "editor-textarea";
        this.textarea.addEventListener("keydown", (e) => {
            if (e.code === "Tab") {
                e.preventDefault();
                const dir = this.textarea.selectionDirection;
                const selectionStart = this.textarea.selectionStart;
                let start = this.textarea.selectionStart - 1;
                while (start > 0 && this.textarea.value[start] !== "\n")
                    --start;
                if (this.textarea.value[start] === "\n")
                    ++start;
                const end = this.textarea.selectionEnd;
                const str = this.textarea.value.slice(start, end);
                if (e.shiftKey) {
                    const replacement = str.replace(/^ {1,4}/, "").replace(/\n {1,4}/g, "\n");
                    this.replace(start, end, replacement);
                    this.textarea.selectionStart = selectionStart - str.match(/^ {0,4}/)[0].length;
                } else {
                    this.replace(start, end, INDENT + str.replace(/\n/g, "\n" + INDENT));
                    this.textarea.selectionStart = selectionStart + 4;
                }
                this.textarea.selectionDirection = dir;
            }
        });
        this.textarea.addEventListener("input", onChange);
        container.appendChild(this.textarea);

        this.onLineClick = onLineClick;

        this.textarea.addEventListener("input", () => this.render());
        this.render();
    }

    get value() {
        return this.textarea.value;
    }

    set value(value) {
        this.textarea.value = value;
        this.render();
    }

    replace(start, end, value) {
        this.textarea.selectionStart = start;
        this.textarea.selectionEnd = end;
        document.execCommand("insertText", false, value);
    }

    render() {
        const lineCount = this.value.split("\n").length;
        for (let i = this.linesContainer.childElementCount + 1; i <= lineCount; ++i) {
            const line = document.createElement("span");
            line.className = "editor-line";
            line.innerText = i;
            line.addEventListener("click", () => this.onLineClick?.(line, i));
            this.linesContainer.appendChild(line);
        }
        while (this.linesContainer.childElementCount > lineCount)
            this.linesContainer.lastElementChild.remove();
        this.textarea.style.height = this.linesContainer.scrollHeight + "px";
    }

    getLine(index) {
        return this.linesContainer.children.item(index - 1);
    }
}