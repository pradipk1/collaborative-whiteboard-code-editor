
import Home from './pages/Home'
// import './App.css'
// import { joinRoomContextProvider } from './context/joinRoomContext'
import joinRoomContext from './context/joinRoomContext';
import { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  return (
    <joinRoomContext.Provider value={{username, roomId, isJoined, setUsername, setRoomId, setIsJoined}}>
      <div>
        {<Home />}
      </div>
    </joinRoomContext.Provider>
  )
}

export default App
