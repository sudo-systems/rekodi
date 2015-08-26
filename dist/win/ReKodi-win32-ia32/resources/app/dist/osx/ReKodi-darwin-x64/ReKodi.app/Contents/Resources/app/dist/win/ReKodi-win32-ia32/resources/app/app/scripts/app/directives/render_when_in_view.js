rekodiApp.directive('rkRenderWhenInView', [
  function() {
  	return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var $elementsContainer = $(attrs.rkRenderWhenInView);
        
        $(attrs.rkRenderWhenInView).on('scroll', function() {
          var $element = $(element);
          
          var docViewTop = $elementsContainer.scrollTop();
          var docViewBottom = docViewTop + $elementsContainer.height();

          var elemTop = $element.offset().top;
          var elemBottom = elemTop + $element.height();

          var isinView = ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
          
          if(isinView && !$element.is(':visible')) {
            $element.show();
          }
          else if($element.is(':visible')){
            $element.hide();
          }
          
          //console.log('Is in view: '+isinView);
        });
        
        if(scope.$last){
          
          /*console.log(attrs.rkRenderWhenInView);

          jQuery(attrs.rkRenderWhenInView).on('appear', function(event, $all_appeared_elements) {
            console.dir($all_appeared_elements);
            console.log('in view');
          });*/
        }
      }
  	};
  }
]);
