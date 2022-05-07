import "./App.css";
import { useEffect, useContext, useState } from "react";
import { HashRouter,  Routes, Route } from 'react-router-dom';
import { Login } from "./components/Login/Login";
import { SignIn } from "./components/SignIn/SignIn";
import { Mainbar } from "./components/Mainbar/Mainbar";
import { Home } from "./components/Home/Home";
import { Profile } from "./components/Profile/Profile";
import { Post } from "./components/Post/Post";
import { Footer } from "./components/Footer/Footer";
import { UploadPost } from "./components/upload-post/UploadPost";
import { SearchPage } from "./components/SearchPage/SearchPage";
import { UserDataContext } from "./dataContext/dataContext";
import { auth } from "./firebase/config";
import { SkeletonTheme } from 'react-loading-skeleton'
import { onAuthStateChanged } from "firebase/auth";
import { getDataByEmail } from "./utils/utils";

function App() {
  
  const {  setUserData } = useContext(UserDataContext);
  const [ user, setUser] = useState(null)

  useEffect(() => { 
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });  
    if (user) {
      getDataByEmail(setUserData, user.email);
    } else {
      getDataByEmail(setUserData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SkeletonTheme baseColor="#9b9b9b;" highlightColor="#979797">
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/" element={<Mainbar />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile/:profileName" element={<Profile />} />
            <Route path="/uploadPost" element={<UploadPost  />} />
            <Route path="/post/:postId" element={<Post />} />
            <Route path="/searchPage" element={<SearchPage />} />
          </Route>
        </Routes>
        <Footer />
      </HashRouter>
    </SkeletonTheme >
  );
}

export default App;