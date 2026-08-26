import{useState}from"react";
import{Link,useNavigate}from"react-router-dom";
import{authAPI,useApp}from"../context/AppContext";
import FormField from"../components/FormField";
import{InlineSpinner}from"../components/Spinner";
export default function Login(){
  const[form,setForm]=useState({email:"",password:""});
  const[loading,setLoading]=useState(false);
  const{login,toast}=useApp();const navigate=useNavigate();
  const submit=async e=>{
    e.preventDefault();setLoading(true);
    try{const r=await authAPI.login(form);login(r.data.user,r.data.access_token);toast("Welcome back!","success");
      const role=r.data.user.role;navigate(role==="admin"?"/admin":role==="officer"?"/officer":"/dashboard");}
    catch(err){toast(err.response?.data?.detail||"Login failed","error");}
    finally{setLoading(false);}
  };
  return<div style={{minHeight:"100vh",background:"#0e1420",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{width:"100%",maxWidth:420,background:"rgba(26,34,54,.85)",border:"1px solid rgba(45,180,155,.2)",borderRadius:20,padding:36,backdropFilter:"blur(24px)",boxShadow:"0 24px 80px rgba(0,0,0,.5)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:24,color:"#fff",margin:"0 auto 14px"}}>E</div>
        <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:6}}>Sign In</h2>
        <p style={{fontSize:14,color:"#94a3b8"}}>EYEWAY Smart Governance Portal</p>
      </div>
      <form onSubmit={submit}>
        <FormField label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/>
        <FormField label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/>
        <button type="submit" disabled={loading} style={{width:"100%",padding:"13px",background:loading?"rgba(45,180,155,.5)":"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",borderRadius:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px rgba(45,180,155,.4)"}}>
          {loading?<><InlineSpinner size={16}/>Signing in...</>:"Sign In →"}
        </button>
      </form>
      <p style={{textAlign:"center",marginTop:18,fontSize:14,color:"#94a3b8"}}>No account? <Link to="/register" style={{color:"#2db49b",fontWeight:600}}>Register free</Link></p>
      <div style={{marginTop:18,padding:"12px 15px",background:"rgba(45,180,155,.06)",border:"1px solid rgba(45,180,155,.18)",borderRadius:10}}>
        <div style={{fontSize:11,fontWeight:700,color:"#2db49b",marginBottom:8,letterSpacing:"0.06em"}}>DEMO CREDENTIALS</div>
        {[["Admin","admin@eyeway.gov.in","admin123"],["Officer","suresh@eyeway.gov.in","officer123"],["Citizen","priya@email.com","citizen123"]].map(([r,e,p])=>(
          <div key={r} style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:4,cursor:"pointer"}} onClick={()=>setForm({email:e,password:p})}>
            <span style={{color:"#2db49b",fontWeight:600}}>{r}:</span> {e} / {p}
          </div>
        ))}
      </div>
    </div>
  </div>;
}
