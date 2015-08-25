rekodiApp.controller('rkRecentlyAddedCtrl', ['$scope', 'rkVideoLibraryService', 'rkAudioLibraryService', '$timeout', 'kodiApiService', 'ngDialog', 'rkRemoteControlService',
  function($scope, rkVideoLibraryService, rkAudioLibraryService, $timeout, kodiApiService, ngDialog, rkRemoteControlService) {
    var itemsLimit = 10;
    var kodiApi = null;
    $scope.selected = {};
    $scope.recentlyAddedMovies = [];
    $scope.recentlyAddedEpisodes = [];
    $scope.recentlyAddedAlbums = [];
    
    $scope.showPlayDialog = function(type, data) {
      $scope.selected[type] = data;

      ngDialog.open({ 
        template: 'views/partials/dialogs/'+type+'_play.html',
        scope: $scope
      });
    };
    
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
    
    $scope.playMovie = function(movie, resume) {
      rkRemoteControlService.play({
        item: { movieid: movie.movieid },
        options: { resume: (resume) }
      });

      return true;
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
    
    $scope.playEpisode = function(episode, resume) {
      rkRemoteControlService.play({
        item: { episodeid: episode.episodeid },
        options: { resume: (resume) }
      });

      return true;
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
    
    $scope.playAlbum = function(album) {
      rkRemoteControlService.play({
        item: { albumid: album.albumid }
      });

      return true;
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