import 'dotenv/config'
import fetch from 'node-fetch';
import { retort } from "retort-js";

const EDAMAM_API_KEY = process.env.EDAMAM_API_KEY;
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;

// Function to fetch recipes from the Edamam Recipe API
const getData = async function (ingredients) {
  try {
    const response = await fetch(
      `https://api.edamam.com/search?q=${ingredients}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.log("Couldn't fetch recipes", err);
    throw err;
  }
};

const retorter = retort(async ($) => {
  const instructions = `
  You are an expert on the Edamam Recipe API. You are tasked with retrieving all recipes based on what the inputted ingredients. 
  Use the Edamam Recipe API.
  Here is the link to the documentation: https://developer.edamam.com/edamam-docs-recipe-api
  You should respond with the number of the recipe you would like to know more about.
  Answer nutrition questions about any of the questions.
  Provide similar options if requested outside of the top 10.
  If the user wishes to end the conversation, say "DONE" in all caps.`;

  $.system(instructions);

  $.assistant`Welcome to the Recipe Bot!
  Please enter the ingredients you have, separated by commas.
  I will find recipes that match any of the ingredients you provide.`;

  // User enters ingredients
  const userInput = await $.user.input();
  const userIngredients = userInput.content.toLowerCase();
  const recipeHits = await getData(userIngredients);

  // Check if recipes were found
  if (recipeHits.hits && recipeHits.hits.length > 0) {
    // Extract name and link of each recipe
    const topRecipes = recipeHits.hits.slice(0, 10); // Limit to top 10 recipes
    const recipesInfo = topRecipes.map((hit, index) => {
      const recipe = hit.recipe;
      console.log(recipe)
      return `${index + 1}, ${recipe.label}: ${recipe.url}`;
    }).join('\n');
    $.assistant`The user has inputted: ${userIngredients}
    The top 10 recipes that match the ingredients you provided are:
    ${recipesInfo}
    Please ask any questions about these recipes.`;
  } else {
    // If no recipes were found
    $.system("Sorry, no recipes found for the provided ingredients.");
  }

  let reply;
  do {
    await $.user.input();
    reply = await $.assistant.generation();
  } while (!reply.content.includes("DONE"));
});

retorter._run(); // Run the conversation