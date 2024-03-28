import fetch from 'node-fetch';
import { retort } from "retort-js";

// Function to fetch space station location from the Open Notify API
const getData = async function () {
  try {
    const response = await fetch(
      'https://api.wheretheiss.at/v1/satellites/25544'
    );
    const data = await response.json();
    return [data.longitude, data.latitude];
  } catch (err) {
    console.log("Couldn't fetch coordinates", err);
    throw err;
  }
};

const retorter = retort(async ($) => {
  let coordinates = await getData()
  const instructions = `
  You are an expert on the Open Notify Recipe API. Using the location of the ISS, please go into detail on where it is currently located.
  Here is the link to the documentation: https://wheretheiss.at/w/developer
  The API response will have this structure:
  You should respond with the current location in the world based on these coordinates: ${coordinates}.
  Respond with the location of the coordinates as in Country, be exact.
  Answer any question about the current location.
  If the user wishes to end the conversation, say "DONE" in all caps.`
  
  $.system(instructions);
  
  $.assistant`Welcome to the Space Station Locator Bot!
  Please ask any questions about its location.`;

  let reply;
  do {
    await $.user.input();
    reply = await $.assistant.generation();
  } while (!reply.content.includes("DONE"));
});

retorter._run(); // Run the conversation