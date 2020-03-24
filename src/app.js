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
    $('#sign')
        .attr('width', canvasContainer.get(0).clientWidth - 30)
        .attr('height', 200);
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
      var signature = signaturePad.toDataURL('image/png');
      localStorage.setItem('signature', signature);
      console.log('Signature stored: ' + signature.substr(0, 20));
      return true;
    });
    _signaturePadInitilized = true;
  };

  var _initDataCheck =
      function() {
    $('.js-go-data-btn').click(function(e) {
      var name = document.getElementById('name').value;
      var birthday = document.getElementById('birthday').value;
      var address = document.getElementById('address').value;
      if (!name || !birthday || !address) {
        alert('Bitte fülle das Formular vollständig aus.');
      } else {
        localStorage.setItem('name', name);
        localStorage.setItem('birthday', birthday);
        localStorage.setItem('address', address);
      }
    });
  }

  var _initOnTheGo =
      function() {
    $('#on-the-go .name').html(localStorage.getItem('name'));
    $('#on-the-go .birthday').html(localStorage.getItem('birthday'));
    $('#on-the-go .address').html(localStorage.getItem('address'));

    $('.signatureImage').attr('src', localStorage.getItem('signature'));
  }

  var _initWelcomeHome =
      function() {
    // do anything
  }

  var _init = function() {
    _router
        .on({
          'zusammenfassung-unterschrift': function() {
            _setContent('zusammenfassung-unterschrift');
            _initSignaturePad();
          },
          'go-data': function() {
            _setContent('go-data');
            _initDataCheck();
          },
          'on-the-go': function() {
            _setContent('on-the-go');
            _initOnTheGo();
          },
          'end': function() {
            _setContent('end');
            _initWelcomeHome();
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

  var _removeActivity =
      function(activity) {
    console.log('_removeActivity:', activity);
    var history = _getActivityHistory();
    if (history.some(
            existing => existing.place.name == activity.place.name &&
                existing.formatted_address == activity.formatted_address)) {
      console.log('Activity removed.');
      history.splice(history.indexOf(activity));
      return localStorage.setItem('activityHistory', JSON.stringify(history));
    } else {
      console.log('Activity not removed; didn\'t exist.');
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

    fetch(detailUri)
        .then(function(response) {
          if (response.status !== 200) {
            console.log(
                'Looks like there was a problem. Status Code: ' +
                response.status);
            return;
          }

          response.json().then(function(data) {
            let desc = (data.current.desc != null) ?
                data.current.desc :
                'Keine Echtzeit-Daten verfügbar';
            let hour = (data.current.hour != null) ? data.current.hour :
                                                     new Date().getHours();

            if (data.current.desc == null) {
              $('#placeInfo').addClass('alert-info');
              $('.days-chart ').hide();
            }

            $('.currentHour').html(hour);
            $('.currentDesc').html(desc);
          });
        })
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });
  }

  return {
    GetUserLocation: _getUserLocation,                //
        GetActivityHistory: _getActivityHistory,      //
        GetActivity: _getActivity,                    //
        AddActivity: _addActivity,                    //
        RemoveActivity: _removeActivity,              //
        ClearActivityHistory: _clearActivityHistory,  //
        GetPopularTimes: _getPopularTimes             //
  }
})();

ShelterInPlace.Application = (function() {
  // Search for places up to 100km around the user.
  const kSearchRadius = 100000;

  // Initializes the entire app. Checks the URL for the page that we're on, and
  // dispatches accordingly.
  var _init = function() {
    if (document.location.pathname.endsWith('/about.html')) {
      _initAbout();
    } else if (document.location.pathname.endsWith('/news.html')) {
      _initNews();
    } else if (document.location.pathname.endsWith('/home.html')) {
      _initHome();
    } else if (document.location.pathname.endsWith('/go.html')) {
      _initGo();
    } else {
      console.log(
          '_init: no special action on page: ' + document.location.pathname);
    }
  };

  var _initAbout =
      function() {
    $('a.about').addClass('active');
  }

  var _initNews =
      function() {
    $('a.news').addClass('active');
  }

  // Initializes the `home` page of the app.
  var _initHome = function() {
    $('a.go').addClass('active');

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
        ShelterInPlace.Utilities.AddActivity({'place': place});

        // ... and go.
        document.location.href =
            document.location.href.replace('/home.html', '/go.html');
      });
    }

    // Fill the search history
    var element = document.getElementById('search-history');
    var history = ShelterInPlace.Utilities.GetActivityHistory();

    if (history.length != 0) {
      // clear
      $(element).html('');

      history.forEach(activity => {
        console.log('Adding from history: ', activity);
        var recentPlace = document.createElement('div');
        recentPlace.className =
            'list-group-item list-group-ite-primary list-group-item-action flex-column align-items-start mb-3';

        var div = document.createElement('div');
        div.className = 'd-flex w-100 justify-content-between';

        var h5 = document.createElement('h5');
        h5.className = 'mb-1';

        var span = document.createElement('span');
        span.className = 'placeName mr-1';
        span.innerText = activity.place.name;
        h5.appendChild(span);

        var span = document.createElement('span');
        span.className = 'placeType';
        span.innerHTML = 'Einkauf';
        h5.appendChild(span);
        div.appendChild(h5);

        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-button btn';

        var img = document.createElement('img');
        img.src = '/data/img/icon-delete.svg';
        img.alt = 'Delete this place';
        deleteButton.appendChild(img);
        div.appendChild(deleteButton);
        recentPlace.appendChild(div);

        var p = document.createElement('p');
        p.className = 'mb-1';

        var span2 = document.createElement('span');
        span2.className = 'placeAddress';
        span2.innerText = activity.place.formatted_address;
        p.appendChild(span2);
        recentPlace.appendChild(p);

        var small2 = document.createElement('div');
        small2.className = 'alert alert-success mt-2 mb-0 col-12 text-center';
        small2.innerText = 'Weniger Besucher als gewöhnlich.';
        recentPlace.appendChild(small2);

        element.appendChild(recentPlace);
      })
    }


    // Init the "latest destination" buttons. Currently, we use these for
    // debugging to set the place to a hard-coded value.
    $('.latest .list-group-item').click((e) => {
      var link = e.target.closest('.list-group-item');
      var activity = ShelterInPlace.Utilities.GetActivity();
      activity.place = {
        name: $(link).find('.placeName').text(),
        formatted_address: $(link).find('.placeAddress').text(),
        addr_address: $(link).find('.placeAddress').text(),
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
    $('a.go').addClass('active');

    var activity = ShelterInPlace.Utilities.GetActivity();

    $('.placeName').html(activity.place.name);
    $('.placeAddress').html(activity.place.formatted_address);
    $('.placeWeekday').html(activity.place.weekday_text);

    // load popular times
    ShelterInPlace.Utilities.GetPopularTimes(
        '#placeInfo',
        activity.place.name + ',' + activity.place.formatted_address);
  };

  return {
    Init: _init
  }
})();
