export default class Editor {
    constructor(container, onChange, onLineClick) {
        this.container = container;
        container.classList.add("editor");
        this.linesContainer = document.createElement("div");
        this.linesContainer.className = "editor-lines";
        container.appendChild(this.linesContainer);
        this.textarea = document.createElement("textarea");
        this.textarea.className = "editor-textarea";
        this.textarea.addEventListener("input", onChange);
        container.appendChild(this.textarea);

        this.onLineClick = onLineClick;

        this.textarea.addEventListener("input", () => this.render());
        this.render();
    }

    get value() {
        return this.textarea.value;
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