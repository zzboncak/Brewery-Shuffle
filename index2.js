//globals
const state = {
    breweries: [],
    body: [],
};
var map;

$( "#map" ).hide();
$( "#js-results" ).hide();
function watchForm() {
    //this function watches for the form to be submitted
    $('#js-form').submit(event => {
        event.preventDefault();
        let userState = $('#search-state').val();
        let userCity = $('#search-city').val();
        let limit = $('#myRange').val();
        
        //clears out any breweries in the array if another search is executed
        state.breweries = [];
        state.body = [];
        if (userState == "" || userCity == "") {
            alert(`Please enter a State and City`);
        }else{
            
            //this is where the initial API will be called
            getStateBreweries(userState, userCity);
        }
    })
}

//slider script
var rangeslider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = rangeslider.value;

rangeslider.oninput = function() {
  output.innerHTML = this.value;
}


//the API only allows the user to call 50 breweries at a time. These two functions iterates through
//all the pages until it's done.
function getStateBreweries(userState, userCity, page=1) {
    let baseUrl = `https://api.openbrewerydb.org/breweries?by_state=${userState}&by_city=${userCity}`;
    let url = baseUrl + `&page=${page}&per_page=50`;
    fetch(url)
        .then(response => response.json())
        .then(responseJson => logBreweries(responseJson, userState, userCity, page))
        .catch(err => alert(`Something failed: ${err.message}`));
}

//if the response is less than 50 results, then that's all the breweries that are left
//if there are exactly 50, there may be more, so it calls the API again with an increase of 1 in the page number
function logBreweries(responseJson, userState, userCity, page) {
    if (responseJson.length < 50) {
        Array.prototype.push.apply(state.breweries, responseJson);

        let breweryRange = randomizeBrewery(state.breweries);

        doneCalling(breweryRange, userState)

        //smooth scroll
        $('html, body').animate({
            scrollTop: $("#map").offset().top
        }, 1800);

    //if the response is a full 50 breweries, it pushes the results to the master brewery array
    //and calls the API again for the next page number
    }else if (responseJson.length = 50) {
        Array.prototype.push.apply(state.breweries, responseJson);
        let newPage = page + 1;
        getStateBreweries(userState, userCity, newPage);
    }
}

function randomizeBrewery(breweries){
    var currentIndex = breweries.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = breweries[currentIndex];
    breweries[currentIndex] = breweries[randomIndex];
    breweries[randomIndex] = temporaryValue;
  }


    let limit =  $('#myRange').val();
    let limitedBreweries = breweries.slice(0,limit);

  return limitedBreweries;
}

function doneCalling(breweries, userState) {
    if (breweries.length === 0) {
        alert(`No results with this search, please try a different city.`);
    } else {
        $('#js-results').empty();
        renderResults(breweries);
        //this function will get all the longitude and latitude
        //coordinates from our array of breweries, and use those
        //to build a static map
        getLongAndLat(breweries, userState);
    }
}


function renderResults(breweries) {
    $( "#js-results" ).show();
    $( "#map" ).show();
    for (let i=0; i<breweries.length; i++) {
        $('#js-results').append(`
        <div class="brewery">                
                <div class="brewery-info">
                    <h2 class="brewery-title">${breweries[i].name}</h2>
                    <p class="brewery-address">${breweries[i].street} ${breweries[i].city}, ${breweries[i].state} ${breweries[i].postal_code}</p>
                    <a href="${breweries[i].website_url}" target="_blank"><span class="brewery-url">${breweries[i].website_url}</span></a>
                </div>

            </div>`);
    }
}


//This function takes an array of objects and begins building
//an array of objects whose contents are the lats and longs of each brewery
function getLongAndLat(arrayOfObjects, userState, i=0) {
    let brewery = arrayOfObjects[i];
    let currentState = userState;
    if (arrayOfObjects.length == i){

        initializeMap();

        //return body;
    }
    else if (brewery.latitude === null && brewery.longitude === null) {
        //If no latitude and logitude is provided, geocode it by
        //calling Bing geocoding API
        let stateAbbrv = stateNames[currentState];
        let street = brewery.street.replace(/ /gm, "%20");
        let streetFixed = street.replace(/#/gm,"");
        let city = brewery.city;
        let zip = brewery.postal_code;
        let geoCodeUrl = `https://dev.virtualearth.net/REST/v1/Locations?countryRegion=USU&adminDistrict=${stateAbbrv}&locality=${city}&postalCode=${zip}&addressLine=${streetFixed}&key=AqXXNX8owOM0j4Uz4_FvIYRMYpgaSr_nHkRvvgKGv0ZnRJ9bfgmnUkLyADX9JmgR`;
        fetch(geoCodeUrl)
            .then(response => response.json())
            .then(responseJson => handleGeocodeResponse(responseJson, arrayOfObjects, currentState, i))
            .catch(err => alert(`Something failed: ${err.message}`));
    }else if (brewery.latitude !== null && brewery.longitude !== null){
        addLatLng(arrayOfObjects, currentState, i);
    }else{
        i += 1;
        getLongAndLat(arrayOfObjects, currentState, i);
    }
}

function handleGeocodeResponse(response, arrayOfObjects, currentState, i) {
    let latitude = response.resourceSets[0].resources[0].geocodePoints[0].coordinates[0];
    let longitude = response.resourceSets[0].resources[0].geocodePoints[0].coordinates[1];
    let name = arrayOfObjects[i].name;
    let pin = {
        latitude: latitude,
        longitude: longitude,
        title: name,
    };
    state.body[i] = pin;
    i += 1;
    getLongAndLat(arrayOfObjects, currentState, i);
}

function addLatLng(arrayOfObjects, currentState, i) {
    let brewery = arrayOfObjects[i];
    let pin = {
        latitude: brewery.latitude,
        longitude: brewery.longitude,
        title: brewery.name,
    };
    state.body[i] = pin;
    i += 1;
    getLongAndLat(arrayOfObjects, currentState, i);
}

//upload pins to a google map
//from https://developers.google.com/maps/documentation/javascript/importing_data

function initializeMap(){
    let brewery1 = state.body[0];
    initMap(brewery1);
}


function initMap(brewery1) {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: new google.maps.LatLng(brewery1.latitude,brewery1.longitude),
        mapTypeId: 'terrain'
    });

    let breweryLatLngs = state.body;

    makePins(breweryLatLngs);
}

function makePins(breweryLatLngs) {
    for (var i = 0; i < breweryLatLngs.length; i++) {
        var coords = breweryLatLngs[i];
        var latLng = new google.maps.LatLng(coords.latitude,coords.longitude);
        var marker = new google.maps.Marker({
          position: latLng,
          map: map,
          title: coords.title,
        });
      }
}

const stateNames = {
    alabama: "AL",
    alaska: "AK",
    arizona: "AZ",
    arkansas: "AR",
    california: "CA",
    colorado: "CO",
    connecticut: "CT",
    delaware: "DE",
    florida: "FL",
    georgia: "GA",
    hawaii: "HI",
    idaho: "ID",
    illinois: "IL",
    indiana: "IN",
    iowa: "IA",
    kansas: "KS",
    kentucky: "KY",
    louisiana: "LA",
    maine: "ME",
    maryland: "MD",
    massachusetts: "MA",
    michigan: "MI",
    minnesota: "MN",
    mississippi: "MS",
    missouri: "MO",
    montana: "MT",
    nebraska: "NE",
    nevada: "NV",
    new_hampshire: "NH",
    new_jersey: "NJ",
    new_mexico: "NM",
    new_york: "NY",
    north_carolina: "NC",
    north_dakota: "ND",
    ohio: "OH",
    oklahoma: "OK",
    oregon: "OR",
    pennsylvania: "PA",
    rhode_island: "RI",
    south_carolina: "SC",
    south_dakota: "SD",
    tennessee: "TN",
    texas: "TX",
    utah: "UT",
    vermont: "VT",
    virginia: "VA",
    washington: "WA",
    west_virginia: "WV",
    wisconsin: "WI",
    wyoming: "WY",
};

$(watchForm);