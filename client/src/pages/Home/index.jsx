
import {io} from 'socket.io-client';
import SplitScreen from './../../components/SplitScreen';
import { useContext, useEffect } from 'react';
import joinRoomContext from '../../context/joinRoomContext';
import JoinRoomPage from '../JoinRoomPage';

function Home() {
    const {username, roomId, isJoined} = useContext(joinRoomContext);

    // make the connection with the server
    const socket = io('http://localhost:8000');

    useEffect(() => {
        if(username && roomId && isJoined) {
            socket.emit('join-room', {
                username: username,
                roomId: roomId
            });
        }

    }, [isJoined]);

    return (
        <div className="home-main-cont">
            {
                !isJoined ? <JoinRoomPage /> : 
                <SplitScreen socket={socket} />
            }
        </div>
    )
}

export default Home;