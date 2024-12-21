// var client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');
var client;

function ConnectButtonClick() {
    let ipName = document.getElementById("ip_name");
    let portName = document.getElementById("port_name");
    client = mqtt.connect('ws://'+ipName.value+':'+portName.value+'/mqtt');
    client.on('connect', () => {
        localStorage.setItem("BrokerIP", ipName.value);
        localStorage.setItem("BrokerPORT", portName.value);
        document.getElementById("status").src = "./green.PNG";
        console.log('connected');
        client.subscribe('test');
    });
}

function disConnectButtonClick(){
    client.end();
    document.getElementById("status").src = "./red.PNG";
}

client.on('massage', (topic, massage) => {
    console.log(topic + ':' + massage);
});

