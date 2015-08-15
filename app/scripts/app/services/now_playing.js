rekodiApp.factory('rkNowPlayingService', ['$rootScope', 'kodiApiService', 'rkEnumsService', 'rkHelperService', 'rkRemoteControlService',
  function($rootScope, kodiApiService, rkEnumsService, rkHelperService, rkRemoteControlService) {
    var kodiApi = null;
    var playingItem = null;
    var itemProperties = [];
    itemProperties[rkEnumsService.PlayerId.AUDIO] = ['title', 'displayartist', 'album', 'track', 'year', 'genre', 'thumbnail', 'file', 'duration'];
    itemProperties[rkEnumsService.PlayerId.VIDEO] = ['title', 'file', 'thumbnail', 'plotoutline', 'year', 'season', 'episode', 'showtitle', 'plot', 'runtime'];
    
    var setNotPlaying = function() {
      playingItem = null;
      $rootScope.$emit('rkNowPlayingDataUpdate', playingItem);
    };

    var getItem = function() {
      rkRemoteControlService.getActivePlayerId(function(playerId) {
        if(playerId !== null) {
          kodiApi.Player.GetItem({
            playerid: playerId,
            properties: itemProperties[playerId]
          }).then(function(data) {
            if(data.item) {
              data.item = rkHelperService.addCustomFields(data.item);

              if(JSON.stringify(playingItem) !== JSON.stringify(data.item)) {
                playingItem = data.item;
                $rootScope.$emit('rkNowPlayingDataUpdate', playingItem);
              }
            }
            else {
              setNotPlaying();
            }
          }, function(error) {
            setNotPlaying();
            rkHelperService.handleError(error);
          });
        }
        else {
          setNotPlaying();
        }
      });
    };

    var init = function() {
      $rootScope.$on('rkWsConnectionStatusChange', function(event, data) {
        kodiApi = kodiApiService.getConnection();
        
        if(kodiApi) {
          kodiApi.Player.OnPlay(function(response) {
            getItem();
          });

          kodiApi.Player.OnStop(function(response) {
            setNotPlaying();
          });

          getItem();
        }
        else {
          setNotPlaying();
        }
      });
    };

    init();
    
    return {
      
    };
  }
]);