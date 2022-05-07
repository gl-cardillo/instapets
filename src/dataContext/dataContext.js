import React, { useState,  } from "react";

export const UserDataContext = React.createContext();
export function UserDataProvider({children}) {
  
  const [ userData, setUserData] = useState('')

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  )
}