import{useEffect,useState}from"react";
import DashboardLayout from"../layouts/DashboardLayout";
import{StatusBadge,PriorityBadge}from"../components/Badge";
import Spinner from"../components/Spinner";
import Modal from"../components/Modal";
import{complaintsAPI}from"../context/AppContext";
const STEPS=["Filed","Assigned","In Progress","Resolved"];
const SI={pending:0,in_progress:2,resolved:3,rejected:1};
function Timeline({status}){const cur=SI[status]??0;return<div style={{display:"flex",alignItems:"center",marginTop:10}}>{STEPS.map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:18,height:18,borderRadius:"50%",background:i<=cur?"linear-gradient(135deg,#1a7a6b,#2db49b)":"rgba(255,255,255,.1)",border:`2px solid ${i<=cur?"#2db49b":"rgba(255,255,255,.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#fff",fontWeight:700}}>{i<=cur?"✓":""}</div><span style={{fontSize:9,color:i<=cur?"rgba(255,255,255,.7)":"rgba(255,255,255,.25)",whiteSpace:"nowrap"}}>{s}</span></div>{i<STEPS.length-1&&<div style={{flex:1,height:2,background:i<cur?"linear-gradient(90deg,#1a7a6b,#2db49b)":"rgba(255,255,255,.08)",margin:"0 4px",marginBottom:18}}/>}</div>)}</div>;}
export default function MyComplaints(){
  const[complaints,setComplaints]=useState([]);const[loading,setLoading]=useState(true);const[selected,setSelected]=useState(null);const[statusF,setStatusF]=useState("");
  useEffect(()=>{complaintsAPI.mine(statusF?{status:statusF}:{}).then(r=>setComplaints(r.data)).catch(()=>{}).finally(()=>setLoading(false));},[statusF]);
  return<DashboardLayout>
    <div style={{maxWidth:900}}>
      <div style={{marginBottom:22,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>My Complaints</h1><p style={{fontSize:14,color:"#94a3b8"}}>Track all your civic complaints with real-time status and timeline.</p></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
        {[["","All"],["pending","Pending"],["in_progress","In Progress"],["resolved","Resolved"],["rejected","Rejected"]].map(([v,l])=>(
          <button key={v} onClick={()=>setStatusF(v)} style={{padding:"7px 16px",borderRadius:999,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,background:statusF===v?"rgba(45,180,155,.2)":"rgba(255,255,255,.05)",border:`1px solid ${statusF===v?"rgba(45,180,155,.4)":"rgba(255,255,255,.1)"}`,color:statusF===v?"#fff":"rgba(255,255,255,.5)",transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      {loading?<Spinner/>:complaints.length===0?<div style={{textAlign:"center",padding:"60px",background:"rgba(26,34,54,.5)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14}}><div style={{fontSize:40,marginBottom:14}}>📭</div><p style={{color:"rgba(255,255,255,.3)",marginBottom:16}}>No complaints found.</p></div>:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {complaints.map(c=><div key={c.id} onClick={()=>setSelected(c)} style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:"18px 20px",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(26,34,54,.95)";e.currentTarget.style.borderColor="rgba(45,180,155,.3)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(26,34,54,.7)";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:8}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,color:"#2db49b",fontWeight:600,background:"rgba(45,180,155,.1)",padding:"2px 8px",borderRadius:5}}>#{c.id?.slice(0,8).toUpperCase()}</span><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div>
              <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{new Date(c.created_at).toLocaleDateString("en-IN")}</span>
            </div>
            <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,marginBottom:5,color:"#fff"}}>{c.title}</h4>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",display:"flex",gap:14,flexWrap:"wrap",marginBottom:4}}><span>📂 {c.category}</span><span>📍 {c.location}</span>{c.assigned_to_name&&<span>👤 {c.assigned_to_name}</span>}</div>
            <Timeline status={c.status}/>
          </div>)}
        </div>
      )}
    </div>
    <Modal open={!!selected} onClose={()=>setSelected(null)} title="Complaint Details" maxWidth={560}>
      {selected&&<div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}><StatusBadge status={selected.status}/><PriorityBadge priority={selected.priority}/></div>
        <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,marginBottom:10}}>{selected.title}</h3>
        <p style={{fontSize:14,color:"rgba(255,255,255,.5)",lineHeight:1.75,marginBottom:16}}>{selected.description}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
          {[["Category",selected.category],["Location",selected.location],["Officer",selected.assigned_to_name||"Unassigned"],["Filed",new Date(selected.created_at).toLocaleString("en-IN")]].map(([k,v])=>(
            <div key={k} style={{background:"rgba(255,255,255,.05)",borderRadius:9,padding:"10px 13px",border:"1px solid rgba(255,255,255,.08)"}}><div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:3,letterSpacing:"0.06em"}}>{k.toUpperCase()}</div><div style={{fontSize:13,color:"#fff"}}>{v}</div></div>
          ))}
        </div>
        {selected.resolution_note&&<div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:9,padding:"11px 15px"}}><div style={{fontSize:11,fontWeight:700,color:"#22c55e",marginBottom:4}}>RESOLUTION NOTE</div><p style={{fontSize:13,color:"rgba(255,255,255,.7)",margin:0}}>{selected.resolution_note}</p></div>}
      </div>}
    </Modal>
  </DashboardLayout>;
}
