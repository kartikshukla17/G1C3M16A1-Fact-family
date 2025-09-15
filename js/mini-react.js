/* ===== MINI REACT IMPLEMENTATION ===== */
/**
 * Minimal React implementation for offline educational applets
 * Provides component-based architecture without external dependencies
 */

// React-like createElement function
function createElement(type, props, ...children) {
    const element = document.createElement(type);
    
    // Set properties
    if (props) {
        Object.keys(props).forEach(key => {
            if (key === 'className') {
                element.className = props[key];
            } else if (key === 'style' && typeof props[key] === 'object') {
                Object.assign(element.style, props[key]);
            } else if (key.startsWith('on') && typeof props[key] === 'function') {
                const eventType = key.slice(2).toLowerCase();
                element.addEventListener(eventType, props[key]);
            } else if (key === 'key') {
                // Key is used for reconciliation, not DOM attributes
                return;
            } else {
                element.setAttribute(key, props[key]);
            }
        });
    }
    
    // Add children
    children.forEach(child => {
        if (typeof child === 'string' || typeof child === 'number') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            element.appendChild(child);
        } else if (Array.isArray(child)) {
            child.forEach(c => {
                if (typeof c === 'string' || typeof c === 'number') {
                    element.appendChild(document.createTextNode(c));
                } else if (c instanceof HTMLElement) {
                    element.appendChild(c);
                }
            });
        }
    });
    
    return element;
}

// React-like render function
function render(element, container) {
    if (typeof element === 'function') {
        // If element is a component function, call it
        const componentElement = element();
        container.appendChild(componentElement);
    } else if (element instanceof HTMLElement) {
        container.appendChild(element);
    }
}

// React-like useState hook simulation
function useState(initialValue) {
    let state = initialValue;
    const setState = (newValue) => {
        if (typeof newValue === 'function') {
            state = newValue(state);
        } else {
            state = newValue;
        }
        // Trigger re-render
        if (window.renderApp) {
            window.renderApp();
        }
    };
    return [state, setState];
}

// React-like useEffect hook simulation
function useEffect(callback, dependencies) {
    // Simple implementation - just call the callback
    // In a real implementation, this would track dependencies
    callback();
}

// React-like createContext simulation
function createContext(defaultValue) {
    return {
        Provider: function(props) {
            return props.children;
        },
        Consumer: function(props) {
            return props.children(defaultValue);
        }
    };
}

// React-like useContext simulation
function useContext(context) {
    // Simple implementation - return default value
    return context._currentValue || context.defaultValue;
}

// React-like Fragment simulation
function Fragment(props) {
    const fragment = document.createDocumentFragment();
    if (props.children) {
        if (Array.isArray(props.children)) {
            props.children.forEach(child => {
                if (typeof child === 'string' || typeof child === 'number') {
                    fragment.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    fragment.appendChild(child);
                }
            });
        } else if (typeof props.children === 'string' || typeof props.children === 'number') {
            fragment.appendChild(document.createTextNode(props.children));
        } else if (props.children instanceof HTMLElement) {
            fragment.appendChild(props.children);
        }
    }
    return fragment;
}

// Export React-like object
window.React = {
    createElement,
    render,
    useState,
    useEffect,
    createContext,
    useContext,
    Fragment
};

// Also make createElement available globally for JSX-like usage
window.createElement = createElement;
