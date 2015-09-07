rekodiApp.controller('rkRecentlyAddedCtrl', ['$scope', 'rkVideoLibraryService', 'rkAudioLibraryService', '$timeout', 'rkVideoLibraryService', 'rkDialogService',
  function($scope, rkVideoLibraryService, rkAudioLibraryService, $timeout, rkVideoLibraryService, rkDialogService) {
    var itemsLimit = 10;
    var kodiApi = null;
    $scope.selected = {};
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
            
            if(!$scope.$$phase){
              $scope.$apply();
            }
          }
        });
      }
    };
    
    $scope.showMovieOptionsDialog = function(movie) {
      rkDialogService.showMovieOptions(movie, function(markWatchedSuccess) {
        if(markWatchedSuccess) {
          $scope.getRecentlyAddedMovies();
        }
      });
    };

    $scope.getRecentlyAddedEpisodes = function() {
      if(kodiApi) {
        if($scope.recentlyAddedEpisodes.length === 0) {
          $scope.recentlyAddedEpisodes = rkVideoLibraryService.getRecentlyAddedEpisodesFromCache();
        }

        rkVideoLibraryService.getRecentlyAddedEpisodes(itemsLimit, function(recentlyAddedEpisodes) {
          if(recentlyAddedEpisodes && !angular.equals(recentlyAddedEpisodes, $scope.recentlyAddedEpisodes)) {
            $scope.recentlyAddedEpisodes = recentlyAddedEpisodes;
            
            if(!$scope.$$phase){
              $scope.$apply();
            }
          }
        });
      }
    };
    
    $scope.showEpisodeOptionsDialog = function(episode) {
      rkDialogService.showEpisodeOptions(episode, function(markWatchedSuccess) {
        if(markWatchedSuccess) {
          $scope.getRecentlyAddedEpisodes();
        }
      });
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
    
    $scope.showAlbumOptionsDialog = function(album) {
      rkDialogService.showAlbumOptions(album);
    };
    
    function updateAllData() {
      $scope.getRecentlyAddedAlbums();
      $scope.getRecentlyAddedMovies();
      $scope.getRecentlyAddedEpisodes();
    }

    var init = function() {
      $scope.$root.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        
        if(kodiApi) {
          updateAllData();

          kodiApi.VideoLibrary.OnCleanFinished(function(data) {
            updateAllData();
          });

          kodiApi.VideoLibrary.OnScanFinished(function(data) {
            updateAllData();
          });

          kodiApi.VideoLibrary.OnRemove(function(data) {
            updateAllData();
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