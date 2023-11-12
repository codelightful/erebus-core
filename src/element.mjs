import utils from './utils.mjs';
import http from './http.mjs';
import random from './random.mjs';

const $scope = {};
// Will hold the reference to the parser instance (if available) or false if it is not available
$scope.domParser = null;

/**
 * Utility method to create a HTMLElement from an XMLElement
 * @param {*} xmlElement XMLElement to create the XMLFrom it
 * @returns HTMLElement created from the XMLElement
 */
function xmlToHtml(xmlElement) {
	var htmlElement = document.createElement(xmlElement.tagName);
	// Recreates the attributes
	for (let ndx=0; ndx < xmlElement.attributes.length; ndx++) {
		const xmlAttribute = xmlElement.attributes[ndx];
		htmlElement.setAttribute(xmlAttribute.name, xmlAttribute.value);
	}
	// Recreates the child elements
	for (let ndx=0; ndx < xmlElement.childNodes.length; ndx++) {
		const childXml = xmlElement.childNodes[ndx];
		if (childXml.nodeType === 3) {
			const childText = document.createTextNode(childXml.textContent);
			htmlElement.appendChild(childText);
			continue;
		} else if (childXml.nodeType !== 1) {
			console.warn(`erebus.element.xml_to_html.invalid_node_type[${childXml.nodeType}]`);
			continue;
		}
		const childHtml = xmlToHtml(childXml);
		htmlElement.appendChild(childHtml);
	}
	return htmlElement;
}

/**
 * Parses a string HTML content and returns its content or null if it is not HTML content
 * @param {string} content HTML content to parse
 * @returns DOM elements representing the content
 */
function parseHTML(content) {
	if (!content || typeof (content) !== 'string') {
		return [];
	}
	if ($scope.domParser === null) {
		if (typeof(DOMParser) === 'undefined') {
			$scope.domParser = false;
		} else {
			$scope.domParser = new DOMParser();
		}
	}
	if ($scope.domParser === false) {
		const holder = document.createElement('div');
		holder.innerHTML = content;
		return [...holder.childNodes];
	}
	// NOTE: We use the XML parser, because the HTML parser does not parse certain tags
	// For example: trying to parse a TR or a TD does not work
	// Parsing atomic HTMLElements is crucial for the good work of the element since allows to create atomic portions of content
	const results = [];
	const holder = $scope.domParser.parseFromString(content, 'text/xml');
	for (let ndx=0; ndx < holder.childNodes.length; ndx++) {
		const htmlElement = xmlToHtml(holder.childNodes[ndx]);
		results.push(htmlElement);
	}
	return results;
}

/**
 * Removes all the child nodes from a specific element
 * @param {HTMLElement} target Element to remove the childs from it
 */
function removeAllChild(target) {
	if (!target || !(target instanceof HTMLElement)) {
		return;
	}
	while (target.firstChild) {
		target.removeChild(target.firstChild);
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
	if (clonedElement.nodeType === 1) {
		clonedElement.removeAttribute('id'); // the element identifier should not be cloned
	}
	return clonedElement;
}

/**
 * Creates a block containing error information that can be correlated in the console
 * @param {*} errorCode Code to show in the console to describe the error
 * @param {*} errorInstance Root cause (usually an Error object captured as an exception)
 * @returns HTMLElement containing the error message to be shown in the UI
 */
function createErrorContent(errorCode, errorInstance) {
	const errorId = random.shortId();
	if (errorInstance) {
		console.error(`${errorCode}[${errorId}]`, errorInstance);
	} else {
		console.error(`${errorCode}[${errorId}]`);
	}
	const errorElement = document.createElement('div');
	errorElement.innerHTML = `Error[${errorId}]`;
	return errorElement;
}

/**
 * Internal method to create an ErebusElement based on the data provided
 * @param {*} source String with the selector, string with HTML code (to create a wrapper for it), reference to an HTMLElement
 * @returns
 */
function createErebusElement(source) {
	if (!source) {
		return null;
	} else if (source instanceof ErebusElement) {
		return source;
	} else if (source === 'body' || source === document.body) {
		if (!$scope.body) {
			$scope.body = new ErebusElement(document.body);
		}
		return $scope.body;
	} else if (source instanceof HTMLElement) {
		return new ErebusElement(source);
	} else if (typeof (source) === 'string') {
		var nativeSource;
		if (source.startsWith('<') && source.endsWith('>')) {
			nativeSource = parseHTML(source);
			if (nativeSource.length == 0) {
				nativeSource = createErrorContent('erebus.element.invalid_html.empty_content');
			} else if (nativeSource.length > 1) {
				nativeSource = createErrorContent('erebus.element.invalid_html.multiple_nodes');
			} else {
				nativeSource = nativeSource[0];
			}
		} else if (source.startsWith('#')) {
			nativeSource = document.getElementById(source.substring(1));
			if (!nativeSource) {
				throw new Error(`erebus.element.unknown_element_id[${source}]`);
			}
		} else {
			nativeSource = document.querySelector(source);
			if (!nativeSource) {
				throw new Error(`erebus.element.unknown_selector[${source}]`);
			}
		}
		return new ErebusElement(nativeSource);
	}
}

/** Wrapper to allow common methods to handle HTML content */
class ErebusElement {
	#wrappedElement;
	// Allows to determine if the element is visible or not
	#hidden;

	constructor(target) {
		this.#hidden = false;
		if (target instanceof HTMLElement) {
			this.#wrappedElement = target;
		} else {
			throw new Error('erebus.element.invalid_element[' + typeof (target) + ']');
		}
	}

	/** Allows to obtain the reference to the source wrapped element */
	get source() {
		return this.#wrappedElement;
	}

	/**
	 * Sets the innerHTML on the wrapped element.
	 * This is a compatibility method to maintain consistency and interchangeability with HTMLElement.
	 * @param {string} value String with the HTML content to set
	 */
	set innerHTML(value) {
		this.#wrappedElement.innerHTML = value;
	}

	/** Removes all the content from the current instance */
	clear() {
		this.#wrappedElement.innerHTML = '';
		removeAllChild(this.#wrappedElement);
	}

	/**
	 * Sets the content inside the wrapped element.  This method is preferred over innerHTML
	 * since it cleans the event listener associated with the child nodes.
	 * @param {any} value String with the content to add (text or HTML), a reference to a HTMLElement to set as the content
	 * 			or a reference to another ErebusElement.
	 * @returns The current wrapper instance
	 */
	content(value) {
		this.clear();
		if (typeof (value) === 'string') {
			this.#wrappedElement.innerHTML = value;
			// If javascript content was added as part of the content, then processes it as a script tag
			const innerScripts = this.#wrappedElement.querySelectorAll('script');
			for (var ndx=0; ndx < innerScripts.length; ndx++) {
				const scriptObj = innerScripts[ndx];
				scriptObj.parentNode.removeChild(scriptObj);
				var newScript = document.createElement('script');
				newScript.textContent = scriptObj.textContent;
				this.#wrappedElement.appendChild(newScript);
			}
		} else if (value instanceof HTMLElement) {
			this.#wrappedElement.appendChild(value);
		} else if (value instanceof ErebusElement) {
			this.clear();
			value.setParentNode(this.#wrappedElement);
		}
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
			if (this.#wrappedElement.parentNode) {
				this.#wrappedElement.parentNode.removeChild(this.#wrappedElement);
			}
			return this;
		} else if (typeof (parent) === 'string') {
			parent = createErebusElement(parent);
		} else if (typeof (parent.appendChild) !== 'function') {
			throw new Error('erebus.wrapper.append_to.invalid_parent[' + typeof (parent) + ']');
		}
		parent.appendChild(this.#wrappedElement);
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
	 */
	appendChild(value) {
		if (typeof (value) === 'string') {
			const parsedContent = parseHTML(value);
			for (let idx = 0; idx < parsedContent.length; idx++) {
				const content = parsedContent[idx];
				this.#wrappedElement.appendChild(content);
			}
		} else if (value instanceof HTMLElement) {
			this.#wrappedElement.appendChild(value);
		} else if (value instanceof ErebusElement) {
			this.#wrappedElement.appendChild(value.source);
		}
		return this;
	}

	/**
	 * Adds a listener to the current instance and its wrapped elements
	 * @param {string} eventName Name of the event. For example click.
	 * @param {function} listener Function to invoke when the event is triggered
	 * @param {object} options Optional object with the options to set the listener (see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
	 * @returns Current element instance to write fluid expressions
	 */
	addEventListener(eventName, listener, options) {
		if (!eventName) {
			throw new Error('erebus.element.add_listener.null_event_name');
		} else if (typeof (listener) === 'function') {
			if (options === undefined) {
				options = { capture: false };
			}
			this.#wrappedElement.addEventListener(eventName, listener, options);
		}
		return this;
	}

	/**
	 * Adds a single execution listener to the current instance and its wrapped elements
	 * @param {string} eventName Name of the event. For example click.
	 * @param {function} listener Function to invoke when the event is triggered
	 * @returns Current element instance to write fluid expressions
	 */
	once(eventName, listener) {
		return this.addEventListener(eventName, listener, { capture: false, once: true });
	}

	/**
	 * Registers a handler to be invoked when the element is clicked
	 * @param {function} handler Function to invoke when the event is triggered
	 * @param {object} options Optional object with the options to set the listener (see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
	 * @returns Current element instance to write fluid expressions
	 */
	onClick(handler, options) {
		return this.addEventListener('click', handler, options);
	}

	/** Allows to determine if the element is hidden or not */
	get isHidden() {
		return this.#hidden;
	}

	/** Hides the wrapped elements to make it invisible */
	hide() {
		if (this.#hidden) {
			return;
		}
		this.#hidden = true;
		const computedDisplay = getComputedStyle(this.#wrappedElement).getPropertyValue('display');
		if (computedDisplay && computedDisplay !== 'none') {
			this.#wrappedElement.originalDisplay = computedDisplay;
		}
		this.#wrappedElement.style.display = 'none';
	}

	/** Shows the wrapped elements to make it visible */
	show() {
		this.#hidden = false;
		const computedDisplay = getComputedStyle(this.#wrappedElement).getPropertyValue('display');
		if (!computedDisplay || computedDisplay === 'none') {
			if (this.#wrappedElement.originalDisplay) {
				this.#wrappedElement.style.display = this.#wrappedElement.originalDisplay;
				delete this.#wrappedElement.originalDisplay;
			} else {
				this.#wrappedElement.style.display = 'block';
			}
		}
	}

	/** Clone the current instance */
	clone() {
		const clonedWrapped = cloneHTMLElement(this.#wrappedElement);
		return new ErebusElement(clonedWrapped);
	}

	/** Adds a new CSS class to the HTMLElements wrapped by the current instance */
	addClass(...classes) {
		if (!classes || classes.length === 0) {
			return this;
		}
		for (let cdx = 0; cdx < classes.length; cdx++) {
			const className = utils.trim(classes[cdx]);
			if (!className || typeof (className) !== 'string') {
				continue;
			}
			if (!this.#wrappedElement.className) {
				this.#wrappedElement.className = className;
			} else if (this.#wrappedElement.classList) {
				this.#wrappedElement.classList.add(className);
			} else {
				const regex = new RegExp('(^|\\s)(' + className + ')($|\\s)', 'g');
				if (!regex.test(this.#wrappedElement.className)) {
					this.#wrappedElement.className += ' ' + className;
				}
			}
		}
		return this;
	}

	/** Adds a new CSS class to the HTMLElements wrapped by the current instance */
	removeClass(...classes) {
		if (!classes || classes.length === 0) {
			return this;
		}
		if (!this.#wrappedElement.className) {
			return;
		}
		for (let cdx = 0; cdx < classes.length; cdx++) {
			const className = utils.trim(classes[cdx]);
			if (!className || typeof (className) !== 'string') {
				continue;
			}
			if (this.#wrappedElement.classList) {
				this.#wrappedElement.classList.remove(className);
			} else {
				const regex = new RegExp('(^|\\s)(' + className + ')($|\\s)', 'g');
				if (regex.test(this.#wrappedElement.className)) {
					this.#wrappedElement.className = this.#wrappedElement.className.replace(regex, '');
				}
			}
		}
		return this;
	}

	/**
	 * Set the CSS class name for the HTMLElements wrapped by the current instance
	 * @param {string} value Name of the CSS class to add
	 */
	set className(value) {
		value = utils.trim(value);
		this.#wrappedElement.className = value;
	}

	/**
	 * Loads the content from an external resource inside the element represented by the current instance
	 * @param {string} url String of the source URL used to load content into the current instance
	 */
	async load(url) {
		if (!url) {
			this.content('<div class="erb-badge erb-error">erebus.element.load.no_url</div>');
		}
		try {
			const response = await http.get(url);
			this.content(response);
		} catch (err) {
			var errorBlock = createErrorContent('erebus.element.load.error', err);
			this.content(errorBlock);
		}
	}
}

export default createErebusElement;