// var client = mqtt.connect('ws://broker.emqx.io:8083/mqtt');
var client = mqtt.connect('ws://192.168.1.120:8081/mqtt');

client.on('connect', () => {
    console.log('connected');
    client.subscribe('test');
});
client.on('massage', (topic, massage) => {
    console.log(topic + ':' + massage);
});