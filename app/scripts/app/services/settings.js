rekodiApp.factory('rkSettingsService', ['$localStorage',
  function($localStorage) {
    var set = function(options) {
      var config = angular.extend({}, {
        category: null, //optional
        key: null, //required
        value: null //required
      }, options);

      if(config.category) {
        if(!$localStorage.settings[config.category] || $localStorage.settings[config.category].constructor !== Object) {
          $localStorage.settings[config.category] = {};
        }
        
        $localStorage.settings[config.category][config.key] = config.value;
      }
      else {
        $localStorage.settings[config.key] = config.value;
      }
    };
    
    var get = function(options) {
      var config = angular.extend({}, {
        category: null, //optional
        key: null //optional
      }, options);

      if(config.category && config.key) {
        if($localStorage.settings[config.category] && $localStorage.settings[config.category].constructor === Object && $localStorage.settings[config.category][config.key]) {
          return $localStorage.settings[config.category][config.key];
        }
      }
      else if(config.category) {
        return ($localStorage.settings[config.category])? $localStorage.settings[config.category] : null;
      }
      else if(config.key) {
        return ($localStorage.settings[config.key])? $localStorage.settings[config.key] : null;
      }
      
      return null;
    };
    
    var isConnectionConfigured = function() {
      return (!$localStorage.settings.connection.serverAddress === '' || 
        $localStorage.settings.connection.serverAddress.lenght < 4 ||
        !$localStorage.settings.connection.jsonRpcPort === '' || 
        $localStorage.settings.connection.jsonRpcPort.length < 2 ||
        !$localStorage.settings.connection.httpPort === '' || 
        $localStorage.settings.connection.httpPort.length < 2)? false : true;
    };
    
    function init() {
      if(!$localStorage.settings) {
        $localStorage.settings = {
          connection: {
            serverAddress: '',
            jsonRpcPort: 9090,
            httpPort: 8080,
            username: '',
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