/*angular.module('rekodiApp')
  .factory('rkKodiWsApiService', ['$rootScope', 
    function($rootScope)
    {
      var kodiWs = require('xbmc-ws');
      var connected = false;
      var statusMessage = 'offline';
      var connection = null;
      var retryIntervalObject = null;
      var config = {
        url: 'donda.nl',
        port: 9090
      };

      var connect = function() {
        kodiWs(config.url, config.port).then(function(link) {
          connection = link;
          connected = true;
          statusMessage = 'online';
          $rootScope.$emit('rkWsConnectionStatusChange', {
            connected: true, 
            statusMessage: 'online'
          });
        },
        function(error) {
          connection = null;
          connected = false;
          statusMessage = 'offline';
          $rootScope.$emit('rkWsConnectionStatusChange', {
            connected: false,
            statusMessage: 'offline'
          });
        });
      };
      
      var connectPersistent = function() {
        var retyInterval = 5000;

        retryIntervalObject = setInterval(function() {
          if(connection === null) {
            connect();
          }
        }, retyInterval);
      };
      
      return {
        connect: connect,
        connectPersistent: connectPersistent,
        connected: connected,
        connection: connection,
        statusMessage: statusMessage
      };
    }
  ]);*/

angular.module('rekodiApp')
  .factory('rkKodiWsApiService', [
    function()
    {
      return {
        test: 'test'
      };
    }
  ]);

