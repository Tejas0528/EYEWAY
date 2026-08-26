import{useEffect,useState}from"react";
import DashboardLayout from"../layouts/DashboardLayout";
import{StatusBadge,PriorityBadge}from"../components/Badge";
import Spinner from"../components/Spinner";
import{complaintsAPI}from"../context/AppContext";
export default function PublicFeed(){
  const[complaints,setComplaints]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{complaintsAPI.public().then(r=>setComplaints(r.data)).catch(()=>{}).finally(()=>setLoading(false));},[]);
  return<DashboardLayout>
    <div style={{maxWidth:900}}>
      <div style={{marginBottom:24,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Community Feed</h1><p style={{fontSize:14,color:"#94a3b8"}}>Public complaints in your city — identities anonymised for privacy.</p></div>
      {loading?<Spinner/>:complaints.length===0?<div style={{textAlign:"center",padding:60,color:"rgba(255,255,255,.3)"}}>No public complaints yet.</div>:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {complaints.map(c=><div key={c.id} style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:8}}>
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}><StatusBadge status={c.status}/><PriorityBadge priority={c.priority}/></div>
              <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{new Date(c.created_at).toLocaleDateString("en-IN")}</span>
            </div>
            <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,marginBottom:6,color:"#fff"}}>{c.title}</h4>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",display:"flex",gap:12,flexWrap:"wrap"}}><span>📂 {c.category}</span><span>📍 {c.location}</span></div>
          </div>)}
        </div>
      )}
    </div>
  </DashboardLayout>;
}
