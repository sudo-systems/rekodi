rekodiApp.factory('rkAudioLibraryService', ['$rootScope', 'rkCacheService', 'rkHelperService', 'kodiApiService', 'rkLogService',
  function($rootScope, rkCacheService, rkHelperService, kodiApiService, rkLogService) {
    var _kodiApi = null;
    var _cache = new rkCacheService.create('audioLibrary');

    var getArtsistsFromCache = function() {
      var _data = _cache.get({key: 'artists'});
      return (_data)? _data : [];
    };
    
    var getArtistsCategorisedFromCache = function() {
      var _data = _cache.get({key: 'artistsCategorised'});
      return (_data)? _data : [];
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
      _cache.set({data: artistsCategorised, key: 'artistsCategorised'});
    }

    var getArtistsCategorised = function(callback) {
      if(_kodiApi) {
        _kodiApi.AudioLibrary.GetArtists({
          albumartistsonly: false,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.artists = (!data.artists)? [] : data.artists;

          if(_cache.update({data: data.artists, key: 'artists'})) {
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
      var _data = _cache.get({key: 'albums', index: artistId});
      return (_data)? _data : [];
    };

    var getAlbums = function(artistId, callback) {
      if(_kodiApi) {
        _kodiApi.AudioLibrary.GetAlbums({
          properties: ['thumbnail', 'year', 'genre', 'displayartist'],
          filter: {
            artistid: artistId
          },
          sort: {
            order: 'descending',
            method: 'year'
          }
        }).then(function(data) {
          data.albums = (!data.albums)? [] : rkHelperService.addCustomFields(data.albums);

          if(_cache.update({data: data.albums, key: 'albums', index: artistId})) {
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
      var _data = _cache.get({key: 'songs', index: albumId});
      return (_data)? _data : [];
    };

    var getSongs = function(albumId, callback) {
      if(_kodiApi) {
        _kodiApi.AudioLibrary.GetSongs({
          properties: ['thumbnail', 'year', 'genre', 'displayartist', 'track', 'album', 'duration'],
          filter: {
            albumid: albumId
          },
          sort: {
            order: 'ascending',
            method: 'track'
          }
        }).then(function(data) {
          data.songs = (!data.songs)? [] : rkHelperService.addCustomFields(data.songs);

          if(_cache.update({data: data.songs, key: 'songs', index: albumId})) {
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
      var _data = _cache.get({key: 'recentlyAddedAlbums'});
      return (_data)? _data : [];
    };
    
    var getRecentlyAddedAlbums = function(limit, callback) {
      if(_kodiApi) {
        limit = (!limit)? 10 : limit;
        
        _kodiApi.AudioLibrary.GetRecentlyAddedAlbums({
          properties: ['thumbnail', 'year', 'genre', 'displayartist'],
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

          if(_cache.update({data: data.albums, key: 'recentlyAddedAlbums'})) {
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

    function init() {
      _kodiApi = kodiApiService.getConnection();
      
      $rootScope.$on('rkWsConnectionStatusChange', function (event, connection) {
        _kodiApi = connection;
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
      getSongs: getSongs
    };
  }
]);