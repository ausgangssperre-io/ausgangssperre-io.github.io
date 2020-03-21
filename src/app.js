/**
 * @fileoverview Main JavaScript code for app.ausgangssperre.io.
 */

// Bootstrap on all pages
$(function() {
  $('body').bootstrapMaterialDesign();
  ShelterInPlace.Application.Init();
});

var ShelterInPlace = ShelterInPlace || {};

ShelterInPlace.Utilities = (function() {
  var _getUserLocation =
      function(successCallback, failureCallback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          function(position) {
            successCallback(position);
          },
          function() {
            failureCallback(true);
          });
    } else {
      failureCallback(false);
    }
  }

  return {
    GetUserLocation: _getUserLocation
  }
})();

ShelterInPlace.Application = (function() {
  var _init = function() {
    ShelterInPlace.Utilities.GetUserLocation(
        function(position) {
          var latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          var circle = new google.maps.Circle(
              {center: latLng, radius: position.coords.accuracy});
          _initAutocomplete(latLng, circle);
        },
        function(browserHasGeolocation) {
          _initAutocomplete();
        });

    var _initAutocomplete = function(latLng, circle) {
      var input = document.getElementById('autocomplete_search');
      var autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.setBounds(circle.getBounds());

      autocomplete.setOptions({
        strictBounds: true,
        // types: ['store'] @todo set allowed types
        // https://developers.google.com/places/android-sdk/reference/com/google/android/libraries/places/api/model/Place.Type
      })

      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();

        // set place data
        console.log(place);
        $('.place-data').removeClass('d-none');
        $('.latest').addClass('d-none');
        $('.info').addClass('d-none');

        $('#placeName').html(place.name);
        $('#placeAddress').html(place.formatted_address);
        $('#placeWeekday').html(place.weekday_text);


        // place variable will have all the information you are looking for.
        $('#lat').val(place.geometry['location'].lat());
        $('#long').val(place.geometry['location'].lng());
      });
    }
  };

  return {
    Init: _init
  }
})();
