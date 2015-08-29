rekodiApp.factory('rkDialogService', ['$rootScope', 'ngDialog', 'rkConfigService',
  function($rootScope, ngDialog, rkConfigService) {
    var templates = rkConfigService.get('templates', 'dialog');
    var playerProperties;
    var currentDialogName = null;
    var currentDialog = null;
    var controllers = {
      movieOptions: ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService',
        function($scope, rkRemoteControlService, rkVideoLibraryService) {
          $scope.play = function(resume) {
            rkRemoteControlService.play({
              item: { movieid: $scope.ngDialogData.item.movieid },
              options: { resume: (resume) }
            });
            return true;
          };

          $scope.markWatched = function(watched) {
            rkVideoLibraryService.markMovieWatched($scope.ngDialogData.item, watched, function(success) {
              $scope.ngDialogData.callback(success);
            });
            return true;
          };
        }
      ],
      episodeOptions: ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService',
        function($scope, rkRemoteControlService, rkVideoLibraryService) {
          $scope.play = function(resume) {
            rkRemoteControlService.play({
              item: { episodeid: $scope.ngDialogData.item.episodeid },
              options: { resume: (resume) }
            });
            return true;
          };

          $scope.markWatched = function(watched) {
            rkVideoLibraryService.markEpisodeWatched($scope.ngDialogData.item, watched, function(success) {
              $scope.ngDialogData.callback(success);
            });
            return true;
          };
        }
      ],
      artistOptions: ['$scope', 'rkRemoteControlService',
        function($scope, rkRemoteControlService) {
          $scope.play = function(shuffle) {
            rkRemoteControlService.play({
              item: { artistid: $scope.ngDialogData.item.artistid[0] },
              options: { shuffled: (shuffle) }
            });
            return true;
          };
        }
      ],
      albumOptions: ['$scope', 'rkRemoteControlService',
        function($scope, rkRemoteControlService) {
          $scope.play = function(shuffle) {
            rkRemoteControlService.play({
              item: { albumid: $scope.ngDialogData.item.albumid },
              options: { shuffled: (shuffle) }
            });
            return true;
          };
        }
      ],
      songOptions: ['$scope', 'rkRemoteControlService',
        function($scope, rkRemoteControlService) {
          $scope.play = function() {
            rkRemoteControlService.play({
              item: { file: $scope.ngDialogData.item.file }
            });
            return true;
          };
        }
      ],
      closeWindow: ['$scope', 'rkRemoteControlService', 'rkSettingsService',
        function($scope, rkRemoteControlService, rkSettingsService) {
          $scope.settings = rkSettingsService.get({category: 'window'});
          
          $scope.toggleShowDialog = function() {
            $scope.settings.showShutdownDialog = (!$scope.settings.showShutdownDialog);
            $scope.$apply();
            rkSettingsService.set('window', 'showShutdownDialog', $scope.settings.showShutdownDialog);
          };
          
          $scope.shutdown = function() {
            rkRemoteControlService.shutdown();
            $scope.close();
            return true;
          };
          
          $scope.close = function() {
            var remote = require('remote');
            var mainWindow = remote.getCurrentWindow();
            mainWindow.close();
            return true;
          };
        }
      ],
      notConfigured: ['$scope', 'rkTabsService',
        function($scope, rkTabsService) {
          $scope.showSettingsTab = function() {
            rkTabsService.navigateTo('settings');
            return true;
          };
        }
      ],
      notConnected: ['$scope', 'rkTabsService',
        function($scope, rkTabsService) {
          $scope.showSettingsTab = function() {
            rkTabsService.navigateTo('settings');
            return true;
          };
        }
      ],
      systemOptions: ['$scope', 'rkTabsService', 'rkRemoteControlService',
        function($scope, rkTabsService) {
          $scope.showSettingsTab = function() {
            rkTabsService.navigateTo('settings');
            return true;
          };
        }
      ]
    };
    
    function showDialog(name, data, options) {
      if(currentDialogName && currentDialogName === name) {
        return;
      }
      
      closeAll();
      currentDialogName = name;
      var _options = {
        name: name,
        template: templates[name]
      };
      
      if(data) {
        _options.data = data;
      }
      
      if(controllers[name]) {
        _options.controller = controllers[name];
      }
      
      if(options) {
        angular.extend(_options, options);
      }

      currentDialog = ngDialog.open(_options);
    }

    var showMovieOptions = function(item, callback) {
      showDialog('movieOptions', {
        item: item,
        callback: callback
      });
    };

    var showEpisodeOptions = function(item, callback) {
      showDialog('episodeOptions', {
        item: item,
        callback: callback
      });
    };

    var showArtistOptions = function(item) {
      showDialog('artistOptions', {item: item});
    };

    var showAlbumOptions = function(item) {
      showDialog('albumOptions', {item: item});
    };

    var showSongOptions = function(item) {
      showDialog('songOptions', {item: item});
    };
    
    var showCloseWindow = function() {
      showDialog('closeWindow');
    };

    var showNotConfigured = function() {
      showDialog('notConfigured', null, {
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    };

    var showNotConnected = function() {
      showDialog('notConnected', null, {
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    };
    
    
    var showSystemOptions = function() {
      showDialog('systemOptions', null);
    };
    

    var showConnecting = function() {
      showDialog('connecting', null, {
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    };
    
    var closeAll = function() {
      currentDialogName = null;
      ngDialog.closeAll();
    };
    
    
    function init() {
      $rootScope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        playerProperties = data;
      });
      
      $rootScope.$root.$on('ngDialog.closed', function(event, data) {
        currentDialogName = null;
        currentDialog = null;
      });
    }
    
    init();
    
    return {
      showMovieOptions: showMovieOptions,
      showEpisodeOptions: showEpisodeOptions,
      showAlbumOptions: showAlbumOptions,
      showArtistOptions: showArtistOptions,
      showSongOptions: showSongOptions,
      showCloseWindow: showCloseWindow,
      showNotConfigured: showNotConfigured,
      showNotConnected: showNotConnected,
      showConnecting: showConnecting,
      closeAll: closeAll,
      showSystemOptions: showSystemOptions
    };
  }
]);