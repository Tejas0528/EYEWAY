import{useEffect,useState,useRef}from"react";
import DashboardLayout from"../layouts/DashboardLayout";
import StatCard from"../components/StatCard";
import{StatusBadge,PriorityBadge}from"../components/Badge";
import Spinner from"../components/Spinner";
import Modal from"../components/Modal";
import FormField from"../components/FormField";
import{TrendChart}from"../components/Charts";
import{complaintsAPI,analyticsAPI,useApp}from"../context/AppContext";
import{InlineSpinner}from"../components/Spinner";
export function OfficerDashboard(){
  const{user}=useApp();const[stats,setStats]=useState(null);const[recent,setRecent]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([analyticsAPI.officerStats(),complaintsAPI.assigned()]).then(([s,r])=>{setStats(s.data);setRecent(r.data.slice(0,5));}).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const rate=stats?.resolution_rate||0;
  return<DashboardLayout>
    <div style={{maxWidth:1100}}>
      <div style={{marginBottom:24,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Officer Dashboard</h1><p style={{fontSize:14,color:"#94a3b8"}}>Welcome, <strong style={{color:"rgba(255,255,255,.8)"}}>{user?.name}</strong>{user?.department&&<> · <span style={{color:"#2db49b"}}>{user.department}</span></>}</p></div>
      {loading?<Spinner/>:<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:15,marginBottom:22}}>
          <StatCard icon="📌" label="Total Assigned" value={stats?.total_assigned||0} color="#3b9eff"/>
          <StatCard icon="⏳" label="Pending" value={stats?.pending||0} color="#f59e0b"/>
          <StatCard icon="🔄" label="In Progress" value={stats?.in_progress||0} color="#2db49b"/>
          <StatCard icon="✅" label="Resolved" value={stats?.resolved||0} color="#22c55e" sub={`${rate}% rate`}/>
        </div>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}><span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:600,color:"#fff"}}>Your Resolution Rate</span><span style={{fontSize:14,fontWeight:800,color:"#2db49b"}}>{rate}%</span></div>
          <div style={{height:8,background:"rgba(255,255,255,.08)",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${rate}%`,background:"linear-gradient(90deg,#1a7a6b,#2db49b)",borderRadius:999,transition:"width 1s ease"}}/></div>
          <p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:8}}>{rate>=80?"🌟 Excellent! Keep it up.":rate>=60?"📈 Good. Aim for 80%+":"⚡ Focus on pending cases."}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:20}}>
          <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:14}}>Weekly Trend</h3><TrendChart/></div>
          <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:16}}>Status Breakdown</h3>
            {[["Pending",stats?.pending||0,"#f59e0b"],["In Progress",stats?.in_progress||0,"#2db49b"],["Resolved",stats?.resolved||0,"#22c55e"]].map(([l,v,c])=>{const total=(stats?.total_assigned||0)||1;return<div key={l} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{l}</span><span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span></div><div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${(v/total)*100}%`,background:c,borderRadius:999}}/></div></div>;})}
          </div>
        </div>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,overflow:"hidden"}}>
          <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between"}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15}}>Recent Cases</h3><a href="/officer/assigned" style={{fontSize:13,color:"#2db49b",fontWeight:600}}>View all →</a></div>
          {recent.length===0?<div style={{padding:40,textAlign:"center",color:"rgba(255,255,255,.3)"}}>No assigned complaints.</div>:recent.map((c,i)=><div key={c.id} style={{padding:"13px 20px",borderBottom:i<recent.length-1?"1px solid rgba(255,255,255,.05)":"none",display:"flex",alignItems:"center",gap:15,flexWrap:"wrap"}}><div style={{flex:1,minWidth:140}}><div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:280}}>{c.title}</div><div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>📍 {c.location}</div></div><PriorityBadge priority={c.priority}/><StatusBadge status={c.status}/></div>)}
        </div>
      </>}
    </div>
  </DashboardLayout>;
}
export function OfficerAssigned(){
  const[complaints,setComplaints]=useState([]);const[loading,setLoading]=useState(true);const[selected,setSelected]=useState(null);const[updating,setUpdating]=useState(false);const[upForm,setUpForm]=useState({status:"",resolution_note:""});const[proofPhotos,setProofPhotos]=useState([]);const[statusF,setStatusF]=useState("");
  const fileRef=useRef(null);const{toast}=useApp();
  const load=async()=>{setLoading(true);try{const r=await complaintsAPI.assigned(statusF?{status:statusF}:{});setComplaints(r.data);}catch{}finally{setLoading(false);};};
  useEffect(()=>{load();},[statusF]);
  const openUpdate=c=>{setSelected(c);setUpForm({status:c.status,resolution_note:c.resolution_note||""});setProofPhotos([]);};
  const handleProof=files=>Array.from(files).filter(f=>f.type.startsWith("image/")).slice(0,3).forEach(f=>setProofPhotos(p=>[...p,{url:URL.createObjectURL(f),file:f}]));
  const submitUpdate=async()=>{if(!upForm.status){toast("Select a status","error");return;}setUpdating(true);try{await complaintsAPI.updateStatus(selected.id,upForm);toast("✅ Updated!","success");setSelected(null);load();}catch(err){toast(err.response?.data?.detail||"Update failed","error");}finally{setUpdating(false);};};
  return<DashboardLayout>
    <div style={{maxWidth:1100}}>
      <div style={{marginBottom:22,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Assigned Cases</h1><p style={{fontSize:14,color:"#94a3b8"}}>Update status and upload resolution proof.</p></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
        {[["","All Cases"],["pending","Pending"],["in_progress","In Progress"],["resolved","Resolved"]].map(([v,l])=>(
          <button key={v} onClick={()=>setStatusF(v)} style={{padding:"7px 16px",borderRadius:9,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:600,background:statusF===v?"rgba(45,180,155,.2)":"rgba(255,255,255,.05)",border:`1px solid ${statusF===v?"rgba(45,180,155,.4)":"rgba(255,255,255,.1)"}`,color:statusF===v?"#fff":"rgba(255,255,255,.5)",transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      {loading?<Spinner/>:complaints.length===0?<div style={{textAlign:"center",padding:60,background:"rgba(26,34,54,.5)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,color:"rgba(255,255,255,.3)"}}>No complaints assigned.</div>:(
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {complaints.map(c=><div key={c.id} style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:"17px 20px",display:"flex",alignItems:"center",gap:15,flexWrap:"wrap",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(26,34,54,.95)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(26,34,54,.7)"}>
            <div style={{width:4,height:46,borderRadius:999,background:c.priority==="high"?"#ef4444":c.priority==="medium"?"#f59e0b":"#22c55e",flexShrink:0}}/>
            <div style={{flex:1,minWidth:150}}>
              <div style={{display:"flex",gap:7,marginBottom:5,flexWrap:"wrap",alignItems:"center"}}><span style={{fontSize:11,color:"#2db49b",fontWeight:600}}>#{c.id?.slice(0,8).toUpperCase()}</span><PriorityBadge priority={c.priority}/>{c.priority==="high"&&<span style={{fontSize:10,color:"#ef4444",background:"rgba(239,68,68,.1)",padding:"2px 7px",borderRadius:5,fontWeight:700}}>⚡ URGENT</span>}</div>
              <h4 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,color:"#fff",marginBottom:3}}>{c.title}</h4>
              <div style={{fontSize:12,color:"rgba(255,255,255,.4)",display:"flex",gap:12,flexWrap:"wrap"}}><span>👤 {c.created_by_name||"Citizen"}</span><span>📍 {c.location}</span><span>📅 {new Date(c.created_at).toLocaleDateString("en-IN")}</span></div>
            </div>
            <div style={{display:"flex",gap:10,flexShrink:0}}><StatusBadge status={c.status}/><button onClick={()=>openUpdate(c)} style={{padding:"8px 16px",background:"rgba(45,180,155,.15)",border:"1px solid rgba(45,180,155,.35)",color:"#2db49b",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(45,180,155,.25)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(45,180,155,.15)"}>Update →</button></div>
          </div>)}
        </div>
      )}
    </div>
    <Modal open={!!selected} onClose={()=>setSelected(null)} title="Update Complaint" maxWidth={480}>
      {selected&&<div>
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:9,padding:"11px 14px",marginBottom:20,border:"1px solid rgba(255,255,255,.08)"}}><div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:2}}>{selected.title}</div><div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>📍 {selected.location} · 👤 {selected.created_by_name||"Citizen"}</div></div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",marginBottom:9,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>New Status</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9}}>
            {[["pending","⏳","Pending","#f59e0b"],["in_progress","🔄","In Progress","#3b9eff"],["resolved","✅","Resolved","#22c55e"]].map(([v,icon,label,c])=>(
              <button key={v} type="button" onClick={()=>setUpForm(p=>({...p,status:v}))} style={{padding:"12px 6px",borderRadius:9,cursor:"pointer",textAlign:"center",fontSize:12,fontWeight:600,transition:"all .15s",background:upForm.status===v?`${c}22`:"rgba(255,255,255,.04)",border:`1px solid ${upForm.status===v?`${c}55`:"rgba(255,255,255,.1)"}`,color:upForm.status===v?c:"rgba(255,255,255,.5)"}}><div style={{fontSize:18,marginBottom:4}}>{icon}</div>{label}</button>
            ))}
          </div>
        </div>
        <FormField label="Resolution Note" type="textarea" placeholder="Describe actions taken..." value={upForm.resolution_note} onChange={e=>setUpForm(p=>({...p,resolution_note:e.target.value}))} rows={3}/>
        <div style={{marginBottom:18}}>
          <label style={{display:"block",marginBottom:8,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Upload Proof Photos (Optional)</label>
          <button type="button" onClick={()=>fileRef.current?.click()} style={{padding:"9px 16px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:9,color:"rgba(255,255,255,.7)",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>📎 Attach Photos</button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>handleProof(e.target.files)}/>
          {proofPhotos.length>0&&<div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:10}}>{proofPhotos.map((p,i)=><div key={i} style={{position:"relative",width:78,height:78}}><img src={p.url} alt="" style={{width:78,height:78,objectFit:"cover",borderRadius:8,border:"1px solid rgba(255,255,255,.15)"}}/><div style={{position:"absolute",top:2,left:4,fontSize:9,fontWeight:700,color:"#22c55e",background:"rgba(34,197,94,.2)",padding:"1px 5px",borderRadius:4}}>PROOF</div></div>)}</div>}
        </div>
        <button onClick={submitUpdate} disabled={updating} style={{width:"100%",padding:"12px",borderRadius:10,background:updating?"rgba(45,180,155,.5)":"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",cursor:updating?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {updating?<><InlineSpinner size={15}/>Saving...</>:"Save Update"}
        </button>
      </div>}
    </Modal>
  </DashboardLayout>;
}
