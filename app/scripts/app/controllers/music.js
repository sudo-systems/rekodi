rekodiApp.controller('rkMusicCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', '$localStorage',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, $localStorage) {
    $scope.identifier = 'musicLibrary';
    $scope.selectedIndex = null;
    $scope.currentLevel = null;
    $scope.currentArtistId = null;
    $scope.currentAlbumId = null;
    $scope.artists = [];
    $scope.artistsCategorised = {};
    $scope.alphabeticIndex = [];
    $scope.albums = {};
    $scope.songs = {};
    $scope.filter = {
      value: ''
    };
    var kodiWsApiConnection = null;
    
    function getArtistsFromCache() {
      if($localStorage.cache[$scope.identifier].artists) {
        if($scope.artists.length === 0) {
          $scope.artists = JSON.parse($localStorage.cache[$scope.identifier].artists);
        }

        if($localStorage.cache[$scope.identifier].artistsCategorised && Object.keys($scope.artistsCategorised).length === 0) {
          $scope.artistsCategorised = JSON.parse($localStorage.cache[$scope.identifier].artistsCategorised);
        }

        if($localStorage.cache[$scope.identifier].alphabeticIndex && $scope.alphabeticIndex.length === 0) {
          $scope.alphabeticIndex = JSON.parse($localStorage.cache[$scope.identifier].alphabeticIndex);
        }

        if($scope.alphabeticIndex.length > 0) {
          setDefaultSelectedIndex();
        }
      }
    }
    
    function updateArtsistsCache(artists) {
      if(!$localStorage.cache[$scope.identifier].artists || $localStorage.cache[$scope.identifier].artists !== JSON.stringify(artists)) {
        processArtists(artists);
        return true;
      }
      
      return false;
    }
    
    function processArtists(artists) {
      $localStorage.cache[$scope.identifier].artists = JSON.stringify(artists);
      $scope.artists = artists;
      $scope.artistsCategorised = {};
      $scope.alphabeticIndex = [];

      for(var key in $scope.artists) {
        var firstLetter = $scope.artists[key].label.charAt(0).toUpperCase();

        if($scope.artistsCategorised[firstLetter] === undefined) {
          $scope.artistsCategorised[firstLetter] = [];
        }

        $scope.artistsCategorised[firstLetter].push($scope.artists[key]);
      }

      $localStorage.cache[$scope.identifier].artistsCategorised = JSON.stringify($scope.artistsCategorised);

      for (var key in $scope.artistsCategorised) {
        if ($scope.artistsCategorised.hasOwnProperty(key)) {
          $scope.alphabeticIndex.push(key);
        }
      }

      $localStorage.cache[$scope.identifier].alphabeticIndex = JSON.stringify($scope.alphabeticIndex);
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

          if(!updateArtsistsCache(data.artists)) {
            getArtistsFromCache();
          }

          $scope.$root.$emit('rkStopLoading');
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
      if($localStorage.cache[$scope.identifier].albums && (!$scope.albums[artistId] || $scope.albums[artistId].length === 0)) {
        var albumsCacheTemp = JSON.parse($localStorage.cache[$scope.identifier].albums);
        $scope.albums[artistId] = (albumsCacheTemp[artistId])? albumsCacheTemp[artistId] : [];
      }
    }
    
    function updateAlbumsCache(albums, artistId) {
      albums = addCustomAlbumsFiels(albums);
      
      if($localStorage.cache[$scope.identifier].albums) {
        var albumsCacheTemp = JSON.parse($localStorage.cache[$scope.identifier].albums);
        
        if(!albumsCacheTemp[artistId] || JSON.stringify(albumsCacheTemp[artistId]) !== JSON.stringify(albums)) {
          processAlbums(albums, artistId);
          return true;
        }
      }
      else {
        processAlbums(albums, artistId);
        return true;
      }
      
      return false;
    }
    
    function processAlbums(albums, artistId) {
      albums = addCustomAlbumsFiels(albums);
      var albumsCacheTemp = ($localStorage.cache[$scope.identifier].albums)? JSON.parse($localStorage.cache[$scope.identifier].albums) : {};
      albumsCacheTemp[artistId] = albums;
      $localStorage.cache[$scope.identifier].albums = JSON.stringify(albumsCacheTemp);
      $scope.albums[artistId] = albums;
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
            artistid: $scope.currentArtistId
          },
          sort: {
            order: 'descending',
            method: 'year'
          }
        }).then(function(data) {
          data.albums = (data.albums === undefined)? [] : data.albums;
          
          if(!updateAlbumsCache(data.albums, artist.artistid)) {
            getAlbumsFromCache(artist.artistid);
          }

          $scope.$root.$emit('rkStopLoading');
        }, function(error) {
          handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };

    function getSongsFromCache(songId) {
      if($localStorage.cache[$scope.identifier].songs && (!$scope.songs[songId] || $scope.songs[songId].length === 0)) {
        var songsCacheTemp = JSON.parse($localStorage.cache[$scope.identifier].songs);
        $scope.songs[songId] = (songsCacheTemp[songId])? songsCacheTemp[songId] : [];
      }
    }
    
    function updateSongsCache(songs, songId) {
      if($localStorage.cache[$scope.identifier].songs) {
        var songsCacheTemp = JSON.parse($localStorage.cache[$scope.identifier].songs);
        
        if(!songsCacheTemp[songId] || JSON.stringify(songsCacheTemp[songId]) !== JSON.stringify(songs)) {
          processSongs(songs, songId);
          return true;
        }
      }
      else {
        processSongs(songs, songId);
        return true;
      }
      
      return false;
    }
    
    function processSongs(songs, songId) {
      var songsCacheTemp = ($localStorage.cache[$scope.identifier].songs)? JSON.parse($localStorage.cache[$scope.identifier].songs) : {};
      songsCacheTemp[songId] = songs;
      $localStorage.cache[$scope.identifier].songs = JSON.stringify(songsCacheTemp);
      $scope.songs[songId] = songs;
    }
    
    $scope.getSongs = function(album) {
      $scope.currentLevel = 'songs';
      $scope.currentAlbumId = album.albumid;
      
      $scope.clearFilter();
      getSongsFromCache(album.albumid);
      
      if(album.back === true) {
        $scope.getArtists();
        return;
      }

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.AudioLibrary.GetSongs({
          properties: ['thumbnail', 'track'],
          filter: {
            albumid: $scope.currentAlbumId
          },
          sort: {
            order: 'ascending',
            method: 'track'
          }
        }).then(function(data) {
          data.songs = (data.songs === undefined)? [] : data.songs;

          if(!updateSongsCache(data.songs, album.albumid)) {
            getSongsFromCache(album.albumid);
          }
          
          $scope.$root.$emit('rkStopLoading');
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
      for(var key in $scope.alphabeticIndex) {
        if($scope.alphabeticIndex[key].toLowerCase() !== $scope.alphabeticIndex[key].toUpperCase()) {
          $scope.selectedIndex = $scope.alphabeticIndex[key];
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
      if($.isEmptyObject($scope.library)) {
        $timeout(function() {
          $scope.getArtists();
        });
      }
      
      if(!$localStorage.cache) {
        $localStorage.cache = {};
      }
      
      if(!$localStorage.cache[$scope.identifier]) {
        $localStorage.cache[$scope.identifier] = {};
      }
    };
  }
]);