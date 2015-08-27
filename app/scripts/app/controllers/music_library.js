rekodiApp.controller('rkMusicLibraryCtrl', ['$scope', 'kodiApiService', 'rkAudioLibraryService', 'rkDialogService',
  function($scope, kodiApiService, rkAudioLibraryService, rkDialogService) {
    var displayLimit = 15;
    var kodiApi = null;
    $scope.currentLevel = null;
    $scope.artistsCategorised = {};
    $scope.artistsIndex = [];
    $scope.scrollItems = [];
    $scope.isFiltering = false;
    $scope.currentArtistId = null;
    $scope.currentAlbumId = null;
    $scope.filteredItems = [];
    $scope.isInitialized = false;
    $scope.albums = {};
    $scope.songs = {};
    $scope.guiModels = {
      filterValue: '',
      selectedIndex: null
    };
    
    $scope.showItems = function(options) {
      var _scrollItemsCount = 0;
      var _options = angular.extend({}, {
        key: null,
        reset: false, //optional
        data: null //required
      }, options);

      if($scope.isFiltering && !_options.reset) {
        _options.data = $scope.filteredItems;
      }

      if(_options.key !== null) {
        if(!$scope.scrollItems[_options.key] || _options.reset) {
          $scope.scrollItems[_options.key] = [];
        }
        
        _scrollItemsCount = $scope.scrollItems[_options.key].length;
      }
      else {
        if(_options.reset) {
          $scope.scrollItems = [];
        }
        
        _scrollItemsCount = $scope.scrollItems.length;
      }

      if(!_options.data || !_options.data[_scrollItemsCount]) {
        return;
      }
      
      for(var x = 0; x < displayLimit; x++) {
        var nextIndex = ((_scrollItemsCount)+x);

        if(_options.data[nextIndex]) {
          if(_options.key) {
            $scope.scrollItems[_options.key].push(_options.data[nextIndex]);
          }
          else {
            $scope.scrollItems.push(_options.data[nextIndex]);
          }
        }
      }

      if(!$scope.$$phase){
        $scope.$apply();
      }
    };

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
      displayLimit = 15;
      $scope.currentAlbumId = null;
      $scope.currentArtistId = null;
      
      if(Object.keys($scope.artistsCategorised).length === 0) {
        $scope.artistsCategorised = rkAudioLibraryService.getArtistsCategorisedFromCache();
        applyArtistsData($scope.artistsCategorised);
      }

      rkAudioLibraryService.getArtistsCategorised(function(artistsCategorised) {
        if(artistsCategorised && !angular.equals(artistsCategorised, $scope.artistsCategorised)) {
          $scope.artistsCategorised = artistsCategorised;
          applyArtistsData($scope.artistsCategorised);
        }
      });
    };
    
    function applyArtistsData(artistsCategorised) {
      $scope.artistsIndex = createCategorisedIndex(artistsCategorised);
      $scope.guiModels.selectedIndex = getDefaultIndex($scope.artistsIndex);
      
      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: artistsCategorised[$scope.guiModels.selectedIndex]
      });
    }

    $scope.getAlbums = function(artistId) {
      $scope.currentLevel = 'albums';
      displayLimit = 5;
      $scope.currentArtistId = artistId;
      $scope.currentAlbumId = null;

      if(!$scope.albums[artistId]) {
        $scope.albums[artistId] = [];
      }
      
      if($scope.albums[artistId].length === 0) {
        $scope.albums[artistId] = rkAudioLibraryService.getAlbumsFromCache(artistId);
      }

      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.albums[artistId]
      });

      rkAudioLibraryService.getAlbums(artistId, function(albums) {
        if(albums && !angular.equals(albums, $scope.albums[artistId])) {
          $scope.albums[artistId] = albums;
          
          $scope.showItems({
            key: $scope.currentLevel,
            reset: true,
            data: $scope.albums[artistId]
          });
        }
      });
    };
    
    $scope.showAlbumOptionsDialog = function(album) {
      rkDialogService.showAlbumOptions(album);
    };

    $scope.getSongs = function(albumId) {
      $scope.currentLevel = 'songs';
      displayLimit = 5;
      $scope.currentAlbumId = albumId;
      
      if(!$scope.songs[albumId]) {
        $scope.songs[albumId] = [];
      }
      
      if($scope.songs[albumId].length === 0) {
        $scope.songs[albumId] = rkAudioLibraryService.getSongsFromCache(albumId);
      }

      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.songs[albumId]
      });
      
      rkAudioLibraryService.getSongs(albumId, function(songs) {
        if(songs && !angular.equals(songs, $scope.songs[albumId])) {
          $scope.songs[albumId] = songs;

          $scope.showItems({
            key: $scope.currentLevel,
            reset: true,
            data: $scope.songs[albumId]
          });
        }
      });
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
        items = ($scope.currentArtistId !== null)? $scope.albums[$scope.currentArtistId] : [];
      }
      else if($scope.currentLevel === 'songs') {
        items = ($scope.currentAlbumId !== null)? $scope.songs[$scope.currentAlbumId] : [];
      }

      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.filteredItems.push(items[key]);
        }
      }

      $scope.showItems({
        key: $scope.currentLevel,
        reset: true,
        data: $scope.filteredItems
      });
    };
    
    $scope.clearFilter = function(clearValue) {
      $scope.isFiltering = false;
      $scope.filteredItems = [];
      clearValue = (clearValue === undefined)? true : clearValue;
      
      if(clearValue) {
        $scope.guiModels.filterValue = '';
      }
 
      if($scope.currentLevel === 'albums') {        
        $scope.showItems({
          key: $scope.currentLevel,
          reset: true,
          data: $scope.albums[$scope.currentArtistId]
        });
      }
      else if($scope.currentLevel === 'songs') {
        $scope.showItems({
          key: $scope.currentLevel,
          reset: true,
          data: $scope.songs[$scope.currentAlbumId]
        });
      }
      else if($scope.currentLevel === 'artists') {
        $scope.showItems({
          key: $scope.currentLevel,
          reset: true,
          data: $scope.artistsCategorised[$scope.guiModels.selectedIndex]
        });
      }
    };

    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi && Object.keys($scope.artistsCategorised).length === 0) {
        $scope.getArtistsCategorised();
      }
    }

    $scope.init = function() {
      if($scope.isInitialized) {
        return;
      }
      
      initConnectionChange();

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        initConnectionChange();
      });

      $scope.isInitialized = true;
    };
  }
]);