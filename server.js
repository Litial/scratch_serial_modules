var SerialPort = require('SerialPort');
var url = require('url')

var serialPort = new SerialPort("COM3", {
  baudRate: 115200
});

serialPort.on('data', function(data) {
	console.log('data rcv:' + data)
})

function write2Serial(data){
    serialPort.write(data);
}

function decodeMsg(reqUrl)
{
	console.log('url:' + reqUrl)
    //var buff = [0xFE,0x05,0x93,0xCF,0x7D,0x5A,0x00,0xFF];
	var buff = ["A".charCodeAt(),
				"T".charCodeAt(),
				"+".charCodeAt(),
				"C".charCodeAt(),
				"O".charCodeAt(),
				"N".charCodeAt(),
				"T".charCodeAt(),
				"R".charCodeAt(),
				"O".charCodeAt(),
				"L".charCodeAt(),
				"=".charCodeAt(),
				0,
				"\r".charCodeAt(),
				"\n".charCodeAt(),
				];
    var urlInfo = url.parse(reqUrl,true);
    var urlPath = urlInfo.pathname;
    var intValue = urlInfo.query.dt;
    switch (urlPath)
    {
        case '/s':	//start/stop
		var msgLen = intValue.length;

		buff = ["A".charCodeAt(),
				"T".charCodeAt(),
				"+".charCodeAt(),
				"S".charCodeAt(),
				"T".charCodeAt(),
				];

		if(intValue == 1){
            buff.push("A".charCodeAt());
			buff.push("R".charCodeAt());
			buff.push("T".charCodeAt());
        }else{
            buff.push("O".charCodeAt());
			buff.push("P".charCodeAt());
        }
        buff.push("\r".charCodeAt());
		buff.push("\n".charCodeAt());
        
        break;
        case '/m':	//forward/backward
        if(intValue == 1){
            buff[11] = 0xA4
        }else{
            buff[11] = 0xA5
        }
        break;
        case '/t':	//left/right
        if(intValue == 1){
            buff[11] = 0xA6
        }else{
            buff[11] = 0xA7
        }
        break;
		case '/time':	//time delay
        var msgLen = intValue.length;

		buff = ["A".charCodeAt(),
				"T".charCodeAt(),
				"+".charCodeAt(),
				"T".charCodeAt(),
				"I".charCodeAt(),
				"M".charCodeAt(),
				"E".charCodeAt(),
				"=".charCodeAt(),
				];

		for (var i = 0; i < msgLen; i++) {
            var s = intValue.substr(i, 1);
            buff.push(s.charCodeAt());
        }
        buff.push("\r".charCodeAt());
		buff.push("\n".charCodeAt());
        break;
        case '/msg':	//message
        var msgLen = intValue.length;
        
        //buff = [0xFE,0x04 + msgLen,0x93,0xCF,0x7D,0x5A];
		buff = ["A".charCodeAt(),
				"T".charCodeAt(),
				"+".charCodeAt(),
				"M".charCodeAt(),
				"S".charCodeAt(),
				"G".charCodeAt(),
				"=".charCodeAt(),
				];

        /* for (var i = 0; i < msgLen; i++) {
            var s = intValue.substr(i, 1);
            var v = parseInt(s, 16);
            buff.push(v);
        } */
		for (var i = 0; i < msgLen; i++) {
            var s = intValue.substr(i, 1);
            //var v = parseInt(s, 16);
            buff.push(s.charCodeAt());
        }
        buff.push("\r".charCodeAt());
		buff.push("\n".charCodeAt());
        break;
        default:break;
    }
    return buff;
}

var server = require("http")
server.createServer(function(req,res){
    var buffSend = decodeMsg(req.url)
    write2Serial(buffSend)
    res.writeHead(200,{"Content-type":"text/plain"});
    res.write("hello");
    res.end();
}).listen(8800)