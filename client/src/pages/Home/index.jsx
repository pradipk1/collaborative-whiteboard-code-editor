
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
    }, []);

    return (
        <div className="home-main-cont">
            {<SplitScreen />}
        </div>
    )
}

export default Home;