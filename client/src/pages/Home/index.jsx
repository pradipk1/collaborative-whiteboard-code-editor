
import {io} from 'socket.io-client';
import SplitScreen from './../../components/SplitScreen';
import { useEffect } from 'react';

function Home() {

    // make the connection with the server
    const socket = io('http://localhost:8000');

    useEffect(() => {
        socket.emit('join-room', {
            username: 'pradip',
            roomId: 101
        });

        return () => {
            socket.disconnect();
        }
    }, [socket]);

    return (
        <div className="home-main-cont">
            {<SplitScreen socket={socket} />}
        </div>
    )
}

export default Home;