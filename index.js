function watchForm() {
    //this function watches for the form to be submitted
    $('#js-form').submit(event => {
        event.preventDefault();
        let userZip = $('#search-term').val();
        let limit = $('#myRange').val();
        if (userZip == "") {
            alert(`Please input a Zip code`);
        }
        else{
            //this is where the API will be called
            let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDq8NboefEBnsZ5q98K6FxtLnZKvAiPjHI&location=41.83635100000001,-88.21690269999999&radius=50000&keyword=brewery`;

            fetch(url).then(response => response.json()).then(responseJson => console.log(responseJson));
        }

    })
}



$(watchForm);