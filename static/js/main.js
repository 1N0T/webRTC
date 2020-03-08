var ws = new WebSocket(location.href.replace('http', 'ws').replace('sala', 'ws'));

var initiator;
var pc;

function initiatorCtrl(event) {
    if (event.data == "sala completa") {
        alert("Lo lamento !!!\n\nLa sala está completa\n\nCrea una nuev sala.");
    }
    if (event.data == "sala iniciada") {
        initiator = false;
        init();
    }
    if (event.data == "not hay sala") {
        initiator = true;
        init();
    }
}

ws.onmessage = initiatorCtrl;


function init() {
    var constraints = {
        audio: true,
        video: true
    };
    getUserMedia(constraints, connect, fail);
}


function connect(stream) {
    pc = new RTCPeerConnection(null);

    if (stream) {
        pc.addStream(stream);
        var local = document.getElementById('local');
        local.srcObject = stream;
        local.play();
    }

    pc.onaddstream = function(event) {
        var remoto = document.getElementById('remoto');
        remoto.srcObject = event.stream;
        remoto.play();
    };
    pc.onicecandidate = function(event) {
        if (event.candidate) {
            ws.send(JSON.stringify(event.candidate));
        }
    };
    ws.onmessage = function (event) {
        var signal = JSON.parse(event.data);
        if (signal.sdp) {
            if (initiator) {
                receiveAnswer(signal);
            } else {
                receiveOffer(signal);
            }
        } else if (signal.candidate) {
            pc.addIceCandidate(new RTCIceCandidate(signal));
        }
    };

    if (initiator) {
        createOffer();
    }
}


function createOffer() {
    pc.createOffer(function(offer) {
        pc.setLocalDescription(offer, function() {
            ws.send(JSON.stringify(offer));
        }, fail);
    }, fail);
}


function receiveOffer(offer) {
    pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
        pc.createAnswer(function(answer) {
            pc.setLocalDescription(answer, function() {
                ws.send(JSON.stringify(answer));
            }, fail);
        }, fail);
    }, fail);
}


function receiveAnswer(answer) {
    pc.setRemoteDescription(new RTCSessionDescription(answer));
}


function fail() {
    console.error.apply(console, arguments);
}
