
import {io} from 'socket.io-client';
import SplitScreen from './../../components/SplitScreen';
import { useEffect } from 'react';
import { useState } from 'react';

function Home() {
    const [username, setUsername] = useState('pradip');
    const [roomId, setRoomId] = useState('101');

    // make the connection with the server
    const socket = io('http://localhost:8000');

    useEffect(() => {
        socket.emit('join-room', {
            username: username,
            roomId: roomId
        });
    }, [roomId]);

    return (
        <div className="home-main-cont">
            {<SplitScreen socket={socket} username={username} roomId={roomId} />}
        </div>
    )
}

export default Home;