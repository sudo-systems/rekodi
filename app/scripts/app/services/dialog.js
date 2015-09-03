rekodiApp.factory('rkDialogService', ['$rootScope', 'ngDialog', 'rkConfigService',
  function($rootScope, ngDialog, rkConfigService) {
    var templates = rkConfigService.get('templates', 'dialog');
    var playerProperties;
    var currentDialogName = null;
    var currentDialog = null;
    var controllers = {
      movieOptions: ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService', 'rkNotificationService', 'rkDialogService',
        function($scope, rkRemoteControlService, rkVideoLibraryService, rkNotificationService, rkDialogService) {
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
          
          $scope.remove = function() {
            rkDialogService.showConfirm('Are your sure wou want to remove the movie "'+$scope.ngDialogData.item.label+'" from the library?', function() {
              rkVideoLibraryService.removeMovie($scope.ngDialogData.item, function(success) {
                if(!success) {
                  rkNotificationService.notifyRemoteSystem('The movie \''+$scope.ngDialogData.item.label+'\' could not be removed from your library.');
                }
              });
              
              return true;
            });
          };
        }
      ],
      episodeOptions: ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService', 'rkDialogService', 'rkNotificationService',
        function($scope, rkRemoteControlService, rkVideoLibraryService, rkDialogService, rkNotificationService) {
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
          
          $scope.remove = function() {
            rkDialogService.showConfirm('Are your sure wou want to remove the episode "'+$scope.ngDialogData.item.label+'" from the library?', function() {
              rkVideoLibraryService.removeEpisode($scope.ngDialogData.item, function(success) {
                if(!success) {
                  rkNotificationService.notifyRemoteSystem('The episode \''+$scope.ngDialogData.item.label+'\' could not be removed from your library.');
                }
              });
              
              return true;
            });
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
            
            if(!$scope.$$phase){
              $scope.$apply();
            }
            
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
      connecting: ['$scope', 'rkTabsService', 'kodiApiService', '$localStorage', 'rkNotificationService',
        function($scope, rkTabsService, kodiApiService, $localStorage, rkNotificationService) {
          $scope.connectionSettings = ($localStorage.settings && $localStorage.settings.connection)? $localStorage.settings.connection : {};
          
          $scope.wakeHost = function() {
            kodiApiService.wakeHost();
            rkNotificationService.notifyRemoteSystem('The wake up command has been sent...');
          };
          
          $scope.showSettingsTab = function() {
            rkTabsService.navigateTo('settings');
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
      notConnected: ['$scope', 'rkTabsService', 'kodiApiService', '$localStorage', 'rkNotificationService',
        function($scope, rkTabsService, kodiApiService, $localStorage, rkNotificationService) {
          $scope.connectionSettings = ($localStorage.settings && $localStorage.settings.connection)? $localStorage.settings.connection : {};
          
          $scope.wakeHost = function() {
            kodiApiService.wakeHost();
            rkNotificationService.notifyRemoteSystem('The wake up command has been sent...');
          };
          
          $scope.showSettingsTab = function() {
            rkTabsService.navigateTo('settings');
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
      systemOptions: ['$scope', 'rkRemoteControlService', 'rkVideoLibraryService', 'rkAudioLibraryService', 'rkNotificationService', 'rkDialogService',
        function($scope, rkRemoteControlService, rkVideoLibraryService, rkAudioLibraryService, rkNotificationService, rkDialogService) {
          $scope.updateVideoLibrary = function() {
            rkVideoLibraryService.scan(null, function(success) {
              if(!success) {
                rkNotificationService.notifyDatabaseAdd('The video library update could not be started');
              }
              
              $scope.closeThisDialog();
            });
          };
          
          $scope.updateAudioLibrary = function() {
            rkAudioLibraryService.scan(null, function(success) {
              if(!success) {
                rkNotificationService.notifyDatabaseAdd('The music library update could not be started');
              }
              
              $scope.closeThisDialog();
            });
          };
          
          $scope.cleanVideoLibrary = function() {
            rkDialogService.showConfirm('Are you sure sou want to clean your video library?', function() {
              rkVideoLibraryService.clean(function(success) {
                if(!success) {
                  rkNotificationService.notifyCleanDatabase('The video library cleanup could not be started');
                }
              });
              
              return true;
            });
          };
          
          $scope.cleanAudioLibrary = function() {
            rkDialogService.showConfirm('Are you sure sou want to clean your music library ()?', function() {
              rkAudioLibraryService.clean(function(success) {
                if(!success) {
                  rkNotificationService.notifyCleanDatabase('The music library cleanup could not be started');
                }
              });
              
              return true;
            });
          };
          
          $scope.close = function() {
            var remote = require('remote');
            var mainWindow = remote.getCurrentWindow();
            mainWindow.close();
          };
          
          $scope.shutdown = function() {
            rkRemoteControlService.shutdown();
            rkNotificationService.notifyRemoteSystem('The Kodi host is shutting down...');
            $scope.close();
            return true;
          };
          
          $scope.reboot = function() {
            rkRemoteControlService.reboot();
            rkNotificationService.notifyRemoteSystem('The Kodi host is rebooting...');
            return true;
          };
        }
      ],
      wakingUp: ['$scope',
        function($scope) {
          $scope.close = function() {
            var remote = require('remote');
            var mainWindow = remote.getCurrentWindow();
            mainWindow.close();
          };
        }
      ],
      playlistItemOptions: ['$scope', 'rkRemoteControlService',
        function($scope, rkRemoteControlService) {
          $scope.play = function() {
            rkRemoteControlService.playPlaylistItem({
              playerid: $scope.ngDialogData.playerId,
              to: $scope.ngDialogData.position
            });
            return true;
          };
          
          $scope.remove = function() {
            rkRemoteControlService.removePlaylistItem({
              playlistid: $scope.ngDialogData.playlistId,
              position: $scope.ngDialogData.position
            });
            return true;
          };
        }
      ],
      savePlaylist: ['$scope', 'rkLocalPlaylistService',
        function($scope, rkLocalPlaylistService) {
          $scope.name = (!$scope.ngDialogData.name)? '' : $scope.ngDialogData.name;
          $scope.errorMessage = '';
          $scope.existsId = null;
          $scope.overwrite = false;
          var _localplaylistId = ($scope.ngDialogData.localplaylistId === undefined)? null : $scope.ngDialogData.localplaylistId;
          
          console.log(_localplaylistId);
          
          $scope.save = function() {
            if(_localplaylistId === null) {
              $scope.existsId = rkLocalPlaylistService.exists($scope.ngDialogData.playlistId, $scope.name);
            }
            
            if($.trim($scope.name) === '') {
              $scope.errorMessage = 'Please provide a name for this playlist';
              return false;
            }
            else if($scope.existsId !== null && $scope.overwrite === false) {
              $scope.errorMessage = 'A playlist with this name allready exists. Do you want to overwrite it?';
              return false;
            }

            var playlistInfo = rkLocalPlaylistService.save({
              playlistId: $scope.ngDialogData.playlistId,
              name: $scope.name,
              items: $scope.ngDialogData.items,
              localPlaylistId: _localplaylistId
            });
            
            $scope.ngDialogData.callback(playlistInfo);
            
            return true;
          };
        }
      ],
      openPlaylist: ['$scope', 'rkLocalPlaylistService',
        function($scope, rkLocalPlaylistService) {
          $scope.items = rkLocalPlaylistService.get($scope.ngDialogData.playlistId);
          
          $scope.open = function(localPlaylistId) {
            rkLocalPlaylistService.open($scope.ngDialogData.playlistId, localPlaylistId);
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
    
    var showWakingUp = function() {
      showDialog('wakingUp', null, {
        showClose: false,
        closeByEscape: false,
        closeByDocument: false
      });
    };
    
    var showConfirm = function(message, callback) {
      showDialog('confirm', {
        message: message,
        callback: callback
      });
    };
    
    var showPlaylistItemOptions = function(playerId, position, item, playlistId) {
      showDialog('playlistItemOptions', {
        playerId: playerId,
        item: item,
        position: position,
        playlistId: playlistId
      });
    };
    
    var showSavePlaylist = function(options) {
      showDialog('savePlaylist', {
        playlistId: options.playlistId,
        items: options.items,
        name: options.name,
        localplaylistId: options.localplaylistId,
        callback: options.callback
      });
    };
    
    var showOpenPlaylist = function(playlistId) {
      showDialog('openPlaylist', {playlistId: playlistId});
    };
    
    var closeAll = function() {
      ngDialog.closeAll();
    };
    
    
    function init() {
      $rootScope.$root.$on('rkPlayerPropertiesChange', function(event, data) {
        playerProperties = data;
      });
      
      $rootScope.$root.$on('ngDialog.closing', function(event, data) {
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
      showSystemOptions: showSystemOptions,
      showWakingUp: showWakingUp,
      showConfirm: showConfirm,
      showPlaylistItemOptions: showPlaylistItemOptions,
      showSavePlaylist: showSavePlaylist,
      showOpenPlaylist: showOpenPlaylist
    };
  }
]);