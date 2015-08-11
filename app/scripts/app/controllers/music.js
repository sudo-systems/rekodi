rekodiApp.controller('rkMusicCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', '$localStorage', '$attrs', 'rkCacheService',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, $localStorage, $attrs, rkCacheService) {
    $scope.identifier = $attrs.id;
    $scope.selectedIndex = null;
    $scope.currentLevel = null;
    $scope.currentArtistId = null;
    $scope.currentAlbumId = null;
    $scope.artistsCategorised = {};
    $scope.artistsIndex = [];
    $scope.albums = {};
    $scope.songs = {};
    $scope.filter = {
      value: ''
    };
    var kodiWsApiConnection = null;
    
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
      
      createArtistsCategoriesIndex();
    }
    
    function createArtistsCategoriesIndex() {
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
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      $scope.clearFilter();
      getArtistsFromCache();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.AudioLibrary.GetArtists({
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
          handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    function addCustomAlbumsFiels(albums) {
      for(var key in albums) {
        if(albums[key].thumbnail && albums[key].thumbnail !== '') {
          albums[key].thumbnail_src = getImageSrc(albums[key].thumbnail);
        }

        if(albums[key].genre) {
          albums[key].display_genre = albums[key].genre.join(', ');
        }
      }
      
      return albums;
    }
    
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
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      $scope.clearFilter();
      getAlbumsFromCache(artist.artistid);
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.AudioLibrary.GetAlbums({
          properties: ['thumbnail', 'year', 'genre', 'displayartist'],
          filter: {
            artistid: artist.artistid
          },
          sort: {
            order: 'descending',
            method: 'year'
          }
        }).then(function(data) {
          data.albums = (data.albums === undefined)? [] : addCustomAlbumsFiels(data.albums);
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
          handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    function addCustomSongsFiels(songs) {
      for(var key in songs) {
        if(songs[key].thumbnail && songs[key].thumbnail !== '') {
          songs[key].thumbnail_src = getImageSrc(songs[key].thumbnail);
        }

        if(songs[key].genre) {
          songs[key].display_genre = songs[key].genre.join(', ');
        }
      }
      
      return songs;
    }

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
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      $scope.clearFilter();
      getSongsFromCache(album.albumid);
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.AudioLibrary.GetSongs({
          properties: ['thumbnail', 'year', 'genre', 'displayartist', 'track', 'album', 'duration'],
          filter: {
            albumid: $scope.currentAlbumId
          },
          sort: {
            order: 'ascending',
            method: 'track'
          }
        }).then(function(data) {
          data.songs = (data.songs === undefined)? [] : addCustomSongsFiels(data.songs);
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
          handleError(error);
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
    
    function getImageSrc(specialPath) {
      var usernameAndPassword = ($localStorage.settings.password && $localStorage.settings.password !== '')? $localStorage.settings.username+':'+$localStorage.settings.password+'@' : '';
      return 'http://'+usernameAndPassword+$localStorage.settings.serverAddress+':'+$localStorage.settings.httpPort+'/image/'+encodeURIComponent(specialPath);
    }
    
    function handleError(error) {
      var errorDetails = (error.response.data)? ' ('+error.response.data.stack.message+': '+error.response.data.stack.name+')' : '';
      $scope.$root.$emit('rkServerError', {
        message: error.response.message+errorDetails
      });
    }

    $scope.init = function() {
      rkCacheService.setCategory($scope.identifier);
      
      if($.isEmptyObject($scope.artists)) {
        $timeout(function() {
          $scope.getArtists();
        });
      }
    };
  }
]);