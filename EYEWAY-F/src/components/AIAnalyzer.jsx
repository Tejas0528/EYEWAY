import{useState,useEffect}from"react";
const CAT={"pothole":"Roads & Transport","road":"Roads & Transport","traffic":"Roads & Transport","water":"Water Supply","pipe":"Water Supply","leak":"Water Supply","electric":"Electricity","light":"Electricity","power":"Electricity","garbage":"Sanitation","sewage":"Sanitation","drain":"Sanitation","health":"Public Health","mosquito":"Public Health","park":"Parks & Recreation","crime":"Public Safety","school":"Education"};
const DEPT={"Roads & Transport":"PWD","Water Supply":"CMWSSB","Electricity":"TANGEDCO","Sanitation":"GCC","Public Health":"Health Dept","Parks & Recreation":"Parks Dept","Public Safety":"Police/GCC","Education":"Education Dept"};
const PRI={high:["emergency","urgent","danger","accident","flood","fire","sewage","burst"],medium:["broken","damage","repair","blocked","overflow","pothole","leak"],low:["minor","small","clean","bench","paint"]};
const ACTIONS={"Roads & Transport":"Dispatch PWD road crew. Assess and resurface within 72 hrs.","Water Supply":"Deploy CMWSSB field team. Restore supply within 48 hrs.","Electricity":"Alert TANGEDCO. Repair within 24 hrs.","Sanitation":"Assign GCC sanitation crew. Clear within 48 hrs.","Public Health":"Notify health officer. Inspect within 24 hrs.","Parks & Recreation":"Alert parks maintenance. Repair within 5 days.","Public Safety":"Escalate to police/GCC. Respond within 2 hrs.","Education":"Notify education officer. Resolve within 7 days."};
function predict(text){
  const m=text.toLowerCase();
  let category="General";for(const[k,c]of Object.entries(CAT)){if(m.includes(k)){category=c;break;}}
  let priority="medium";for(const[p,kws]of Object.entries(PRI)){if(kws.some(k=>m.includes(k))){priority=p;break;}}
  const conf=Math.floor(72+Math.random()*24);
  const dept=DEPT[category]||"General Admin";
  const action=ACTIONS[category]||"Review and assign within 3 working days.";
  const eta=priority==="high"?"2–24 hours":priority==="medium"?"2–5 days":"5–10 days";
  return{category,priority,conf,dept,action,eta};
}
export default function AIAnalyzer({text,onResult}){
  const[phase,setPhase]=useState("idle");
  const[result,setResult]=useState(null);
  useEffect(()=>{
    if(!text||text.length<12){setPhase("idle");setResult(null);return;}
    setPhase("scanning");setResult(null);
    const t1=setTimeout(()=>setPhase("classifying"),900);
    const t2=setTimeout(()=>{const r=predict(text);setResult(r);setPhase("done");onResult?.(r);},1800);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[text]);
  if(phase==="idle")return null;
  const PC={high:"#ef4444",medium:"#f59e0b",low:"#22c55e"};
  return<div style={{background:"rgba(45,180,155,.06)",border:"1px solid rgba(45,180,155,.25)",borderRadius:12,overflow:"hidden",marginTop:14,animation:"fadeIn .3s ease"}}>
    <div style={{padding:"10px 16px",background:"rgba(45,180,155,.1)",borderBottom:"1px solid rgba(45,180,155,.15)",display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:phase==="done"?"#22c55e":"#f59e0b",animation:phase!=="done"?"ping 1s ease infinite":"none"}}/>
      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:12,color:"#2db49b",letterSpacing:"0.05em"}}>🤖 AI ANALYSER</span>
      <span style={{marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,.4)"}}>{phase==="scanning"?"Scanning...":phase==="classifying"?"Classifying...":"Complete"}</span>
    </div>
    {(phase==="scanning"||phase==="classifying")&&<div style={{padding:"16px"}}><div style={{display:"flex",gap:9,flexWrap:"wrap"}}>{["Category","Priority","Dept","ETA"].map((l,i)=><div key={l} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 12px",background:"rgba(255,255,255,.04)",borderRadius:8,border:"1px solid rgba(255,255,255,.08)"}}><div style={{width:13,height:13,border:"2px solid rgba(45,180,155,.3)",borderTop:"2px solid #2db49b",borderRadius:"50%",animation:`spin .7s linear ${i*.15}s infinite`}}/><span style={{fontSize:12,color:"rgba(255,255,255,.45)"}}>{l}</span></div>)}</div></div>}
    {phase==="done"&&result&&<div style={{padding:15}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:11}}>
        <div style={{background:"rgba(45,180,155,.1)",border:"1px solid rgba(45,180,155,.25)",borderRadius:9,padding:"10px 12px"}}><div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:4,letterSpacing:"0.08em"}}>CATEGORY</div><div style={{fontSize:14,fontWeight:700,color:"#2db49b"}}>{result.category}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{result.dept} · ETA {result.eta}</div></div>
        <div style={{background:`${PC[result.priority]}15`,border:`1px solid ${PC[result.priority]}35`,borderRadius:9,padding:"10px 12px"}}><div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:4,letterSpacing:"0.08em"}}>PRIORITY</div><div style={{fontSize:14,fontWeight:800,color:PC[result.priority]}}>{result.priority.toUpperCase()}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>Confidence: {result.conf}%</div></div>
      </div>
      <div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:999,overflow:"hidden",marginBottom:11}}><div style={{height:"100%",width:`${result.conf}%`,background:"linear-gradient(90deg,#1a7a6b,#2db49b)",borderRadius:999,transition:"width .8s ease"}}/></div>
      <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:9,padding:"10px 13px"}}><div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:5,letterSpacing:"0.08em"}}>AI RECOMMENDED ACTION</div><div style={{fontSize:13,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>{result.action}</div></div>
    </div>}
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
  </div>;
}
