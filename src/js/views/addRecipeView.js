import View from "./View.js";
// import icons from "url:../../img/icons.svg";


class AddRecipeView extends View {
    // Helps create page numbers for search results
    _parentElement = document.querySelector(".upload");
    _successMessage = "Recipe was successfully uploaded 👍";

    _window = document.querySelector(".add-recipe-window");
    _overlay = document.querySelector(".overlay");
    _btnOpen = document.querySelector(".nav__btn--add-recipe");
    _btnClose = document.querySelector(".btn--close-modal");

    constructor() {
        super();
        this._addHandlerShowWindow();
        this._addHandlerHideWindow();
    }

    toggleWindow() {
        this._overlay.classList.toggle("hidden");
        this._window.classList.toggle("hidden");
    }

    _addHandlerShowWindow() {
        this._btnOpen.addEventListener("click", this.toggleWindow.bind(this));
    }
    
    _addHandlerHideWindow() {
        this._btnClose.addEventListener("click", this.toggleWindow.bind(this));
        this._overlay.addEventListener("click", this.toggleWindow.bind(this));
    }

    addHandlerUpload(handler) {
        this._parentElement.addEventListener("submit", function(e) {
            e.preventDefault();
            // new FormData method adds all of our info from form to an array of entries
            const dataArr = [...new FormData(this)];
            // This takes array of entries and turns it into an object
            const data = Object.fromEntries(dataArr);
            handler(data);
        });
    }

    _generateMarkup() {
    
    }
};

export default new AddRecipeView();