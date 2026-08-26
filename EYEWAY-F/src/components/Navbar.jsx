import{useState,useEffect}from"react";
import{Link,useLocation,useNavigate}from"react-router-dom";
import{useApp}from"../context/AppContext";
const DASH=["/dashboard","/officer","/admin","/complaint","/profile","/my-complaints","/public-feed"];
export default function Navbar(){
  const[scrolled,setScrolled]=useState(false);const[mob,setMob]=useState(false);
  const{user,logout,lang,switchLang,toggleTheme,theme}=useApp();
  const location=useLocation();const navigate=useNavigate();
  const isDash=DASH.some(p=>location.pathname.startsWith(p));
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn);return()=>window.removeEventListener("scroll",fn);},[]);
  if(isDash)return null;
  const links=[{href:"/#features",label:"Features"},{href:"/#how-it-works",label:"How It Works"},{href:"/#about",label:"About"}];
  return<>
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,height:64,transition:"all .4s",background:scrolled?"rgba(14,20,32,.94)":"transparent",backdropFilter:scrolled?"blur(24px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,.07)":"1px solid transparent"}}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"0 28px",height:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <Link to="/" style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:18,color:"#fff"}}>E</div>
          <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:17,color:"#fff",lineHeight:1}}>EYEWAY</div><div style={{fontSize:9,color:"rgba(45,180,155,.9)",letterSpacing:"0.1em",lineHeight:1,marginTop:2}}>SMART GOVERNANCE</div></div>
        </Link>
        <div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
          {links.map(l=><a key={l.href} href={l.href} style={{color:"rgba(255,255,255,.6)",fontSize:14,fontWeight:500,transition:"color .2s"}} onMouseEnter={e=>e.target.style.color="#2db49b"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.6)"}>{l.label}</a>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:3}}>
            {["en","ta"].map(l=><button key={l} onClick={()=>switchLang(l)} style={{padding:"4px 9px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:lang===l?"rgba(45,180,155,.4)":"transparent",color:lang===l?"#2db49b":"rgba(255,255,255,.4)",transition:"all .15s"}}>{l.toUpperCase()}</button>)}
          </div>
          <button onClick={toggleTheme} style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.7)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15}}>{theme==="dark"?"☀️":"🌙"}</button>
          {user?<>
            <Link to={user.role==="admin"?"/admin":user.role==="officer"?"/officer":"/dashboard"}><button style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>Dashboard</button></Link>
            <button onClick={()=>{logout();navigate("/");}} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:13,cursor:"pointer"}}>Sign out</button>
          </>:<>
            <Link to="/login"><button style={{background:"none",border:"1px solid rgba(255,255,255,.2)",color:"#fff",padding:"8px 18px",borderRadius:9,fontSize:14,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(45,180,155,.7)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.2)"}>Login</button></Link>
            <Link to="/register"><button style={{background:"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",padding:"9px 20px",borderRadius:9,fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(45,180,155,.45)",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(45,180,155,.6)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 16px rgba(45,180,155,.45)"}}>Register</button></Link>
          </>}
          <button onClick={()=>setMob(!mob)} className="nav-ham" style={{display:"none",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,width:36,height:36,color:"#fff",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18}}>{mob?"✕":"☰"}</button>
        </div>
      </div>
    </nav>
    {mob&&<div style={{position:"fixed",top:64,left:0,right:0,zIndex:199,background:"rgba(14,20,32,.98)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,.08)",padding:"20px 28px 28px",animation:"fadeIn .2s ease",display:"flex",flexDirection:"column",gap:14}}>
      {links.map(l=><a key={l.href} href={l.href} onClick={()=>setMob(false)} style={{color:"rgba(255,255,255,.8)",fontSize:16,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>{l.label}</a>)}
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <Link to="/login" onClick={()=>setMob(false)} style={{flex:1}}><button style={{width:"100%",padding:"11px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",borderRadius:9,fontWeight:600,cursor:"pointer"}}>Login</button></Link>
        <Link to="/register" onClick={()=>setMob(false)} style={{flex:1}}><button style={{width:"100%",padding:"11px",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",borderRadius:9,fontWeight:700,cursor:"pointer"}}>Register</button></Link>
      </div>
    </div>}
    <style>{`@media(max-width:800px){.nav-links{display:none!important}.nav-ham{display:flex!important}} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
  </>;
}
