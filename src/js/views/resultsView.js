import View from "./View.js";
import previewView from "./previewView.js";
import icons from "url:../../img/icons.svg";


class ResultsView extends View {
    
    // Creates search results on left side
    // Creates the small side tab view items when searching
    _parentElement = document.querySelector(".results");
    _errorMessage = "No recipes found for your query! Please try again!";
    _successMessage = "";

    _generateMarkup() {
        // console.log(this._data);

        return this._data
        .map(function(result) {
            return previewView.render(result, false)
        })
        .join("");
    }
}

export default new ResultsView();