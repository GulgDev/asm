/**
 * @typedef {HTMLElement | Children[]} Children
 */

/**
 * Create a DOM element with given parameters and children
 * @param {string} tagName 
 * @param {string?} className 
 * @param  {...Children} children 
 * @returns {HTMLElement}
 */
export function createElement(tagName, className, ...children) {
    const element = document.createElement(tagName);
    if (className)
        element.className = className;
    children.flat().forEach((child) => element.appendChild(child));
    return element;
}

/**
 * Create a text span
 * @param {string} text 
 * @returns {HTMLSpanElement}
 */
export function createSpan(text) {
    const span = document.createElement("span");
    span.innerText = text;
    return span;
}