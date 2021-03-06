$(document).ready(function () {
    // navBar
    $(window).on('scroll', function () {
        if ($(window).scrollTop() >= 80) {
            $('.navbar').addClass('change-bg');
        }
        else {
            $('.navbar').removeClass('change-bg');
        }
    });
    // navBar
    // set package boxes in the same height
    var locationName = $('.packages .package .card .list-group .list-group-item.location-name');
    var maxHeight = 0;
    locationName.each(function () {
        if ($(this).outerHeight() > maxHeight) {
            maxHeight = $(this).outerHeight();
        }
    });
    locationName.outerHeight(maxHeight);
    // set package boxes in the same height
});
//////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    var current_fs, next_fs, previous_fs; //fieldsets
    var opacity;
    var current = 1;
    var steps = $("fieldset").length;
    setProgressBar(current);
    $(".next").click(function () {
        current_fs = $(this).parent();
        next_fs = $(this).parent().next();
        //Add Class Active
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
        //show the next fieldset
        next_fs.show();
        //hide the current fieldset with style
        current_fs.animate({
            opacity: 0
        }, {
            step: function (now) {
                // for making fielset appear animation
                opacity = 1 - now;
                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                next_fs.css({
                    'opacity': opacity
                });
            },
            duration: 500
        });
        setProgressBar(++current);
    });
    $(".previous").click(function () {
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();
        //Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
        //show the previous fieldset
        previous_fs.show();
        //hide the current fieldset with style
        current_fs.animate({
            opacity: 0
        }, {
            step: function (now) {
                // for making fielset appear animation
                opacity = 1 - now;
                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                previous_fs.css({
                    'opacity': opacity
                });
            },
            duration: 500
        });
        setProgressBar(--current);
    });
    function setProgressBar(curStep) {
        var percent = parseFloat("" + 100 / steps) * curStep;
        percent = percent.toFixed();
        $(".progress-bar")
            .css("width", percent + "%");
    }
    $(".submit").click(function () {
        return false;
    });
    //////////////////start view more //////////////
    $('#show').click(function () {
        $('.menu').toggle("slide");
        var text = $(this).text();
        if (text == "More info") {
            /*if text inside #toggleMessage is Show...*/
            $(this).text("Less info"); /*Change button text to Hide*/
        }
        else {
            $(this).text("More info"); /*Change button text to Show*/
        }
    });
    ////////////////////end///////////
});
/////////////////////////////////////////////////////////////////
var map;
var originPlaceId;
var destinationPlaceId;
// waypoint inputs logic
var waypointID = 0;
var waypointInputs = [];
var originInput;
var destInput;
var directionsService;
var directionsRenderer;
var pageMode = "distance";
function initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: {
            lat: 26.8206,
            lng: 30.8025
        } //Egypt.
    });
    directionsService = new google.maps.DirectionsService;
    directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: true,
        map: this.map,
        panel: document.getElementById('right-panel')
    });
    directionsRenderer.addListener('directions_changed', function () {
        computeTotalDistance(directionsRenderer.getDirections());
        computeTotalTime(directionsRenderer.getDirections());
    });
    originInput = document.getElementById("inputAddress");
    destInput = document.getElementById("inputAddress2");
    initOrigDestsAutocompelete();
}
function displayRoute() {
    var wayponints = waypointInputs.slice();
    wayponints = wayponints.map(function (e) {
        if (e.place) {
            var lat = e.place.geometry.location.lat();
            var lng = e.place.geometry.location.lng();
            return {
                location: lat + ", " + lng
            };
        }
    });
    directionsService.route({
        origin: {
            placeId: this.originPlaceId
        },
        waypoints: wayponints ? wayponints : null,
        destination: {
            placeId: this.destinationPlaceId
        },
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: false
    }, function (response, status) {
        if (status === 'OK') {
            this.directionsRenderer.setDirections(response);
        }
        else {
            alert('Could not display directions due to: ' + status);
        }
    });
}
function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    document.getElementById('distance-result').innerText = total + ' km';
}
function computeTotalTime(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].duration.value;
    }
    var totalObj = secondsToTime(total);
    document.getElementById('time-result').innerHTML = totalObj.h + "h " + totalObj.m + "m";
}
function secondsToTime(secs) {
    var hours = Math.floor(secs / (60 * 60));
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);
    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}
function initWaypointsAutocompelete() {
    var _this = this;
    var _loop_1 = function (i) {
        var waypoint = waypointInputs[i];
        var input = waypoint.input;
        var inputAutocomplete = new google.maps.places.Autocomplete(input);
        inputAutocomplete.addListener("place_changed", function () {
            var place = inputAutocomplete.getPlace();
            waypoint.place = place;
            if (_this.originPlaceId && _this.destinationPlaceId) {
                displayRoute();
            }
        });
    };
    for (var i = 0; i < waypointInputs.length; i++) {
        _loop_1(i);
    }
}
function initOrigDestsAutocompelete() {
    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    originAutocomplete.setFields(["place_id"]);
    setupPlaceChangedListener(originAutocomplete, "ORIG");
    var destAutocomplete = new google.maps.places.Autocomplete(destInput);
    destAutocomplete.setFields(["place_id"]);
    setupPlaceChangedListener(destAutocomplete, "DEST");
}
function setupPlaceChangedListener(autocomplete, mode) {
    var _this = this;
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", function () {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === "ORIG") {
            _this.originPlaceId = place.place_id;
        }
        if (mode === "DEST") {
            _this.destinationPlaceId = place.place_id;
        }
        if (_this.originPlaceId && _this.destinationPlaceId) {
            displayRoute();
        }
    });
}
function initAddWaypointButton() {
    var btn = $("#add-waypoint");
    btn.click(function (e) {
        e.preventDefault();
        console.log("clicked");
        createWaypointInput();
    });
}
function createWaypointInput() {
    var originaInput = document.getElementById("inputAddress");
    var newInput = document.createElement("input");
    newInput.setAttribute("class", "form-control pickup-input waypoint_class");
    newInput.setAttribute("id", "waypoint_" + waypointID);
    newInput.setAttribute("placeholder", "Enter a waypoint");
    var newLabel = document.createElement("label");
    newLabel.setAttribute("for", "waypoint_" + waypointID);
    newLabel.innerText = "Waypoint Location";
    // create input container
    var newInputContainer = document.createElement("div");
    newInputContainer.setAttribute("class", "form-group inputAdress-waypoint");
    newInputContainer.setAttribute("id", "waypoint_container_" + waypointID);
    // add waypoint button
    var newbtn = document.createElement("button");
    newbtn.setAttribute("class", "pickup-button");
    newbtn.innerText = "+";
    $(newbtn).on("click", function (e) {
        e.preventDefault();
        createWaypointInput();
    });
    // remove waypoint button
    var deleteWatpoint = document.createElement("button");
    deleteWatpoint.setAttribute("class", "pickup-button delete-waypoint");
    deleteWatpoint.innerText = "-";
    $(deleteWatpoint).on("click", function (e) {
        e.preventDefault();
        newInputContainer.remove();
        for (var i = 0; i < waypointInputs.length; i++) {
            if (waypointInputs[i].input === newInput) {
                waypointInputs.splice(i, 1);
                break;
            }
        }
        displayRoute();
    });
    originaInput.parentElement.parentElement.append(newInputContainer);
    newInputContainer.append(newLabel);
    newInputContainer.append(newInput);
    newInputContainer.append(deleteWatpoint);
    newInputContainer.append(newbtn);
    waypointID++;
    var waypointObj = {
        input: newInput
    };
    waypointInputs.push(waypointObj);
    initWaypointsAutocompelete();
}
initAddWaypointButton();
function resetConsistannt() {
    waypointID = 0;
    waypointInputs = [];
    originPlaceId = null;
    $(".inputAdress-waypoint").remove();
}
function changeMode(mode) {
    console.log("mode changed");
    resetConsistannt();
    if (mode == "hourly") {
        $("#add-waypoint").remove();
    }
    if (mode == "distance" && pageMode == "hourly") {
        var e = $("#inputAdress-input");
        e.append("<button role=\"button\" class=\"pickup-button\" id=\"add-waypoint\">+</button>");
        var btn = $("#add-waypoint");
        $(btn).on("click", function (e) {
            e.preventDefault();
            createWaypointInput();
        });
        console.log("is this btn");
        console.log(btn);
    }
    pageMode = mode;
}
//# sourceMappingURL=main.js.map