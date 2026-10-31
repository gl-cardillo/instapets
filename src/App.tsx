import "./App.css";
import "animate.css";
import { HashRouter, Navigate, Routes, Route } from "react-router";
import { SkeletonTheme } from "react-loading-skeleton";
import { Login } from "./components/Login/Login";
import { SignIn } from "./components/SignIn/SignIn";
import { Mainbar } from "./components/Mainbar/Mainbar";
import { Home } from "./components/Home/Home";
import { Profile } from "./components/Profile/Profile";
import { Post } from "./components/Post/Post";
import { Footer } from "./components/Footer/Footer";
import { UploadPost } from "./components/upload-post/UploadPost";
import { SearchPage } from "./components/SearchPage/SearchPage";
import { NotFound } from "./components/NotFound/NotFound";
import { RequireAuth } from "./auth/RequireAuth";

function App() {
  return (
    <SkeletonTheme
      baseColor="var(--color-line)"
      highlightColor="var(--color-surface-hover)"
    >
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signIn" element={<SignIn />} />
          <Route path="/" element={<Mainbar />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile/:profileName" element={<Profile />} />
            <Route
              path="/uploadPost"
              element={
                <RequireAuth>
                  <UploadPost />
                </RequireAuth>
              }
            />
            <Route path="/post/:postId" element={<Post />} />
            <Route path="/searchPage" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Footer />
      </HashRouter>
    </SkeletonTheme>
  );
}

export default App;
