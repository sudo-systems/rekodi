rekodiApp.factory('rkDialogService', ['$rootScope', 'ngDialog', 'rkConfigService',
  function($rootScope, ngDialog, rkConfigService) {
    var templates = rkConfigService.get('templates', 'dialog');
    var playerProperties;
    
    var movieOptionsController = ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService',
      function($scope, rkRemoteControlService, rkVideoLibraryService) {
        $scope.play = function(resume) {
          rkRemoteControlService.play({
            item: { movieid: $scope.ngDialogData.movie.movieid },
            options: { resume: (resume) }
          });
          return true;
        };

        $scope.markWatched = function(watched) {
          rkVideoLibraryService.markMovieWatched($scope.ngDialogData.movie, watched, function(success) {
            $scope.ngDialogData.callback(success);
          });
          return true;
        };
      }
    ];
    
    var showMovieOptions = function(movie, callback) {
      closeAll();

      ngDialog.open({ 
        template: templates.movieOptions,
        data: {
          movie: movie,
          callback: callback
        },
        controller: movieOptionsController
      });
    };
    
    
    var episodeOptionsController = ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService',
      function($scope, rkRemoteControlService, rkVideoLibraryService) {
        $scope.play = function(resume) {
          rkRemoteControlService.play({
            item: { episodeid: $scope.ngDialogData.episode.episodeid },
            options: { resume: (resume) }
          });
          return true;
        };

        $scope.markWatched = function(watched) {
          rkVideoLibraryService.markEpisodeWatched($scope.ngDialogData.episode, watched, function(success) {
            $scope.ngDialogData.callback(success);
          });
          return true;
        };
      }
    ];
    
    var showEpisodeOptions = function(episode, callback) {
      closeAll();

      ngDialog.open({ 
        template: templates.episodeOptions,
        data: {
          episode: episode,
          callback: callback
        },
        controller: episodeOptionsController
      });
    };
    
    
    var artistOptionsController = ['$scope', 'rkRemoteControlService',
      function($scope, rkRemoteControlService) {
        $scope.play = function(shuffle) {
          rkRemoteControlService.play({
            item: { artistid: $scope.ngDialogData.artist.artistid[0] },
            options: { shuffled: (shuffle) }
          });
          return true;
        };
      }
    ];
    
    var showArtistOptions = function(artist) {
      closeAll();

      ngDialog.open({ 
        template: templates.artistOptions,
        data: {artist: artist},
        controller: artistOptionsController
      });
    };
    
    
    var albumOptionsController = ['$scope', 'rkRemoteControlService',
      function($scope, rkRemoteControlService) {
        $scope.play = function(shuffle) {
          rkRemoteControlService.play({
            item: { albumid: $scope.ngDialogData.album.albumid },
            options: { shuffled: (shuffle) }
          });
          return true;
        };
      }
    ];
    
    var showAlbumOptions = function(album) {
      closeAll();

      ngDialog.open({ 
        template: templates.albumOptions,
        data: { album: album },
        controller: albumOptionsController
      });
    };
    
    
    var songOptionsController = ['$scope', 'rkRemoteControlService',
      function($scope, rkRemoteControlService) {
        $scope.play = function() {
          rkRemoteControlService.play({
            item: { file: $scope.ngDialogData.song.file }
          });
          return true;
        };
      }
    ];
    
    var showSongOptions = function(song) {
      closeAll();

      ngDialog.open({ 
        template: templates.songOptions,
        data: {song: song},
        controller: songOptionsController
      });
    };
    
    
    var notConfiguredController = ['$scope', 'rkTabsService',
      function($scope, rkTabsService) {
        $scope.showSettingsTab = function() {
          rkTabsService.navigateTo('settings');
          return true;
        };
      }
    ];
    
    var showNotConfigured = function() {
      closeAll();
      
      ngDialog.open({ 
        template: templates.notConfigured,
        controller: notConfiguredController,
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    };
    
    
    var notConnectedController = ['$scope', 'rkTabsService',
      function($scope, rkTabsService) {
        $scope.showSettingsTab = function() {
          rkTabsService.navigateTo('settings');
          return true;
        };
      }
    ];
    
    var showNotConnected = function() {
      closeAll();
      
      ngDialog.open({ 
        template: templates.notConnected,
        controller: notConnectedController,
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    };
    

    var showConnecting = function() {
      closeAll();
      
      ngDialog.open({ 
        template: templates.connecting,
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    };
    
    
    var closeAll = function() {
      ngDialog.closeAll();
    };
    
    
    function init() {
      $rootScope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        playerProperties = data;
      });
    }
    
    init();
    
    return {
      showMovieOptions: showMovieOptions,
      showEpisodeOptions: showEpisodeOptions,
      showAlbumOptions: showAlbumOptions,
      showArtistOptions: showArtistOptions,
      showSongOptions: showSongOptions,
      showNotConfigured: showNotConfigured,
      showNotConnected: showNotConnected,
      showConnecting: showConnecting,
      closeAll: closeAll
    };
  }
]);