import React, { useState,  } from "react";

export const UserDataContext = React.createContext();
export function UserDataProvider({children}) {
  
  const [ userData, setUserData] = useState('')
  const [users, setUsers] = useState([])

  return (
    <UserDataContext.Provider value={{ userData, setUserData, users, setUsers }}>
      {children}
    </UserDataContext.Provider>
  )
}