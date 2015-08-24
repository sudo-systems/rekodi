rekodiApp.factory('rkVideoLibraryService', ['$rootScope', 'rkCacheService', 'rkHelperService', 'kodiApiService',
  function($rootScope, rkCacheService, rkHelperService, kodiApiService) {
    var _kodiApi = null;
    var _cache = new rkCacheService.create('videoLibrary');

    var getMoviesFromCache = function() {
      var _data = _cache.get({key: 'movies'});
      return (_data)? _data : [];
    };
    
    var getMoviesCategorisedFromCache = function() {
      var _data = _cache.get({key: 'moviesCategorised'});
      return (_data)? _data : [];
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
    
    var getTvShowsFromCache = function() {
      var _data = _cache.get({key: 'tvShows'});
      return (_data)? _data : [];
    };
    
    var getTvShowsCategorisedFromCache = function() {
      var _data = _cache.get({key: 'tvShowsCategorised'});
      return (_data)? _data : [];
    };
    
    function updateTvShowsCategorised(tvShows, callback) {
      var tvShowsCategorised = {};
      
      for(var key in tvShows) {
        var firstLetter = tvShows[key].label.charAt(0).toUpperCase();

        if(tvShowsCategorised[firstLetter] === undefined) {
          tvShowsCategorised[firstLetter] = [];
        }

        tvShowsCategorised[firstLetter].push(tvShows[key]);
      }

      callback(tvShowsCategorised);
      _cache.set({data: tvShowsCategorised, key: 'tvShowsCategorised'});
    }

    var getTvShowsCategorised = function(callback) {
      if(_kodiApi) {
        _kodiApi.VideoLibrary.GetTVShows({
          properties: ['thumbnail', 'watchedepisodes', 'episode', 'premiered', 'rating', 'plot', 'genre', 'file'],
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.tvshows = (!data.tvshows)? [] : rkHelperService.addCustomFields(data.tvshows);

          if(_cache.update({data: data.tvshows, key: 'tvShows'})) {
            updateTvShowsCategorised(data.tvshows, callback);
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
    
    var getSeasonsFromCache = function(tvShowId) {
      var _data = _cache.get({key: 'seasons', index: tvShowId});
      return (_data)? _data : [];
    };
    
    var getSeasons = function(tvShowId, callback) {
      if(_kodiApi) {
        _kodiApi.VideoLibrary.GetSeasons({
          properties: ['thumbnail', 'showtitle', 'season', 'watchedepisodes', 'episode'],
          tvshowid: tvShowId,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.seasons = (!data.seasons)? [] : rkHelperService.addCustomFields(data.seasons);

          if(_cache.update({data: data.seasons, key: 'seasons', index: tvShowId})) {
            callback(data.seasons);
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
    
    var getEpisodesFromCache = function(tvShowId, season) {
      var _data = _cache.get({key: 'episodes', index: tvShowId+'_'+season});
      return (_data)? _data : [];
    };
    
    var getEpisodes = function(tvShowId, season, callback) {
      if(_kodiApi) {
        _kodiApi.VideoLibrary.GetEpisodes({
          properties: ['thumbnail', 'showtitle', 'plot', 'rating', 'season', 'episode', 'firstaired', 'runtime', 'streamdetails', 'lastplayed', 'resume'],
          tvshowid: tvShowId,
          season: season,
          sort: {
            order: 'ascending',
            method: 'episode'
          }
        }).then(function(data) {
          data.episodes = (!data.episodes)? [] : rkHelperService.addCustomFields(data.episodes);

          if(_cache.update({data: data.episodes, key: 'episodes', index: tvShowId+'_'+season})) {
            callback(data.episodes);
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
      _kodiApi = kodiApiService.getConnection();
      
      $rootScope.$on('rkWsConnectionStatusChange', function (event, connection) {
        _kodiApi = connection;
      });
    };

    init();
    
    return {
      getMoviesFromCache: getMoviesFromCache,
      getMoviesCategorisedFromCache: getMoviesCategorisedFromCache,
      getMoviesCategorised: getMoviesCategorised,
      getTvShowsFromCache: getTvShowsFromCache,
      getTvShowsCategorisedFromCache: getTvShowsCategorisedFromCache,
      getTvShowsCategorised: getTvShowsCategorised,
      getSeasonsFromCache: getSeasonsFromCache,
      getSeasons: getSeasons,
      getEpisodesFromCache: getEpisodesFromCache,
      getEpisodes: getEpisodes
    };
  }
]);