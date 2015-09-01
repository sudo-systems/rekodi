rekodiApp.directive('rkTooltips', ['$timeout',
  function($timeout) {
  	return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var tooltip;
        
        function applyTooltips() {
          tooltip = $(element).find('[title]').jBox('Tooltip',  {
            animation: 'move',
            position: {
              x: 'center',
              y: 'bottom'
            }
          });
        }
        
        if(attrs.rkTooltips === 'true') {
          $timeout(function() {
            applyTooltips();
          });
        }
        else {
          scope.$on('$includeContentLoaded', function () {
            $timeout(function() {
              applyTooltips();
            });
          });

          if(scope.$last === true) {
            $timeout(function() {
              applyTooltips();
            });
          }
        }
        
        scope.$on('$destroy', function() {
          if(tooltip) {
            tooltip.destroy();
          }
        });
      }
  	};
  }
]);
