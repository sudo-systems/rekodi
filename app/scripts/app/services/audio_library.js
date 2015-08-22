rekodiApp.factory('rkAudioLibraryService', ['$rootScope', 'rkCacheService', 'rkHelperService',
  function($rootScope, rkCacheService, rkHelperService) {
    var _kodiApi = null;
    var _cache = new rkCacheService.create('audioLibrary');

    var getArtsistsFromCache = function() {
      return _cache.get({key: 'artists'});
    };
    
    var getArtistsCategorisedFromCache = function() {
      return _cache.get({key: 'artistsCategorised'});
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
          rkHelperService.handleError(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var getAlbumsFromCache = function(artistId) {
      return _cache.get({key: 'albums', index: artistId});
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
          rkHelperService.handleError(error);
        });
        
        return;
      }
      
      callback([]);
    };
    
    var getSongsFromCache = function(albumId) {
      return _cache.get({key: 'songs', index: albumId});
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
      getArtsistsFromCache: getArtsistsFromCache,
      getArtistsCategorisedFromCache: getArtistsCategorisedFromCache,
      getArtistsCategorised: getArtistsCategorised,
      getAlbumsFromCache: getAlbumsFromCache,
      getAlbums: getAlbums,
      getSongsFromCache: getSongsFromCache,
      getSongs: getSongs
    };
  }
]);