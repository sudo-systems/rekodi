var remote = require('remote');
var BrowserWindow = remote.require('browser-window');
var fs = require('fs');
var path = require('path');
var xec = require('xbmc-event-client');
var mainWindow = remote.getCurrentWindow();

var opts = {
  log: true,
  icontype: xec.ICON_PNG,
  //iconbuffer: fs.readFileSync('./node.png'),
  host: 'donda.nl',
  port: 9777
};

var kodiEventClient = new xec.XBMCEventClient('ReKodi', opts);

kodiEventClient.connect(function(errors, bytes) {
  if (errors.length) {
    alert('Could not connect to KODI Event Sever. Please check your sttings.');
  }
});

$(document).ready(function() {
  /*$('#showRemote').on('click', function() {
    kodiRcWindow = new BrowserWindow({
      width: 400,
      height: 500
    });

    kodiRcWindow.loadUrl('file://' + __dirname + '/remote.html');
    
    kodiRcWindow.on('closed', function() {
      remoteWindow = null;
    });
  });*/
  
  $('#player #topBar .windowControls .button.close').on('click', function() {
    mainWindow.close();
  });
  
  $('#player #topBar .windowControls .button.minimize').on('click', function() {
    mainWindow.minimize();
  });
  
  $('#player #controls .previous').on('click', function() {
    mainWindow.minimize();
  });
  
  $('#player #controls li').on('click', function() {
    kodiEventClient.remotePress($(this).attr('data-button'));
  });
  
  var navElement, leftPos, newWidth, mainNav = $('#player nav > ul');

  mainNav.append('<li class="magic-line"></li>');
  var magicLine = $('#player nav .magic-line');

  magicLine
    .css('left', $('#player nav li.active').position().left)
    .data('origLeft', magicLine.position().left)
    .data('origWidth', magicLine.width());

  $('#player nav li').hover(function() {
    navElement = $(this);
    leftPos = navElement.position().left;
    newWidth = navElement.width();
    magicLine.stop().animate({
      left: leftPos,
      width: newWidth
    });
  }, function() {
    magicLine.stop().animate({
      left: magicLine.data('origLeft'),
      width: magicLine.data('origWidth')
    });    
  });
  
  $('#tabsWrapper nav li').on('click', function(e) {
    e.preventDefault();
    $('#tabsWrapper nav li').removeClass('active');
    $(this).addClass('active');
    
    var index = $(this).index();
    $('#tabsWrapper .tabs').attr('data-tab', index);
    
    magicLine
      .css('left', $('#player nav li.active').position().left)
      .data('origLeft', magicLine.position().left)
      .data('origWidth', magicLine.width());
  });
});