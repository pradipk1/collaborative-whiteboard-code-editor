
import {io} from 'socket.io-client';
import SplitScreen from './../../components/SplitScreen';
import { useContext, useEffect } from 'react';
import { useState } from 'react';
import joinRoomContext from '../../context/joinRoomContext';
import JoinRoomPage from '../JoinRoomPage';
// import { useJoinRoomContext } from '../../context/joinRoomContext';

function Home() {
    const {username, roomId, isJoined} = useContext(joinRoomContext);
    // console.log(username)
    // const {} = useJoinRoomContext();
    // const [username, setUsername] = useState('');
    // const [roomId, setRoomId] = useState('');
    // const [isJoined, setIsJoined] = useState(false);

    // make the connection with the server
    const socket = io('http://localhost:8000');

    useEffect(() => {
        if(username && roomId) {
            socket.emit('join-room', {
                username: username,
                roomId: roomId
            });
        }
    }, [username, roomId]);

    return (
        <div className="home-main-cont">
            {
                !isJoined ? <JoinRoomPage /> : 
                <SplitScreen socket={socket} username={username} roomId={roomId} />
            }
            {/* { !isJoined &&  } */}
            {/* { } */}
        </div>
    )
}

export default Home;