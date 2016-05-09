var socket;
var isConnected = false;

function sendOsc(address, value) {
  if (isConnected == true)
  {
 	if(value!==undefined){socket.emit('message', [address].concat(value));}
 	else{socket.emit('message', [address]);}
  }
    
  }

function setupOsc(oscPortIn, oscPortOut, whichIP) {
	socket = io.connect('http://127.0.0.1', { port: 8085, forceNew: true, rememberTransport: false });
	socket.on('connect', function() {
		socket.emit('config', {	
			server: { port: oscPortIn},
			client: { port: oscPortOut, host: whichIP}
		});
    isConnected = true;
	});
	socket.on('message', function(msg) {
		if (msg[0] == '#bundle') {
			for (var i=2; i<msg.length; i++) {
				receiveOsc(msg[i][0], msg[i].splice(1));
			}
		} else {
			receiveOsc(msg[0], msg.splice(1));
		}
	});
}