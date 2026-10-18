import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Navbar from "./components/NavBar";
import MobileNavbar from "./components/MobileNavbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import About from "./components/About";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

// Hosts without an SPA rewrite rule (e.g. a Render static site) set VITE_HASH_ROUTER=true,
// so deep links like /#/question/123 still work after a page refresh.
const Router = import.meta.env.VITE_HASH_ROUTER === "true" ? HashRouter : BrowserRouter;
import { useState, useRef, useEffect } from "react"; 
import QuestionDetail from "./components/QuestionDetail";

import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import TopicPage from "./components/TopicPage";
import AIAssistant from "./components/ai/AIAssistant";
// Remembers that the user logged in, so a page refresh doesn't log them out.
// Storage can be unavailable (e.g. some private windows); the app then just forgets on refresh.
const LOGIN_KEY = "cph_logged_in";
const readLoggedIn = () => {
  try {
    return localStorage.getItem(LOGIN_KEY) === "true";
  } catch {
    return false;
  }
};
const saveLoggedIn = (value) => {
  try {
    if (value) localStorage.setItem(LOGIN_KEY, "true");
    else localStorage.removeItem(LOGIN_KEY);
  } catch {
    /* storage unavailable */
  }
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(readLoggedIn);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleIsLoggedIn = () => {
    saveLoggedIn(true);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    saveLoggedIn(false);
    setIsLoggedIn(false);
    setIsSidebarOpen(false);
  };

  
  useEffect(() => {
  const handleClickOutside = (event) => {
    
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsSidebarOpen(false);
    }
  };
  
  document.addEventListener("mousedown", handleClickOutside);
  // ...
}, []);

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar toggleSidebar={toggleSidebar} isLoggedIn={isLoggedIn} isSidebarOpen={isSidebarOpen} onLogout={handleLogout}/>

        <Sidebar ref={sidebarRef}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isLoggedIn={isLoggedIn} 
        />
        
        <div className="d-lg-none">
          <MobileNavbar />
        </div>

        <div
          className="content"
          style={{
            marginLeft: isSidebarOpen ? "270px" : "0px", 
            padding: "0px",
            transition: "margin-left 0.3s ease", 
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  isOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                  isLoggedIn={isLoggedIn}
                />
              }
            />
            <Route path="/sidebar" element={<Sidebar/>} />
            <Route
              path="/login"
              element={<Login handleIsLoggedIn={handleIsLoggedIn} />}
            />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
             <Route path="/question/:id" element={<QuestionDetail />} />
             
            <Route path="/topic/:topicName" element={<TopicPage />} />
          </Routes>
        </div>

        <Footer />
        <AIAssistant />
      </div>
    </Router>
  );
}

export default App;
