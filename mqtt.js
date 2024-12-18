const mqtt = require('mqtt');

const url = 'ws://broker.emqx.io:8083/mqtt'

const options = {
    clean: true,
    connectTimeout: 4000,
    clientId: 'emqx_test',
    username: 'emqx_test',
    password: 'emqx_test',
}
const client = mqtt.connect(url, options);

client.on('connect', function() {
    console.log('Connected');
    client.subscribe('test', function(err){
        if(!err){
            client.publish('test', 'Hello mqtt');
        }
    })
})

client.on('massage', function(topic, massage) {
    console.log(massage.toString())
    client.end()
})