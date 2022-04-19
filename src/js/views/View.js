import icons from "url:../../img/icons.svg";

export default class View {
    _data;

    /**
     * Render the received object to the DOM (JSDoc format)
     * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
     * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
     * @returns {undefined | string} A markup string is returned if render=false
     * @this {Object} View instance
     * @author Fernando Gamboa
     * @todo Finish implementation
     */
    render(data, render = true) {
        // Checks if data exist
        // If theres no data or if there is data but that data is an array and it's empty give error on serch results)
        if(!data || (Array.isArray(data) && data.length === 0)) {
            return this.renderError(); 
        }

        this._data = data;
        const markup = this._generateMarkup();

        if(!render) {
            return markup;
        }

        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }

    // Mini algorithm
    update(data) {
        this._data = data;
        const newMarkup = this._generateMarkup();

        // newDOM will become into a big object which is like a virtual DOM
        const newDOM = document.createRange().createContextualFragment(newMarkup);
        const newElements = Array.from(newDOM.querySelectorAll("*"));
        const curElements = Array.from(this._parentElement.querySelectorAll("*"));
        // console.log(curElements);
        // console.log(newElements);

        newElements.forEach(function(newEl, i) {
            const curEl = curElements[i];
            // console.log(curEl, newEl.isEqualNode(curEl));

            // Updates changed TEXT
            if(!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== "") {
                curEl.textContent = newEl.textContent;
            }

            // Updates changed ATTRIBUTES
            if(!newEl.isEqualNode(curEl)) {
                Array.from(newEl.attributes).forEach(function(attr) {
                    return curEl.setAttribute(attr.name, attr.value)
                })
            }
        })
    }

    // Clears text once food is found
    _clear() {
        this._parentElement.innerHTML = "";
    }

    // Generating the loading spinner icon
    renderSpinner() {
        const markup = `
        <div class="spinner">
            <svg>
            <use href="${icons}#icon-loader"></use>
            </svg>
        </div>
        `;
        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }

    // By default the error message given is the one we declared above as a private variable
    renderError(message = this._errorMessage) {
        const markup = `
        <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
        </div>
        `;

        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }
    
    renderMessage(message = this._successMessage) {
        const markup = `
        <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
        </div>
        `;

        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", markup);
    }
}