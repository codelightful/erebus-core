const $scope = {};

/**
 * Parses a string HTML content and returns its content or null if it is not HTML content
 * @param {string} content HTML content to parse
 * @returns DOM elements representing the content
 */
function parseHTML(content) {
	if (!content || typeof (content) !== 'string') {
		return [];
	}
	const holder = document.createElement('div');
	holder.innerHTML = content;
	return [...holder.childNodes];
}

/**
 * Removes all the child nodes from a specific element
 * @param {HTMLElement} Element to remove the childs from it
 */
function removeAllChild(element) {
	if (!element || !(element instanceof HTMLElement)) {
		return;
	}
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

/**
 * Executes a deep copy of an HTMLElement
 * @param {HTMLElement} sourceElement Element to copy
 * @returns Copy of the element
 */
function cloneHTMLElement(sourceElement) {
	if (!sourceElement || !(sourceElement instanceof HTMLElement)) {
		return null;
	}
	const clonedElement = sourceElement.cloneNode(true);
	if(clonedElement.nodeType === 1) {
		clonedElement.removeAttribute('id'); // the element identifier should not be cloned
	}
	return clonedElement;
}

/**
 * Internal method to create an ErebusElement based on the data provided
 * @param {*} source String with the selector, string with HTML code (to create a wrapper for it), reference to an HTMLElement
 * @returns 
 */
function getElement(source) {
	if (!source) {
		return null;
	} else if (source instanceof ErebusElement) {
		return source;
	} else if (source === 'body' || source === document.body) {
		if(!$scope.body) {
			$scope.body = new ErebusElement(document.body);
		}
		return $scope.body;
	} else if (source instanceof HTMLElement) {
		return new ErebusElement(source);
	} else if (typeof (source) === 'string') {
		var nativeSource;
		if (source.startsWith('<') && source.endsWith('>')) {
			nativeSource = parseHTML(source);
		} else if (source.startsWith('#')) {
			nativeSource = document.getElementById(source.substring(1));
			if (!nativeSource) {
				throw Error('erebus.element.unknown_element_id[' + source + ']');
			}
		} else {
			nativeSource = document.querySelectorAll(source);
			if (nativeSource.length === 0) {
				throw Error('erebus.element.unknown_selector[' + source + ']');
			}
		}
		return new ErebusElement(nativeSource);
	}
}

/** Wrapper to allow common methods to handle HTML content */
class ErebusElement {
	#wrappedElements;
	#hidden;

	constructor(element) {
		this.#hidden = false;
		if (element instanceof HTMLElement) {
			this.#wrappedElements = [];
			this.#wrappedElements.push(element);
		} else if (element instanceof NodeList) {
			this.#wrappedElements = Array.from(element);
		} else if (Array.isArray(element)) {
			this.#wrappedElements = element;
		} else {
			throw Error('erebus.element.unknown_type[' + typeof (element) + ']');
		}
	}

	/**
	 * Iterates each wrapped element and invokes a handler that receives each separate instane
	 * @param {function} handler Function that receives each separated HTMLElement wrapped, the function
	 * 			receives the instance and an integer with the index of the element
	 */
	each(handler) {
		for (let wdx = 0; wdx < this.#wrappedElements.length; wdx++) {
			const result = handler(this.#wrappedElements[wdx], wdx);
			if (result === false) {
				break;
			}
		}
	}

	/**
	 * Sets the innerHTML on the wrapped elements
	 */
	set innerHTML(value) {
		this.each(element => {
			element.innerHTML = value;
		});
	}

	/**
	 * Sets the content inside the wrapped elements.  This method is preferred over innerHTML
	 * since it cleans the event listener associated with the child nodes.
	 * @param {*} value String with the content to add (text or HTML), a reference to a HTMLElement to set as the content
	 * 			or a reference to another ErebusElement.
	 * @returns The current wrapper instance
	 */
	content(value) {
		this.each((element, index) => {
			if (typeof (value) === 'string') {
				element.innerHTML = value;
			} else if (value instanceof HTMLElement) {
				removeAllChild(element);
				if (index === 0) {
					element.appendChild(value);
				} else {
					element.appendChild(cloneHTMLElement(value));
				}
			} else if (value instanceof ErebusElement) {
				removeAllChild(element);
				if (index === 0) {
					value.setParentNode(element);
				} else {
					value.clone().setParentNode(element);
				}
			}
		});
		return this;
	}

	/**
	 * Append the current instance to a specific parent
	 * @param {*} parent String with the parent selector, reference to the HTMLElement to use as a parent or
	 * 			reference to an ErebusElement or null to detach the wrapped elements
	 * @returns The current wrapper instance
	 */
	setParentNode(parent) {
		if (!parent) {
			this.each(element => {
				element.parentNode.removeChild(element);
			});
			return this;
		} else if (typeof (parent) === 'string') {
			parent = getElement(parent);
		} else if (typeof (parent.appendChild) !== 'function') {
			throw Error('erebus.wrapper.append_to.invalid_parent[' + typeof (parent) + ']');
		}
		this.each(element => {
			parent.appendChild(element);
		});
		return this;
	}

	/** Alias to the setParent node method that allows to enable compatibility with DOM elements */
	set parentNode(parent) {
		this.setParentNode(parent);
	}

	/**
	 * Append a child element to the wrapped element
	 * @param {*} value String with the HTML element to add or reference to the HTML element to add or 
	 * 			reference to the ErebusElement to add.
	 * @returns 
	 */
	appendChild(value) {
		if (typeof (value) === 'string') {
			const parsedContent = parseHTML(value);
			this.each((element, index) => {
				for (let idx = 0; idx < parsedContent.length; idx++) {
					const content = parsedContent[idx];
					if (index === 0) {
						element.appendChild(content);
					} else {
						element.appendChild(cloneHTMLElement(content));
					}
				}
			});
		} else {
			this.each((element, index) => {
				if (value instanceof HTMLElement) {
					if (index === 0) {
						element.appendChild(value);
					} else {
						element.appendChild(cloneHTMLElement(value));
					}
				} else if (value instanceof ErebusElement) {
					value.each(innerElement => {
						if (index === 0) {
							element.appendChild(innerElement);
						} else {
							element.appendChild(cloneHTMLElement(innerElement));
						}
					});
				}
			});
		}
		return this;
	}

	/** Adds a listener to the current instance and its wrapped elements */
	addEventListener(eventName, listener) {
		if(!eventName) {
			throw Error('erebus.element.add_listener.null_event_name');
		} else if(typeof(listener) === 'function') {
			this.each(element => {
				if (typeof (element.addEventListener) === 'function') {
					element.addEventListener(eventName, listener, false);
				} else if (typeof (element.attachEvent) === 'function') {
					element.attachEvent('on' + eventName, listener);
				}
			});
		}
		return this;
	}

	/** Allows to determine if the element is hidden or not */
	get isHidden() {
		return this.#hidden;
	}

	/** Hides the wrapped elements to make it invisible */
	hide() {
		if(this.#hidden) {
			return;
		}
		this.#hidden = true;
		this.each(element => {
			const computedDisplay = getComputedStyle(element).getPropertyValue('display');
			if(computedDisplay && computedDisplay !== 'none') {
				element.originalDisplay = computedDisplay;
			}
			element.style.display = 'none';
		});
	}

	/** Shows the wrapped elements to make it visible */
	show() {
		this.each(element => {
			const computedDisplay = getComputedStyle(element).getPropertyValue('display');
			console.log('computedDisplay=' + computedDisplay);
			if(!computedDisplay || computedDisplay === 'none') {
				if(element.originalDisplay) {
					element.style.display = element.originalDisplay;
					delete element.originalDisplay;
				} else {
					element.style.display = 'block';
				}
			}
		});
	}

	/** Clone the current instance */
	clone() {
		const clonedWrapped = [];
		this.each(element => {
			clonedWrapped.push(cloneHTMLElement(element));
		});
		return new ErebusElement(clonedWrapped);
	}
}

export default getElement;