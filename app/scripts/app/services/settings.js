rekodiApp.factory('rkSettingsService', ['$localStorage',
  function($localStorage) {
    var set = function(options) {
      var _options = angular.extend({}, {
        category: null, //optional
        key: null, //required
        value: null //required
      }, options);

      if(_options.category) {
        if(!$localStorage.settings[_options.category] || $localStorage.settings[_options.category].constructor !== Object) {
          $localStorage.settings[_options.category] = {};
        }
        
        $localStorage.settings[_options.category][_options.key] = _options.value;
      }
      else {
        $localStorage.settings[_options.key] = _options.value;
      }
    };
    
    var get = function(options) {
      var _options = angular.extend({}, {
        category: null, //optional
        key: null, //optional
      }, options);

      if(_options.category && $localStorage.settings[_options.category].constructor === Object) {
        if(_options.key) {
          return ($localStorage.settings[_options.category][_options.key])? $localStorage.settings[_options.category][_options.key] : null;
        }

        return ($localStorage.settings[_options.category])? $localStorage.settings[_options.category] : null;
      }
      else if(_options.key) {
        return ($localStorage.settings[_options.key])? $localStorage.settings[_options.key] : null;
      }
      
      return null;
    };
    
    var isConnectionConfigured = function() {
      return (!$localStorage.settings.serverAddress || 
        $localStorage.settings.serverAddress.lenght < 4 ||
        !$localStorage.settings.jsonRpcPort || 
        $localStorage.settings.jsonRpcPort.length < 2)? false : true;
    };
    
    function init() {
      if(!$localStorage.settings) {
        $localStorage.settings = {
          connection: {
            serverAddress: '',
            jsonRpcPort: 9090,
            httpPort: 8080,
            username: 'kodi',
            password: ''
          },
          nowPlaying: {
            fanartWallpaper: true
          },
          tvShowsLibrary: {
            hideWatched: false,
            showEpisodePlot: false,
            showTvShowDescription: false
          },
          moviesLibrary: {
            hideWatched: false,
            showPlot: false
          }
        };
      }
    }
    
    init();
    
    return {
      set: set,
      get: get,
      isConnectionConfigured: isConnectionConfigured
    };
  }
]);