import View from "./View.js";
import previewView from "./previewView.js";
import icons from "url:../../img/icons.svg";


class BookmarksView extends View {
    
    // Creates search results on left side
    // Creates the small side tab view items when searching
    _parentElement = document.querySelector(".bookmarks__list");
    _errorMessage = "No bookmarks yet. Find a nice recipe and bookmark it!";
    _successMessage = "";

    addHandlerRender(handler) {
        window.addEventListener("load", handler);
    }

    _generateMarkup() {
        // console.log(this._data);

        return this._data
        .map(function(bookmark) {
            return previewView.render(bookmark, false)
        })
        .join("");
    }
}

export default new BookmarksView();