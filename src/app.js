/**
 * @fileoverview Main JavaScript code for app.ausgangssperre.io.
 */

// Bootstrap on all pages
$(function() {
  $('body').bootstrapMaterialDesign();
  ShelterInPlace.Router.Init();
  ShelterInPlace.Application.Init();
});

var ShelterInPlace = ShelterInPlace || {};

ShelterInPlace.Router = (function() {
  var _router = new Navigo(null, /*useHash=*/ true, /*hash=*/ '#!');

  var _setContent = function(area) {
    console.log('_setContent:', area);
    $('section.route-active')
        .removeClass('route-active')
        .addClass('route-inactive');
    $('section#' + area).removeClass('route-inactive').addClass('route-active');
  };

  var _signaturePadInitilized = false;
  var _initSignaturePad = function() {
    if (_signaturePadInitilized) {
      return;
    }
    var canvasContainer = $('#canvas-container');

    // do not style canvas width and height via css, this will break
    // functionality!
    $('#sign').attr('width', canvasContainer.outerWidth()).attr('height', 300);
    var canvas = document.querySelector('canvas');
    var signaturePad = new SignaturePad(canvas);

    $('.js-reset-sign').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      signaturePad.clear();
    });
    $('.js-jetzt-unterschreiben-btn').click(function(e) {
      if (signaturePad.isEmpty()) {
        alert('Bitte unterschreibe im Signaturfeld!');
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // fetch sign as png data url
      var sign = signaturePad.toDataURL();

      // @TODO: store data in local storage

      return true;
    });
    _signaturePadInitilized = true;
  };

  var _init = function() {
    _router
        .on({
          'jetzt-losgehen': function() {
            _setContent('jetzt-losgehen');
          },
          'zusammenfassung-unterschrift': function() {
            _setContent('zusammenfassung-unterschrift');
            _initSignaturePad();
          },
          '*': function() {
            _setContent('home')
          }
        })
        .resolve();
  };

  return {
    Init: _init,
    SetContent: _setContent,
    Navigate: _router.navigate.bind(_router),
  };
})();

ShelterInPlace.Utilities = (function() {
  // Obtains all we know about the current activity. This is *the* core state of
  // the app, where we store all we know about what the user intends to do.
  var _getActivity = function() {
    var history = _getActivityHistory();
    if (history.length > 0) {
      return history[history.length - 1];
    }
    return {}
  };

  var _removeActivity = function (activity) {
    console.log('_removeActivity:', activity);
    var history = _getActivityHistory();
    if (history.some(
      existing => existing.place.name == activity.place.name &&
        existing.formatted_address == activity.formatted_address)) {
      console.log('Activity removed.');
      history.splice(history.indexOf(activity));
      return localStorage.setItem('activityHistory', JSON.stringify(history));
    } else {
      console.log("Activity not removed; didn't exist.");
    }
  }

  // Returns the history of all activities.
  var _getActivityHistory = function() {
    return JSON.parse(localStorage.getItem('activityHistory') || '[]');
  };

  // Adds the current activity. Call this to persist the activity's state after
  // the activity has been modified. For debugging, call
  // `ShelterInPlace.Utilities.AddActivity({...})` in the JavaScript console to
  // put the app in a particular state.
  var _addActivity =
      function(activity) {
    console.log('_addActivity:', activity);
    var history = _getActivityHistory();
    if (!history.some(
            existing => existing.place.name == activity.place.name &&
                existing.formatted_address == activity.formatted_address)) {
      console.log('Activity added.');
      history.push(activity);
      return localStorage.setItem('activityHistory', JSON.stringify(history));
    } else {
      console.log('Activity not added; already existed.');
    }
  }

  var _clearActivityHistory =
      function() {
    console.log('Activity history cleared');
    return localStorage.setItem('activityHistory', '[]');
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

  var _getPopularTimes =
      function(id, placeId) {
          let baseUri = 'https://api.ausgangssperre.io/place/';
          let detailUri = baseUri + placeId;

          var request = new XMLHttpRequest();
          request.open('GET', detailUri, true);

          request.onload = function() {
              if (request.status >= 200 && request.status < 400) {
                  // Success!
                  var data = JSON.parse(request.responseText);
                  console.log(data);

                  // $(id).html('#####');

              } else {
                  console.log('popular times api returned a error');
              }
          };

          request.onerror = function() {
              console.log('popular times api connection error');
          };

          request.send();
  }

  return {
    GetUserLocation: _getUserLocation,                //
    GetActivityHistory: _getActivityHistory,      //
    GetActivity: _getActivity,                    //
    AddActivity: _addActivity,                    //
    RemoveActivity: _removeActivity,
    ClearActivityHistory: _clearActivityHistory,  //
    GetPopularTimes: _getPopularTimes
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
        ShelterInPlace.Utilities.AddActivity({"place": place});

        // ... and go.
        document.location.href =
            document.location.href.replace('/home.html', '/go.html');
      });
    }

    // Fill the search history
    var element = document.getElementById('search-history');
    var history = ShelterInPlace.Utilities.GetActivityHistory();
    if (history.length != 0) {
      history.forEach(activity => {
        console.log('Adding from history: ', activity);
        var a = document.createElement('A');
        a.className =
            'list-group-item list-group-item-action flex-column align-items-start border mb-3';

        var div = document.createElement('div');
        div.className = 'd-flex w-100 justify-content-between';

        var h5 = document.createElement('h5');
        h5.className = 'mb-1';

        var span = document.createElement('span');
        span.className = 'place-name';
        span.innerHTML = activity.place.name;
        h5.appendChild(span);

        var small = document.createElement('small');
        small.innerHTML = 'Einkauf';
        h5.appendChild(small);
        div.appendChild(h5);

        var img = document.createElement('img');
        img.src = '/data/img/icon-delete.svg';
        img.width = 20;
        img.height = 20;
        div.appendChild(img);
        a.appendChild(div);

        var p = document.createElement('p');
        p.className = 'mb-1';

        var span2 = document.createElement('span');
        span2.className = 'place-address';
        span2.innerHTML = activity.place.formatted_address;
        p.appendChild(span2);
        a.appendChild(p);

        var small2 = document.createElement('small');
        small2.className = 'p-3 mb-2 bg-success';
        small2.innerHTML = 'Weniger Besucher als gewöhnlich.';
        a.appendChild(small2);

        element.appendChild(a);
      })
    } else {
      document.getElementById('history-text').innerHTML = 'Keine Letzten Ziele.'
    }

    // Init the "latest destination" buttons. Currently, we use these for
    // debugging to set the place to a hard-coded value.
    $('.latest a').click((e) => {
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
      ShelterInPlace.Utilities.AddActivity(activity);
      document.location.href =
          document.location.href.replace('/home.html', '/go.html');
    });
  };

  // Initializes the `go` page of the app.
  var _initGo = function() {
    var activity = ShelterInPlace.Utilities.GetActivity();

    $('.placeName').html(activity.place.name);
    $('.placeAddress').html(activity.place.formatted_address);
    $('.placeWeekday').html(activity.place.weekday_text);

    // load popular times
    ShelterInPlace.Utilities.GetPopularTimes('#placeInfo', activity.place.name + activity.place.formatted_address);

    $('.js-jetzt-losgehen-btn').on('click', function() {
      ShelterInPlace.Router.Navigate('jetzt-losgehen');
    })
  };

  return {
    Init: _init
  }
})();
