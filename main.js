// Virtual DOM Implementation
function createVNode(type, props, children) {
    return { type, props: props || {}, children: children || [] };
}

function createDOMNode(vnode) {
    if (typeof vnode === 'string') {
        return document.createTextNode(vnode);
    }
    const element = document.createElement(vnode.type);
    Object.keys(vnode.props).forEach(key => {
        element.setAttribute(key, vnode.props[key]);
    });
    vnode.children.forEach(child => {
        element.appendChild(createDOMNode(child));
    });
    element._vnode = vnode; // Store vnode for diffing
    return element;
}

function patch(oldNode, newVNode) {
    const oldVNode = oldNode._vnode;

    if (!oldVNode) {
        return createDOMNode(newVNode);
    }

    if (oldVNode.type !== newVNode.type) {
        const newNode = createDOMNode(newVNode);
        oldNode.parentNode.replaceChild(newNode, oldNode);
        return newNode;
    }

    const props = newVNode.props;
    const oldProps = oldVNode.props;
    for (let key in oldProps) {
        if (!(key in props)) {
            oldNode.removeAttribute(key);
        }
    }
    for (let key in props) {
        if (props[key] !== oldProps[key]) {
            oldNode.setAttribute(key, props[key]);
        }
    }

    const oldChildren = oldVNode.children;
    const newChildren = newVNode.children;
    const max = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < max; i++) {
        const oldChild = oldNode.childNodes[i];
        const newChildVNode = newChildren[i];

        if (!oldChild && newChildVNode) {
            oldNode.appendChild(createDOMNode(newChildVNode));
        } else if (oldChild && !newChildVNode) {
            oldNode.removeChild(oldChild);
        } else if (oldChild && newChildVNode) {
            if (typeof newChildVNode === 'string' && oldChild.nodeType === Node.TEXT_NODE) {
                if (newChildVNode !== oldChildren[i]) {
                    oldNode.classList.add('fade-out');
                    setTimeout(() => {
                        oldChild.textContent = newChildVNode;
                        oldNode.classList.remove('fade-out');
                        oldNode.classList.add('fade-in');
                        setTimeout(() => oldNode.classList.remove('fade-in'), 500);
                    }, 500);
                }
            } else if (oldChild.nodeType === Node.ELEMENT_NODE) {
                const oldText = oldChild.textContent;
                const newText = newChildVNode.children[0] || '';
                if (oldText !== newText) {
                    oldChild.classList.add('fade-out');
                    setTimeout(() => {
                        patch(oldChild, newChildVNode);
                        oldChild.classList.remove('fade-out');
                        oldChild.classList.add('fade-in');
                        setTimeout(() => oldChild.classList.remove('fade-in'), 500);
                    }, 500);
                } else {
                    patch(oldChild, newChildVNode);
                }
            }
        }
    }

    oldNode._vnode = newVNode;
    return oldNode;
}

// Component with State Management
const componentState = { name: 'Alice' };

function MyComponent(state) {
    return createVNode('div', { class: 'greeting' }, [
        createVNode('span', { class: 'greeting-text' }, [`Hello, ${state.name}!`])
    ]);
}

// Shadow DOM Custom Element
class MyCustomElement extends HTMLDivElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = `
            :host {
                background-color: #ff4444;
                padding: 10px;
                display: block;
            }
            p {
                color: white;
                margin: 0;
            }
            slot {
                color: #00cc00;
            }
        `;
        shadow.appendChild(style);
        const paragraph = document.createElement('p');
        paragraph.textContent = 'This is in shadow DOM';
        shadow.appendChild(paragraph);
        const slot = document.createElement('slot');
        shadow.appendChild(slot);
    }
}
customElements.define('my-element', MyCustomElement, { extends: 'div' });

// Rendering Logic for Virtual DOM
const appContainer = document.getElementById('app');

function renderComponent() {
    const newVNode = MyComponent(componentState);
    if (!appContainer.firstChild) {
        appContainer.appendChild(createDOMNode(newVNode));
    } else {
        patch(appContainer.firstChild, newVNode);
    }
}

// Light DOM State and Update Logic
const lightContent = document.getElementById('light-content');
const dashLine = document.querySelector('.dash-line');
let lightState = 'Projected content from light DOM';

function updateLightContent() {
    lightContent.classList.add('fade-out');
    dashLine.classList.add('active');
    setTimeout(() => {
        lightState = lightState === 'Projected content from light DOM' 
            ? 'Updated light DOM content!' 
            : 'Projected content from light DOM';
        lightContent.textContent = lightState;
        lightContent.classList.remove('fade-out');
        lightContent.classList.add('fade-in');
        setTimeout(() => {
            lightContent.classList.remove('fade-in');
            dashLine.classList.remove('active');
        }, 500);
    }, 500);
}

// Reconciliation Animation Logic
const reconciliationElements = document.querySelectorAll('.node, .vdom, .changes, .actual-dom, .phase, .react-elements');
const flowLine = document.querySelector('.flow-line');

function animateReconciliation() {
    // Reset animation
    reconciliationElements.forEach(el => el.classList.remove('animate'));
    flowLine.classList.remove('active');

    // Animate in sequence with delays
    setTimeout(() => document.querySelector('.app').classList.add('animate'), 0);
    setTimeout(() => document.querySelectorAll('.node').forEach((node, index) => {
        setTimeout(() => node.classList.add('animate'), index * 300);
    }), 500);
    setTimeout(() => document.querySelector('.react-elements').classList.add('animate'), 1500);
    setTimeout(() => document.querySelector('.previous-vdom').classList.add('animate'), 2000);
    setTimeout(() => document.querySelector('.new-vdom').classList.add('animate'), 2500);
    setTimeout(() => document.querySelector('.changes').classList.add('animate'), 3000);
    setTimeout(() => document.querySelector('.actual-dom').classList.add('animate'), 3500);
    setTimeout(() => document.querySelector('.render-phase').classList.add('animate'), 2000);
    setTimeout(() => document.querySelector('.commit-phase').classList.add('animate'), 3500);
    setTimeout(() => flowLine.classList.add('active'), 2000);
}

// Initial Render
renderComponent();

// Event Listeners
document.getElementById('update-btn').addEventListener('click', () => {
    componentState.name = componentState.name === 'Alice' ? 'Bob' : 'Alice';
    renderComponent();
});

document.getElementById('update-light-btn').addEventListener('click', updateLightContent);
document.getElementById('animate-reconciliation-btn').addEventListener('click', animateReconciliation);