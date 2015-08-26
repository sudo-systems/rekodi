rekodiApp.factory('rkDialogService', ['$rootScope', 'ngDialog', 'rkConfigService',
  function($rootScope, ngDialog, rkConfigService) {
    var templates = rkConfigService.get('templates', 'dialog');
    
    var movieOptionsController = ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService',
      function($scope, rkRemoteControlService, rkVideoLibraryService) {
        $scope.play = function(movie, resume) {
          rkRemoteControlService.play({
            item: { movieid: movie.movieid },
            options: { resume: (resume) }
          });

          return true;
        };

        $scope.markWatched = function(movie, watched, callback) {
          rkVideoLibraryService.markMovieWatched(movie, watched, function(success) {
            callback(success);
          });

          return true;
        };
      }
    ];
    
    var showMovieOptions = function(movie, callback) {
      var localScope = $rootScope.$new();
      localScope.movie = movie;
      localScope.callback = callback;
      
      ngDialog.open({ 
        template: templates.movieOptions,
        scope: localScope,
        controller: movieOptionsController
      });
    };
    
    
    var episodeOptionsController = ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService',
      function($scope, rkRemoteControlService, rkVideoLibraryService) {
        $scope.play = function(episode, resume) {
          rkRemoteControlService.play({
            item: { episodeid: episode.episodeid },
            options: { resume: (resume) }
          });

          return true;
        };

        $scope.markWatched = function(episode, watched, callback) {
          rkVideoLibraryService.markEpisodeWatched(episode, watched, function(success) {
            callback(success);
          });

          return true;
        };
      }
    ];
    
    var showEpisodeOptions = function(episode, callback) {
      var localScope = $rootScope.$new();
      localScope.episode = episode;
      localScope.callback = callback;
      
      ngDialog.open({ 
        template: templates.episodeOptions,
        scope: localScope,
        controller: episodeOptionsController
      });
    };
    
    
     var albumOptionsController = ['$scope', 'rkRemoteControlService',
      function($scope, rkRemoteControlService) {
        $scope.play = function(album) {
          rkRemoteControlService.play({
            item: { albumid: album.albumid }
          });

          return true;
        };
      }
    ];
    
    var showAlbumOptions = function(album) {
      var localScope = $rootScope.$new();
      localScope.album = album;
      
      ngDialog.open({ 
        template: templates.albumOptions,
        scope: localScope,
        controller: albumOptionsController
      });
    };
    
    return {
      showMovieOptions: showMovieOptions,
      showEpisodeOptions: showEpisodeOptions,
      showAlbumOptions: showAlbumOptions
    };
  }
]);