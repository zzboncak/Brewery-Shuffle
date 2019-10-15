function watchForm() {
    //this function watches for the form to be submitted
    $('#js-form').submit(event => {
        event.preventDefault();
        let userInput = $('#search-term').val();
        let limit = $('#myRange').val();
        if (userInput == "") {
            alert(`Please input a Zip code`);
        }else{
            //this is where the API will be called
            initializeMap();
            renderMap(userInput);
            //console.log(breweryName);
        }
    })
}

let url = `https://api.openbrewerydb.org/breweries/2394`;

//Google Maps variables
var map;
var service;
var infowindow;
var breweryName;

//fetch(url).then(response => response.json()).then(responseJson => renderMap(responseJson));

function initializeMap() {
    var breweryLocation = new google.maps.LatLng(41.8870058, -87.6722122);

    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(
        document.getElementById('map'), {center: breweryLocation, zoom: 15});
}


function renderMap(userInput) {
    //from https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/examples/place-search
    
    /*var breweryLocation = new google.maps.LatLng(41.8870058, -87.6722122);

    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(
        document.getElementById('map'), {center: breweryLocation, zoom: 15});*/

    var request = {
        query: `Breweries near ${userInput}`,
        fields: ['name', 'geometry'],
    };

    console.log(request);
    service = new google.maps.places.PlacesService(map);

    service.findPlaceFromQuery(request, function(results, status) {
        breweryName = results[0].name;
        console.log(results);
        //console.log(breweryName);
        if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }

            map.setCenter(results[0].geometry.location);
        }

        let url = buildUrl(breweryName);
        console.log(url);
        fetch(url).then(response => response.json()).then(responseJson => console.log(responseJson));

    });
      
    /*let url = buildUrl(breweryName);
    console.log(url);
    fetch(url).then(response => response.json()).then(responseJson => console.log(responseJson));*/
}

function buildUrl(breweryName) {
    //this function is responsible for building the API call URL
    let baseUrl = `https://api.openbrewerydb.org/breweries`;
    let noSpaceString = breweryName.replace(/ /g, "%20");
    let url = baseUrl + "?by_name=" + noSpaceString;
    return url;
}

function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });
  }



$(watchForm);