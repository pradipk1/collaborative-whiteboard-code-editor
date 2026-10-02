
// import { useJoinRoomContext } from '../../context/joinRoomContext';
import { useContext } from 'react';
import joinRoomContext from '../../context/joinRoomContext';
import './joinRoomPage.css';

function JoinRoomPage() {
  const {username, roomId, setUsername, setRoomId, setIsJoined} = useContext(joinRoomContext);

  const handleJoinRoom = () => {
    if(!username.trim() || !roomId.trim()) {
      alert('Please Enter Your Name and Room ID');
      return;
    }
    setIsJoined(true);
  }

  return (
    <div className="join-page">
      <div className="join-card">
        <h1>SyncSpace</h1>
        <p>Real-Time Collaborative Whiteboard & Code Editor</p>

        <label>Your Name</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
        />

        <label>Room ID</label>
        <input
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
          placeholder="demo-room"
        />

        <button onClick={handleJoinRoom}>Join Room</button>

        {/* <p>
          {isJoined
              ? "🟢 Server Connected"
              : "🔴 Connecting..."}
        </p> */}

      </div>

    </div>
  )
}

export default JoinRoomPage;