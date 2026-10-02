
// import { useJoinRoomContext } from '../../context/joinRoomContext';
import './joinRoomPage.css';

function JoinRoomPage() {
  // const {username, roomId, isJoined, setUsername, setRoomId, setIsJoined} = useJoinRoomContext();
  return (
    <div className="join-page">
      <div className="join-card">
        <h1>SyncSpace</h1>
        <p>Real-Time Collaborative Whiteboard & Code Editor</p>

        <label>Your Name</label>
        <input
          value={
            name
          }

          onChange={
            (event) =>
              setName(
                event.target.value
              )
          }

          placeholder="Enter your name"

        />


        <label>
          Room ID
        </label>


        <input

          // value={
          //   roomId
          // }

          onChange={
            (event) =>
              setRoomId(
                event.target.value
              )
          }

          placeholder="demo-room"

        />


        <button
          type="button"
          onClick={() => {
            console.log("JOIN BUTTON CLICKED");
            joinRoom();
          }}
        >
          Join Room
        </button>

        <p>

          {/* {connected
              ? "🟢 Server Connected"
              : "🔴 Connecting..."} */}

        </p>

      </div>

    </div>
  )
}

export default JoinRoomPage;