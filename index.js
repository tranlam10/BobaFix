const yelpAPI = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search';
//const yelpAPI = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?categories=bars&limit=50&location=New York';
const yelpKey = 'R1kG7qIDMipsR5EThix7_5-WXBTTHvNmadr4dtC5FCbE8I89CNFdPjTlTBube5DQ6xRtnnJuu3BRulcd-ObCOUBxQk2-a6BEmM3Kr_8TqbSJzllj5_xYsm1KTyPZW3Yx';
const yelpIdAPI = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/';
const googleKey = 'AIzaSyAzr3VKSqJeQRLYjyhb9RDUeBXgW1-Jw5A';
const geocodeAPI = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?';

//set up ajax call that calls when you click the down button
//make a button that redirects to homepage to restart search


function timeChange(time) {
    function insert(str, index, value) {
        return (str.substr(0, index) + value + str.substr(index));
    }
    if (time == 1200) {
        return ('12:00 PM');
    }
    if (time == 0000) {
        return ('12:00 AM');
    }
    if(time <= 1200) {
       //return time.split('').splice(2, 0, ':').join();
       return insert(time.toString(), 2, ":") + " AM";
    } else {
        time -= 1200;
        return insert(time.toString(), 2, ":") + " PM";
    }
}

function showHours(data) { 
    $('.down').on('click', function() {
        let index = $("li").index($(this).closest('li'));
        let storeHours = [];

        for(let i = 0; i < data.businesses.length; i++) {
            storeHours.push(data.businesses[i].id);
        }

        //calls yelp "business/id" API to get information about each shop
        let infoTab = $(this).closest('li').find('.moreInfo');
        console.log(infoTab);
        let id = storeHours[index];
        $.ajax({
            "url": yelpIdAPI + id,
            "dataType": 'json',
            "type": 'GET',
            //"data": { locale: id },
            "headers": {
                'Authorization': 'Bearer R1kG7qIDMipsR5EThix7_5-WXBTTHvNmadr4dtC5FCbE8I89CNFdPjTlTBube5DQ6xRtnnJuu3BRulcd-ObCOUBxQk2-a6BEmM3Kr_8TqbSJzllj5_xYsm1KTyPZW3Yx'            
            },
            "success": function(storeData) {
                let hours = storeData.hours[0].open;
                let yelpLink = storeData.url;

                // function time(time) {
                //     if(time <= 1200) {
                //        //return time.split('').splice(2, 0, ':').join();
                //        return time.split('').splice(2, 0, ':').join('');
                //     }
                // }
                // console.log(time(hours[0].start));
                console.log(timeChange(hours[0].start));
                infoTab.html(`
                    <h2>Hours:</h2>
                    <p> Mon: ${timeChange(hours[0].start)} - ${timeChange(hours[0].end)} </p>
                    <p> Tue: ${timeChange(hours[1].start)} - ${timeChange(hours[1].end)} </p>
                    <p> Wed: ${timeChange(hours[2].start)} - ${timeChange(hours[2].end)} </p>
                    <p> Thu: ${timeChange(hours[3].start)} - ${timeChange(hours[3].end)} </p>
                    <p> Fri: ${timeChange(hours[4].start)} - ${timeChange(hours[4].end)} </p>
                    <p> Sat: ${timeChange(hours[5].start)} - ${timeChange(hours[5].end)} </p>
                    <p> Sun: ${hours[6] ? timeChange(hours[6].start):''} - ${hours[6] ? timeChange(hours[6].end):''} </p>
                    <a  class="yelp" href="${yelpLink}">Yelp</a>
                `);
            }
        });

        if ($(this).attr('src') == 'arrow_down.png') {
            $(this).attr('src', 'arrow_up.png');
        } else {
            $(this).attr('src', 'arrow_down.png');
        }
        $(this).parent().closest('li').find('.moreInfo').toggle();
    });
}

//insert the list of shops once the API calls data from YELP
function insertList(data) {
    for(let i = 0; i < data.businesses.length; i++) {
        let name = data.businesses[i].name;
        let rating = data.businesses[i].rating;
        let amountReviews = data.businesses[i].review_count;
        let phone = data.businesses[i].display_phone;
        // let storeIds = [];

        // for(let i = 0; i < hours.length; i++) {
        //     storeHours.push(id);
        // }

        $('.info').append(`<br>`);
        $('.info').append(`
            <li class="newShop">
                <h1>${name}</h1>
                <h2>Rating: ${rating} (${amountReviews})</h2>
                <p>${phone}</p>
                <img class="down" src="arrow_down.png" alt="down">
                <div class="moreInfo"></div>
            </li>
        `);
        console.log(i, data.businesses.length);
        if (i == data.businesses.length - 1) {
            showHours(data);
        }
    }
}

//place markers on the Google map
function putMarkers(data, map) {
    if (data) {
        for(let i = 0; i < data.businesses.length; i++) {
            let coordinates = {
                lat: data.businesses[i].coordinates.latitude,
                lng: data.businesses[i].coordinates.longitude
            }
        
            let marker = new google.maps.Marker({position: coordinates, map: map});
        }

        $("body").css('background-image', 'none');
        $(".landing").css('display', 'none');
        $(".map").css('display', 'block');
        $(".restart").css('display', 'inline');
        $(".info").css('display', 'block');
    }
}

//call the Google map and center 
function initMap(latLong, data) {
    let map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: latLong
    });

    putMarkers(data, map);
}

//API to fetch YELP data
function fetchData(latLong, query) {
    console.log("fetch data is printing latlong" + latLong);
    $.ajax({
        "url": yelpAPI,
        "dataType": 'json',
        "type": 'GET',
        "data": query,
        "headers": {
            'Authorization': 'Bearer R1kG7qIDMipsR5EThix7_5-WXBTTHvNmadr4dtC5FCbE8I89CNFdPjTlTBube5DQ6xRtnnJuu3BRulcd-ObCOUBxQk2-a6BEmM3Kr_8TqbSJzllj5_xYsm1KTyPZW3Yx'            
        },
        "success": function(data) {
             initMap(latLong, data);
             insertList(data);
        }
    });
}

//whenever the user puts in location
function formSubmit() {
    $(".searchForm").submit(function(event){
        event.preventDefault();
        const location = $(event.currentTarget).find('.locationForm').val();

        console.log(location);

        const query = {
            term: 'boba',
            location: location
        }

        //call to geocodeAPI to get the latitute and longitude
        $.ajax({
            "url": geocodeAPI,
            "dataType": 'json',
            "type": 'GET',
            "data": {
                address: location,
                key: 'AIzaSyDMBvgUG0xPZaqBcL3R1mzTH84cKB0xbo8'
            },
            "success": function(data) {
                if (data.results.length > 0) {
                    let latLong = data.results[0].geometry.location;
                fetchData(latLong, query);
                } else {
                    alert("wrong location");
                }
            }
        });
    });
}

$(formSubmit);

//make the center the zip code that the user enters
//for loop iterate all the results received from the API call and this will make a bunch of markers
//when user clicks on a marker, pop up link to website of the location
//remove landing page whenever user submits search and replace with map