import{useApp}from"../context/AppContext";
const C={success:{bg:"rgba(34,197,94,.15)",b:"rgba(34,197,94,.4)",c:"#22c55e",i:"✓"},error:{bg:"rgba(239,68,68,.15)",b:"rgba(239,68,68,.4)",c:"#ef4444",i:"✕"},warning:{bg:"rgba(245,158,11,.15)",b:"rgba(245,158,11,.4)",c:"#f59e0b",i:"⚠"},info:{bg:"rgba(45,180,155,.15)",b:"rgba(45,180,155,.4)",c:"#2db49b",i:"ℹ"}};
export default function ToastContainer(){
  const{toasts}=useApp();
  return<div style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:10}}>
    {toasts.map(t=>{const c=C[t.type]||C.info;return<div key={t.id} style={{background:c.bg,border:`1px solid ${c.b}`,borderRadius:10,padding:"12px 18px",display:"flex",alignItems:"center",gap:10,minWidth:300,maxWidth:400,backdropFilter:"blur(20px)",boxShadow:"0 8px 32px rgba(0,0,0,.4)",animation:"slide-in .3s ease"}}><span style={{width:24,height:24,borderRadius:"50%",background:`${c.c}22`,color:c.c,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,flexShrink:0}}>{c.i}</span><span style={{color:"#fff",fontSize:14}}>{t.message}</span></div>;})}
  </div>;
}
