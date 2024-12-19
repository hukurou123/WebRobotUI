// var client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');
var client;

function ConnectButtonClick() {
    let ipName = document.getElementById("ip_name");
    let portName = document.getElementById("port_name");
    client = mqtt.connect('ws://'+ipName.value+':'+portName.value+'/mqtt');
    client.on('connect', () => {
        console.log('connected');
        client.subscribe('test');
    });
}

client.on('massage', (topic, massage) => {
    console.log(topic + ':' + massage);
});

