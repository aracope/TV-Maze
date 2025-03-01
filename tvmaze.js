"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

// Step 2: Modify getShowsByTerm to Fetch Data
// Replace the hardcoded array with an AJAX request using axios:

async function getShowsByTerm(term) {
  const response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);

  return response.data.map(result => {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary || "No summary available.",
      image: show.image ? show.image.medium : "static-tv.jpg" // Ensure "static-tv.jpg" is in your project folder
    };
  });
}

async function getShowsByActor(actor) {
  const response = await axios.get(`http://api.tvmaze.com/search/people?q=${actor}`);

  if (response.data.length === 0) return []; // Return empty if no results

  const actorId = response.data[0].person.id; // Get the first matching actor's ID

  // Fetch shows the actor has appeared in
  const creditsResponse = await axios.get(`http://api.tvmaze.com/people/${actorId}/castcredits?embed=show`);

  return creditsResponse.data.map(credit => {
    let show = credit._embedded.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary || "No summary available.",
      image: show.image ? show.image.medium : "static-tv.jpg"
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

// Step 3: Update populateShows
// Modify the function to display dynamically fetched data:

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(`
      <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="card-img-top w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
      </div>
    `);

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
// Step 4: Fetch Episodes for a Show
// Create getEpisodesOfShow function:

async function getEpisodesOfShow(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  return response.data.map(ep => ({
    id: ep.id,
    name: ep.name,
    season: ep.season,
    number: ep.number
  }));
}

/** Write a clear docstring for this function... */

// Step 5: Display Episodes
// Implement populateEpisodes:

function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let ep of episodes) {
    const $item = $(`<li>${ep.name} (Season ${ep.season}, Episode ${ep.number})</li>`);
    $episodesList.append($item);
  }

  $("#episodesArea").show(); // Reveal the episodes section
}


// Step 6: Add Event Listener for Episodes Button
// Since episodes buttons are dynamically created, use event delegation:

$("#showsList").on("click", ".Show-getEpisodes", async function (evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});


