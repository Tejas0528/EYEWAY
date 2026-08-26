import{useState,useEffect,useRef}from"react";
import{Link}from"react-router-dom";
import{useApp}from"../context/AppContext";

function TypeWriter({phrases,speed=75}){
  const[text,setText]=useState("");const[idx,setIdx]=useState(0);const[chr,setChr]=useState(0);const[del,setDel]=useState(false);
  useEffect(()=>{
    const cur=phrases[idx%phrases.length];const delay=del?32:speed;
    const t=setTimeout(()=>{
      if(!del){setText(cur.slice(0,chr+1));if(chr+1===cur.length)setTimeout(()=>setDel(true),2200);else setChr(c=>c+1);}
      else{setText(cur.slice(0,chr-1));if(chr-1===0){setDel(false);setIdx(i=>(i+1)%phrases.length);setChr(0);}else setChr(c=>c-1);}
    },delay);
    return()=>clearTimeout(t);
  },[text,del,chr,idx,phrases,speed]);
  return<span style={{color:"#2db49b"}}>{text}<span style={{borderRight:"2px solid #2db49b",marginLeft:2,animation:"blink .7s step-end infinite"}}/></span>;
}

function Counter({target,suffix=""}){
  const[val,setVal]=useState(0);const ref=useRef(null);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return;
      let v=0;const step=target/65;
      const t=setInterval(()=>{v+=step;if(v>=target){setVal(target);clearInterval(t);}else setVal(Math.floor(v));},18);
    },{threshold:.5});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[target]);
  return<span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const FEATURES=[
  {icon:"🗺️",color:"#2db49b",title:"Live Complaint Map",desc:"Real-time Leaflet map showing complaint pins across city zones. Click any marker for details."},
  {icon:"🤖",color:"#22c55e",title:"AI Auto-Classification",desc:"NLP detects category, department, priority and suggests action in under 2 seconds."},
  {icon:"🎤",color:"#f59e0b",title:"Voice Filing (Tamil/English)",desc:"Speak your complaint. AI transcribes and auto-fills the form instantly."},
  {icon:"📸",color:"#3b9eff",title:"AI Image Analysis",desc:"Upload photos. AI identifies potholes, garbage, broken fixtures, water leaks automatically."},
  {icon:"🚨",color:"#ef4444",title:"Emergency Escalation",desc:"One-tap emergency mode routes critical complaints to senior officers within 60 minutes."},
  {icon:"📊",color:"#a78bfa",title:"Real-time Analytics",desc:"5 Recharts dashboards tracking resolution rates, department performance, and monthly trends."},
];
const STEPS=[
  {icon:"📝",title:"File Complaint",desc:"Type or speak in Tamil/English. Add GPS and photos."},
  {icon:"🤖",title:"AI Processes",desc:"Auto-categorisation, priority scoring, department routing."},
  {icon:"📡",title:"Officer Responds",desc:"Assigned officer gets notified. Real-time status updates."},
  {icon:"✅",title:"Issue Resolved",desc:"Confirm resolution and rate the service."},
];
const STATS=[{val:52480,suf:"+",label:"Complaints Resolved"},{val:98,suf:"%",label:"Satisfaction Rate"},{val:127,suf:"+",label:"Cities Connected"},{val:3,suf:"d",label:"Avg Resolution"}];

export default function Home(){
  const{lang}=useApp();const[hov,setHov]=useState(null);
  return<div style={{position:"relative",minHeight:"100vh",background:"#0e1420",overflowX:"hidden"}}>
    {/* Civic grid background */}
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#0a0f1c 0%,#0e1420 40%,#0b1219 100%)"}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(45,180,155,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,180,155,.04) 1px,transparent 1px)",backgroundSize:"80px 80px"}}/>
      <div style={{position:"absolute",top:"20%",left:"10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(45,180,155,.07) 0%,transparent 70%)",filter:"blur(40px)"}}/>
      <div style={{position:"absolute",bottom:"20%",right:"5%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(34,197,94,.05) 0%,transparent 70%)",filter:"blur(40px)"}}/>
    </div>

    {/* HERO */}
    <section style={{position:"relative",zIndex:1,padding:"110px 28px 100px",textAlign:"center"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:9,background:"rgba(45,180,155,.08)",border:"1px solid rgba(45,180,155,.3)",borderRadius:999,padding:"7px 20px",marginBottom:36,animation:"fadeUp .6s ease both"}}>
          <div style={{position:"relative",width:10,height:10}}><div style={{position:"absolute",inset:0,borderRadius:"50%",background:"#22c55e",animation:"ping 1.5s ease infinite"}}/><div style={{position:"absolute",inset:"25%",borderRadius:"50%",background:"#22c55e"}}/></div>
          <span style={{fontSize:13,color:"rgba(255,255,255,.75)",letterSpacing:"0.04em"}}>Live · 127 Cities · AI-Powered · Government of India</span>
        </div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:900,fontSize:"clamp(2.4rem,5.5vw,4.5rem)",lineHeight:1.1,marginBottom:20,animation:"fadeUp .6s ease .1s both"}}>
          {lang==="ta"?"புத்திசாலி குடிமக்கள் ஆட்சி":"Smart Civic Governance"}
          <br/><TypeWriter phrases={lang==="ta"?["ஒவ்வொரு குடிமகனுக்கும்","AI இயக்கப்படும்","வேகமான தீர்வு"]:["For Every Citizen","AI-Powered","Built for India","Fast & Transparent"]}/>
        </h1>
        <p style={{fontSize:"clamp(.95rem,1.8vw,1.15rem)",color:"#94a3b8",maxWidth:580,margin:"0 auto 48px",lineHeight:1.85,animation:"fadeUp .6s ease .2s both"}}>
          EYEWAY transforms civic complaint management with AI categorisation, real-time officer routing, live complaint maps, and transparent government accountability.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",animation:"fadeUp .6s ease .3s both"}}>
          <Link to="/register"><button style={{background:"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",padding:"15px 36px",borderRadius:11,fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 8px 28px rgba(45,180,155,.5)",transition:"all .25s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 14px 40px rgba(45,180,155,.65)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 8px 28px rgba(45,180,155,.5)"}}>🚀 {lang==="ta"?"புகார் தெரிவிக்க":"File a Complaint"}</button></Link>
          <a href="#how-it-works"><button style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"15px 30px",borderRadius:11,fontSize:15,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.06)"}>See How It Works →</button></a>
        </div>
        {/* Dashboard mock */}
        <div style={{marginTop:72,maxWidth:900,margin:"72px auto 0",animation:"fadeUp .9s ease .5s both"}}>
          <div style={{background:"rgba(19,25,39,.9)",border:"1px solid rgba(45,180,155,.2)",borderRadius:20,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,.7)"}}>
            <div style={{background:"rgba(255,255,255,.04)",padding:"11px 20px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:8}}>
              {["#ef4444","#f59e0b","#22c55e"].map(c=><div key={c} style={{width:11,height:11,borderRadius:"50%",background:c}}/>)}
              <div style={{flex:1,background:"rgba(255,255,255,.04)",borderRadius:5,padding:"5px 14px",fontSize:12,color:"rgba(255,255,255,.28)",marginLeft:14,fontFamily:"monospace"}}>🔒 eyeway.gov.in/admin/dashboard</div>
              <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",animation:"ping 2s ease infinite"}}/><span style={{fontSize:10,color:"#22c55e",fontWeight:700}}>LIVE</span></div>
            </div>
            <div style={{padding:"18px 22px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[["📋","1,247","Total","#2db49b"],["⏳","158","Pending","#f59e0b"],["🔄","89","In Progress","#3b9eff"],["✅","1,000","Resolved","#22c55e"]].map(([icon,v,l,c])=>(
                <div key={l} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"13px 14px"}}>
                  <div style={{fontSize:18,marginBottom:6}}>{icon}</div>
                  <div style={{fontSize:20,fontWeight:900,color:c,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"0 22px 22px",display:"grid",gridTemplateColumns:"3fr 2fr",gap:12}}>
              <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:14,height:80,display:"flex",alignItems:"flex-end",gap:3}}>
                {[30,48,38,65,52,80,68,88,60,82,45,95].map((h,i)=><div key={i} style={{flex:1,height:`${h}%`,background:i===11?"linear-gradient(0deg,#1a7a6b,#2db49b)":"rgba(45,180,155,.22)",borderRadius:"2px 2px 0 0"}}/>)}
              </div>
              <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:10,padding:12}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:7,letterSpacing:"0.06em"}}>CITY MAP</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:2}}>
                  {Array.from({length:32},(_,i)=><div key={i} style={{height:8,borderRadius:2,background:`rgba(${i%3===0?"239,68,68":i%5===0?"45,180,155":"245,158,11"},.${Math.floor(2+Math.random()*6)})`}}/>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* STATS */}
    <section style={{position:"relative",zIndex:1,padding:"44px 28px"}}>
      <div style={{maxWidth:1000,margin:"0 auto",background:"rgba(26,34,54,.7)",border:"1px solid rgba(45,180,155,.15)",borderRadius:20,padding:"38px 52px",backdropFilter:"blur(20px)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:32}}>
        {STATS.map(s=><div key={s.label} style={{textAlign:"center"}}>
          <div style={{fontSize:44,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}><Counter target={s.val} suffix={s.suf}/></div>
          <div style={{fontSize:14,color:"#94a3b8",marginTop:6}}>{s.label}</div>
        </div>)}
      </div>
    </section>

    {/* FEATURES */}
    <section id="features" style={{position:"relative",zIndex:1,padding:"70px 28px"}}>
      <div style={{maxWidth:1280,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{fontSize:11,letterSpacing:"0.12em",color:"#2db49b",textTransform:"uppercase",fontWeight:700,marginBottom:12}}>PLATFORM CAPABILITIES</div>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif",marginBottom:14}}>Built for <span style={{background:"linear-gradient(135deg,#1a7a6b,#2db49b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Smart Governance</span></h2>
          <p style={{maxWidth:520,margin:"0 auto",color:"#94a3b8",fontSize:16}}>Professional civic tools used by city governments to manage and resolve citizen issues efficiently.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
          {FEATURES.map((f,i)=><div key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{background:hov===i?"rgba(26,34,54,.9)":"rgba(19,25,39,.8)",border:`1px solid ${hov===i?`${f.color}44`:"rgba(255,255,255,.08)"}`,borderRadius:18,padding:28,transition:"all .3s",transform:hov===i?"translateY(-4px)":"none",boxShadow:hov===i?`0 16px 50px rgba(0,0,0,.4),0 0 0 1px ${f.color}22`:"none",backdropFilter:"blur(12px)"}}>
            <div style={{width:52,height:52,borderRadius:13,background:`${f.color}15`,border:`1px solid ${f.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:18}}>{f.icon}</div>
            <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,marginBottom:9}}>{f.title}</h4>
            <p style={{fontSize:14,color:"#94a3b8",lineHeight:1.75,margin:0}}>{f.desc}</p>
          </div>)}
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section id="how-it-works" style={{position:"relative",zIndex:1,padding:"60px 28px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11,letterSpacing:"0.12em",color:"#f59e0b",textTransform:"uppercase",fontWeight:700,marginBottom:12}}>PROCESS</div>
          <h2 style={{fontFamily:"'Space Grotesk',sans-serif"}}>From Report to <span style={{background:"linear-gradient(135deg,#1a7a6b,#2db49b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Resolution</span></h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:32}}>
          {STEPS.map((s,i)=><div key={i} style={{textAlign:"center"}}>
            <div style={{width:76,height:76,borderRadius:"50%",margin:"0 auto 18px",background:"rgba(26,34,54,.9)",border:"2px solid rgba(45,180,155,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,position:"relative",boxShadow:"0 4px 20px rgba(45,180,155,.15)"}}>
              {s.icon}<span style={{position:"absolute",top:-9,right:-9,width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",fontSize:12,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{i+1}</span>
            </div>
            <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,marginBottom:9}}>{s.title}</h4>
            <p style={{fontSize:14,color:"#94a3b8",lineHeight:1.75,margin:0}}>{s.desc}</p>
          </div>)}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section id="about" style={{position:"relative",zIndex:1,padding:"0 28px 80px"}}>
      <div style={{maxWidth:820,margin:"0 auto",background:"rgba(26,34,54,.85)",border:"1px solid rgba(45,180,155,.25)",borderRadius:24,padding:"56px 44px",textAlign:"center",backdropFilter:"blur(24px)"}}>
        <h2 style={{fontFamily:"'Space Grotesk',sans-serif",marginBottom:16,fontSize:"clamp(1.6rem,3vw,2.4rem)"}}>Your City · Your Voice · <span style={{background:"linear-gradient(135deg,#1a7a6b,#2db49b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Your Right</span></h2>
        <p style={{color:"#94a3b8",marginBottom:34,fontSize:16,maxWidth:460,margin:"0 auto 34px"}}>Join 50,000+ citizens using EYEWAY to hold civic authorities accountable.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <Link to="/register"><button style={{background:"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",padding:"14px 34px",borderRadius:11,fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15,cursor:"pointer",boxShadow:"0 6px 24px rgba(45,180,155,.45)"}}>🚀 Register Free</button></Link>
          <Link to="/login"><button style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.18)",color:"#fff",padding:"14px 28px",borderRadius:11,fontSize:15,cursor:"pointer"}}>Sign In →</button></Link>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer style={{position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,.07)",padding:"36px 28px 24px"}}>
      <div style={{maxWidth:1280,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff"}}>E</div>
          <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:16,color:"#fff"}}>EYEWAY</div><div style={{fontSize:9,color:"rgba(45,180,155,.8)",letterSpacing:"0.08em"}}>SMART CIVIC GOVERNANCE</div></div>
        </div>
        <p style={{fontSize:13,color:"#94a3b8",maxWidth:340,lineHeight:1.8}}>AI-powered civic governance platform. A Digital India initiative under MeitY, Government of India.</p>
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:20,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,.2)"}}>© 2025 EYEWAY — Ministry of Electronics & IT, Government of India.</span>
        <span style={{fontSize:12,color:"rgba(255,255,255,.2)"}}>Digital India · Make in India · AI-Powered Governance</span>
      </div>
    </footer>

    <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}} @keyframes ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}`}</style>
  </div>;
}
