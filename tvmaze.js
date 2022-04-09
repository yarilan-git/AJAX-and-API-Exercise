"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $episodesList = $("#episodes-list");
const $searchForm = $("#search-form");
const baseURL = "https://api.tvmaze.com/search/shows";


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  const paramsObj = { params : {q : searchTerm}}; // Prepare the query params
  try {   
    // Get data from TVMaze and load selected fields into the returned array
    const result = await axios.get(baseURL, paramsObj);    
    const resultsArr = [];
    for (let show of result.data) {
      resultsArr.push({id:show.show.id, name:show.show.name, summary:show.show.summary, image:(show.show.image.medium ? show.show.image.medium : "https://tinyurl.com/tv-missing")});
    }   
    return resultsArr;  // Return the results to the calling function
  } catch {
      alert ("Couldn't find anything. Try again.");
  }  
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();  // Clear the shows area on the page

  for (let show of shows) {
    // Prepare the HTML elements for each show
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image} 
              alt="Image of ${show.name}"  
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>            
             <button class="episodes-button">Episodes</button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  // Add the show to the page
  }

  // Add a listener to the 'Episodes' button
  $("#shows-list").on("click", ".episodes-button", async function () {      
    let showID = $(this).closest(".Show").data("show-id");    // Get the show ID data from the container element of the show
    const epsArr = await getEpisodesOfShow(showID);   // Get this show's episodes from TVMaze
    populateEpisodes(epsArr); // Display the returned episodes at the bottom of the page
  })  
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {

  // Get shows from TVMaze, based on the search term entered by the user
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide(); // Hide the episodes area for now
  populateShows(shows); // Display the shows on the page
}

// Add a listener to the search ("GO") button
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();  // Get shows from TVMaze
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number } https://api.tvmaze.com/shows/1/episodes
 */

async function getEpisodesOfShow(id) { 

  //  Prepare an episodes request string for a specific show
  const request = `https://api.tvmaze.com/shows/${id}/episodes`;
  try {   
    const result = await axios.get(request);     // Get episodes from TVMaze   
    const episodesArr = [];

    // Build an episodes array
    for (let episode of result.data) {
      episodesArr.push({id:episode.id, name:episode.name, season:episode.season, number:episode.number});
    }    
    return episodesArr; // Return the episodes array to the calling function
  } catch {
      alert ("Couldn't find anything. Try again.");
  }  


}

/** Write a clear docstring for this function... */

// Display episodes on the page
function populateEpisodes(episodes) { 
  $episodesList.html('');  // Clear the episodes area

  // Build a list item for each episode and add it to the page
  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`)
      $episodesList.append($episode);    
  }
    // Make the episodes area visible
    $episodesArea.show();
}


