rekodiApp.controller('rkTabsCtrl', ['$scope', '$localStorage',
  function($scope, $localStorage) {
    $scope.storage = null;
    
    $scope.initTab = function(tabSelector) {
      for(var i in tabSelector) {
        angular.element(tabSelector[i]).scope().init();
      }
    };
    
    $scope.setActive = function($event) {
      var elementId = $event.currentTarget.attributes['rel'].value;
      var tabLevel = parseInt($event.currentTarget.attributes['data-level'].value);
      var elementSelector = angular.element('#'+elementId);
      var tab, subTab;
      
      if(tabLevel === 1) {
        tab = elementId;
      }
      else if(tabLevel === 2) {
        tab = $(elementSelector).parents('.tabsContainer:first').attr('id');
        subTab = elementId;
      }
      
      angular.forEach($scope.storage, function(value, key) {
        if(key === tab) {
          $scope.storage[key].active = true;
          $scope.storage.currentlyActiveTab = tab;
          
          if($scope.storage[key].below) {
            angular.forEach($scope.storage[key].below, function(value2, key2) {
              if(subTab && $scope.storage[key].below[key2] === subTab) {
                $scope.storage[key].below[key2].active = true;
                $scope.storage.currentlyActiveTab = subTab;
              }
              else {
                $scope.storage[key].below[key2].active = false;
              }
            });
          }
        }
        else if($scope.storage[key]) {
          if($scope.storage[key].active) {
            $scope.storage[key].active = false;
          }
          
          if($scope.storage[key].below) {
            angular.forEach($scope.storage[key].below, function(value3, key3) {
              $scope.storage[key].below[key3].active = false;
            });
          }
        }
      });
    };
    
    $scope.setDefault = function(tabPath) {
      
    };
    
    function init() {
      if(!$localStorage.tabs || $localStorage.tabs.constructor !== Object) {
        $localStorage.tabs = {
          currentlyActiveTab: null,
          nowPlayingDetails: {
            active: true,
            isDefault: false
          },
          playlist: {
            active: false,
            isDefault: false,
            below: {
              audioPlaylist: {
                active: false,
                isDefault: false
              },
              videoPlaylist: {
                active: false,
                isDefault: false
              }
            }
          },
          music: {
            active: false,
            isDefault: false,
            below: {
              musicLibrary: {
                active: false,
                isDefault: false
              },
              musicFiles: {
                active: false,
                isDefault: false
              },
              musicAddons: {
                active: false,
                isDefault: false
              }
            }
          },
          movies: {
            active: false,
            isDefault: false,
            moviesLibrary: {
              active: false,
              isDefault: false
            },
            moviesFiles: {
              active: false,
              isDefault: false
            },
            moviesAddons: {
              active: false,
              isDefault: false
            }
          },
          tvShows: {
            tvShowsLibrary: {
              active: false,
              isDefault: false
            },
            tvShowsFiles: {
              active: false,
              isDefault: false
            },
            tvShowsAddons: {
              active: false,
              isDefault: false
            }
          },
          photos: {
            active: false,
            isDefault: false
          },
          addons: {
            active: false,
            isDefault: false
          },
          remote: {
            active: false,
            isDefault: false
          },
          settings: {
            active: false,
            isDefault: false
          }
        };
      }
      
      $scope.storage = $localStorage.tabs;
    }
    
    init();
  }
]);