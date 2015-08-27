rekodiApp.factory('rkDialogService', ['$rootScope', 'ngDialog', 'rkConfigService',
  function($rootScope, ngDialog, rkConfigService) {
    var templates = rkConfigService.get('templates', 'dialog');
    var playerProperties;
    
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
    
    
    var artistOptionsController = ['$scope', 'rkRemoteControlService',
      function($scope, rkRemoteControlService) {
        $scope.play = function(artist) {
          rkRemoteControlService.play({
            item: { artistid: artist.artistid[0] },
            options: { shuffled: false }
          });

          return true;
        };
        
        $scope.shufflePlay = function(artist) {
          rkRemoteControlService.play({
            item: { artistid: artist.artistid[0] },
            options: { shuffled: true }
          });

          return true;
        };
      }
    ];
    
    var showArtistOptions = function(artist) {
      var localScope = $rootScope.$new();
      localScope.artist = artist;
      
      ngDialog.open({ 
        template: templates.artistOptions,
        scope: localScope,
        controller: artistOptionsController
      });
    };
    
    
    var albumOptionsController = ['$scope', 'rkRemoteControlService',
      function($scope, rkRemoteControlService) {
        $scope.play = function(album) {
          rkRemoteControlService.play({
            item: { albumid: album.albumid },
            options: { shuffled: false }
          });

          return true;
        };
        
        $scope.shufflePlay = function(album) {
          rkRemoteControlService.play({
            item: { albumid: album.albumid },
            options: { shuffled: true }
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
    
    
    var songOptionsController = ['$scope', 'rkRemoteControlService',
      function($scope, rkRemoteControlService) {
        $scope.play = function(song) {
          rkRemoteControlService.play({
            item: { file: song.file }
          });

          return true;
        };
        
        /*$scope.repeatPlay = function(song) {
          if(!playerProperties.repeat || playerProperties.repeat === 'off' || playerProperties.repeat === 'one') {
            rkRemoteControlService.setRepeat('one');
          }
          
          rkRemoteControlService.play({
            item: { file: song.file }
          });

          return true;
        };*/
      }
    ];
    
    var showSongOptions = function(song) {
      var localScope = $rootScope.$new();
      localScope.song = song;
      
      ngDialog.open({ 
        template: templates.songOptions,
        scope: localScope,
        controller: songOptionsController
      });
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
      showSongOptions: showSongOptions
    };
  }
]);