import * as model from "./model.js";
import {MODAL_CLOSE_SEC} from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";
// import {async} from "regenerator-runtime";

// hot module reloading refreshes page without triggering a full page reload on the browser
if(module.hot) {
  module.hot.accept();
}


// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// Creating an async function to fetch data from an API
const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1);

    // If there's no id on url we don't get errors
    if(!id) {
      return;
    }
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view (debugger allows step by step proccess of code USE when stuck!)
    // debugger;
    bookmarksView.update(model.state.bookmarks);
    
    // 2) Loading recipe
    await model.loadRecipe(id);
    
    // 3) Rendering recipe ingredients
    recipeView.render(model.state.recipe);
    // console.log(model.state.recipe);
  }
  catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if(!query) {
      return;
    }

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results (when searching new result the (1) sets to first page of search results)
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(1));
    
    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  }
  catch(err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage) {
    // 3) Render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 4) Render NEW pagination buttons
    paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
  // Adds bookmark only when the recipe is NOT bookmarked
  if(!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  }
  // Removes bookmark only when the recipe IS bookmarked
  else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks);
};

// For when adding your own recipes
const controlAddRecipe = async function(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Chnage ID in the url after uploading new recipe (using history API of browsers)
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  }
  catch(err) {
    console.error("❌", err);
    addRecipeView.renderError(err.message);
  }
};

const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();


// Improvements and feature ideas: Challenges -----

// Simple improvements -----

// 1) Display number of total pages between the pagination buttons (DONE)

// 2) Ability to sort search results by duration or number of ingredients (needs API alteration) (No)

// 3) Perform ingredient validation in view, before submitting the form (No)

// 4) Improve recipe ingredient input: seperate in multiple fields and allow more than 6 ingredients (DONE)


// Additional Features that could be implemented -----

// 1) Shopping list feature: button on recipe to add ingredients to a list (No)

// 2) Weekly meal planning feature: assign recipes to the next 7 days and show on a weekly calendar (No)

// 3) Get nutrition data on each ingredient from spoonacular API and calculate total calories of recipe (Maybe)