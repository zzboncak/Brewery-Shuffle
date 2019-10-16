function watchForm() {
    //this function watches for the form to be submitted
    $('#js-form').submit(event => {
        event.preventDefault();

        let userZip = $('#search-term').val();
        let limit = $('#myRange').val();
        if (userZip == "") {
            alert(`Please input a Zip code`);
        }else if (typeof(userZip) !== 'number') {
            alert(`Please input a number for the Zip code`);
        }else{
            //this is where the API will be called
        }

        console.log();
    })
}



$("#button").click(function() {
    $('html, body').animate({
        scrollTop: $("#js-results").offset().top
    }, 2000);
});




$(watchForm);