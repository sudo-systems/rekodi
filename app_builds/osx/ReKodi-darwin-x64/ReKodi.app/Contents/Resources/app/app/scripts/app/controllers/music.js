rekodiApp.controller('rkMusicCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', '$attrs', 'rkCacheService', 'rkHelperService',
  function($scope, $element, kodiApiService, rkTooltipsService, $attrs, rkCacheService, rkHelperService) {
    $scope.identifier = $attrs.id;
    $scope.selectedIndex = null;
    $scope.currentLevel = null;
    $scope.currentArtistId = null;
    $scope.currentAlbumId = null;
    $scope.artistsCategorised = {};
    $scope.artistsIndex = [];
    $scope.albums = {};
    $scope.songs = {};
    var kodiApi = null;
    $scope.filter = {
      value: ''
    };
    
    function getArtistsFromCache() {
      if(Object.keys($scope.artistsCategorised).length === 0) {
        $scope.artistsCategorised = rkCacheService.get({key: 'artistsCategorised'});
      }

      if($scope.artistsIndex.length === 0) {
        $scope.artistsIndex = rkCacheService.get({key: 'artistsIndex'});
      }

      if($scope.artistsIndex.length > 0) {
        setDefaultSelectedIndex();
      }
    }

    function createArtistsCategorised(artists) {
      $scope.artistsCategorised = {};
      
      for(var key in artists) {
        var firstLetter = artists[key].label.charAt(0).toUpperCase();

        if($scope.artistsCategorised[firstLetter] === undefined) {
          $scope.artistsCategorised[firstLetter] = [];
        }

        $scope.artistsCategorised[firstLetter].push(artists[key]);
      }
      
      rkCacheService.set({
        data: $scope.artistsCategorised,
        key: 'artistsCategorised'
      });
      
      createArtistsCategorisedIndex();
    }
    
    function createArtistsCategorisedIndex() {
      $scope.artistsIndex = [];

      for (var key in $scope.artistsCategorised) {
        if ($scope.artistsCategorised.hasOwnProperty(key)) {
          $scope.artistsIndex.push(key);
        }
      }
      
      rkCacheService.set({
        data: $scope.artistsIndex,
        key: 'artistsIndex'
      });
      
      setDefaultSelectedIndex();
    }

    $scope.getArtists = function() {
      $scope.currentLevel = 'artists';
      $scope.clearFilter();

      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getArtistsFromCache();
        
        kodiApi.AudioLibrary.GetArtists({
          albumartistsonly: false,
          sort: {
            order: 'ascending',
            method: 'label'
          }
        }).then(function(data) {
          data.artists = (data.artists === undefined)? [] : data.artists;
          var properties = {
            data: data.artists,
            key: 'artists'
          };
          
          if(rkCacheService.update(properties)) {
            createArtistsCategorised(data.artists);
          }
          else {
            getArtistsFromCache();
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };

    function getAlbumsFromCache(artistId) {
      if(!$scope.albums[artistId]) {
        $scope.albums[artistId] = rkCacheService.get({
          key: 'albums',
          index: artistId
        });
      }
    }

    $scope.getAlbums = function(artist) {
      $scope.currentLevel = 'albums';
      $scope.currentArtistId = artist.artistid;
      $scope.clearFilter();

      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getAlbumsFromCache(artist.artistid);
        
        kodiApi.AudioLibrary.GetAlbums({
          properties: ['thumbnail', 'year', 'genre', 'displayartist'],
          filter: {
            artistid: artist.artistid
          },
          sort: {
            order: 'descending',
            method: 'year'
          }
        }).then(function(data) {
          data.albums = (data.albums === undefined)? [] : rkHelperService.addCustomFields(data.albums);
          var properties = {
            data: data.albums,
            key: 'albums',
            index: artist.artistid
          };
          
          if(rkCacheService.update(properties)) {
            $scope.albums[artist.artistid] = data.albums;
          }
          else {
            getAlbumsFromCache(artist.artistid);
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };

    function getSongsFromCache(albumId) {
      if(!$scope.songs[albumId]) {
        $scope.songs[albumId] = rkCacheService.get({
          key: 'songs',
          index: albumId
        });
      }
    }

    $scope.getSongs = function(album) {
      $scope.currentLevel = 'songs';
      $scope.currentAlbumId = album.albumid;
      $scope.clearFilter();
      
      if(kodiApi) {
        $scope.$root.$emit('rkStartLoading');
        getSongsFromCache(album.albumid);
        
        kodiApi.AudioLibrary.GetSongs({
          properties: ['thumbnail', 'year', 'genre', 'displayartist', 'track', 'album', 'duration'],
          filter: {
            albumid: $scope.currentAlbumId
          },
          sort: {
            order: 'ascending',
            method: 'track'
          }
        }).then(function(data) {
          data.songs = (data.songs === undefined)? [] : rkHelperService.addCustomFields(data.songs);
          var properties = {
            data: data.songs,
            key: 'songs',
            index: album.albumid
          };
          
          if(rkCacheService.update(properties)) {
            $scope.songs[album.albumid] = data.songs;
          }
          else {
            getSongsFromCache(album.albumid);
          }

          $scope.$root.$emit('rkStopLoading');
          rkTooltipsService.apply($($element).find('.data-list-wrapper'));
        }, function(error) {
          rkHelperService.handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    $scope.playSong = function(song) {
      if(song.back === true) {
        $scope.getAlbums(song);
      }
    };
    
    $scope.filterList = function(entry) {
      return (entry.label.toLowerCase().indexOf($scope.filter.value.toLowerCase()) > -1 || entry.label === '..');
    };
    
    $scope.clearFilter = function() {
      $scope.filter.value = '';
    };
    
    function setDefaultSelectedIndex() {
      for(var key in $scope.artistsIndex) {
        if($scope.artistsIndex[key].toLowerCase() !== $scope.artistsIndex[key].toUpperCase()) {
          $scope.selectedIndex = $scope.artistsIndex[key];
          break;
        }
      }
    }
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi && $.isEmptyObject($scope.artists)) {
        $scope.getArtists();
      }
    }

    $scope.init = function() {
      rkCacheService.setCategory($scope.identifier);
      initConnectionChange();
      
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, data) {
        initConnectionChange();
      });
    };
  }
]);