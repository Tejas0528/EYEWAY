import{useState}from"react";
export default function StatCard({icon,label,value,color="#2db49b",sub}){
  const[h,setH]=useState(false);
  return<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:h?"rgba(26,34,54,.95)":"rgba(26,34,54,.7)",border:`1px solid ${h?`${color}55`:"rgba(255,255,255,.08)"}`,borderRadius:14,padding:"20px 22px",transition:"all .25s",transform:h?"translateY(-3px)":"none",boxShadow:h?`0 12px 36px rgba(0,0,0,.35),0 0 0 1px ${color}22`:"none",display:"flex",alignItems:"center",gap:16,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:-16,right:-16,width:72,height:72,borderRadius:"50%",background:`${color}10`,pointerEvents:"none"}}/>
    <div style={{width:48,height:48,borderRadius:12,background:`${color}18`,border:`1px solid ${color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div>
    <div>
      <div style={{fontSize:26,fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",color:"#fff",lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:13,color:"#94a3b8",marginTop:3}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:`${color}cc`,marginTop:2,fontWeight:600}}>{sub}</div>}
    </div>
  </div>;
}
