// var client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');
let ipName = document.getElementById("ip_name");
let portName = document.getElementById("port_name");
var client = mqtt.connect('ws://localhost:9001/mqtt');

client.on('connect', () => {
    console.log('connected');
    client.subscribe('test');
});
client.on('massage', (topic, massage) => {
    console.log(topic + ':' + massage);
});

