let breweries = [];
let userCity;
let body = [];


function watchForm() {
    //this function watches for the form to be submitted
    $('#js-form').submit(event => {
        event.preventDefault();
        let userState = $('#search-state').val();
        userCity = $('#search-city').val();
        let limit = $('#myRange').val();
        
        //clears out any breweries in the array if another search is executed
        breweries = [];
        body = [];
        if (userState == "" || userCity == "") {
            alert(`Please enter a State and Zip`);
        }else{
            //this is where the API will be called
            getStateBreweries(userState, userCity);
        }
    })
}

$("#button").click(function() {
    $('html, body').animate({
        scrollTop: $("#js-results").offset().top
    }, 1800);
});


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
    if (breweries.length === 0) {
        alert(`No results with this search, please try a different city.`);
    } else {
        $('#js-results').empty();
        renderResults(breweries);
        
        //experimenting with implementing a static map
        //this function will get all the longitude and latitude
        //coordinates from our array of breweries, and use those
        //to build a static map with Bing Maps API
        getLongAndLat(breweries);
    }
});

document.addEventListener('doneConstructingBody', function (event) {
    //custon event listener to send http request and build the map
    renderMap();
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

//This function takes an array of objects and begins building
//the body of an HTTP POST call to Bing Maps API for a static map
function getLongAndLat(arrayOfObjects, i=0) {
    //console.log(arrayOfObjects);
    let brewery = arrayOfObjects[i];
    if (arrayOfObjects.length == i){
        let httpBody = body.join("&");
        console.log(httpBody);
        console.log(httpBody.length);
        //need to add custom event listener here as well to signal when all this calling is done.
        let event = new Event('doneConstructingBody');
        document.dispatchEvent(event);

        return httpBody;
    }
    else if (brewery.latitude === null && brewery.longitude === null) {
        //If no latitude and logitude is provided, geocode it by
        //calling Bing geocoding API and append to HTTP body
        let state = abbreviateState(brewery.state);
        let street = brewery.street.replace(" ", "%20");
        let city = brewery.city;
        let zip = brewery.postal_code;
        let geoCodeUrl = `http://dev.virtualearth.net/REST/v1/Locations?countryRegion=USU&adminDistrict=${state}&locality=${city}&postalCode=${zip}&addressLine=${street}&key=AqXXNX8owOM0j4Uz4_FvIYRMYpgaSr_nHkRvvgKGv0ZnRJ9bfgmnUkLyADX9JmgR`;
        fetch(geoCodeUrl)
            .then(response => response.json())
            .then(responseJson => handleGeocodeResponse(responseJson, arrayOfObjects, i))
    }else{
        addPin(arrayOfObjects, i);
    }
}

function addPin(arrayOfObjects, i) {
    let brewery = arrayOfObjects[i];
    let pin = `pp=${brewery.latitude},${brewery.longitude};64;${i+1}`;
    body[i] = pin;
    i += 1;
    getLongAndLat(arrayOfObjects, i);
}

function handleGeocodeResponse(response, arrayOfObjects, i) {
    let latitude = response.resourceSets[0].resources[0].geocodePoints[0].coordinates[0];
    let longitude = response.resourceSets[0].resources[0].geocodePoints[0].coordinates[1];
    let string = `pp=${latitude},${longitude};64;${i+1}`
    body[i] = string;
    i += 1;
    getLongAndLat(arrayOfObjects, i);
}

//for formating the state name for geocode query
function abbreviateState(stateName) {
    let stateAbbrev;
    if (stateName == "Alabama" || stateName == "alabama") {
        stateAbbrev = "AL";
    }else if (stateName == "Alaska" || stateName == "alaska") {
        stateAbbrev = "AK";
    }else if (stateName == "Arizona" || stateName == "arizona") {
        stateAbbrev = "AZ";
    }else if (stateName == "Arkansas" || stateName == "arkansas") {
        stateAbbrev = "AR";
    }else if (stateName == "California" || stateName == "california") {
        stateAbbrev = "CA";
    }else if (stateName == "Colorado" || stateName == "colorado") {
        stateAbbrev = "CO";
    }else if (stateName == "Connecticut" || stateName == "connecticut") {
        stateAbbrev = "CT";
    }else if (stateName == "Delaware" || stateName == "delaware") {
        stateAbbrev = "DE";
    }else if (stateName == "Florida" || stateName == "florida") {
        stateAbbrev = "FL";
    }else if (stateName == "Georgia" || stateName == "georgia") {
        stateAbbrev = "GA";
    }else if (stateName == "Hawaii" || stateName == "hawaii") {
        stateAbbrev = "HI";
    }else if (stateName == "Idaho" || stateName == "idaho") {
        stateAbbrev = "ID";
    }else if (stateName == "Illinois" || stateName == "illinois") {
        stateAbbrev = "IL";
    }else if (stateName == "Indiana" || stateName == "indiana") {
        stateAbbrev = "IN";
    }else if (stateName == "Iowa" || stateName == "iowa") {
        stateAbbrev = "IA";
    }else if (stateName == "Kansas" || stateName == "kansas") {
        stateAbbrev = "KS";
    }else if (stateName == "Kentucky" || stateName == "kentucky") {
        stateAbbrev = "KY";
    }else if (stateName == "Louisiana" || stateName == "louisiana") {
        stateAbbrev = "LA";
    }else if (stateName == "Maine" || stateName == "maine") {
        stateAbbrev = "ME";
    }else if (stateName == "Maryland" || stateName == "maryland") {
        stateAbbrev = "MD";
    }else if (stateName == "Massachusetts" || stateName == "massachusetts") {
        stateAbbrev = "MA";
    }else if (stateName == "Michigan" || stateName == "michigan") {
        stateAbbrev = "MI";
    }else if (stateName == "Minnesota" || stateName == "minnesota") {
        stateAbbrev = "MN";
    }else if (stateName == "Mississippi" || stateName == "mississippi") {
        stateAbbrev = "MS";
    }else if (stateName == "Missouri" || stateName == "missouri") {
        stateAbbrev = "MO";
    }else if (stateName == "Montana" || stateName == "montana") {
        stateAbbrev = "MT";
    }else if (stateName == "Nebraska" || stateName == "nebraska") {
        stateAbbrev = "NE";
    }else if (stateName == "Nevada" || stateName == "nevada") {
        stateAbbrev = "NV";
    }else if (stateName == "New_Hampshire" || stateName == "new_hampshire") {
        stateAbbrev = "NH";
    }else if (stateName == "New_Jersey" || stateName == "new_jersey") {
        stateAbbrev = "NJ";
    }else if (stateName == "New_Mexico" || stateName == "new_mexico") {
        stateAbbrev = "NM";
    }else if (stateName == "New_York" || stateName == "new_york") {
        stateAbbrev = "NY";
    }else if (stateName == "North_Carolina" || stateName == "north_carolina") {
        stateAbbrev = "NC";
    }else if (stateName == "North_Dakota" || stateName == "north_dakota") {
        stateAbbrev = "ND";
    }else if (stateName == "Ohio" || stateName == "ohio") {
        stateAbbrev = "OH";
    }else if (stateName == "Oklahoma" || stateName == "oklahoma") {
        stateAbbrev = "OK";
    }else if (stateName == "Oregon" || stateName == "oregon") {
        stateAbbrev = "OR";
    }else if (stateName == "Pennsylvania" || stateName == "pennsylvania") {
        stateAbbrev = "PA";
    }else if (stateName == "Rhode_Island" || stateName == "rhode_island") {
        stateAbbrev = "RI";
    }else if (stateName == "South_Carolina" || stateName == "south_carolina") {
        stateAbbrev = "SC";
    }else if (stateName == "South_Dakota" || stateName == "south_dakota") {
        stateAbbrev = "SD";
    }else if (stateName == "Tennessee" || stateName == "tennessee") {
        stateAbbrev = "TN";
    }else if (stateName == "Texas" || stateName == "texas") {
        stateAbbrev = "TX";
    }else if (stateName == "Utah" || stateName == "utah") {
        stateAbbrev = "UT";
    }else if (stateName == "Vermont" || stateName == "vermont") {
        stateAbbrev = "VT";
    }else if (stateName == "Virginia" || stateName == "virginia") {
        stateAbbrev = "VA";
    }else if (stateName == "Washington" || stateName == "washington") {
        stateAbbrev = "WA";
    }else if (stateName == "West_Virginia" || stateName == "west_virginia") {
        stateAbbrev = "WV";
    }else if (stateName == "Wisconsin" || stateName == "wisconsin") {
        stateAbbrev = "WI";
    }else if (stateName == "Wyoming" || stateName == "wyoming") {
        stateAbbrev = "WY";
    }
    return stateAbbrev;
}

$(watchForm);