rekodiApp.directive('rkSetHeight', [
  function() {
  	return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        function setTabContentHeight() {
          var wrapperHeight = ($('#tabs').outerHeight() - $('#tabs').find('nav:first').outerHeight());
          var parent = $(element).parents('.tabsContainer:first');
          parent.css('height', wrapperHeight+'px');
          
          var parentNavHeight = parent.find('nav:first').outerHeight();
          var thisHeight = (parent.outerHeight() - parentNavHeight);
          $(element).css('height', thisHeight+'px');
        }
        
        $(window).on('resize', function(){
          setTabContentHeight();
        });
        
        setTabContentHeight();
      }
  	};
  }
]);
