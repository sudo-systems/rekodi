rekodiApp.controller('rkMusicLibraryCtrl', ['$scope', '$element', 'kodiApiService', 'rkTooltipsService', '$timeout', 'rkAudioLibraryService',
  function($scope, $element, kodiApiService, rkTooltipsService, $timeout, rkAudioLibraryService) {
    $scope.selectedIndex = null;
    $scope.currentLevel = null;
    $scope.artistsCategorised = {};
    $scope.artistsIndex = [];
    $scope.scrollItems = [];
    $scope.displayLimit = 15;
    $scope.isFiltering = false;
    $scope.currentArtistId = null;
    $scope.currentAlbumId = null;
    $scope.albums = {};
    $scope.songs = {};
    $scope.filter = {value: ''};
    var kodiApi = null;
    
    $scope.showItems = function(selectedIndex, reset) {
      if(selectedIndex !== null) {
        $scope.selectedIndex = selectedIndex;
      }
      
      if(reset || !$scope.scrollItems[$scope.currentLevel]) {
        $scope.scrollItems[$scope.currentLevel] = [];
      }

      var items = [];
      
      if($scope.currentLevel === 'artists') {
        items = ($scope.selectedIndex !== null)? $scope.artistsCategorised[$scope.selectedIndex] : [];
      }
      else if($scope.currentLevel === 'albums') {
        items = ($scope.currentArtistId !== null)? $scope.albums[$scope.currentArtistId] : [];
      }
      else if($scope.currentLevel === 'songs') {
        items = ($scope.currentAlbumId !== null)? $scope.songs[$scope.currentAlbumId] : [];
      }
      
      var scrollItemsCount = $scope.scrollItems[$scope.currentLevel].length;
      
      if(!items || !items[scrollItemsCount]) {
        return;
      }

      for(var x = 0; x < $scope.displayLimit; x++) {
        var nextIndex = ((scrollItemsCount)+x);

        if(items[nextIndex]) {
          $scope.scrollItems[$scope.currentLevel].push(items[nextIndex]);
        }
      }

      if(!$scope.$$phase){
        $scope.$apply();
      }
    };

    function createArtistsCategorisedIndex(artistsCategorised) {
      $scope.artistsIndex = [];

      for (var key in artistsCategorised) {
        if (artistsCategorised.hasOwnProperty(key)) {
          $scope.artistsIndex.push(key);
        }
      }

      return $scope.artistsIndex;
    }

    function getDefaultArtistsIndex(artistsIndex) {
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
      var defaultArtistsIndex = null;
      var artistsIndex = [];
      $scope.clearFilter();
      
      if(Object.keys($scope.artistsCategorised).length === 0) {
        $scope.artistsCategorised = rkAudioLibraryService.getArtistsCategorisedFromCache();
        artistsIndex = createArtistsCategorisedIndex($scope.artistsCategorised);
        defaultArtistsIndex = getDefaultArtistsIndex(artistsIndex);
      }
      
      if(defaultArtistsIndex !== null) {
        $scope.showItems(defaultArtistsIndex, true);
      }

      rkAudioLibraryService.getArtistsCategorised(function(artistsCategorised) {
        if(artistsCategorised && !angular.equals(artistsCategorised, $scope.artistsCategorised)) {
          $scope.artistsCategorised = artistsCategorised;
          artistsIndex = createArtistsCategorisedIndex(artistsCategorised);
          defaultArtistsIndex = getDefaultArtistsIndex(artistsIndex);

          if(defaultArtistsIndex !== null) {
            $scope.showItems(true);
          }
        }
      });
    };

    $scope.getAlbums = function(artistId) {
      $scope.currentLevel = 'albums';
      $scope.displayLimit = 5;
      $scope.currentArtistId = artistId;
      $scope.currentAlbumId = null;
      $scope.clearFilter();

      if(!$scope.albums[artistId]) {
        $scope.albums[artistId] = [];
      }
      
      if($scope.albums[artistId].length === 0) {
        $scope.albums[artistId] = rkAudioLibraryService.getAlbumsFromCache(artistId);
      }
      
      $scope.showItems(null, true);
      
      rkAudioLibraryService.getAlbums(artistId, function(albums) {
        if(albums && !angular.equals(albums, $scope.albums[artistId])) {
          $scope.albums[artistId] = albums;
          $scope.showItems(null, true);
        }
      });
    };

    $scope.getSongs = function(albumId) {
      $scope.currentLevel = 'songs';
      $scope.displayLimit = 5;
      $scope.currentAlbumId = albumId;
      $scope.clearFilter();
      
      if(!$scope.songs[albumId]) {
        $scope.songs[albumId] = [];
      }
      
      if($scope.songs[albumId].length === 0) {
        $scope.songs[albumId] = rkAudioLibraryService.getSongsFromCache(albumId);
      }
      
      $scope.showItems(null, true);
      
      rkAudioLibraryService.getSongs(albumId, function(songs) {
        if(songs && !angular.equals(songs, $scope.songs[albumId])) {
          $scope.songs[albumId] = songs;
          $scope.showItems(null, true);
        }
      });
    };

    $scope.applyFilter = function(filterValue) {
      if(filterValue.length < 2) {
        $scope.isFiltering = false;
        $scope.showItems(null, true);
        return;
      }

      $scope.isFiltering = true;
      $scope.scrollItems[$scope.currentLevel] = [];
      var items = [];
      
      if($scope.currentLevel === 'artists') {
        var artists = rkAudioLibraryService.getArtsistsFromCache();
        items = (artists)? artists : [];
      }
      else if($scope.currentLevel === 'albums') {
        items = ($scope.currentArtistId!== null)? $scope.albums[$scope.currentArtistId] : [];
      }
      else if($scope.currentLevel === 'songs') {
        items = ($scope.currentAlbumId !== null)? $scope.songs[$scope.currentAlbumId] : [];
      }
      
      for(var key in items) {
        if(items[key].label && items[key].label.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
          $scope.scrollItems[$scope.currentLevel].push(items[key]);
        }
      }
    };
    
    $scope.clearFilter = function() {
      $scope.isFiltering = false;
      $scope.filter.value = '';
      $scope.showItems(null, true);
    };

    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();

      if(kodiApi && $.isEmptyObject($scope.artistsCategorised)) {
        $scope.getArtistsCategorised();
      }
    }

    var init = function() {
      initConnectionChange();

      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        initConnectionChange();
      });
    };
    
    $timeout(function() {
      init();
    });
  }
]);