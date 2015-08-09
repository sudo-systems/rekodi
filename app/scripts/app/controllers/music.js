rekodiApp.controller('rkMusicCtrl', ['$scope', '$element', '$timeout', 'rkKodiWsApiService', 'rkTooltipsService', '$localStorage',
  function($scope, $element, $timeout, rkKodiWsApiService, rkTooltipsService, $localStorage) {
    $scope.artists = [];
    $scope.albums = [];
    $scope.songs = [];
    $scope.alphabeticLibrary = [];
    $scope.alphabeticIndex = [];
    $scope.selectedIndex = null;
    $scope.currentLevel = null;
    $scope.filter = {
      value: ''
    };
    var kodiWsApiConnection = null;
    
    $scope.getArtists = function(reload) {
      $scope.currentLevel = 'artists';
      reload = (reload === undefined)? true : reload;
      
      $scope.clearFilter();
      
      if(!reload) {
        return;
      }
      
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
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
          $scope.artists = data.artists;
          
          for(var key in $scope.artists) {
            var firstLetter = $scope.artists[key].label.charAt(0).toLowerCase();
            
            if($scope.alphabeticLibrary[firstLetter] === undefined) {
              $scope.alphabeticLibrary[firstLetter] = [];
            }
            
            $scope.alphabeticLibrary[firstLetter][key] = $scope.artists[key];
          }
          
          for (var key in $scope.alphabeticLibrary) {
            if ($scope.alphabeticLibrary.hasOwnProperty(key)) {
              $scope.alphabeticIndex.push(key);
            }
          }
          
          $scope.selectedIndex = $scope.alphabeticIndex[0];

          $scope.$root.$emit('rkStopLoading');
        }, function(error) {
          handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    $scope.getAlbums = function(artist) {
      $scope.albums = [];
      $scope.currentLevel = 'albums';
      
      $scope.clearFilter();

      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
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
          data.albums = (data.albums === undefined)? [] : data.albums;
          $scope.albums = data.albums;
          
          for(var key in $scope.albums) {
            $scope.albums[key].artistid = artist.artistid;
            
            if($scope.albums[key].thumbnail && $scope.albums[key].thumbnail !== '') {
              $scope.albums[key].thumbnail_src = getImageSrc($scope.albums[key].thumbnail);
            }
            
            if($scope.albums[key].genre) {
              $scope.albums[key].display_genre = $scope.albums[key].genre.join(', ');
            }
          }

          var dirUp = {
            label: '[back to artists] ..',
            back: true
          };

          $scope.albums.unshift(dirUp);
          $scope.$root.$emit('rkStopLoading');
        }, function(error) {
          handleError(error);
          $scope.$root.$emit('rkStopLoading');
        });
      }
    };
    
    $scope.getSongs = function(album, reload) {
      $scope.songs = [];
      $scope.currentLevel = 'songs';
      reload = (reload === undefined)? true : reload;
      
      $scope.clearFilter();
      
      if(album.back === true) {
        $scope.getArtists(false);
        return;
      }
      
      if(!reload) {
        return;
      }
      
      kodiWsApiConnection = rkKodiWsApiService.getConnection();
      
      if(kodiWsApiConnection) {
        $scope.$root.$emit('rkStartLoading');
        
        kodiWsApiConnection.AudioLibrary.GetSongs({
          properties: ['thumbnail', 'track'],
          filter: {
            albumid: album.albumid
          },
          sort: {
            order: 'ascending',
            method: 'track'
          }
        }).then(function(data) {
          data.songs = (data.songs === undefined)? [] : data.songs;
          $scope.songs = data.songs;
          
          for(var key in $scope.songs) {
            if($scope.songs[key].thumbnail && $scope.songs[key].thumbnail !== '') {
              $scope.songs[key].thumbnail_src = getImageSrc($scope.songs[key].thumbnail);
            }
          }
          
          var dirUp = {
            label: '[back to albums] ..',
            back: true,
            artistid: album.artistid
          };

          $scope.songs.unshift(dirUp);
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
    };
  }
]);