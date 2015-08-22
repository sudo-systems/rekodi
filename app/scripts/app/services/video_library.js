rekodiApp.factory('rkVideoLibraryService', ['$rootScope', 'rkCacheService', 'rkHelperService',
  function($rootScope, rkCacheService, rkHelperService) {
    var _kodiApi = null;
    var _cache = new rkCacheService.create('videoLibrary');

    var getMoviesFromCache = function() {
      return _cache.get({key: 'movies'});
    };
    
    var getMoviesCategorisedFromCache = function() {
      return _cache.get({key: 'moviesCategorised'});
    };
    
    function updateMoviesCategorised(movies, callback) {
      var moviesCategorised = {};
      
      for(var key in movies) {
        var firstLetter = movies[key].label.charAt(0).toUpperCase();

        if(moviesCategorised[firstLetter] === undefined) {
          moviesCategorised[firstLetter] = [];
        }

        moviesCategorised[firstLetter].push(movies[key]);
      }

      callback(moviesCategorised);
      _cache.set({data: moviesCategorised, key: 'moviesCategorised'});
    }

    var getMoviesCategorised = function(callback) {
      if(_kodiApi) {
        _kodiApi.VideoLibrary.GetMovies({
          properties: ['thumbnail', 'year', 'rating', 'plotoutline', 'genre', 'runtime', 'resume', 'lastplayed', 'file'],
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.movies = (!data.movies)? [] : rkHelperService.addCustomFields(data.movies);

          if(_cache.update({data: data.movies, key: 'movies'})) {
            updateMoviesCategorised(data.movies, callback);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback([]);
          rkHelperService.handleError(error);
        });
        
        return;
      }
      
      callback([]);
    };
 
    function init() {
      $rootScope.$on('rkWsConnectionStatusChange', function (event, connection) {
        _kodiApi = connection;
      });
    };

    init();
    
    return {
      getMoviesFromCache: getMoviesFromCache,
      getMoviesCategorisedFromCache: getMoviesCategorisedFromCache,
      getMoviesCategorised: getMoviesCategorised
    };
  }
]);