// var client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');
var client;

function ConnectButtonClick() {
    let ipName = document.getElementById("ip_name");
    let portName = document.getElementById("port_name");
    client = mqtt.connect('ws://'+ipName.value+':'+portName.value+'/mqtt');
    client.on('connect', () => {
        localStorage.setItem("BrokerIP", ipName.value);
        localStorage.setItem("BrokerPORT", portName.value);
        console.log('connected');
        client.subscribe('test');
    });

    client.on('error', (error) => {
        console.error('Connection failed:', error);
        alert("接続に失敗しました(´Д`; )");
        client.end();
    })
}

client.on('massage', (topic, massage) => {
    console.log(topic + ':' + massage);
});

