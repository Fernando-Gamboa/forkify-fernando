import {async} from "regenerator-runtime";
import {API_URL, RES_PER_PAGE, KEY} from "./config.js";
// import {getJSON, sendJSON} from "./helpers.js";
import {AJAX} from "./helpers.js";


export const state = {
    recipe: {},
    search: {
        query: "",
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: [],
};


// This recipe code below is to try and make the titles of the object a bit cleaner and less cluttered -----------
const createRecipeObject = function(data) {
    
    const {recipe} = data.data;
        return {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            sourceUrl: recipe.source_url,
            image: recipe.image_url,
            servings: recipe.servings,
            cookingTime: recipe.cooking_time,
            ingredients: recipe.ingredients,
            ...(recipe.key && {key: recipe.key}),
        }
};


// LOADS RECIPES -------------------------------------------------------------------------------------------------
export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`)        
        state.recipe = createRecipeObject(data);

        // This will allow for every book mark to be set to true or false
        // some() means ANY so if any of the "BLANK" results match return result or true
        if(state.bookmarks.some(function(bookmark) {
            return bookmark.id === id;
        })) {
            return state.recipe.bookmarked = true;
        }
        else {
            state.recipe.bookmarked = false;
        }

        console.log(state.recipe);

        // Getting nutrition facts from ingredients loaded from selected food recipe
        // First, reset nutObj values back to 0 in order to properly add up nutrition facts from each selected
        nutObj.cal = 0;
        nutObj.fat = 0;
        nutObj.sat = 0;
        nutObj.cho = 0;
        nutObj.sod = 0;
        nutObj.car = 0;
        nutObj.fib = 0;
        nutObj.sug = 0;
        nutObj.pro = 0;

        // Then, iterate through each ingredient and proper pass it through the foody function API
        state.recipe.ingredients.map(function(i, index) {
            foody(`${i.quantity} ${i.unit} ${i.description}`).then(() => console.log(nutObj));
            // console.log(i);
        })
        // console.log(Object.entries(state.recipe));
    }
    catch(err) {
        console.error(`${err} ❌❌❌`);
        throw err;
    }
};


// LOADS SEARCH RESULTS ------------------------------------------------------------------------------------------
export const loadSearchResults = async function(query) {
    try {
        state.search.query = query;

        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        // console.log(data);

        state.search.results = data.data.recipes.map(function(rec) {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && {key: rec.key}),
            }
        });
        // Another method of setting search results page back to first page
        // state.search.page = 1;
    }
    catch(err) {
        console.error(`${err} ❌❌❌`);
        throw err;
    }
};


// GET SEARCH RESULT PAGE BACK -----------------------------------------------------------------------------------
export const getSearchResultsPage = function(page = state.search.page) {
    state.search.page = page;

    // state.search.resultsPerPage = 10
    const start = (page -1) * state.search.resultsPerPage // 0
    const end = (page * state.search.resultsPerPage) // 9

    return state.search.results.slice(start, end);
};


// UPDATE SERVINGS -----------------------------------------------------------------------------------------------
export const updateServings = function(newServings) {
    state.recipe.ingredients.forEach(function(ing) {
        ing.quantity = ing.quantity * newServings / state.recipe.servings;
        // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
    })

    // Update nutrition label based on servings
    nutObj.cal = nutObj.cal * newServings / state.recipe.servings;
    nutObj.fat = nutObj.fat * newServings / state.recipe.servings;
    nutObj.sat = nutObj.sat * newServings / state.recipe.servings;
    nutObj.cho = nutObj.cho * newServings / state.recipe.servings;
    nutObj.sod = nutObj.sod * newServings / state.recipe.servings;
    nutObj.car = nutObj.car * newServings / state.recipe.servings;
    nutObj.fib = nutObj.fib * newServings / state.recipe.servings;
    nutObj.sug = nutObj.sug * newServings / state.recipe.servings;
    nutObj.pro = nutObj.pro * newServings / state.recipe.servings;
    
    state.recipe.servings = newServings;
};


// This will allow to save the bookmarks into the browsers local storage -----------------------------------------
const persistBookmarks = function() {
    localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};


// ADDS RECIPES TO LOCAL STORAGE WITH BOOKMARK FUNCTION ----------------------------------------------------------
export const addBookmark = function(recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);
    
    // Add recipe to localStorage (this was set on top of if statement below)
    // If issues occur regarding localStorage move this function under the if statement
    persistBookmarks();
    
    // Mark current recipe as bookmark
    if(recipe.id === state.recipe.id) {
        return state.recipe.bookmarked = true;
    }
};


// DELETE RECIPE FROM LOCAL STORAGE ------------------------------------------------------------------------------
export const deleteBookmark = function(id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(function(el) {
        return el.id === id;
    })
    state.bookmarks.splice(index, 1);
    
    // Delete recipe from localStorage (this was set on top of if statement below)
    // If issues occur regarding localStorage move this function under the if statement
    persistBookmarks();
    
    // Mark current recipe as NOT a bookmark anymore
    if(id === state.recipe.id) {
        return state.recipe.bookmarked = false;
    }
};


// Function to add bookmarks to local storage on browser ---------------------------------------------------------
const init = function() {
    const storage = localStorage.getItem("bookmarks");
    if(storage) {
        // .parse converts string back into an object
        return state.bookmarks = JSON.parse(storage);
    }
};
// debugger;
init();
console.log("localStorage recipes: ", state.bookmarks); 
console.log("To delete go to model.js line 170");


// Function to delete all local storage bookmarks at once --------------------------------------------------------
const clearBookmarks = function() {
    localStorage.clear("bookmarks");
};
// clearBookmarks();





// START EDITED/ ADDED THIS SECTION TO EXPERIMENT AND ADD CERTAIN FUNCTIONALITIES --------------------------------
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------

const ingredients = [];
const nutObj = {
    cal: 0,
    fat: 0,
    sat: 0,
    cho: 0,
    sod: 0,
    car: 0,
    fib: 0,
    sug: 0,
    pro: 0,
};
const quan = [];
const uni = [];
const nam = [];
const compare = [];


// Adding our own recipe -----------------------------------------------------------------------------------------
export const uploadRecipe = async function(newRecipe) {
    try {
        // INSTRUCTORS VERSION --------------------------------------------------------
        // const ingredients = Object.entries(newRecipe)
        // .filter(function(entry) {
        //     return entry[0].startsWith("ingredient") && entry[1] !== "";
        // })
        // .map(function(ing) {
        //     // const ingArr = ing[1].replaceAll(" ", "").split(",");
        //     const ingArr = ing[1].split(",").map(function(el) {
        //         return el.trim();
        //     })
            
        //     if(ingArr.length !== 3) {
        //         throw new Error("Wrong ingredient format! Please use the correct format!");
        //     }

        //     console.log(ingArr);
            
        //     const [quantity, unit, description] = ingArr;
            
        //     return {quantity: quantity ? +quantity : null, unit, description};
        // });
        // INSTRUCTORS VERSION --------------------------------------------------------

        
        // MY VERSION OF INPUTS -------------------------------------------------------
        
        // This prints after clicking upload button
        // console.log("UPLOAD BUTTON WAS PRESSED ---");

        ingredients.map(function(i, index) {
            foody(`${i.quantity} ${i.unit} ${i.description}`).then(() => console.log(nutObj));
        })


        // const once = function(){
        //     quan.map(function(q, index) {
        //         const u = uni[index];
        //         const n = nam[index];
        //         ingredients.push({quantity: +q, unit: u, description: n});
        //     })
        // };
        // once();

        // console.log("This is ingredients array: ", ingredients);
        // console.log("This is array:", quan);
        // console.log("This is array:", uni);
        // console.log("This is array:", nam);

        // MY VERSION OF INPUTS -------------------------------------------------------


        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };
        
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    }
    catch(err) {
        throw err;
    }
}


// ATTEMPT TO ADD EXTRA INGREDIENT SLOTS -------------------------------------------------------------------------
// const start = document.querySelector(".upload__heading1");
// const btnPlus = document.querySelector(".btn--add-ingredient");
// let ingCount = 1;

// btnPlus.addEventListener("click", function() {
//     console.log("HELLO WORLD");
//     const mark = `<label>Ingredient ${ingCount++}</label>
//                     <input
//                         type="text"
//                         required
//                         name="ingredient-1"
//                         placeholder="Format: Quantity, Unit (Kg, Cup), Name"
//                     />`

//     start.insertAdjacentHTML("afterend", mark);
// })



// CHANGE INGREDIENTS INPUT MENU -------------------------------------------------------------------------
const addRecipeWindow2 = document.querySelector(".add-recipe-window2");
const overlay2 = document.querySelector(".overlay2");
const doneBtn = document.querySelector(".upload-ingredients__btn");
const closeModal = document.querySelector(".btn--close-modal2");
const byClass = document.getElementsByClassName("ing-1");
const byInput = document.getElementsByClassName("in");


// Counter to keep track of how many clicks on each ingredient in order to later delete, etc.
const counts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
}


// FUNCTION TO HELP DELETE PREVIOUS OBJECT WHEN EDITING INGREDIENT -----------------------------------------------
const editIngredient = function() {
    if(!input2.placeholder.includes(",")) {
        return;
    }

    const inputArr = input2.placeholder.split(", ");
    console.log(inputArr);
    const [b,a,l] = inputArr;
    compare.push({quantity: +b, unit: a, description: l});

    compare.map(function(i, index) {
        // console.log(i);

        // Comparing objects
        // console.log(JSON.stringify(i) === JSON.stringify(ingredients[index]));

        if(i.quantity === ingredients[index].quantity && i.unit === ingredients[index].unit && i.description === ingredients[index].description) {
            // console.log("HELLO WORLD", i, ingredients[index]);
            // console.log(ingredients);

            // Find the object in array and delete
            const ingIndex = ingredients.indexOf(ingredients[index]);
            if(ingIndex > -1) {
                ingredients.splice(ingIndex, 1); // 2nd parameter means remove one item only
            }
            // console.log("FINAL INGREDIENTS LIST", ingredients);
        }
    })
};


// DELETE ENTRY FOR EDIT -----------------------------------------------------------------------------------------
const checkClick = function(ingClicked, ingText) {
    if(+ingClicked === +ingClicked) { // compare to input.name html (optional)
        // console.log(counts[ingClicked]); // output: 0
        if(counts[ingClicked] > 0) {
            // console.log("YOU CLICKED ME TWICE!");
            editIngredient();
        }
        counts[ingClicked] = counts[ingClicked] + 1;
        // console.log(`Point added to ${ingText}!`);
    }
};


// ITERATE THROUGH INGREDIENTS -----------------------------------------------------------------------------------
let input2 = [];
const each = function() {
    // For of loop version --------------------------------------------------
    for(const label of byClass) {
        label.addEventListener("click", function(e) {
            overlay2.classList.remove("hidden");
            addRecipeWindow2.classList.remove("hidden");
            // console.log("hi");
            // console.log(label);

            // console.log("e.target here:", e.target.getAttribute("id"));
            for(const input of byInput) {
                // console.log(input.getAttribute("id"));
                if(input.getAttribute("id") === e.target.getAttribute("id")) {
                    // console.log(e.target);
                    // console.log(input);
                    input2 = input;

                    checkClick(e.target.getAttribute("name"), e.target.textContent);
                    
                }
            }
        })
    }

    // For loop classic version ---------------------------------------------
    // for(let index = 0; index < byClass.length; index++) {
    //     byClass[index].addEventListener("click", function(e) {
    //         overlay2.classList.remove("hidden");
    //         addRecipeWindow2.classList.remove("hidden");
    //         console.log("hi");

    //         console.log("e.target here:", e.target.getAttribute("id"));
            
    //         const input = byInput[index];
    //             console.log(input.getAttribute("id"));
    //         if(input.getAttribute("id") === e.target.getAttribute("id")) {
    //             console.log(e.target);
    //             console.log(input);
    //             input2 = input;
    //         }
    //     })
    // }
}
each();


// CLOSE BUTTON FOR INGREDIENTS INPUT OVERLAY --------------------------------------------------------------------
closeModal.addEventListener("click", function() {
    overlay2.classList.add("hidden");
    addRecipeWindow2.classList.add("hidden");
    console.log("hi");
})


// DONE BUTTON FOR INGREDIENTS INPUT -----------------------------------------------------------------------------
doneBtn.addEventListener("click", function(e) {
    e.preventDefault();
    overlay2.classList.add("hidden");
    addRecipeWindow2.classList.add("hidden");
    // console.log("hi");
    // console.log(document.querySelector(".quantity-box").value);
    // console.log(document.querySelector(".unit-box").value);
    // console.log(document.querySelector(".name-box").value);

    // Pushing values into array
    quan.push(document.querySelector(".quantity-box").value);
    uni.push(document.querySelector(".unit-box").value);
    nam.push(document.querySelector(".name-box").value);

    // Adds values into placeholder
    input2.placeholder =
    document.querySelector(".quantity-box").value + ", " +
    document.querySelector(".unit-box").value +  ", " +
    document.querySelector(".name-box").value;

    const once = function(){
        quan.map(function(q, index) {
            const u = uni[index];
            const n = nam[index];
            ingredients.push({quantity: +q, unit: u, description: n});
        })
    };
    once();


    // Remove from here and put on upload button
    // When click on nutrition button sum up the calories
    // WHY? Because you dont want to upload calories everytime done button it set because cant edit
    // It's better to run it thorugh the API once the decided amount is set
    // One problem is having the pop function not working out of this function
    // NVM I THINK JUST COMPLETELY DELETING NUTINGREDIENTS AND USING INGREDIENTS WOULD SOLVE IT
    // ingredients.map(function(i, index) {
    //     foody(`${i.quantity} ${i.unit} ${i.description}`).then(() => console.log(nutObj.cal));
    // })
    

    // Remove values after added to ingredients to prevent repeats
    quan.pop();
    uni.pop();
    nam.pop();

    // console.log(ingredients);

    // Clear the input fields after done button has been submitted
    document.querySelector(".quantity-box").value = "";
    document.querySelector(".unit-box").value = "";
    document.querySelector(".name-box").value = ""; 
})

// console.log(byClass);
// console.log(document.getElementById("in-1").value);





// START SPOONACULAR API -----------------------------------------------------------------------------------------

// Uses API to pull nutrtional facts from foods ------------------------------------------------------------------
const foody = async function(food) {
    try {
        // Recipes baised on ingredient name (yogurt) ---
        // const request = await fetch("https://api.spoonacular.com/food/products/search?query=yogurt&apiKey=3e11bfc77e0141e7ad71314337532ea2");

        // Finds ingredient baised on ID ---
        // const request = await fetch("https://api.spoonacular.com/food/ingredients/9266/information?amount=1&unit=&apiKey=3e11bfc77e0141e7ad71314337532ea2");

        // Finds various foods matching the ingrrdient picked (banana) ---
        // const request = await fetch("https://api.spoonacular.com/food/ingredients/search?query=banana&apiKey=3e11bfc77e0141e7ad71314337532ea2");


        // Gets text and converts it to nutrition of food ---
        const request = await fetch(`https://api.spoonacular.com/recipes/parseIngredients?apiKey=3e11bfc77e0141e7ad71314337532ea2&ingredientList=${food}&servings=${1}&includeNutrition=${true}`, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    // 'Content-Type': 'application/json'
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
        });

        const [req] = await request.json();

        if(!request.ok) {
            throw new Error(`${req.message} (${request.status})`);
        }

        // Log in console to see the fetched promise/request
        // console.log(req.nutrition.nutrients[33].amount);
        // console.log(req);
        
        // Properly iterate through ingredients and add corresponding nutrition
        req.nutrition.nutrients.map(function(i, index) {
            if(i.name === "Calories") {
                nutObj.cal += i.amount;
            }
            if(i.name === "Fat") {
                nutObj.fat += i.amount;
            }
            if(i.name === "Saturated Fat") {
                nutObj.sat += i.amount;
            }
            if(i.name === "Cholesterol") {
                nutObj.cho += i.amount;
            }
            if(i.name === "Sodium") {
                nutObj.sod += i.amount;
            }
            if(i.name === "Carbohydrates") {
                nutObj.car += i.amount;
            }
            if(i.name === "Fiber") {
                nutObj.fib += i.amount;
            }
            if(i.name === "Sugar") {
                nutObj.sug += i.amount;
            }
            if(i.name === "Protein") {
                nutObj.pro += i.amount;
            }
        })
        // console.log(request);

    }
    catch(err) {
        console.log(err);
    }
}
// foody("2 tbsp peanut butter");



// Converts amounts based on units through the API ---------------------------------------------------------------
const convertAmounts = async function() {
    try{
        const request = await fetch(`https://api.spoonacular.com/recipes/convert?ingredientName=${"flour"}&sourceAmount=${2.5}&sourceUnit=${"cups"}&targetUnit=${"grams"}&apiKey=3e11bfc77e0141e7ad71314337532ea2`);

            const req = await request.json();
            console.log(req);
            // console.log(request);

    }
    catch(err) {
        console.log(err);
    }
}
// convertAmounts();


// Gathers a nutrition label image from API ----------------------------------------------------------------------
const nutritionalFactsLabel = async function() {
    try {
        // Nutrition label image ---
        // const request = await fetch(`https://api.spoonacular.com/recipes/${1003464}/nutritionLabel.png?apiKey=3e11bfc77e0141e7ad71314337532ea2`, {
        //         headers: {
        //             // 'Content-Type': 'application/json'
        //             // 'Content-Type': 'application/x-www-form-urlencoded',
        //             'Content-Type': 'image/png',
        //             'Accept': 'image/png',
        //         },
        // });

        // Nutrition label widget ---
        const request = await fetch(`https://api.spoonacular.com/recipes/${641166}/nutritionLabel?apiKey=3e11bfc77e0141e7ad71314337532ea2`, {
                headers: {
                    // 'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                    // 'Content-Type': 'image/png',
                    // 'Accept': 'image/png',
                    'Content-Type': 'text/html',
                },
        });

        console.log(request);
    }
    catch(err) {
        console.log(err);
    }
}
// nutritionalFactsLabel();


// BUTTON FOR NUTRITION FACTS LABEL ------------------------------------------------------------------------------
const addRecipeWindow3 = document.querySelector(".add-recipe-window3");
const overlay3 = document.querySelector(".overlay3");
const closeModal3 = document.querySelector(".btn--close-modal3");
const nutBtn = document.querySelector(".nut-label__btn");
const nutLabel = document.querySelector(".performance-facts");


// Button to open nutrition facts overlay ------------------------------------------------------------------------
const ingredientsLabel = function() {
    nutBtn.addEventListener("click", function() {
        
        if(nutObj.cal < 1) {
            renderLabel("There's no nutritional facts at the moment!");
            // renderLabel(labelMarkup(nutObj.cal, nutObj.fat, nutObj.sat, nutObj.cho, nutObj.sod, nutObj.car, nutObj.fib, nutObj.sug, nutObj.pro));

        }
        else {
            renderLabel(labelMarkup(nutObj.cal, nutObj.fat, nutObj.sat, nutObj.cho, nutObj.sod, nutObj.car, nutObj.fib, nutObj.sug, nutObj.pro));
        }
        
        overlay3.classList.remove("hidden");
        addRecipeWindow3.classList.remove("hidden");
        // console.log('hi');
    })
};
ingredientsLabel();


// Closes nutrition label overlay by clicking x ------------------------------------------------------------------
closeModal3.addEventListener("click", function() {
    overlay3.classList.add("hidden");
    addRecipeWindow3.classList.add("hidden");
    // console.log("hi");
})


// Closes as well when clicking outside the overlay --------------------------------------------------------------
overlay3.addEventListener("click", function() {
    overlay3.classList.add("hidden");
    addRecipeWindow3.classList.add("hidden");
})


// Clears labelMarkup HTML text from nutLabel once food is found -------------------------------------------------
const clear = function() {
    nutLabel.innerHTML = "";
}


// Renders nutrition label by inserting HTML text ----------------------------------------------------------------
const renderLabel = function(data) {
    if(!renderLabel) {
        return data;
    }

    clear();
    nutLabel.insertAdjacentHTML("afterbegin", data);
}


// Takes text to later be rendered into the nutrition label html -------------------------------------------------
const labelMarkup = function(cal, fat, sat, cho, sod, car, fib, sug, pro) {
    return `
    <header class="performance-facts__header">
    <h1 class="performance-facts__title">${state.recipe.title}</h1>
    <h1 class="performance-facts__title">Nutrition Facts</h1>
    <p>Serving Size ${state.recipe.servings} <!-- (about ${50}g)
        <p>Serving Per Container ${12} --> </p>
    </header>
    <table class="performance-facts__table">
        <thead>
        <tr>
            <th colspan="3" class="small-info">
            Amount Per Serving
            </th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <th colspan="2">
            <b>Calories</b>
            ${Math.round(cal)}
            </th>
            <td>

            <!-- Calories from Fat
            ${130} -->

            </td>
        </tr>
        <tr class="thick-row">
            <th colspan="3">
            <b>Total Fat</b>
            ${Math.round(fat)}g
            </th>
        </tr>
        <tr>
            <td class="blank-cell">
            </td>
            <th>
            Saturated Fat
            ${Math.round(sat)}g
            </th>
        </tr>
        <tr>
            <th colspan="2">
            <b>Cholesterol</b>
            ${Math.round(cho)}mg
            </th>
        </tr>
        <tr>
            <th colspan="2">
            <b>Sodium</b>
            ${Math.round(sod)}mg
            </th>
        </tr>
        <tr>
            <th colspan="2">
            <b>Total Carbohydrate</b>
            ${Math.round(car)}g
            </th>
        </tr>
        <tr>
            <td class="blank-cell">
            </td>
            <th>
            Dietary Fiber
            ${Math.round(fib)}g
            </th>
        </tr>
        <tr>
            <td class="blank-cell">
            </td>
            <th>
            Sugars
            ${Math.round(sug)}g
            </th>
            <td>
            </td>
        </tr>
        <tr class="thick-end">
            <th colspan="2">
            <b>Protein</b>
            ${Math.round(pro)}g
            </th>
            <td>
            </td>
        </tr>
        </tbody>
    </table>
    `;
};
// renderLabel(labelMarkup());