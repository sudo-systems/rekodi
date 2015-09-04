rekodiApp.factory('rkVideoLibraryService', ['$rootScope', 'rkCacheService', 'rkHelperService', 'kodiApiService', 'rkLogService', 'rkConfigService', 'rkNotificationService',
  function($rootScope, rkCacheService, rkHelperService, kodiApiService, rkLogService, rkConfigService, rkNotificationService) {
    var kodiApi = null;
    var cache = new rkCacheService.create('videoLibrary');
    var requestProperties = rkConfigService.get('apiRequestProperties', 'videoLibrary');




    var getMoviesFromCache = function() {
      var _data = cache.get({key: 'movies'});
      return (_data)? _data : [];
    };
    
    var getMoviesCategorisedFromCache = function() {
      var _data = cache.get({key: 'moviesCategorised'});
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
      cache.set({data: moviesCategorised, key: 'moviesCategorised'});
    }

    var getMoviesCategorised = function(callback) {
      if(kodiApi) {
        kodiApi.VideoLibrary.GetMovies({
          properties: requestProperties.movies,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.movies = (!data.movies)? [] : rkHelperService.addCustomFields(data.movies);
          
          if(data.movies.length === 0) {
            callback([]);
          }
          else if(cache.update({data: data.movies, key: 'movies'})) {
            updateMoviesCategorised(data.movies, callback);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback([]);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var getRecentlyAddedMoviesFromCache = function() {
      var _data = cache.get({key: 'recentlyAddedMovies'});
      return (_data)? _data : [];
    };
    
    var getRecentlyAddedMovies = function(limit, callback) {
      if(kodiApi) {
        limit = (!limit)? 10 : limit;
        
        kodiApi.VideoLibrary.GetRecentlyAddedMovies({
          properties: requestProperties.movies,
          limits: {
            start: 0,
            end: limit
          },
          sort: {
            order: 'descending',
            method: 'dateadded'
          }
        }).then(function(data) {
          data.movies = (!data.movies)? [] : rkHelperService.addCustomFields(data.movies);
          
          if(data.movies.length === 0) {
            callback([]);
          }
          else if(cache.update({data: data.movies, key: 'recentlyAddedMovies'})) {
            callback(data.movies);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback([]);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var markMovieWatched = function(movie, watched, callback) {
      if(!kodiApi) {
        callback(false);
        return;
      }
      
      kodiApi.VideoLibrary.SetMovieDetails({
        movieid: movie.movieid,
        lastplayed: (watched)? new Date().toISOString().slice(0, 19).replace('T', ' ') : ''
      }).then(function(result) {
        callback((result === 'OK'));
      }, function(error) {
        callback(false);
        rkLogService.error(error);
      });
    };
    
    var removeMovie = function(movie, callback) {
      if(!kodiApi) {
        callback(false);
        return;
      }
      
      kodiApi.VideoLibrary.RemoveMovie({
        movieid: movie.movieid
      }).then(function(result) {
        callback((result === 'OK'));
      }, function(error) {
        callback(false);
        rkLogService.error(error);
      });
    };
    
    
    
    
    
    var getTvShowsFromCache = function() {
      var _data = cache.get({key: 'tvShows'});
      return (_data)? _data : [];
    };
    
    var getTvShowsCategorisedFromCache = function() {
      var _data = cache.get({key: 'tvShowsCategorised'});
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
      cache.set({data: tvShowsCategorised, key: 'tvShowsCategorised'});
    }

    var getTvShowsCategorised = function(callback) {
      if(kodiApi) {
        kodiApi.VideoLibrary.GetTVShows({
          properties: requestProperties.tvShows,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.tvshows = (!data.tvshows)? [] : rkHelperService.addCustomFields(data.tvshows);

          if(data.tvshows.length === 0) {
            callback([]);
          }
          else if(cache.update({data: data.tvshows, key: 'tvShows'})) {
            updateTvShowsCategorised(data.tvshows, callback);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback([]);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var removeTvShow = function(tvShow, callback) {
      if(!kodiApi) {
        callback(false);
        return;
      }
      
      kodiApi.VideoLibrary.RemoveTvShow({
        tvshowid: tvShow.tvshowid
      }).then(function(result) {
        callback((result === 'OK'));
      }, function(error) {
        callback(false);
        rkLogService.error(error);
      });
    };
    
    
    
    var getSeasonsFromCache = function(tvShowId) {
      var _data = cache.get({key: 'seasons', index: tvShowId});
      return (_data)? _data : [];
    };
    
    var getSeasons = function(tvShowId, callback) {
      if(kodiApi) {
        kodiApi.VideoLibrary.GetSeasons({
          properties: requestProperties.seasons,
          tvshowid: tvShowId,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.seasons = (!data.seasons)? [] : rkHelperService.addCustomFields(data.seasons);

          if(data.seasons.length === 0) {
            callback([]);
          }
          else if(cache.update({data: data.seasons, key: 'seasons', index: tvShowId})) {
            callback(data.seasons);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback([]);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    
    
    
    
    var getEpisodesFromCache = function(tvShowId, season) {
      var _data = cache.get({key: 'episodes', index: tvShowId+'_'+season});
      return (_data)? _data : [];
    };
    
    var getEpisodes = function(tvShowId, season, callback) {
      if(kodiApi) {
        kodiApi.VideoLibrary.GetEpisodes({
          properties: requestProperties.episodes,
          tvshowid: tvShowId,
          season: season,
          sort: {
            order: 'ascending',
            method: 'episode'
          }
        }).then(function(data) {
          data.episodes = (!data.episodes)? [] : rkHelperService.addCustomFields(data.episodes);

          if(data.episodes.length === 0) {
            callback([]);
          }
          else if(cache.update({data: data.episodes, key: 'episodes', index: tvShowId+'_'+season})) {
            callback(data.episodes);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback([]);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
 
    var getRecentlyAddedEpisodesFromCache = function() {
      var _data = cache.get({key: 'recentlyAddedEpisodes'});
      return (_data)? _data : [];
    };
    
    var getRecentlyAddedEpisodes = function(limit, callback) {
      if(kodiApi) {
        limit = (!limit)? 10 : limit;
        
        kodiApi.VideoLibrary.GetRecentlyAddedEpisodes({
          properties: requestProperties.episodes,
          limits: {
            start: 0,
            end: limit
          },
          sort: {
            order: 'descending',
            method: 'dateadded'
          }
        }).then(function(data) {
          data.episodes = (!data.episodes)? [] : rkHelperService.addCustomFields(data.episodes);

          if(data.episodes.length === 0) {
            callback([]);
          }
          else if(cache.update({data: data.episodes, key: 'recentlyAddedEpisodes'})) {
            callback(data.episodes);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback([]);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var markEpisodeWatched = function(episode, watched, callback) {
      if(!kodiApi) {
        callback(false);
        return;
      }
      
      kodiApi.VideoLibrary.SetEpisodeDetails({
        episodeid: episode.episodeid,
        lastplayed: (watched)? new Date().toISOString().slice(0, 19).replace('T', ' ') : ''
      }).then(function(result) {
        callback((result === 'OK'));
      }, function(error) {
        callback(false);
        rkLogService.error(error);
      });
    };
    
    var removeEpisode = function(episode, callback) {
      if(!kodiApi) {
        callback(false);
        return;
      }
      
      kodiApi.VideoLibrary.RemoveEpisode({
        episodeid: episode.episodeid
      }).then(function(result) {
        callback((result === 'OK'));
      }, function(error) {
        callback(false);
        rkLogService.error(error);
      });
    };
    
    
    
    
    
    var scan = function(directory, callback) {
      if(kodiApi) {
        var _options = {};
      
        if(directory) {
          _options.directory = directory;
        }

        kodiApi.VideoLibrary.Scan(_options).then(function(result) {
          callback((result === 'OK'));
        }, function(error) {
          callback(false);
          rkLogService.error(error);
        });
      }
      else {
        callback(false);
      }
    };
    
    var clean = function(callback) {
      if(kodiApi) {
        kodiApi.VideoLibrary.Clean().then(function(result) {
          callback((result === 'OK'));
        }, function(error) {
          callback(false);
          rkLogService.error(error);
        });
      }
      else {
        callback(false);
      }
    };
    
    function initConnectionChange() {
      if(kodiApi) {
        kodiApi.VideoLibrary.OnCleanStarted(function(data) {
          rkNotificationService.notifyCleanDatabase('Video library cleanup has been started...');
        });
        
        kodiApi.VideoLibrary.OnCleanFinished(function(data) {
          rkNotificationService.notifyCleanDatabase('Video library cleanup has been completed');
        });
        
        kodiApi.VideoLibrary.OnScanStarted(function(data) {
          rkNotificationService.notifyDatabaseAdd('Video library has update has started...');
        });
        
        kodiApi.VideoLibrary.OnScanFinished(function(data) {
          rkNotificationService.notifyDatabaseAdd('The video library has been updated');
        });
        
        kodiApi.VideoLibrary.OnRemove(function(data) {
          console.dir(data);
          rkNotificationService.notifyDatabaseAdd(' has been removed from your library.');
        });
      }
    }
 
    function init() {
      kodiApi = kodiApiService.getConnection();
      initConnectionChange();
      
      $rootScope.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        initConnectionChange();
      });
    };

    init();
    
    return {
      getMoviesFromCache: getMoviesFromCache,
      getMoviesCategorisedFromCache: getMoviesCategorisedFromCache,
      getMoviesCategorised: getMoviesCategorised,
      getRecentlyAddedMoviesFromCache: getRecentlyAddedMoviesFromCache,
      getRecentlyAddedMovies: getRecentlyAddedMovies,
      markMovieWatched: markMovieWatched,
      removeMovie: removeMovie,
      
      getTvShowsFromCache: getTvShowsFromCache,
      getTvShowsCategorisedFromCache: getTvShowsCategorisedFromCache,
      getTvShowsCategorised: getTvShowsCategorised,
      removeTvShow: removeTvShow,
      
      getSeasonsFromCache: getSeasonsFromCache,
      getSeasons: getSeasons,
      
      getEpisodesFromCache: getEpisodesFromCache,
      getEpisodes: getEpisodes,
      getRecentlyAddedEpisodesFromCache: getRecentlyAddedEpisodesFromCache,
      getRecentlyAddedEpisodes: getRecentlyAddedEpisodes,
      markEpisodeWatched: markEpisodeWatched,
      removeEpisode: removeEpisode,
      
      scan: scan,
      clean: clean
    };
  }
]);