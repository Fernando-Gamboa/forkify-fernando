// import {async} from "regenerator-runtime";
import { TIMEOUT_SEC } from "./config";


const timeout = function (s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${s} second`));
      }, s * 1000);
    });
};

// This AJAX function replaces below two functions into one
export const AJAX = async function(url, uploadData = undefined) {
  try {
    const fetchPro = uploadData ? fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(uploadData)
    }) : fetch(url);

    // Fetching data from his API
    // This Promise has two objectives, if the timeout occurs first then its rejected
    // Or it runs the url first
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    // const res = await fetch("https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bccb2");
    const data = await res.json();

    if(!res.ok) {
    throw new Error(`${data.message} (${res.status})`);
    }

    return data;
  }
  catch(err) {
      // Throws the error to the catch model.js file
      throw err;
  }
};

/*
export const getJSON = async function(url) {
    try {
        // Fetching data from his API
        // This Promise has two objectives, if the timeout occurs first then its rejected
        // Or it runs the url first
        const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
        // const res = await fetch("https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bccb2");
        const data = await res.json();

        if(!res.ok) {
        throw new Error(`${data.message} (${res.status})`);
        }

        return data;
    }
    catch(err) {
        // Throws the error to the catch model.js file
        throw err;
    }
}

export const sendJSON = async function(url, uploadData) {
    try {
        const fetchPro = fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(uploadData)
        });

        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();

        if(!res.ok) {
        throw new Error(`${data.message} (${res.status})`);
        }

        return data;
    }
    catch(err) {
        // Throws the error to the catch model.js file
        throw err;
    }
};
*/