rekodiApp.controller('rkMusicLibraryCtrl', ['$scope', 'rkAudioLibraryService', 'rkDialogService', '$timeout',
  function($scope, rkAudioLibraryService, rkDialogService, $timeout) {
    $scope.displayLimit = 15;
    var kodiApi = null;
    $scope.currentLevel = null;
    $scope.artistsCategorised = {};
    $scope.albums = [];
    $scope.songs = [];
    $scope.artistsIndex = [];
    $scope.scrollItems = {
      artists: [],
      albums: [],
      songs: []
    };
    $scope.isFiltering = false;
    $scope.currentArtistId = null;
    $scope.currentAlbumId = null;
    $scope.filteredItems = [];
    $scope.guiModels = {
      filterValue: '',
      selectedIndex: null
    };

    function refreshData() {
      if($scope.currentLevel === 'artists') {
        $scope.artistsCategorised = {};
        $scope.getArtistsCategorised();
      }
      else if ($scope.currentLevel === 'albums'){
        $scope.albums = [];
        $scope.getAlbums($scope.currentArtistId);
      }
      else if($scope.currentLevel === 'songs') {
        $scope.songs = [];
        $scope.getSongs($scope.currentAlbumId);
      }
    }

    function createCategorisedIndex(artistsCategorised) {
      $scope.artistsIndex = [];

      for (var key in artistsCategorised) {
        if (artistsCategorised.hasOwnProperty(key)) {
          $scope.artistsIndex.push(key);
        }
      }

      return $scope.artistsIndex;
    }

    function getDefaultIndex(artistsIndex) {
      for(var key in artistsIndex) {
        if(artistsIndex[key].toLowerCase() !== artistsIndex[key].toUpperCase()) {
          return artistsIndex[key];
        }
      }
      
      return null;
    }
    
    $scope.getArtistsCategorised = function() {
      $scope.currentLevel = 'artists';
      $scope.displayLimit = 15;
      $scope.currentAlbumId = null;
      $scope.currentArtistId = null;
      
      if(Object.keys($scope.artistsCategorised).length === 0) {
        $scope.artistsCategorised = rkAudioLibraryService.getArtistsCategorisedFromCache();
        applyArtistsData($scope.artistsCategorised);
      }

      rkAudioLibraryService.getArtistsCategorised(function(artistsCategorised) {
        if($scope.artistsCategorised === null) {
          return;
        }
        
        if(artistsCategorised && !angular.equals(artistsCategorised, $scope.artistsCategorised)) {
          $scope.artistsCategorised = artistsCategorised;
          applyArtistsData($scope.artistsCategorised);
        }
      });
    };
    
    function applyArtistsData(artistsCategorised) {
      $scope.artistsIndex = createCategorisedIndex(artistsCategorised);
      $scope.guiModels.selectedIndex = getDefaultIndex($scope.artistsIndex);
      
      if(!$scope.$$phase){
        $scope.$apply();
      }
    }
    
    $scope.showArtistOptionsDialog = function(artist) {
      rkDialogService.showArtistOptions(artist);
    };

    $scope.getAlbums = function(artistId) {
      $scope.currentLevel = 'albums';
      $scope.displayLimit = 5;
      $scope.currentArtistId = artistId;
      $scope.currentAlbumId = null;
      $scope.albums = rkAudioLibraryService.getAlbumsFromCache(artistId);
      
      if(!$scope.$$phase){
        $scope.$apply();
      }

      rkAudioLibraryService.getAlbums(artistId, function(albums) {
        if(albums === null) {
          return;
        }
        
        if(albums && !angular.equals(albums, $scope.albums)) {
          $scope.albums = albums;
          
          if(!$scope.$$phase){
            $scope.$apply();
          }
        }
      });
    };
    
    $scope.showAlbumOptionsDialog = function(album) {
      rkDialogService.showAlbumOptions(album);
    };

    $scope.getSongs = function(albumId) {
      $scope.currentLevel = 'songs';
      $scope.displayLimit = 5;
      $scope.currentAlbumId = albumId;
      $scope.songs = rkAudioLibraryService.getSongsFromCache(albumId);
      
      if(!$scope.$$phase){
        $scope.$apply();
      }

      rkAudioLibraryService.getSongs(albumId, function(songs) {
        if(songs === null) {
          return;
        }
        
        if(songs && !angular.equals(songs, $scope.songs)) {
          $scope.songs = songs;
          
          if(!$scope.$$phase){
            $scope.$apply();
          }
        }
      });
    };
    
    $scope.updateLibrary = function() {
      rkAudioLibraryService.scan();
    };
    
    $scope.cleanLibrary = function() {
      rkDialogService.showConfirm('Are you sure sou want to clean your music library?', function() {
        rkAudioLibraryService.clean();
        return true;
      });
    };
    
    $scope.showSongOptionsDialog = function(song) {
      rkDialogService.showSongOptions(song);
    };

    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.clearFilter(false);
        return;
      }
      
      $scope.isFiltering = true;
      $scope.filteredItems = [];
      var items = [];

      if($scope.currentLevel === 'artists') {
        items = rkAudioLibraryService.getArtsistsFromCache();
      }
      else if($scope.currentLevel === 'albums') {
        items = $scope.albums;
      }
      else if($scope.currentLevel === 'songs') {
        items = $scope.songs;
      }

      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.filteredItems.push(items[key]);
        }
      }
    };
    
    $scope.clearFilter = function(clearValue) {
      $scope.isFiltering = false;
      $scope.filteredItems = [];
      clearValue = (clearValue === undefined)? true : clearValue;
      
      if(clearValue) {
        $scope.guiModels.filterValue = '';
      }
 
      if($scope.currentLevel === 'albums') {        

      }
      else if($scope.currentLevel === 'songs') {

      }
      else if($scope.currentLevel === 'artists') {

      }
    };

    var init = function() {
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        
        if(kodiApi) {
          $scope.getArtistsCategorised();

          kodiApi.AudioLibrary.OnCleanFinished(function(data) {
            refreshData();
          });

          kodiApi.AudioLibrary.OnScanFinished(function(data) {
            refreshData();
          });
        }
      });
    };

    $scope.$evalAsync(function() {
      $timeout(function() {
        init();
      });
    });
  }
]);