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
            renderMap(userInput);
        }
    })
}

let url = `https://api.openbrewerydb.org/breweries/2394`;
let brewery;
let longitude;
let latitude;

//making Google Maps variables
var map;
var service;
var infowindow;

//fetch(url).then(response => response.json()).then(responseJson => renderMap(responseJson));

function renderMap(userInput) {

    //from https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/examples/place-search
    
    var breweryLocation = new google.maps.LatLng(41.8870058, -87.6722122);

    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(
        document.getElementById('map'), {center: breweryLocation, zoom: 15});

    var request = {
        query: `Breweries near ${userInput}`,
        fields: ['name', 'geometry'],
    };

    console.log(request);
    service = new google.maps.places.PlacesService(map);

    service.findPlaceFromQuery(request, function(results, status) {
        console.log(results);
        if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }

            map.setCenter(results[0].geometry.location);
        }
    });
      

      
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