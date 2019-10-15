let breweries = [];
let userZip;

function watchForm() {
    //this function watches for the form to be submitted
    $('#js-form').submit(event => {
        event.preventDefault();
        let userState = $('#search-state').val();
        userZip = $('#search-zip').val();
        let limit = $('#myRange').val();
        
        //clears out any breweries in the array if another search is executed
        breweries = [];
        if (userState == "" || userZip == "") {
            alert(`Please enter a State and Zip`);
        }else{
            //this is where the API will be called
            getStateBreweries(userState);
        }
    })
}

//the API only allows the user to call 50 breweries at a time. These two functions iterates through
//all the pages until it's done.
function getStateBreweries(userState, page=1) {
    let baseUrl = `https://api.openbrewerydb.org/breweries?by_state=`;
    let url = baseUrl + userState + `&page=${page}&per_page=50`;
    //console.log(url);
    fetch(url).then(response => response.json()).then(responseJson => logBreweries(responseJson, userState, page));
}

//if the response is less than 50 results, then that's all the breweries that are left
//if there are exactly 50, there may be more, so it calls the API again with an increase of 1 in the page number
function logBreweries(responseJson, userState, page) {
    if (responseJson.length < 50) {
        Array.prototype.push.apply(breweries, responseJson);
        console.log(breweries);
        
        //custom event for executing other functions once all the API calls are done
        let event = new Event('doneCalling');
        document.dispatchEvent(event);

    }else if (responseJson.length = 50) {
        Array.prototype.push.apply(breweries, responseJson);
        let newPage = page + 1;
        getStateBreweries(userState, newPage);
    }
}

//custom event listener for when the API calls are all done running
//need to sort the data by zipcode and render to the page
document.addEventListener('doneCalling', function (event) {
    console.log(`this worked`);
    let breweriesZip = breweries.filter(brewery => brewery.postal_code.includes(userZip));
    console.log(breweriesZip);
});

function filterBreweriesByZip(responseJson) {
    let zipBreweries = responseJson.filter(function(object) {
        return object.postal_code == "60555";
    });
    console.log(zipBreweries);
}

$(watchForm);