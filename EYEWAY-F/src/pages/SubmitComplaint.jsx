import{useState,useRef,useCallback}from"react";
import{useNavigate}from"react-router-dom";
import DashboardLayout from"../layouts/DashboardLayout";
import FormField from"../components/FormField";
import VoiceInput from"../components/VoiceInput";
import AIAnalyzer from"../components/AIAnalyzer";
import{complaintsAPI,useApp}from"../context/AppContext";
import{InlineSpinner}from"../components/Spinner";
const CATS=[{val:"Roads & Transport",icon:"🛣️",dept:"PWD"},{val:"Water Supply",icon:"💧",dept:"CMWSSB"},{val:"Electricity",icon:"⚡",dept:"TANGEDCO"},{val:"Sanitation",icon:"🗑️",dept:"GCC"},{val:"Public Health",icon:"🏥",dept:"Health Dept"},{val:"Parks & Recreation",icon:"🌳",dept:"Parks Dept"},{val:"Public Safety",icon:"🛡️",dept:"Police/GCC"},{val:"Education",icon:"📚",dept:"Education"},{val:"Other",icon:"📌",dept:"General"}];
function Sec({num,title,children,red}){
  return<div style={{background:red?"rgba(239,68,68,.05)":"rgba(26,34,54,.7)",border:`1px solid ${red?"rgba(239,68,68,.25)":"rgba(255,255,255,.09)"}`,borderRadius:14,padding:24,marginBottom:18,backdropFilter:"blur(12px)"}}>
    <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,marginBottom:18,paddingBottom:12,borderBottom:`1px solid ${red?"rgba(239,68,68,.15)":"rgba(255,255,255,.08)"}`,display:"flex",alignItems:"center",gap:10}}>
      <span style={{width:24,height:24,borderRadius:"50%",background:red?"linear-gradient(135deg,#c0392b,#ef4444)":"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{num}</span>
      {title}
    </h3>
    {children}
  </div>;
}
export default function SubmitComplaint(){
  const[form,setForm]=useState({title:"",description:"",category:"",location:"",priority:"medium"});
  const[photos,setPhotos]=useState([]);const[videos,setVideos]=useState([]);
  const[camera,setCamera]=useState(false);const[emergency,setEmergency]=useState(false);
  const[voiceMode,setVoiceMode]=useState(false);const[aiResult,setAiResult]=useState(null);
  const[loading,setLoading]=useState(false);const[locLoading,setLocLoading]=useState(false);const[success,setSuccess]=useState(null);
  const videoRef=useRef(null);const streamRef=useRef(null);const fileRef=useRef(null);const vidRef=useRef(null);
  const{toast,lang}=useApp();const navigate=useNavigate();
  const upd=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const getGPS=()=>{if(!navigator.geolocation){toast("Geolocation not supported","error");return;}setLocLoading(true);navigator.geolocation.getCurrentPosition(pos=>{const{latitude:la,longitude:lo}=pos.coords;setForm(p=>({...p,location:`${la.toFixed(5)}, ${lo.toFixed(5)} (GPS)`}));toast("📍 GPS captured","success");setLocLoading(false);},()=>{toast("Location unavailable","error");setLocLoading(false);});};
  const handleVoice=t=>{setForm(p=>({...p,description:p.description?p.description+" "+t:t}));toast("🎤 Voice added","success");};
  const handleAI=r=>{if(r.category&&!form.category)setForm(p=>({...p,category:r.category,priority:r.priority}));setAiResult(r);};
  const handleFiles=files=>Array.from(files).filter(f=>f.type.startsWith("image/")).slice(0,5-photos.length).forEach(f=>setPhotos(p=>[...p,{url:URL.createObjectURL(f),file:f}]));
  const handleVideo=files=>Array.from(files).filter(f=>f.type.startsWith("video/")).slice(0,2-videos.length).forEach(f=>setVideos(p=>[...p,{url:URL.createObjectURL(f),file:f,name:f.name}]));
  const openCamera=async()=>{try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});streamRef.current=s;setCamera(true);setTimeout(()=>{if(videoRef.current)videoRef.current.srcObject=s;},100);}catch{toast("Camera access denied","error");}};
  const closeCamera=()=>{streamRef.current?.getTracks().forEach(t=>t.stop());setCamera(false);};
  const capturePhoto=useCallback(()=>{const v=videoRef.current;if(!v)return;const c=document.createElement("canvas");c.width=v.videoWidth;c.height=v.videoHeight;c.getContext("2d").drawImage(v,0,0);c.toBlob(blob=>{const url=URL.createObjectURL(blob);const file=new File([blob],`cap-${Date.now()}.jpg`,{type:"image/jpeg"});setPhotos(p=>[...p,{url,file}]);toast("📷 Photo captured","success");},"image/jpeg",.85);},[]);
  const handleSubmit=async e=>{e.preventDefault();if(!form.category){toast("Please select a category","error");return;}setLoading(true);try{const p={...form};if(emergency)p.priority="high";const r=await complaintsAPI.create(p);setSuccess(r.data);toast("✅ Complaint submitted!","success");}catch(err){toast(err.response?.data?.detail||"Submission failed","error");}finally{setLoading(false);};};
  const reset=()=>{setSuccess(null);setForm({title:"",description:"",category:"",location:"",priority:"medium"});setPhotos([]);setVideos([]);setEmergency(false);setAiResult(null);};

  if(success)return<DashboardLayout>
    <div style={{maxWidth:520,margin:"0 auto",textAlign:"center",padding:"68px 0",animation:"fadeUp .4s ease"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(34,197,94,.12)",border:"2px solid rgba(34,197,94,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 22px",animation:"pulse-glow 2s ease infinite"}}>✓</div>
      <h2 style={{fontFamily:"'Space Grotesk',sans-serif",marginBottom:10}}>Complaint Registered!</h2>
      <p style={{color:"#94a3b8",marginBottom:8}}>AI routed your complaint to the correct department.</p>
      <div style={{margin:"14px 0",padding:"11px 18px",background:"rgba(45,180,155,.08)",border:"1px solid rgba(45,180,155,.25)",borderRadius:10,display:"inline-block"}}>
        <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:4}}>REFERENCE ID</div>
        <div style={{fontSize:22,fontWeight:900,color:"#2db49b",fontFamily:"'Space Grotesk',sans-serif"}}>#{success.id?.slice(0,8).toUpperCase()}</div>
      </div>
      {aiResult&&<div style={{margin:"14px 0",padding:"13px 16px",background:"rgba(26,34,54,.8)",border:"1px solid rgba(45,180,155,.2)",borderRadius:11,textAlign:"left"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#2db49b",marginBottom:9,letterSpacing:"0.06em"}}>AI CLASSIFICATION</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[["Category",aiResult.category],["Dept",aiResult.dept],["Priority",aiResult.priority?.toUpperCase()],["ETA",aiResult.eta]].map(([k,v])=>(
            <div key={k} style={{background:"rgba(255,255,255,.04)",borderRadius:8,padding:"8px 11px"}}><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:2}}>{k.toUpperCase()}</div><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{v}</div></div>
          ))}
        </div>
      </div>}
      <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:22}}>
        <button onClick={()=>navigate("/my-complaints")} style={{padding:"11px 24px",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",borderRadius:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>Track Complaint</button>
        <button onClick={reset} style={{padding:"11px 24px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.15)",color:"#fff",borderRadius:10,cursor:"pointer"}}>Submit Another</button>
      </div>
    </div>
  </DashboardLayout>;

  return<DashboardLayout>
    <div style={{maxWidth:700}}>
      <div style={{marginBottom:24,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:5}}>Submit Complaint</h1>
        <p style={{fontSize:14,color:"#94a3b8"}}>AI analyses your complaint automatically. Speak in Tamil or English.</p>
      </div>

      {/* Emergency toggle */}
      <div onClick={()=>setEmergency(e=>!e)} style={{marginBottom:16,padding:"13px 18px",borderRadius:12,cursor:"pointer",transition:"all .25s",background:emergency?"rgba(239,68,68,.1)":"rgba(26,34,54,.7)",border:`2px solid ${emergency?"rgba(239,68,68,.5)":"rgba(255,255,255,.09)"}`,animation:emergency?"emerg 1.5s ease infinite":"none",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:44,height:44,borderRadius:11,background:emergency?"rgba(239,68,68,.2)":"rgba(255,255,255,.05)",border:`1px solid ${emergency?"rgba(239,68,68,.5)":"rgba(255,255,255,.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>🚨</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,color:emergency?"#ef4444":"#fff"}}>{emergency?"⚡ EMERGENCY MODE ACTIVE":"Mark as Emergency"}</div>
          <div style={{fontSize:12,color:emergency?"rgba(239,68,68,.7)":"rgba(255,255,255,.35)",marginTop:2}}>{emergency?"Escalated to senior officer within 60 min.":"Tap to activate for urgent safety hazards."}</div>
        </div>
        <div style={{width:44,height:24,borderRadius:999,background:emergency?"#ef4444":"rgba(255,255,255,.12)",position:"relative",transition:"all .3s",flexShrink:0}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:emergency?22:3,transition:"left .25s"}}/>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Sec num="1" title="Complaint Details" red={emergency}>
          <FormField label="Complaint Title" placeholder="Short clear title — e.g. 'Pothole on MG Road'" value={form.title} onChange={upd("title")} required/>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <label style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Description <span style={{color:"#ef4444"}}>*</span></label>
              <button type="button" onClick={()=>setVoiceMode(v=>!v)} style={{padding:"4px 12px",borderRadius:999,background:voiceMode?"rgba(45,180,155,.2)":"rgba(255,255,255,.06)",border:`1px solid ${voiceMode?"rgba(45,180,155,.4)":"rgba(255,255,255,.12)"}`,color:voiceMode?"#2db49b":"rgba(255,255,255,.5)",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>🎤 {voiceMode?"Hide Voice":"Speak Instead"}</button>
            </div>
            {voiceMode&&<div style={{marginBottom:12,padding:"13px 16px",background:"rgba(45,180,155,.06)",border:"1px solid rgba(45,180,155,.2)",borderRadius:10}}><VoiceInput onTranscript={handleVoice} lang={lang}/></div>}
            <textarea value={form.description} onChange={upd("description")} required rows={5}
              placeholder={lang==="ta"?"புகாரை விவரிக்கவும் — AI தானாக பகுப்பாய்வு செய்யும்...":"Describe the issue. AI will auto-categorise..."}
              style={{width:"100%",padding:"11px 14px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#fff",fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",resize:"vertical",minHeight:110,transition:"border-color .2s"}}
              onFocus={e=>e.target.style.borderColor="rgba(45,180,155,.6)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.12)"}/>
            <AIAnalyzer text={form.description} onResult={handleAI}/>
          </div>
        </Sec>

        <Sec num="2" title="Location & Category" red={emergency}>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",marginBottom:7,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Location <span style={{color:"#ef4444"}}>*</span></label>
            <div style={{display:"flex",gap:10}}>
              <input type="text" value={form.location} onChange={upd("location")} required placeholder="Street, landmark, area..."
                style={{flex:1,padding:"11px 14px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#fff",fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",transition:"border-color .2s"}}
                onFocus={e=>e.target.style.borderColor="rgba(45,180,155,.6)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.12)"}/>
              <button type="button" onClick={getGPS} disabled={locLoading} style={{padding:"11px 16px",background:"rgba(45,180,155,.1)",border:"1px solid rgba(45,180,155,.3)",borderRadius:9,color:"#2db49b",fontSize:13,fontWeight:600,cursor:locLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}>
                {locLoading?<><InlineSpinner size={14} color="#2db49b"/>Locating...</>:"📍 GPS"}
              </button>
            </div>
          </div>
          <div>
            <label style={{display:"block",marginBottom:9,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>
              Category <span style={{color:"#ef4444"}}>*</span>
              {aiResult?.category&&<span style={{marginLeft:8,fontSize:11,color:"#2db49b",fontWeight:400}}>🤖 AI: {aiResult.category}</span>}
            </label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:8}}>
              {CATS.map(c=><button key={c.val} type="button" onClick={()=>setForm(p=>({...p,category:c.val}))}
                style={{padding:"10px 11px",borderRadius:9,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:8,background:form.category===c.val?"rgba(45,180,155,.15)":"rgba(255,255,255,.04)",border:`1px solid ${form.category===c.val?"rgba(45,180,155,.5)":"rgba(255,255,255,.09)"}`,color:form.category===c.val?"#fff":"#94a3b8",fontSize:13,fontWeight:form.category===c.val?600:400,fontFamily:"'Inter',sans-serif",transition:"all .15s"}}>
                <span style={{fontSize:16}}>{c.icon}</span>
                <div><div>{c.val}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:1}}>{c.dept}</div></div>
              </button>)}
            </div>
          </div>
        </Sec>

        <Sec num="3" title="Priority Level" red={emergency}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {[{v:"low",i:"🟢",l:"Low",d:"Non-urgent"},{v:"medium",i:"🟡",l:"Medium",d:"Moderate"},{v:"high",i:"🔴",l:"High",d:"Urgent / Safety"}].map(p=>(
              <button key={p.v} type="button" onClick={()=>setForm(pr=>({...pr,priority:p.v}))}
                style={{padding:"15px 10px",borderRadius:11,cursor:"pointer",textAlign:"center",transition:"all .15s",background:form.priority===p.v?(p.v==="high"?"rgba(239,68,68,.15)":p.v==="medium"?"rgba(245,158,11,.15)":"rgba(34,197,94,.12)"):"rgba(255,255,255,.04)",border:`1px solid ${form.priority===p.v?(p.v==="high"?"rgba(239,68,68,.5)":p.v==="medium"?"rgba(245,158,11,.5)":"rgba(34,197,94,.5)"):"rgba(255,255,255,.09)"}`,fontFamily:"'Inter',sans-serif"}}>
                <div style={{fontSize:22,marginBottom:5}}>{p.i}</div>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:2}}>{p.l}</div>
                <div style={{fontSize:11,color:"#94a3b8"}}>{p.d}</div>
              </button>
            ))}
          </div>
        </Sec>

        <Sec num="4" title="Media Evidence + AI Image Scan" red={emergency}>
          <p style={{fontSize:13,color:"#94a3b8",marginBottom:14}}>Upload photos/videos. AI auto-scans images to identify issue type.</p>
          <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:12}}>
            <button type="button" onClick={()=>fileRef.current?.click()} style={{padding:"9px 16px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:9,color:"rgba(255,255,255,.7)",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📁 Photos</button>
            <button type="button" onClick={()=>vidRef.current?.click()} style={{padding:"9px 16px",background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.35)",borderRadius:9,color:"#a78bfa",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>🎥 Video</button>
            <button type="button" onClick={openCamera} style={{padding:"9px 16px",background:"rgba(45,180,155,.1)",border:"1px solid rgba(45,180,155,.35)",borderRadius:9,color:"#2db49b",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>📷 Camera</button>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
            <input ref={vidRef} type="file" accept="video/*" multiple style={{display:"none"}} onChange={e=>handleVideo(e.target.files)}/>
          </div>
          {camera&&<div style={{marginBottom:12,background:"#000",borderRadius:11,overflow:"hidden",border:"1px solid rgba(255,255,255,.1)",position:"relative"}}><video ref={videoRef} autoPlay playsInline muted style={{width:"100%",maxHeight:240,objectFit:"cover",display:"block"}}/><div style={{position:"absolute",bottom:12,left:0,right:0,display:"flex",justifyContent:"center",gap:12}}><button type="button" onClick={capturePhoto} style={{width:52,height:52,borderRadius:"50%",background:"#fff",border:"4px solid rgba(255,255,255,.3)",cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>📷</button><button type="button" onClick={closeCamera} style={{padding:"9px 16px",background:"rgba(239,68,68,.85)",border:"none",borderRadius:9,color:"#fff",fontWeight:600,cursor:"pointer"}}>✕</button></div></div>}
          {photos.length>0&&<div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:10}}>
            {photos.map((p,i)=><div key={i} style={{position:"relative",width:88,height:88}}><img src={p.url} alt="" style={{width:88,height:88,objectFit:"cover",borderRadius:9,border:"1px solid rgba(255,255,255,.15)"}}/><button type="button" onClick={()=>setPhotos(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:-5,right:-5,width:19,height:19,borderRadius:"50%",background:"#ef4444",border:"2px solid #0e1420",color:"#fff",fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button></div>)}
            <button type="button" onClick={()=>fileRef.current?.click()} style={{width:88,height:88,borderRadius:9,border:"2px dashed rgba(255,255,255,.2)",background:"rgba(255,255,255,.02)",color:"rgba(255,255,255,.2)",fontSize:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>}
          {videos.length>0&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
            {videos.map((v,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:11,background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.2)",borderRadius:9,padding:"9px 13px"}}><span style={{fontSize:18}}>🎥</span><span style={{flex:1,fontSize:13,color:"rgba(255,255,255,.65)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.name}</span><button type="button" onClick={()=>setVideos(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:15}}>✕</button></div>)}
          </div>}
        </Sec>

        <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",borderRadius:11,background:emergency?"linear-gradient(135deg,#c0392b,#ef4444)":loading?"rgba(45,180,155,.5)":"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",fontSize:15,fontWeight:800,fontFamily:"'Space Grotesk',sans-serif",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:emergency?"0 6px 24px rgba(239,68,68,.4)":"0 6px 24px rgba(45,180,155,.4)",transition:"all .2s"}}>
          {loading?<><InlineSpinner size={17}/>Submitting...</>:emergency?"🚨 Submit Emergency":"📤 Submit Complaint"}
        </button>
      </form>
    </div>
    <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(34,197,94,.3)}50%{box-shadow:0 0 40px rgba(34,197,94,.7)}} @keyframes emerg{0%,100%{background:rgba(239,68,68,.08)}50%{background:rgba(239,68,68,.2)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </DashboardLayout>;
}
