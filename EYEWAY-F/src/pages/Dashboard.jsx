import{useEffect,useState}from"react";
import{Link}from"react-router-dom";
import DashboardLayout from"../layouts/DashboardLayout";
import StatCard from"../components/StatCard";
import{StatusBadge,PriorityBadge}from"../components/Badge";
import Spinner from"../components/Spinner";
import Modal from"../components/Modal";
import{TrendChart}from"../components/Charts";
import{complaintsAPI,useApp}from"../context/AppContext";
const STEPS=["Filed","Assigned","In Progress","Resolved"];
const SI={pending:0,in_progress:2,resolved:3,rejected:1};
function Timeline({status}){
  const cur=SI[status]??0;
  return<div style={{display:"flex",alignItems:"center",marginTop:12}}>
    {STEPS.map((s,i)=><div key={s} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <div style={{width:20,height:20,borderRadius:"50%",background:i<=cur?"linear-gradient(135deg,#1a7a6b,#2db49b)":"rgba(255,255,255,.1)",border:`2px solid ${i<=cur?"#2db49b":"rgba(255,255,255,.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:700,boxShadow:i===cur?"0 0 0 4px rgba(45,180,155,.2)":"none"}}>{i<=cur?"✓":""}</div>
        <span style={{fontSize:9,color:i<=cur?"rgba(255,255,255,.7)":"rgba(255,255,255,.25)",whiteSpace:"nowrap"}}>{s}</span>
      </div>
      {i<STEPS.length-1&&<div style={{flex:1,height:2,background:i<cur?"linear-gradient(90deg,#1a7a6b,#2db49b)":"rgba(255,255,255,.08)",margin:"0 4px",marginBottom:18}}/>}
    </div>)}
  </div>;
}
const AI_RECS=[
  {icon:"💡",color:"#3b9eff",title:"Batch Your Complaint",desc:"3 similar road complaints near your area. Filing together speeds resolution by 40%."},
  {icon:"⏰",color:"#f59e0b",title:"Best Time to File",desc:"Complaints filed 8–10 AM get 28% faster assignment based on officer patterns."},
  {icon:"📸",color:"#2db49b",title:"Add Photos",desc:"Complaints with photos resolve 2x faster. Add evidence for better results."},
];
const MOCK_NOTIFS=[
  {id:1,type:"success",title:"Resolved ✓",msg:"Complaint #C003 fully resolved by Officer Suresh.",time:"2h ago",read:false,color:"#22c55e"},
  {id:2,type:"info",title:"In Progress",msg:"#C001 assigned to Officer Meena, Roads dept.",time:"5h ago",read:false,color:"#3b9eff"},
  {id:3,type:"warning",title:"Action Needed",msg:"Please confirm resolution for #C003.",time:"1d ago",read:true,color:"#f59e0b"},
];
export default function Dashboard(){
  const{user}=useApp();
  const[complaints,setComplaints]=useState([]);const[loading,setLoading]=useState(true);
  const[selected,setSelected]=useState(null);const[tab,setTab]=useState("complaints");
  const[notifs,setNotifs]=useState(MOCK_NOTIFS);const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{complaintsAPI.mine().then(r=>setComplaints(r.data)).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const counts={total:complaints.length,pending:complaints.filter(c=>c.status==="pending").length,in_progress:complaints.filter(c=>c.status==="in_progress").length,resolved:complaints.filter(c=>c.status==="resolved").length};
  const rate=counts.total?Math.round(counts.resolved/counts.total*100):0;
  return<DashboardLayout>
    <div style={{maxWidth:1100}}>
      <div style={{marginBottom:26,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>Welcome back, <span style={{background:"linear-gradient(135deg,#1a7a6b,#2db49b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{user?.name?.split(" ")[0]}</span></h1>
          <p style={{fontSize:14,color:"#94a3b8"}}>Track and manage your civic complaints. AI monitoring active.</p>
        </div>
        <Link to="/complaint"><button style={{padding:"10px 22px",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",borderRadius:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:"0 4px 16px rgba(45,180,155,.4)",display:"flex",alignItems:"center",gap:8}}>📝 New Complaint</button></Link>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:15,marginBottom:22}}>
        <StatCard icon="📋" label="Total" value={counts.total} color="#2db49b"/>
        <StatCard icon="⏳" label="Pending" value={counts.pending} color="#f59e0b"/>
        <StatCard icon="🔄" label="In Progress" value={counts.in_progress} color="#3b9eff"/>
        <StatCard icon="✅" label="Resolved" value={counts.resolved} color="#22c55e" sub={`${rate}% rate`}/>
      </div>
      <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}><span style={{fontSize:14,fontWeight:600,color:"#fff",fontFamily:"'Space Grotesk',sans-serif"}}>Overall Resolution Progress</span><span style={{fontSize:14,fontWeight:800,color:"#2db49b"}}>{rate}%</span></div>
        <div style={{height:8,background:"rgba(255,255,255,.08)",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${rate}%`,background:"linear-gradient(90deg,#1a7a6b,#2db49b)",borderRadius:999,transition:"width 1s ease"}}/></div>
        <div style={{display:"flex",gap:16,marginTop:9}}>
          {[["#f59e0b","Pending",counts.pending],["#3b9eff","In Progress",counts.in_progress],["#22c55e","Resolved",counts.resolved]].map(([c,l,v])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:c}}/><span style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{l}: <strong style={{color:"rgba(255,255,255,.7)"}}>{v}</strong></span></div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:11,padding:5,width:"fit-content",flexWrap:"wrap"}}>
        {[{id:"complaints",label:"📋 Complaints"},{id:"analytics",label:"📊 Analytics"},{id:"ai",label:"🤖 AI Insights"},{id:"notifs",label:`🔔 Alerts${unread?` (${unread})`:""}`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 15px",borderRadius:8,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:tab===t.id?600:400,background:tab===t.id?"rgba(45,180,155,.2)":"transparent",border:`1px solid ${tab===t.id?"rgba(45,180,155,.4)":"transparent"}`,color:tab===t.id?"#fff":"rgba(255,255,255,.45)",transition:"all .2s"}}>{t.label}</button>
        ))}
      </div>
      {tab==="complaints"&&<div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"13px 20px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between"}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15}}>Recent Complaints</h3><Link to="/my-complaints" style={{fontSize:13,color:"#2db49b",fontWeight:600}}>View all →</Link></div>
        {loading?<Spinner/>:complaints.length===0?<div style={{padding:"48px 20px",textAlign:"center"}}><div style={{fontSize:40,marginBottom:14}}>📭</div><p style={{color:"rgba(255,255,255,.35)",fontSize:14,marginBottom:16}}>No complaints filed yet.</p><Link to="/complaint" style={{color:"#2db49b",fontWeight:600,fontSize:14}}>File your first complaint →</Link></div>
        :complaints.slice(0,6).map((c,i)=>(
          <div key={c.id} onClick={()=>setSelected(c)} style={{padding:"15px 20px",borderBottom:i<Math.min(complaints.length,6)-1?"1px solid rgba(255,255,255,.05)":"none",display:"flex",alignItems:"center",gap:15,cursor:"pointer",transition:"background .2s",flexWrap:"wrap"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:40,height:40,borderRadius:10,background:"rgba(45,180,155,.1)",border:"1px solid rgba(45,180,155,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c.category?.includes("Road")?"🛣️":c.category?.includes("Water")?"💧":c.category?.includes("Electric")?"⚡":"📋"}</div>
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:280}}>{c.title}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>📍 {c.location} · {new Date(c.created_at).toLocaleDateString("en-IN")}</div>
              <Timeline status={c.status}/>
            </div>
            <div style={{display:"flex",gap:7,flexShrink:0}}><PriorityBadge priority={c.priority}/><StatusBadge status={c.status}/></div>
          </div>
        ))}
      </div>}
      {tab==="analytics"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:22,gridColumn:"1/-1"}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,marginBottom:5}}>Resolution Rate Trend (7 days)</h3><p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginBottom:18}}>Daily resolution percentage</p><TrendChart/></div>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:22,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:64,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{rate}%</div><p style={{color:"rgba(255,255,255,.35)",fontSize:13}}>of your complaints resolved</p></div>
        <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:22}}><h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,marginBottom:18}}>By Category</h3>
          {complaints.length===0?<p style={{color:"rgba(255,255,255,.3)",fontSize:13}}>No data yet.</p>:(()=>{const cats={};complaints.forEach(c=>{cats[c.category]=(cats[c.category]||0)+1;});const max=Math.max(...Object.values(cats),1);return Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,cnt])=>(<div key={cat} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{cat}</span><span style={{fontSize:12,fontWeight:700,color:"#2db49b"}}>{cnt}</span></div><div style={{height:5,background:"rgba(255,255,255,.07)",borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${(cnt/max)*100}%`,background:"linear-gradient(90deg,#1a7a6b,#2db49b)",borderRadius:999}}/></div></div>));})()} 
        </div>
      </div>}
      {tab==="ai"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"rgba(45,180,155,.07)",border:"1px solid rgba(45,180,155,.2)",borderRadius:12,padding:"15px 18px",display:"flex",gap:12}}><span style={{fontSize:22,flexShrink:0}}>🤖</span><div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,color:"#fff",marginBottom:4}}>AI Summary</div><p style={{fontSize:13,color:"rgba(255,255,255,.55)",margin:0,lineHeight:1.7}}>You have filed <strong style={{color:"#2db49b"}}>{counts.total}</strong> complaints with a <strong style={{color:"#2db49b"}}>{rate}%</strong> resolution rate.{counts.pending>0&&` ${counts.pending} complaint${counts.pending>1?"s are":" is"} still pending.`}</p></div></div>
        <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:16,marginTop:4}}>AI Recommendations</h3>
        {AI_RECS.map((r,i)=><div key={i} style={{background:"rgba(26,34,54,.7)",border:`1px solid ${r.color}22`,borderRadius:12,padding:"16px 20px",display:"flex",gap:13,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor=`${r.color}44`;}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(26,34,54,.7)";e.currentTarget.style.borderColor=`${r.color}22`;}}>
          <div style={{width:42,height:42,borderRadius:10,background:`${r.color}18`,border:`1px solid ${r.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{r.icon}</div>
          <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,color:"#fff",marginBottom:4}}>{r.title}</div><p style={{fontSize:13,color:"rgba(255,255,255,.5)",margin:0,lineHeight:1.65}}>{r.desc}</p></div>
        </div>)}
      </div>}
      {tab==="notifs"&&<div>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><button onClick={()=>setNotifs(p=>p.map(n=>({...n,read:true})))} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,padding:"7px 14px",color:"rgba(255,255,255,.6)",fontSize:12,cursor:"pointer"}}>Mark all read</button></div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {notifs.map(n=><div key={n.id} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} style={{background:n.read?"rgba(255,255,255,.03)":`${n.color}10`,border:`1px solid ${n.read?"rgba(255,255,255,.07)":n.color+"35"}`,borderRadius:12,padding:"15px 18px",display:"flex",gap:13,cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <div style={{width:36,height:36,borderRadius:9,background:`${n.color}18`,border:`1px solid ${n.color}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{n.type==="success"?"✅":n.type==="warning"?"⚠️":"ℹ️"}</div>
            <div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:14,fontWeight:600,color:"#fff"}}>{n.title}</span><div style={{display:"flex",alignItems:"center",gap:7}}>{!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:n.color}}/>}<span style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>{n.time}</span></div></div><p style={{fontSize:13,color:"rgba(255,255,255,.5)",margin:0,lineHeight:1.6}}>{n.msg}</p></div>
          </div>)}
        </div>
      </div>}
    </div>
    <Modal open={!!selected} onClose={()=>setSelected(null)} title="Complaint Details" maxWidth={560}>
      {selected&&<div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}><StatusBadge status={selected.status}/><PriorityBadge priority={selected.priority}/></div>
        <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:17,marginBottom:10}}>{selected.title}</h3>
        <p style={{fontSize:14,color:"rgba(255,255,255,.5)",lineHeight:1.75,marginBottom:18}}>{selected.description}</p>
        <Timeline status={selected.status}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginTop:18,marginBottom:14}}>
          {[["Category",selected.category],["Location",selected.location],["Officer",selected.assigned_to_name||"Pending"],["Filed",new Date(selected.created_at).toLocaleString("en-IN")]].map(([k,v])=>(
            <div key={k} style={{background:"rgba(255,255,255,.05)",borderRadius:9,padding:"10px 13px",border:"1px solid rgba(255,255,255,.08)"}}><div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:3,letterSpacing:"0.06em"}}>{k.toUpperCase()}</div><div style={{fontSize:13,color:"#fff"}}>{v}</div></div>
          ))}
        </div>
        {selected.resolution_note&&<div style={{background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.25)",borderRadius:9,padding:"11px 15px"}}><div style={{fontSize:11,fontWeight:700,color:"#22c55e",marginBottom:4}}>RESOLUTION NOTE</div><p style={{fontSize:13,color:"rgba(255,255,255,.7)",margin:0}}>{selected.resolution_note}</p></div>}
      </div>}
    </Modal>
  </DashboardLayout>;
}
