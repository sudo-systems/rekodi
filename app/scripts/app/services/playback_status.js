rekodiApp.factory('rkPlaybackStatusService', ['$rootScope', 'kodiApiService', 'rkPlayerPropertiesService',
  function($rootScope, kodiApiService, rkPlayerPropertiesService) {
    var kodiApi = null;
    var defaultStatus = {
      isConnected: false,
      isPlaying: false,
      isPaused: false,
      isStopped: true,
      isRewinding: false,
      isFastForwarding: false,
      isMuted: false,
      currentSpeed: 0,
      currentVolume: 0
    };
    var currentStatus = angular.extend({}, defaultStatus);
    var status = angular.extend({}, defaultStatus);
    
    function updateCurrentStatus() {
      if(!angular.equals(status, currentStatus)) {
        currentStatus = angular.extend({}, status);
        $rootScope.$emit('rkPlaybackStatusChange', currentStatus);
      }
    }
    
    function setDefaultStatus() {
      if(!angular.equals(currentStatus, defaultStatus)) {
        status = angular.extend({}, defaultStatus);
        currentStatus = angular.extend({}, defaultStatus);
        $rootScope.$emit('rkPlaybackStatusChange', currentStatus);
      }
    }
    
    function initConnectionChange() {
      status.isConnected = (kodiApi);
      status.currentSpeed = 0;
      updateCurrentStatus();

      if(!kodiApi) {
        setDefaultStatus();
      }
      else {
        kodiApi.Player.OnPlay(function(data) {
          status.isPaused = false;
          status.isPlaying = true;
          status.currentSpeed = data.data.player.speed;
          status.isRewinding = (status.currentSpeed < 0);
          status.isFastForwarding = (status.currentSpeed > 1);
          updateCurrentStatus();
        });

        kodiApi.Player.OnPause(function(data) {
          status.isPaused = true;
          status.isPlaying = true;
          status.currentSpeed = 0;
          status.isRewinding = false;
          status.isFastForwarding = false;
          updateCurrentStatus();
        });

        kodiApi.Player.OnStop(function(data) {
          status.isPaused = false;
          status.isPlaying = false;
          status.currentSpeed = 0;
          status.isRewinding = false;
          status.isFastForwarding = false;
          updateCurrentStatus();
        });

        kodiApi.Player.OnSpeedChanged(function (data) {
          status.currentSpeed = data.data.player.speed;
          status.isRewinding = (status.currentSpeed < 0);
          status.isFastForwarding = (status.currentSpeed > 1);
          updateCurrentStatus();
        });
      }
    }
    
    var getCurrentStatus = function() {
      return currentStatus;
    };
    
    function init() {
      kodiApi = kodiApiService.getConnection();
      initConnectionChange();

      $rootScope.$on('rkPlayerPropertiesChange', function(event, data) {
        status.isPaused = (data.speed === 0 && data.type !== null);
        status.isPlaying = (data.type !== null);
        status.currentSpeed = data.speed;
        status.isRewinding = (status.currentSpeed < 0 && data.type !== null);
        status.isFastForwarding = (status.currentSpeed > 1 && data.type !== null);
        updateCurrentStatus();
      });

      $rootScope.$on('rkNowPlayingDataUpdate', function(event, data) {
        if(data === null) {
          rkPlayerPropertiesService.stopUpdateInterval();
          status.isPaused = false;
          status.isPlaying = false;
          status.currentSpeed = 0;
          status.isRewinding = false;
          status.isFastForwarding = false;
          updateCurrentStatus();
        }
        else {
          rkPlayerPropertiesService.startUpdateInterval();
          status.isPaused = false;
          status.isPlaying = true;
          status.currentSpeed = 0;
          status.isRewinding = false;
          status.isFastForwarding = false;
          updateCurrentStatus();
        }
      });
      
      $rootScope.$on('rkKodiPropertiesChange', function(event, data) {
        status.currentVolume = data.volume;
        status.isMuted = data.muted;
        updateCurrentStatus();
      });

      $rootScope.$on('rkWsConnectionStatusChange', function (event, connection) {
        kodiApi = connection;
        initConnectionChange();
      });
    }
    
    init();
    
    return {
      getCurrentStatus: getCurrentStatus
    };
  }
]);