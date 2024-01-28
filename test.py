import socketio
import time

with socketio.SimpleClient() as sio:
    port = 5173 
    sio.connect("http://localhost:5173", transports=['websocket']) 
    #print('my sid is', sio.sid)
    #print('my transport is', sio.transport)
    for i in range (5):
        sio.emit("myMessage", {'foo': 'barrr'})
        time.sleep(1)

