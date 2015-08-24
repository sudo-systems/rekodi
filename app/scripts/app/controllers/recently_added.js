rekodiApp.controller('rkRecentlyAddedCtrl', ['$scope', 'rkVideoLibraryService', 'rkAudioLibraryService', '$timeout', 'kodiApiService',
  function($scope, rkVideoLibraryService, rkAudioLibraryService, $timeout, kodiApiService) {
    var itemsLimit = 10;
    var kodiApi = null;
    $scope.recentlyAddedMovies = [];
    $scope.recentlyAddedEpisodes = [];
    $scope.recentlyAddedAlbums = [];
    
    $scope.getRecentlyAddedMovies = function() {
      if(kodiApi) {
        if($scope.recentlyAddedMovies.length === 0) {
          $scope.recentlyAddedMovies = rkVideoLibraryService.getRecentlyAddedMoviesFromCache();
        }

        rkVideoLibraryService.getRecentlyAddedMovies(itemsLimit, function(recentlyAddedMovies) {
          if(recentlyAddedMovies && !angular.equals(recentlyAddedMovies, $scope.recentlyAddedMovies)) {
            $scope.recentlyAddedMovies = recentlyAddedMovies;
          }
        });
      }
    };
    
    $scope.getRecentlyAddedEpisodes = function() {
      if(kodiApi) {
        if($scope.recentlyAddedEpisodes.length === 0) {
          $scope.recentlyAddedEpisodes = rkVideoLibraryService.getRecentlyAddedEpisodesFromCache();
        }

        rkVideoLibraryService.getRecentlyAddedEpisodes(itemsLimit, function(recentlyAddedEpisodes) {
          if(recentlyAddedEpisodes && !angular.equals(recentlyAddedEpisodes, $scope.recentlyAddedEpisodes)) {
            $scope.recentlyAddedEpisodes = recentlyAddedEpisodes;
          }
        });
      }
    };
    
    $scope.getRecentlyAddedAlbums = function() {
      if(kodiApi) {
        if($scope.recentlyAddedAlbums.length === 0) {
          $scope.recentlyAddedAlbums = rkAudioLibraryService.getRecentlyAddedAlbumsFromCache();
        }

        rkAudioLibraryService.getRecentlyAddedAlbums(itemsLimit, function(recentlyAddedAlbums) {
          if(recentlyAddedAlbums && !angular.equals(recentlyAddedAlbums, $scope.recentlyAddedAlbums)) {
            $scope.recentlyAddedAlbums = recentlyAddedAlbums;
          }
        });
      }
    };
    
    function initConnectionChange() {
      kodiApi = kodiApiService.getConnection();
     
      if(kodiApi) {
        $scope.getRecentlyAddedMovies();
        $scope.getRecentlyAddedEpisodes();
        $scope.getRecentlyAddedAlbums();
      }
    }
    
    function init() {
      initConnectionChange();
      
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        initConnectionChange();
      });
    }
    
    $timeout(function() {
      init();
    });
  }
]);