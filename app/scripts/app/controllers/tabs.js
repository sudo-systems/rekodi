rekodiApp.controller('rkTabsCtrl', ['$scope', '$localStorage',
  function($scope, $localStorage) {
    $scope.storage = null;
    
    $scope.initTab = function(tabSelector) {
      for(var i in tabSelector) {
        angular.element($(tabSelector[i])).scope().init();
      }
    };
    
    $scope.setActive = function(tab, subTab) {
      angular.forEach($scope.storage, function(value, key) {
        if(key === tab) {
          $scope.storage[key].active = true;
          
          if($scope.storage[key].below) {
            angular.forEach($scope.storage[key].below, function(value2, key2) {
              if($scope.storage[key].below[key2] === subTab) {
                $scope.storage[key].below[key2].active = true;
              }
              else {
                $scope.storage[key].below[key2].active = false;
              }
            });
          }
        }
        else {
          $scope.storage[key].active = false;
          
          if($scope.storage[key].below) {
            angular.forEach($scope.storage[key].below, function(value3, key3) {
                $scope.storage[key].below[key3].active = false;
            });
          }
        }
      });
    };
    
    function init() {
      if(!$localStorage.tabs || $localStorage.tabs.constructor !== Object) {
        $localStorage.tabs = {
          nowPlayingDetails: {
            active: true
          },
          playlist: {
            active: false,
            below: {
              audioPlaylist: {
                active: false
              },
              videoPlaylist: {
                active: false
              }
            }
          },
          music: {
            active: false,
            below: {
              musicLibrary: {
                active: false
              },
              audioFiles: {
                active: false
              }
            }
          },
          movies: {
            active: false,
            moviesLibrary: {
              active: false
            },
            videoFiles: {
              active: false
            }
          },
          tvShows: {
            tvShowsLibrary: {
              active: false
            },
            videoFiles: {
              active: false
            }
          },
          photos: {
            active: false
          },
          addons: {
            active: false
          },
          remote: {
            active: false
          },
          settings: {
            active: false
          }
        };
      }
      
      $scope.storage = $localStorage.tabs;
    }
    
    init();
  }
]);