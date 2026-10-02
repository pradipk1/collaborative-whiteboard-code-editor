import { createContext, useContext, useState } from "react";

const joinRoomContext = createContext();

export default joinRoomContext;

// export function joinRoomContextProvider({children}) {
//     const [username, setUserName] = useState('');
//     const [roomId, setRoomId] = useState('');
//     const [isJoined, setIsJoined] = useState(false);

//     return (
//         <joinRoomContext value={{
//             username, roomId, isJoined, setUserName, setRoomId, setIsJoined
//         }}>
//             {children}
//         </joinRoomContext>
//     );
// }

// export const useJoinRoomContext = () => {
//     return useContext(joinRoomContext);
// }

// export function useJoinRoomContext() {
//     const context = useContext(joinRoomContext);
//     console.log(context)
//     if(!context) return;
//     return context;
// }