rekodiApp.factory('rkNotificationService', ['rkHelperService', 'rkLogService',
  function(rkHelperService, rkLogService) {
    var remote = require('remote');
    var notifier = require('node-notifier');
    var mainWindow = remote.getCurrentWindow();
    var iconsPath = __dirname+'/images/icons/';
    var isNotifying = false;
    var minNotificationInterval = 100;
    var notificationLimitTimeout = null;
    var icons = {
      default: iconsPath+'rekodi.png',
      volume: iconsPath+'volume.png',
      play: iconsPath+'play.png',
      pause: iconsPath+'pause.png',
      connected: iconsPath+'connected.png',
      disconnected: iconsPath+'disconnnected.png',
      databaseAdd: iconsPath+'database_add.png',
      databaseRemove: iconsPath+'database_remove.png',
      clean: iconsPath+'clean.png',
      server: iconsPath+'server.png'
    };

    var notify = function(options) {
      if(isNotifying) {
        return;
      }
      
      isNotifying = true;
      var _options = angular.extend({}, {
        title: 'ReKodi',
        message: '',
        icon: icons.default,
        contentImage: void 0,
        sound: false,
        wait: false
      }, options);
      
      notificationLimitTimeout = setTimeout(function() {
        isNotifying = false;
      }, minNotificationInterval);

      notifier.notify(_options, function (error, response) {
        if(error) {
          rkLogService.error(error);
        }
        
        isNotifying = false;
        clearInterval(notificationLimitTimeout);
      });
    };
    
    var itemNotify = function(options) {
      if(options.item.thumbnail_src) {
        rkHelperService.downloadFile(options.item.thumbnail_src, 'thumbnail', (new Date).getTime(), true, function(donwloadedFilePath) {
          if(donwloadedFilePath) {
            options.contentImage = donwloadedFilePath;
          }
          
          delete options.item;
          notify(options);
        });
        
        return;
      }
      
      delete options.item;
      notify(options);
    };
    
    var notifyVolume = function(percentage) {
      notify({
        message: 'Volume set to '+percentage+'%',
        icon: icons.volume
      });
    };
    
    var notifyPlay = function(item) {
      var options = {
        icon: icons.play,
        message: '\''+item.label,
        item: item
      };
      
      if(item.displayartist && item.displayartist !== '') {
        options.message += ' by '+item.displayartist;
      }
      
      options.message += '\' is playing';
      
      itemNotify(options);
    };
    
    var notifyPause = function(item) {
      var options = {
        icon: icons.pause,
        message: '\''+item.label,
        item: item
      };
      
      if(item.displayartist && item.displayartist !== '') {
        options.message += ' by '+item.displayartist;
      }
      
      options.message += '\' has been paused';
      
      itemNotify(options);
    };
    
    var notifyResume = function(item) {
      var options = {
        icon: icons.play,
        message: '\''+item.label,
        item: item
      };
      
      if(item.displayartist && item.displayartist !== '') {
        options.message += ' by '+item.displayartist;
      }
      
      options.message += '\' resumed';
      
      itemNotify(options);
    };
    
    var notifyConnection = function(isConnected, message) {
      notify({
        message: message,
        icon: (isConnected)? icons.connected : icons.disconnected
      });
    };
    
    var notifyDatabaseAdd = function(message) {
      notify({
        message: message,
        icon: icons.databaseAdd
      });
    };
    
    var notifyDatabaseRemove = function(message) {
      notify({
        message: message,
        icon: icons.databaseRemove
      });
    };
    
    var notifyCleanDatabase = function(message) {
      notify({
        message: message,
        icon: icons.clean
      });
    };
    
    var notifyRemoteSystem = function(message) {
      notify({
        message: message,
        icon: icons.server
      });
    };
    
    function init() {
      notifier.on('click', function (notifierObject, options) {
        mainWindow.focus();
      });
    }
    
    init();
    
    return {
      notify: notify,
      notifyVolume: notifyVolume,
      notifyPlay: notifyPlay,
      notifyPause: notifyPause,
      notifyResume: notifyResume,
      notifyConnection: notifyConnection,
      notifyDatabaseAdd: notifyDatabaseAdd,
      notifyDatabaseRemove: notifyDatabaseRemove,
      notifyCleanDatabase: notifyCleanDatabase,
      notifyRemoteSystem: notifyRemoteSystem
    };
  }
]);