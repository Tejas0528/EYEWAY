import{useState}from"react";
import{Link,useLocation,useNavigate}from"react-router-dom";
import{useApp}from"../context/AppContext";
const NAV={citizen:[{to:"/dashboard",icon:"🏠",label:"Overview"},{to:"/complaint",icon:"📝",label:"Submit Complaint"},{to:"/my-complaints",icon:"📋",label:"My Complaints"},{to:"/public-feed",icon:"🌐",label:"Community Feed"},{to:"/profile",icon:"👤",label:"Profile"}],officer:[{to:"/officer",icon:"🏠",label:"Overview"},{to:"/officer/assigned",icon:"📌",label:"Assigned Cases"},{to:"/profile",icon:"👤",label:"Profile"}],admin:[{to:"/admin",icon:"📊",label:"Analytics"},{to:"/admin/complaints",icon:"📋",label:"All Complaints"},{to:"/admin/users",icon:"👥",label:"Users"},{to:"/admin/officers",icon:"🎖️",label:"Officers"},{to:"/admin/map",icon:"🗺️",label:"Live Map"},{to:"/profile",icon:"👤",label:"Profile"}]};
const NOTIFS=[{id:1,text:"Complaint #C001 is now In Progress",time:"2h ago",read:false,color:"#3b9eff"},{id:2,text:"Complaint #C003 resolved ✓",time:"5h ago",read:false,color:"#22c55e"},{id:3,text:"New officer assigned to #C002",time:"1d ago",read:true,color:"#f59e0b"}];
function SL({to,icon,label,active}){
  const[h,setH]=useState(false);
  return<Link to={to} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:"flex",alignItems:"center",gap:11,padding:"10px 14px",borderRadius:10,marginBottom:3,background:active?"rgba(45,180,155,.18)":h?"rgba(255,255,255,.06)":"transparent",borderLeft:`3px solid ${active?"#2db49b":"transparent"}`,color:active?"#fff":h?"rgba(255,255,255,.85)":"rgba(255,255,255,.5)",fontSize:13,fontWeight:active?600:400,transition:"all .2s",textDecoration:"none"}}><span style={{fontSize:16}}>{icon}</span><span>{label}</span>{active&&<div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"#2db49b"}}/>}</Link>;
}
export default function DashboardLayout({children}){
  const{user,logout,lang,switchLang,theme,toggleTheme}=useApp();
  const location=useLocation();const navigate=useNavigate();
  const[mob,setMob]=useState(false);const[notifOpen,setNotifOpen]=useState(false);const[notifs,setNotifs]=useState(NOTIFS);
  const role=user?.role||"citizen";const links=NAV[role]||NAV.citizen;const unread=notifs.filter(n=>!n.read).length;
  const Sidebar=<aside style={{width:256,minHeight:"100vh",background:"#0a0f1c",borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
    <div style={{height:3,background:"linear-gradient(90deg,#1a7a6b,#2db49b,#f59e0b)"}}/>
    <div style={{padding:"16px 18px 12px",borderBottom:"1px solid rgba(255,255,255,.07)"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,color:"#fff"}}>E</div><div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15,color:"#fff"}}>EYEWAY</div><div style={{fontSize:9,color:"rgba(45,180,155,.8)",letterSpacing:"0.08em"}}>SMART GOVERNANCE</div></div></div></div>
    <div style={{padding:"13px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",background:"rgba(255,255,255,.02)"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()||"U"}</div><div style={{overflow:"hidden"}}><div style={{fontSize:13,fontWeight:600,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.4)",textTransform:"capitalize"}}>{role}</div></div><div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:"#22c55e",flexShrink:0,boxShadow:"0 0 6px rgba(34,197,94,.6)"}}/></div></div>
    <nav style={{flex:1,padding:"12px 10px"}}>{links.map(l=><SL key={l.to} {...l} active={location.pathname===l.to}/>)}</nav>
    <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <button onClick={toggleTheme} style={{flex:1,padding:"7px",borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.6)",fontSize:12,cursor:"pointer"}}>{theme==="dark"?"☀️ Light":"🌙 Dark"}</button>
        <div style={{display:"flex",gap:3,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:4}}>{["en","ta"].map(l=><button key={l} onClick={()=>switchLang(l)} style={{padding:"4px 8px",borderRadius:5,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:lang===l?"rgba(45,180,155,.4)":"transparent",color:lang===l?"#2db49b":"rgba(255,255,255,.35)"}}>{l.toUpperCase()}</button>)}</div>
      </div>
      <button onClick={()=>{logout();navigate("/");}} style={{width:"100%",padding:"10px 14px",borderRadius:9,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.22)",color:"#ef4444",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,.18)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(239,68,68,.1)"}>🚪 Sign Out</button>
    </div>
  </aside>;
  return<div style={{display:"flex",minHeight:"100vh",background:"#0e1420"}}>
    <div className="dash-sidebar">{Sidebar}</div>
    {mob&&<div onClick={()=>setMob(false)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,.65)",backdropFilter:"blur(4px)"}}><div onClick={e=>e.stopPropagation()} style={{width:256,height:"100%"}}>{Sidebar}</div></div>}
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <header style={{height:64,background:"rgba(10,15,28,.96)",borderBottom:"1px solid rgba(255,255,255,.06)",backdropFilter:"blur(24px)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={()=>setMob(true)} className="dash-ham" style={{display:"none",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:17,cursor:"pointer"}}>☰</button>
          <div style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>Ministry of Civic Affairs &rsaquo; <span style={{color:"rgba(255,255,255,.6)"}}>EYEWAY Portal</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>setNotifOpen(o=>!o)} style={{width:36,height:36,borderRadius:9,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,position:"relative"}}>
              🔔{unread>0&&<span style={{position:"absolute",top:5,right:5,width:8,height:8,borderRadius:"50%",background:"#ef4444",border:"2px solid #0e1420"}}/>}
            </button>
            {notifOpen&&<div style={{position:"absolute",top:44,right:0,width:295,background:"#131927",border:"1px solid rgba(45,180,155,.2)",borderRadius:14,boxShadow:"0 16px 50px rgba(0,0,0,.5)",zIndex:200,animation:"fadeUp .2s ease"}}>
              <div style={{padding:"12px 15px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"#fff"}}>Notifications</span><span onClick={()=>setNotifs(p=>p.map(n=>({...n,read:true})))} style={{fontSize:11,color:"#2db49b",cursor:"pointer",fontWeight:600}}>Mark all read</span></div>
              {notifs.map(n=><div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} style={{padding:"11px 15px",borderBottom:"1px solid rgba(255,255,255,.05)",background:n.read?"transparent":"rgba(255,255,255,.02)",display:"flex",gap:10,cursor:"pointer"}}><div style={{width:8,height:8,borderRadius:"50%",background:n.color,marginTop:5,flexShrink:0}}/><div><div style={{fontSize:13,color:"#fff",lineHeight:1.5}}>{n.text}</div><div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:3}}>{n.time}</div></div></div>)}
            </div>}
          </div>
          <span style={{fontSize:12,fontWeight:600,padding:"3px 11px",borderRadius:5,background:"rgba(45,180,155,.15)",color:"#2db49b",border:"1px solid rgba(45,180,155,.3)",textTransform:"capitalize"}}>{role}</span>
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff"}}>{user?.name?.[0]?.toUpperCase()}</div>
        </div>
      </header>
      <main style={{flex:1,padding:28,overflowY:"auto"}}><div style={{animation:"fadeIn .3s ease"}}>{children}</div></main>
      <footer style={{padding:"12px 28px",borderTop:"1px solid rgba(255,255,255,.05)",background:"rgba(10,15,28,.6)",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,.2)"}}>© 2025 EYEWAY — Ministry of Electronics & IT, Govt. of India</span>
        <span style={{fontSize:12,color:"rgba(255,255,255,.2)"}}>Digital India · AI-Powered Governance</span>
      </footer>
    </div>
    <style>{`@media(max-width:900px){.dash-sidebar{display:none!important}.dash-ham{display:flex!important}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>;
}
