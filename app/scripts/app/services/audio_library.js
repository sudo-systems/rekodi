rekodiApp.factory('rkAudioLibraryService', ['$rootScope', 'rkCacheService', 'rkHelperService', 'kodiApiService', 'rkLogService', 'rkConfigService', 'rkNotificationService',
  function($rootScope, rkCacheService, rkHelperService, kodiApiService, rkLogService, rkConfigService, rkNotificationService) {
    var kodiApi = null;
    var cache = new rkCacheService.create('audioLibrary');
    var requestProperties = rkConfigService.get('apiRequestProperties', 'audioLibrary');

    var getArtsistsFromCache = function() {
      var data = cache.get({key: 'artists'});
      return (data)? data : [];
    };
    
    var getArtistsCategorisedFromCache = function() {
      var data = cache.get({key: 'artistsCategorised'});
      return (data)? data : [];
    };
    
    function updateArtistsCategorised(artists, callback) {
      var artistsCategorised = {};
      
      for(var key in artists) {
        var firstLetter = artists[key].label.charAt(0).toUpperCase();

        if(artistsCategorised[firstLetter] === undefined) {
          artistsCategorised[firstLetter] = [];
        }

        artistsCategorised[firstLetter].push(artists[key]);
      }

      callback(artistsCategorised);
      cache.set({data: artistsCategorised, key: 'artistsCategorised'});
    }

    var getArtistsCategorised = function(callback) {
      if(kodiApi) {
        kodiApi.AudioLibrary.GetArtists({
          albumartistsonly: false,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.artists = (!data.artists)? [] : data.artists;

          if(cache.update({data: data.artists, key: 'artists'})) {
            updateArtistsCategorised(data.artists, callback);
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
    
    var getAlbumsFromCache = function(artistId) {
      var data = cache.get({key: 'albums', index: artistId});
      return (data)? data : [];
    };

    var getAlbums = function(artistId, callback) {
      if(kodiApi) {
        kodiApi.AudioLibrary.GetAlbums({
          properties: requestProperties.albums,
          filter: {
            artistid: artistId
          },
          sort: {
            order: 'descending',
            method: 'year'
          }
        }).then(function(data) {
          data.albums = (!data.albums)? [] : rkHelperService.addCustomFields(data.albums);

          if(cache.update({data: data.albums, key: 'albums', index: artistId})) {
            callback(data.albums);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback(null);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var getSongsFromCache = function(albumId) {
      var data = cache.get({key: 'songs', index: albumId});
      return (data)? data : [];
    };

    var getSongs = function(albumId, callback) {
      if(kodiApi) {
        kodiApi.AudioLibrary.GetSongs({
          properties: requestProperties.songs,
          filter: {
            albumid: albumId
          },
          sort: {
            order: 'ascending',
            method: 'track'
          }
        }).then(function(data) {
          data.songs = (!data.songs)? [] : rkHelperService.addCustomFields(data.songs);

          if(cache.update({data: data.songs, key: 'songs', index: albumId})) {
            callback(data.songs);
          }
          else {
            callback(null);
          }
        }, function(error) {
          callback(null);
          rkLogService.error(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var getRecentlyAddedAlbumsFromCache = function() {
      var data = cache.get({key: 'recentlyAddedAlbums'});
      return (data)? data : [];
    };
    
    var getRecentlyAddedAlbums = function(limit, callback) {
      if(kodiApi) {
        limit = (!limit)? 10 : limit;
        
        kodiApi.AudioLibrary.GetRecentlyAddedAlbums({
          properties: requestProperties.albums,
          limits: {
            start: 0,
            end: limit
          },
          sort: {
            order: 'descending',
            method: 'dateadded'
          }
        }).then(function(data) {
          data.albums = (!data.albums)? [] : rkHelperService.addCustomFields(data.albums);

          if(cache.update({data: data.albums, key: 'recentlyAddedAlbums'})) {
            callback(data.albums);
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
    
    var scan = function(directory, callback) {
      var _options = {};
      
      if(directory) {
        _options.directory = directory;
      }
      
      kodiApi.AudioLibrary.Scan(_options).then(function(result) {
        callback((result === 'OK'));
      }, function(error) {
        callback(false);
        rkLogService.error(error);
      });
    };
    
    var clean = function(callback) {
      if(kodiApi) {
        kodiApi.AudioLibrary.Clean().then(function(result) {
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
        kodiApi.AudioLibrary.OnCleanStarted(function(data) {
          rkNotificationService.notifyCleanDatabase('Music library cleanup has started...');
        });
        
        kodiApi.AudioLibrary.OnCleanFinished(function(data) {
          rkNotificationService.notifyCleanDatabase('Music library cleanup has been completed');
        });
        
        kodiApi.AudioLibrary.OnScanStarted(function(data) {
          rkNotificationService.notifyDatabaseAdd('Music library update has started...');
        });
        
        kodiApi.AudioLibrary.OnScanFinished(function(data) {
          rkNotificationService.notifyDatabaseAdd('The music library has been updated');
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
      getArtsistsFromCache: getArtsistsFromCache,
      getArtistsCategorisedFromCache: getArtistsCategorisedFromCache,
      getArtistsCategorised: getArtistsCategorised,
      getAlbumsFromCache: getAlbumsFromCache,
      getAlbums: getAlbums,
      getRecentlyAddedAlbumsFromCache: getRecentlyAddedAlbumsFromCache,
      getRecentlyAddedAlbums: getRecentlyAddedAlbums,
      getSongsFromCache: getSongsFromCache,
      getSongs: getSongs,
      scan: scan,
      clean: clean
    };
  }
]);