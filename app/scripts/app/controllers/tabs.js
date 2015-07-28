rekodiApp.controller('rkTabsCtrl', ['$scope', '$localStorage',
  function($scope, $localStorage) {
    $scope.storage = null;
    
    $scope.initTab = function(tabSelector) {
      for(var i in tabSelector) {
        angular.element($(tabSelector[i])).scope().init();
      }
    };
    
    function init() {
      if(!$localStorage.tabs || $localStorage.tabs.constructor !== Object) {
        $localStorage.tabs = {
          nowPlayingDetails: {
            constoller: 'rkNowPlayingCtrl',
            view: 'views/partials/tabs/now_playing_details.html',
            title: 'Now playing',
            icon: 'mdi mdi-play-box-outline',
            active: true,
            onClick: function(){}
          },
          playlist: {
            controller: '',
            view: 'views/partials/tabs/playlist.html',
            title: 'Playlist',
            icon: 'mdi mdi-view-list',
            active: false,
            onClick: function() {
              $scope.initTab(['#audioPlaylist', '#videoPlaylist']);
            },
            below: {
              audioPlaylist: {
                controller: 'rkPlaylistCtrl',
                view: 'views/partials/tabs/playlist/audio.html',
                title: 'Audio playlist',
                icon: 'mdi mdi-music-note',
                active: false,
                onClick: function(){}
              },
              videoPlaylist: {
                controller: 'rkPlaylistCtrl',
                view: 'views/partials/tabs/playlist/video.html',
                title: 'Video playlist',
                icon: 'mdi mdi-video',
                active: false,
                onClick: function(){}
              }
            }
          }
        };
      }
    }
    
    init();
  }
]);