import{useEffect,useState}from"react";
import DashboardLayout from"../layouts/DashboardLayout";
import StatCard from"../components/StatCard";
import{StatusBadge,PriorityBadge,RoleBadge}from"../components/Badge";
import Spinner from"../components/Spinner";
import Modal from"../components/Modal";
import FormField from"../components/FormField";
import ComplaintMap from"../components/ComplaintMap";
import{MonthlyChart,CategoryChart,TrendChart,DeptChart,ActivityChart}from"../components/Charts";
import{complaintsAPI,analyticsAPI,authAPI,useApp}from"../context/AppContext";
import{InlineSpinner}from"../components/Spinner";

function exportCSV(data){
  const h=["ID","Title","Citizen","Officer","Category","Priority","Status","Date"];
  const rows=data.map(c=>[c.id?.slice(0,8)||"",`"${(c.title||"").replace(/"/g,'""')}"`,c.created_by_name||"",c.assigned_to_name||"Unassigned",c.category||"",c.priority||"",c.status||"",new Date(c.created_at).toLocaleDateString("en-IN")]);
  const csv=[h,...rows].map(r=>r.join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`eyeway_${new Date().toISOString().slice(0,10)}.csv`;a.click();
}
function exportPDF(data,analytics){
  const win=window.open("","_blank");if(!win){alert("Allow popups");return;}
  win.document.write(`<!DOCTYPE html><html><head><title>EYEWAY Report</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{color:#1a7a6b;border-bottom:3px solid #2db49b;padding-bottom:12px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th{background:#1a7a6b;color:#fff;padding:10px 12px;text-align:left}td{padding:8px 12px;border-bottom:1px solid #e9ecef}tr:nth-child(even){background:#f8f9fa}.stat{display:inline-block;background:#e8f5f3;border:1px solid #2db49b;border-radius:8px;padding:12px 20px;margin:6px;min-width:120px;text-align:center}.sv{font-size:28px;font-weight:bold;color:#1a7a6b}.sl{font-size:12px;color:#666;margin-top:4px}</style></head><body><h1>🏛️ EYEWAY Civic Governance Report</h1><p style="color:#666">Generated: ${new Date().toLocaleString("en-IN")}</p><h2>Summary</h2><div>${[["Total",analytics?.total||0],["Resolved",analytics?.resolved||0],["Pending",analytics?.pending||0],["Rate",`${analytics?.resolution_rate||0}%`]].map(([l,v])=>`<div class="stat"><div class="sv">${v}</div><div class="sl">${l}</div></div>`).join("")}</div><h2>Complaints</h2><table><thead><tr><th>#</th><th>Title</th><th>Citizen</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead><tbody>${data.slice(0,100).map((c,i)=>`<tr><td>${i+1}</td><td>${c.title}</td><td>${c.created_by_name||""}</td><td>${c.category}</td><td>${c.priority}</td><td>${c.status}</td><td>${new Date(c.created_at).toLocaleDateString("en-IN")}</td></tr>`).join("")}</tbody></table><p style="margin-top:40px;font-size:11px;color:#999">EYEWAY Smart Governance · Digital India Initiative</p><script>window.onload=()=>window.print();</script></body></html>`);win.document.close();
}

export function AdminDashboard(){
  const[a,setA]=useState(null);const[loading,setLoading]=useState(true);
  useEffect(()=>{analyticsAPI.dashboard().then(r=>setA(r.data)).catch(()=>{}).finally(()=>setLoading(false));},[]);
  if(loading)return<DashboardLayout><Spinner/></DashboardLayout>;
  const an=a||{};
  return<DashboardLayout>
    <div style={{maxWidth:1100}}>
      <div style={{marginBottom:24,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Analytics Dashboard</h1><p style={{fontSize:14,color:"#94a3b8"}}>Real-time governance metrics and performance indicators.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:15,marginBottom:24}}>
        <StatCard icon="📋" label="Total" value={an.total||0} color="#2db49b"/>
        <StatCard icon="⏳" label="Pending" value={an.pending||0} color="#f59e0b"/>
        <StatCard icon="🔄" label="In Progress" value={an.in_progress||0} color="#3b9eff"/>
        <StatCard icon="✅" label="Resolved" value={an.resolved||0} color="#22c55e" sub={`${an.resolution_rate||0}% rate`}/>
        <StatCard icon="👥" label="Citizens" value={an.total_citizens||0} color="#a78bfa"/>
        <StatCard icon="🎖️" label="Officers" value={an.total_officers||0} color="#06b6d4"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:18}}>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:5}}>Monthly Complaints vs Resolved</h3><p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:18}}>Filed vs resolved per month</p><MonthlyChart/></div>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:18}}>By Category</h3><CategoryChart data={an.by_category}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:14}}>Resolution Rate Trend</h3><TrendChart/></div>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:14}}>Department Performance</h3><DeptChart/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18}}>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:14}}>User Activity (30 days)</h3><ActivityChart/></div>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,marginBottom:16}}>Priority Distribution</h3>
          {[["High",(an.by_priority||{}).high||0,"#ef4444","rgba(239,68,68,.12)"],["Medium",(an.by_priority||{}).medium||0,"#f59e0b","rgba(245,158,11,.12)"],["Low",(an.by_priority||{}).low||0,"#22c55e","rgba(34,197,94,.12)"]].map(([l,v,c,bg])=>(
            <div key={l} style={{background:bg,border:`1px solid ${c}25`,borderRadius:9,padding:"12px 15px",marginBottom:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:c,fontWeight:600}}>{l} Priority</span><span style={{fontSize:22,fontWeight:900,color:c,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</span></div>
          ))}
        </div>
      </div>
    </div>
  </DashboardLayout>;
}

export function AdminComplaints(){
  const[complaints,setComplaints]=useState([]);const[officers,setOfficers]=useState([]);const[analytics,setAnalytics]=useState(null);const[loading,setLoading]=useState(true);const[selected,setSelected]=useState(null);const[updating,setUpdating]=useState(false);const[upForm,setUpForm]=useState({status:"",resolution_note:"",assigned_to:""});const[filters,setFilters]=useState({status:"",priority:"",search:""});
  const{toast}=useApp();
  const load=async()=>{setLoading(true);try{const params={};if(filters.status)params.status=filters.status;if(filters.priority)params.priority=filters.priority;if(filters.search)params.search=filters.search;const[cR,oR,aR]=await Promise.all([complaintsAPI.all(params),authAPI.officers(),analyticsAPI.dashboard().catch(()=>({data:null}))]);setComplaints(cR.data);setOfficers(oR.data);setAnalytics(aR.data);}catch{}finally{setLoading(false);};};
  useEffect(()=>{load();},[filters.status,filters.priority]);
  const openUpdate=c=>{setSelected(c);setUpForm({status:c.status,resolution_note:c.resolution_note||"",assigned_to:c.assigned_to||""});};
  const submitUpdate=async()=>{setUpdating(true);try{const p={status:upForm.status};if(upForm.resolution_note)p.resolution_note=upForm.resolution_note;if(upForm.assigned_to)p.assigned_to=upForm.assigned_to;await complaintsAPI.updateStatus(selected.id,p);toast("✅ Updated","success");setSelected(null);load();}catch(err){toast(err.response?.data?.detail||"Failed","error");}finally{setUpdating(false);};};
  const del=async id=>{if(!confirm("Delete this complaint?"))return;try{await complaintsAPI.remove(id);toast("Deleted","success");load();}catch{toast("Failed","error");};};
  return<DashboardLayout>
    <div style={{maxWidth:1200}}>
      <div style={{marginBottom:22,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>All Complaints</h1><p style={{fontSize:14,color:"#94a3b8"}}>Full visibility · Assign officers · Manage resolution</p></div>
        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>exportCSV(complaints)} style={{padding:"8px 14px",background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.35)",borderRadius:9,color:"#22c55e",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📊 CSV</button>
          <button onClick={()=>exportPDF(complaints,analytics)} style={{padding:"8px 14px",background:"rgba(59,158,255,.15)",border:"1px solid rgba(59,158,255,.35)",borderRadius:9,color:"#3b9eff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📄 PDF</button>
        </div>
      </div>
      <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:11,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <form onSubmit={e=>{e.preventDefault();load();}} style={{display:"flex",gap:9,flex:1,flexWrap:"wrap"}}>
          <input value={filters.search} onChange={e=>setFilters(p=>({...p,search:e.target.value}))} placeholder="🔍 Search title, location..." style={{flex:1,minWidth:160,padding:"8px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#fff",fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none"}}/>
          <button type="submit" style={{padding:"8px 14px",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"}}>Search</button>
        </form>
        {[["status",["","pending","in_progress","resolved","rejected"],["All Status","Pending","In Progress","Resolved","Rejected"]],["priority",["","high","medium","low"],["All Priority","High","Medium","Low"]]].map(([k,vals,labels])=>(
          <select key={k} value={filters[k]} onChange={e=>setFilters(p=>({...p,[k]:e.target.value}))} style={{padding:"8px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#fff",fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none",cursor:"pointer"}}>
            {vals.map((v,i)=><option key={v} value={v} style={{background:"#1a2236"}}>{labels[i]}</option>)}
          </select>
        ))}
      </div>
      <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,overflow:"auto"}}>
        {loading?<Spinner/>:(
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:1000}}>
            <thead><tr style={{background:"rgba(255,255,255,.04)"}}>{["#","Title","Citizen","Officer","Category","Priority","Status","Date","Actions"].map(h=><th key={h} style={{padding:"10px 13px",textAlign:"left",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",letterSpacing:"0.06em",borderBottom:"1px solid rgba(255,255,255,.08)",whiteSpace:"nowrap"}}>{h.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {complaints.length===0?<tr><td colSpan={9} style={{padding:48,textAlign:"center",color:"rgba(255,255,255,.3)",fontSize:14}}>No complaints found.</td></tr>:complaints.map((c,i)=>(
                <tr key={c.id} style={{borderBottom:"1px solid rgba(255,255,255,.05)",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"10px 13px",fontSize:12,color:"rgba(255,255,255,.3)"}}>{i+1}</td>
                  <td style={{padding:"10px 13px",fontSize:13,fontWeight:500,color:"#fff",maxWidth:180}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{c.title}</div></td>
                  <td style={{padding:"10px 13px",fontSize:13,color:"rgba(255,255,255,.6)",whiteSpace:"nowrap"}}>{c.created_by_name||"—"}</td>
                  <td style={{padding:"10px 13px",fontSize:13,whiteSpace:"nowrap"}}>{c.assigned_to_name?<span style={{color:"#2db49b"}}>{c.assigned_to_name}</span>:<span style={{color:"rgba(255,255,255,.25)"}}>Unassigned</span>}</td>
                  <td style={{padding:"10px 13px",fontSize:12,color:"rgba(255,255,255,.5)",whiteSpace:"nowrap"}}>{c.category}</td>
                  <td style={{padding:"10px 13px"}}><PriorityBadge priority={c.priority}/></td>
                  <td style={{padding:"10px 13px"}}><StatusBadge status={c.status}/></td>
                  <td style={{padding:"10px 13px",fontSize:12,color:"rgba(255,255,255,.35)",whiteSpace:"nowrap"}}>{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                  <td style={{padding:"10px 13px"}}><div style={{display:"flex",gap:6}}><button onClick={()=>openUpdate(c)} style={{padding:"4px 10px",background:"rgba(45,180,155,.15)",border:"1px solid rgba(45,180,155,.3)",borderRadius:6,color:"#2db49b",fontSize:11,fontWeight:600,cursor:"pointer"}}>Edit</button><button onClick={()=>del(c.id)} style={{padding:"4px 10px",background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,color:"#ef4444",fontSize:11,fontWeight:600,cursor:"pointer"}}>Del</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{fontSize:12,color:"rgba(255,255,255,.25)",marginTop:9}}>Total: {complaints.length} complaint(s)</p>
    </div>
    <Modal open={!!selected} onClose={()=>setSelected(null)} title="Edit Complaint" maxWidth={480}>
      {selected&&<div>
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:9,padding:"10px 13px",marginBottom:18,border:"1px solid rgba(255,255,255,.08)"}}><div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:2}}>{selected.title}</div><div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>By {selected.created_by_name} · {selected.location}</div></div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",marginBottom:8,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Status</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
            {[["pending","Pending"],["in_progress","In Progress"],["resolved","Resolved"],["rejected","Rejected"]].map(([v,l])=>(
              <button key={v} type="button" onClick={()=>setUpForm(p=>({...p,status:v}))} style={{padding:"8px 4px",borderRadius:8,cursor:"pointer",textAlign:"center",fontSize:11,fontWeight:600,transition:"all .15s",background:upForm.status===v?"rgba(45,180,155,.2)":"rgba(255,255,255,.04)",border:`1px solid ${upForm.status===v?"rgba(45,180,155,.5)":"rgba(255,255,255,.1)"}`,color:upForm.status===v?"#fff":"rgba(255,255,255,.5)"}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",marginBottom:8,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Assign Officer</label>
          <select value={upForm.assigned_to} onChange={e=>setUpForm(p=>({...p,assigned_to:e.target.value}))} style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#fff",fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none"}}>
            <option value="" style={{background:"#1a2236"}}>Keep current</option>
            {officers.map(o=><option key={o.id} value={o.id} style={{background:"#1a2236"}}>{o.name} — {o.department||"No dept"}</option>)}
          </select>
        </div>
        <FormField label="Resolution Note" type="textarea" placeholder="Note..." value={upForm.resolution_note} onChange={e=>setUpForm(p=>({...p,resolution_note:e.target.value}))} rows={3}/>
        <button onClick={submitUpdate} disabled={updating} style={{width:"100%",padding:"12px",borderRadius:10,background:updating?"rgba(45,180,155,.5)":"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",cursor:updating?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {updating?<><InlineSpinner size={15}/>Saving...</>:"Save Changes"}
        </button>
      </div>}
    </Modal>
  </DashboardLayout>;
}

export function AdminUsers(){
  const[users,setUsers]=useState([]);const[loading,setLoading]=useState(true);const{toast}=useApp();
  const load=()=>{setLoading(true);authAPI.users().then(r=>setUsers(r.data)).catch(()=>{}).finally(()=>setLoading(false));};
  useEffect(()=>{load();},[]);
  const toggle=async id=>{try{const r=await authAPI.toggle(id);toast(`User ${r.data.is_active?"enabled":"disabled"}`,"success");load();}catch{toast("Failed","error");};};
  return<DashboardLayout>
    <div style={{maxWidth:1100}}>
      <div style={{marginBottom:22,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Manage Users</h1><p style={{fontSize:14,color:"#94a3b8"}}>All registered citizens, officers and admins.</p></div>
      <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,overflow:"hidden"}}>
        {loading?<Spinner/>:(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:"rgba(255,255,255,.04)"}}>{["#","Name","Email","Phone","Role","Dept","Status","Action"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.35)",letterSpacing:"0.06em",borderBottom:"1px solid rgba(255,255,255,.08)",whiteSpace:"nowrap"}}>{h.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={u.id} style={{borderBottom:"1px solid rgba(255,255,255,.05)",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"11px 14px",fontSize:12,color:"rgba(255,255,255,.3)"}}>{i+1}</td>
                  <td style={{padding:"11px 14px"}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>{u.name?.[0]?.toUpperCase()}</div><span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{u.name}</span></div></td>
                  <td style={{padding:"11px 14px",fontSize:13,color:"rgba(255,255,255,.55)"}}>{u.email}</td>
                  <td style={{padding:"11px 14px",fontSize:13,color:"rgba(255,255,255,.4)"}}>{u.phone||"—"}</td>
                  <td style={{padding:"11px 14px"}}><RoleBadge role={u.role}/></td>
                  <td style={{padding:"11px 14px",fontSize:13,color:"rgba(255,255,255,.4)"}}>{u.department||"—"}</td>
                  <td style={{padding:"11px 14px"}}><span style={{fontSize:12,fontWeight:600,padding:"3px 10px",borderRadius:999,background:u.is_active?"rgba(34,197,94,.12)":"rgba(255,255,255,.06)",color:u.is_active?"#22c55e":"rgba(255,255,255,.4)",border:`1px solid ${u.is_active?"rgba(34,197,94,.3)":"rgba(255,255,255,.1)"}`}}>{u.is_active?"Active":"Disabled"}</span></td>
                  <td style={{padding:"11px 14px"}}><button onClick={()=>toggle(u.id)} style={{padding:"5px 12px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all .15s",background:u.is_active?"rgba(239,68,68,.12)":"rgba(34,197,94,.12)",border:`1px solid ${u.is_active?"rgba(239,68,68,.3)":"rgba(34,197,94,.3)"}`,color:u.is_active?"#ef4444":"#22c55e"}}>{u.is_active?"Disable":"Enable"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  </DashboardLayout>;
}

export function AdminOfficers(){
  const[officers,setOfficers]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{authAPI.officers().then(r=>setOfficers(r.data)).catch(()=>{}).finally(()=>setLoading(false));},[]);
  return<DashboardLayout>
    <div style={{maxWidth:1000}}>
      <div style={{marginBottom:22,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Manage Officers</h1><p style={{fontSize:14,color:"#94a3b8"}}>All field officers in the system.</p></div>
      {loading?<Spinner/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(275px,1fr))",gap:15}}>
          {officers.length===0?<p style={{color:"rgba(255,255,255,.3)",gridColumn:"1/-1",textAlign:"center",padding:48}}>No officers yet.</p>:officers.map(o=>(
            <div key={o.id} style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:13,padding:20,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(26,34,54,.95)";e.currentTarget.style.borderColor="rgba(45,180,155,.3)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(26,34,54,.7)";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";}}>
              <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:700,color:"#fff",flexShrink:0}}>{o.name?.[0]?.toUpperCase()}</div>
                <div style={{flex:1,overflow:"hidden"}}><div style={{fontWeight:700,fontSize:14,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.name}</div><div style={{fontSize:12,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis"}}>{o.email}</div></div>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:999,flexShrink:0,background:o.is_active?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)",color:o.is_active?"#22c55e":"#ef4444",border:`1px solid ${o.is_active?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`}}>{o.is_active?"Active":"Inactive"}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Dept",o.department||"Not set"],["Phone",o.phone||"—"]].map(([k,v])=>(
                  <div key={k} style={{background:"rgba(255,255,255,.04)",borderRadius:8,padding:"9px 11px",border:"1px solid rgba(255,255,255,.07)"}}><div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",letterSpacing:"0.06em",marginBottom:3}}>{k.toUpperCase()}</div><div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>{v}</div></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </DashboardLayout>;
}

export function AdminMap(){
  return<DashboardLayout>
    <div style={{maxWidth:1100}}>
      <div style={{marginBottom:22,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Live Complaint Map</h1><p style={{fontSize:14,color:"#94a3b8"}}>Real-time geographic view. Click markers for complaint details.</p></div>
      <div style={{background:"rgba(45,180,155,.07)",border:"1px solid rgba(45,180,155,.2)",borderRadius:10,padding:"10px 16px",marginBottom:18,fontSize:13,color:"rgba(255,255,255,.6)",display:"flex",gap:10,alignItems:"center"}}>🗺️ Interactive map — circle size = priority level · colour = status. Use filter buttons to focus on specific statuses.</div>
      <ComplaintMap height={520}/>
    </div>
  </DashboardLayout>;
}
