var fs = require('fs');
var path = require('path');
var xec = require('xbmc-event-client');

var opts = {
  log: true,
  icontype: xec.ICON_PNG,
  //iconbuffer: fs.readFileSync('./node.png'),
  host: 'donda.nl',
  port: 9777
};
 
var xbmc = new xec.XBMCEventClient('ReKodi', opts);
 
xbmc.connect(function(errors, bytes) {
  if (errors.length) {
    console.dir(errors[0]);
  }
});

$(document).ready(function() {
  $('#remoteLeft').on('click', function() {
    xbmc.remotePress('left', function() {
      console.log('Remote left pressed');
    });
  });
});