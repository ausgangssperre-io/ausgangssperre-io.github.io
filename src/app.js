/**
 * @fileoverview Main JavaScript code for app.ausgangssperre.io.
 */

// Bootstrap on all pages
$(function() {
  $('body').bootstrapMaterialDesign();
  ShelterInPlace.Application.Init();
  BindEventsOnGoPage();
});

var ShelterInPlace = ShelterInPlace || {};

ShelterInPlace.Utilities = (function() {
  // Obtains all we know about the current activity. This is *the* core state of
  // the app, where we store all we know about what the user intends to do.
  var _getActivity =
      function() {
    return JSON.parse(localStorage.getItem('activity') || '{}');
  }

  // Sets the current activity. Call this to persist the activity's state after
  // the activity has been modified. For debugging, call
  // `ShelterInPlace.Utilities.SetActivity({...})` in the JavaScript console to
  // put the app in a particular state.
  var _setActivity =
      function(activity) {
    console.log('Activity updated:', activity);
    return localStorage.setItem('activity', JSON.stringify(activity));
  }

  // Obtains the user's location
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
    GetUserLocation: _getUserLocation, GetActivity: _getActivity,
        SetActivity: _setActivity,
  }
})();

ShelterInPlace.Application = (function() {
  // Search for places up to 10km around the user.
  const kSearchRadius = 10000;

  // Initializes the entire app. Checks the URL for the page that we're on, and
  // dispatches accordingly.
  var _init = function() {
    if (document.location.pathname == '/' ||
        document.location.pathname == '/index.html') {
      _initIndex();
    } else if (document.location.pathname.endsWith('/home.html')) {
      _initHome();
    } else if (document.location.pathname.endsWith('/go.html')) {
      _initGo();
    } else {
      console.error('_init: Unknown page: ' + document.location.pathname);
    }
  };

  // Initialized the index page. This is also our way to clear the state.
  var _initIndex = function() {
    ShelterInPlace.Utilities.SetActivity({});
  };

  // Initializes the `home` page of the app.
  var _initHome = function() {
    // Request the user's location and init the autocomplete search bar once we
    // get it.
    ShelterInPlace.Utilities.GetUserLocation(
        function(position) {
          var latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          var circle =
              new google.maps.Circle({center: latLng, radius: kSearchRadius});
          _initAutocomplete(latLng, circle);
        },
        function(browserHasGeolocation) {
          _initAutocomplete();
        });

    var _initAutocomplete =
        function(latLng, circle) {
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

        // Set place data...
        activity = ShelterInPlace.Utilities.GetActivity();
        activity.place = place;
        ShelterInPlace.Utilities.SetActivity(activity);

        // ... and go.
        document.location.href =
            document.location.href.replace('/home.html', '/go.html');
      });
    }

        // Init the "latest destination" buttons. Currently, we use these for
        // debugging to set the place to a hard-coded value.
        $('.latest a')
            .click((e) => {
              var link = e.target.closest('a');
              var activity = ShelterInPlace.Utilities.GetActivity();
              activity.place = {
                name: $(link).find('.place-name').text(),
                formatted_address: $(link).find('.place-address').text(),
                addr_address: $(link).find('.place-address').text(),
                address_components: [
                  {
                    'long_name': 'Laim',
                    'short_name': 'Laim',
                    'types': ['sublocality_level_1', 'sublocality', 'political']
                  },
                  {
                    'long_name': 'Munich',
                    'short_name': 'Munich',
                    'types': ['locality', 'political']
                  },
                  {
                    'long_name': 'Munich',
                    'short_name': 'Munich',
                    'types': ['administrative_area_level_3', 'political']
                  },
                  {
                    'long_name': 'Upper Bavaria',
                    'short_name': 'Upper Bavaria',
                    'types': ['administrative_area_level_2', 'political']
                  },
                  {
                    'long_name': 'Bavaria',
                    'short_name': 'BY',
                    'types': ['administrative_area_level_1', 'political']
                  },
                  {
                    'long_name': 'Germany',
                    'short_name': 'DE',
                    'types': ['country', 'political']
                  }
                ],
              };
              ShelterInPlace.Utilities.SetActivity(activity);
              document.location.href =
                  document.location.href.replace('/home.html', '/go.html');
            });
  };

  // Initializes the `go` page of the app.
  var _initGo = function() {
    var activity = ShelterInPlace.Utilities.GetActivity();

    $('#placeName').html(activity.place.name);
    $('#placeAddress').html(activity.place.formatted_address);
    $('#placeWeekday').html(activity.place.weekday_text);
  };

  return {
    Init: _init
  }
})();


/**
 * binds click-event on page go.html
 */
function BindEventsOnGoPage() {
  $(document).ready(function(){
    $('.js-jetzt-losgehen-btn').on('click', function(){
      router.navigate('jetzt-losgehen');
    })
  });
}
