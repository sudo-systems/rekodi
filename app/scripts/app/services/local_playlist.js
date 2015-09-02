rekodiApp.factory('rkLocalPlaylistService', ['rkConfigService', 'rkLogService', 'rkEnumsService', 'rkRemoteControlService',
  function(rkConfigService, rkLogService, rkEnumsService, rkRemoteControlService) {
    var fs = require('fs');
    var playlistsFile = rkConfigService.get('files', 'playlists');
    var playlists = [];
    playlists[rkEnumsService.PlaylistId.AUDIO] = [];
    playlists[rkEnumsService.PlaylistId.VIDEO] = [];
    
    var get = function(playlistId, localPlaylistId) {
      if(localPlaylistId) {
        return (playlists[playlistId][localPlaylistId])? playlists[playlistId][localPlaylistId] : null;
      }
      
      return playlists[playlistId];
    };
    
    var open = function(playlistId, localPlaylistId) {
      rkRemoteControlService.clearPlaylist(playlistId);
      
      angular.forEach(playlists[playlistId][localPlaylistId].items, function(value, key) {
        rkRemoteControlService.addToPlaylist({
          file: value
        });
      });
    };
    
    var save = function(options) {
      if(options.localPlaylistId === null || options.localPlaylistId === undefined || !playlists[options.playlistId][options.localPlaylistId]) {
        playlists[options.playlistId].push({
          name: options.name,
          items: []
        });
        
        options.localPlaylistId = (playlists[options.playlistId].length -1);
      }

      angular.forEach(options.items, function(value, key) {
        playlists[options.playlistId][options.localPlaylistId].items.push(value.file);
      });
      
      store(playlists);   
      
      return {
        localPlaylistId: options.localPlaylistId,
        name: options.name
      };
    };
    
    var remove = function(playlistId, localPlaylistId) {
      if(playlists[playlistId][localPlaylistId]) {
        playlists[playlistId].splice(localPlaylistId, 1);
        return playlists[playlistId];
      }
      
      return null;
    };

    var exists = function(playlistId, name) {
      angular.forEach(playlists[playlistId], function(value, key) {
        if($.trim(name) === $.trim(value.name)) {
          return key;
        }
      });
      
      return null;
    };

    function store(data) {
      fs.writeFile(playlistsFile, JSON.stringify(data), function(error) {
        if(error) {
          rkLogService.error(error);
        }
      }); 
    }
    
    var isLocalPlaylist = function(playlistId, items) {
      var playlistFound = false;
      var playlistData = {
        localPlaylistId: null,
        name: ''
      };
      
      if(items) {
        angular.forEach(playlists[playlistId], function(value, key) {
          if(!playlistFound) {
            var isStoredPlaylist = true;

            angular.forEach(value.items, function(value, index) {
              if(!items || !items[index] || value !== items[index].file) {
                isStoredPlaylist = false;
              }
            });

            if(isStoredPlaylist) {
              playlistData = {
                localPlaylistId: key,
                name: value.name
              };

              playlistFound = true; 
            }
          }
        });
      }
      
      return playlistData;
    };
    
    function init() {
      if(!fs.existsSync(playlistsFile)) {
        store(playlists);
        return;
      }
      
      playlists = require(playlistsFile);
    }
    
    init();
    
    return {
      get: get,
      save: save,
      remove: remove,
      exists: exists,
      isLocalPlaylist: isLocalPlaylist,
      open: open
    };
  }
]);