let breweries = [];
let userCity;

function watchForm() {
    //this function watches for the form to be submitted
    $('#js-form').submit(event => {
        event.preventDefault();
        let userState = $('#search-state').val();
        userCity = $('#search-city').val();
        let limit = $('#myRange').val();
        
        //clears out any breweries in the array if another search is executed
        breweries = [];
        if (userState == "" || userCity == "") {
            alert(`Please enter a State and Zip`);
        }else{
            //this is where the API will be called
            getStateBreweries(userState, userCity);
        }
    })
}

//the API only allows the user to call 50 breweries at a time. These two functions iterates through
//all the pages until it's done.
function getStateBreweries(userState, userCity, page=1) {
    let baseUrl = `https://api.openbrewerydb.org/breweries?by_state=${userState}&by_city=${userCity}`;
    let url = baseUrl + `&page=${page}&per_page=50`;
    fetch(url).then(response => response.json()).then(responseJson => logBreweries(responseJson, userState, userCity, page));
}

//if the response is less than 50 results, then that's all the breweries that are left
//if there are exactly 50, there may be more, so it calls the API again with an increase of 1 in the page number
function logBreweries(responseJson, userState, userCity, page) {
    if (responseJson.length < 50) {
        Array.prototype.push.apply(breweries, responseJson);
        //console.log(breweries);
        
        //custom event for executing other functions once all the API calls are done
        let event = new Event('doneCalling');
        document.dispatchEvent(event);

    //if the response is a full 50 breweries, it pushes the results to the master brewery array
    //and calls the API again for the next page number
    }else if (responseJson.length = 50) {
        Array.prototype.push.apply(breweries, responseJson);
        let newPage = page + 1;
        getStateBreweries(userState, userCity, newPage);
    }
}

//custom event listener for when the API calls are all done running
//need to sort the data by zipcode and render to the page
document.addEventListener('doneCalling', function (event) {
    $('#js-results').empty();
    renderResults(breweries);
});

function renderResults(breweries) {
    for (let i=0; i<breweries.length; i++) {
        $('#js-results').append(`
        <div class="brewery">
                <img src="Images/Beer.png" alt="brewery picture" class="brewery-picture">
                
                <div class="brewery-info">
                    <h2 class="brewery-title">${breweries[i].name}</h2>
                    <p class="brewery-address">${breweries[i].street} ${breweries[i].city}, ${breweries[i].state} ${breweries[i].postal_code}</p>
                    <a href="${breweries[i].website_url}" target="_blank"><span class="brewery-url">${breweries[i].website_url}</span></a>
                </div>

            </div>`);
    }
}

$(watchForm);