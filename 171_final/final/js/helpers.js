/* * * * * * * * * * * * * *
*         Carousels        *
* * * * * * * * * * * * * */

// Create bootstrap carousel, disabling rotating
let carousel = new bootstrap.Carousel(document.getElementById('stateCarousel'), {interval: false})
let typeCarousel = new bootstrap.Carousel(document.getElementById('typeCarousel'), {interval: false})


// on button click switch view
function switchTimeView() {
    carousel.next();
    document.getElementById('switchView').innerHTML === 'Team View' ? document.getElementById('switchView').innerHTML = 'Time View' : document.getElementById('switchView').innerHTML = 'Team View';
}

function switchTypeView() {
    typeCarousel.next();
    document.getElementById('switchTypeView').innerHTML === 'Offense View' ? document.getElementById('switchTypeView').innerHTML = 'Defense View' : document.getElementById('switchTypeView').innerHTML = 'Offense View';
}

