import React, { createContext, useState ,useEffect} from "react";
import axios from 'axios'
export const UserContext = createContext({});

export function UsercontextProvider({ children }) {
  const [username, setusername] = useState(null);
  const [id, setid] = useState(null);

  useEffect(() => {
    axios.get('/profile').then(response => {
        setid(response.data.userId);
        setusername(response.data.username);
    });
  
  
  }, []);
  
  return (
    <UserContext.Provider value={{ username, setusername, id, setid }}>
      {children}
    </UserContext.Provider>
  );
}
