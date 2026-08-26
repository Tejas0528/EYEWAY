import{useEffect}from"react";
export default function Modal({open,onClose,title,children,maxWidth=520}){
  useEffect(()=>{document.body.style.overflow=open?"hidden":"";return()=>{document.body.style.overflow="";};},[open]);
  if(!open)return null;
  return<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(10,15,28,.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#1a2236",border:"1px solid rgba(45,180,155,.2)",borderRadius:18,padding:28,width:"100%",maxWidth,boxShadow:"0 24px 80px rgba(0,0,0,.6)",animation:"fadeUp .25s ease",maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,color:"#fff"}}>{title}</h3>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.5)",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      {children}
    </div>
  </div>;
}
