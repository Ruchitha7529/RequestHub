import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            const newSocket = io("http://localhost:5001", {
                query: { userId: user.id }
            });

            setSocket(newSocket);

            newSocket.on("connect", () => {
                console.log("Socket: Connected with ID", newSocket.id);
            });

            newSocket.on("disconnect", (reason) => {
                console.log("Socket: Disconnected", reason);
            });

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
