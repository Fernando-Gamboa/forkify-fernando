import View from "./View.js";
import icons from "url:../../img/icons.svg";



class paginationView extends View {
    // Helps create page numbers for search results
    _parentElement = document.querySelector(".pagination");
    
    addHandlerClick(handler) {
        this._parentElement.addEventListener("click", function(e) {
            // .closest searches up in the tree (looks for parents)
            const btn = e.target.closest(".btn--inline");
            if(!btn) {
                return;
            }
            
            const goToPage = +btn.dataset.goto; // + turns code into Number value
            // console.log(goToPage);
            handler(goToPage);
        })
    }

    _generateMarkup() {
        const curPage = this._data.page;
        const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);
        
        console.log(curPage, numPages);
       
        // Page 1, and there are other pages
        if(curPage === 1 && numPages > 1) {
            return `
            <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
                <span>Page ${curPage + 1}</span>
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>
            <p class="total--pages">${curPage}/${numPages} Pages</p>
          `;
        }
        
        // Last page
        if(curPage === numPages && numPages > 1) {
            return `
            <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${curPage - 1}</span>
            </button>
            <p class="total--pages-last">Last Page</p>
          `;
        }
        
        // Other page (For example: if page (2) is less than the # of total pages (5))
        if(curPage < numPages) {
            return `
            <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${curPage - 1}</span>
            </button>
            <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
                <span>Page ${curPage + 1}</span>
                <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>
            <p class="total--pages-next">${curPage < numPages ? curPage : numPages - (curPage - 1)}/${numPages} Pages</p>
            `;
        }
        
        // Page 1, and there are NO other pages
        return "";
    }
};

export default new paginationView();