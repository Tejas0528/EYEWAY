import{BrowserRouter,Routes,Route,Navigate}from"react-router-dom";
import{AppProvider,useApp}from"./context/AppContext";
import ToastContainer from"./components/Toast";
import AIChatbot from"./components/AIChatbot";
import Navbar from"./components/Navbar";
import Home from"./pages/Home";
import Login from"./pages/Login";
import Register from"./pages/Register";
import Dashboard from"./pages/Dashboard";
import SubmitComplaint from"./pages/SubmitComplaint";
import MyComplaints from"./pages/MyComplaints";
import PublicFeed from"./pages/PublicFeed";
import Profile from"./pages/Profile";
import{OfficerDashboard,OfficerAssigned}from"./pages/OfficerPages";
import{AdminDashboard,AdminComplaints,AdminUsers,AdminOfficers,AdminMap}from"./pages/AdminPages";

function RequireAuth({children}){const{user}=useApp();if(!user)return<Navigate to="/login" replace/>;return children;}
function RequireRole({children,roles}){const{user}=useApp();if(!user)return<Navigate to="/login" replace/>;if(!roles.includes(user.role))return<Navigate to={rHome(user.role)} replace/>;return children;}
function rHome(role){return role==="admin"?"/admin":role==="officer"?"/officer":"/dashboard";}
function RoleRedirect(){const{user}=useApp();if(!user)return<Navigate to="/login" replace/>;return<Navigate to={rHome(user.role)} replace/>;}

function AppRoutes(){
  const{user}=useApp();
  return<>
    <Navbar/>
    <ToastContainer/>
    {user&&<AIChatbot/>}
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/home" element={<RoleRedirect/>}/>
      <Route path="/dashboard" element={<RequireRole roles={["citizen","admin"]}><Dashboard/></RequireRole>}/>
      <Route path="/complaint" element={<RequireRole roles={["citizen","admin"]}><SubmitComplaint/></RequireRole>}/>
      <Route path="/my-complaints" element={<RequireRole roles={["citizen","admin"]}><MyComplaints/></RequireRole>}/>
      <Route path="/public-feed" element={<RequireAuth><PublicFeed/></RequireAuth>}/>
      <Route path="/officer" element={<RequireRole roles={["officer"]}><OfficerDashboard/></RequireRole>}/>
      <Route path="/officer/assigned" element={<RequireRole roles={["officer"]}><OfficerAssigned/></RequireRole>}/>
      <Route path="/admin" element={<RequireRole roles={["admin"]}><AdminDashboard/></RequireRole>}/>
      <Route path="/admin/complaints" element={<RequireRole roles={["admin"]}><AdminComplaints/></RequireRole>}/>
      <Route path="/admin/users" element={<RequireRole roles={["admin"]}><AdminUsers/></RequireRole>}/>
      <Route path="/admin/officers" element={<RequireRole roles={["admin"]}><AdminOfficers/></RequireRole>}/>
      <Route path="/admin/map" element={<RequireRole roles={["admin"]}><AdminMap/></RequireRole>}/>
      <Route path="/profile" element={<RequireAuth><Profile/></RequireAuth>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </>;
}

export default function App(){
  return<BrowserRouter><AppProvider><AppRoutes/></AppProvider></BrowserRouter>;
}
