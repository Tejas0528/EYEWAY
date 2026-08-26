import{useState}from"react";
import{Link,useNavigate}from"react-router-dom";
import{authAPI,useApp}from"../context/AppContext";
import FormField from"../components/FormField";
import{InlineSpinner}from"../components/Spinner";
const DEPTS=["PWD","CMWSSB","TANGEDCO","GCC","Health Department","Parks Department","Police","Education Department","General Administration"];
export default function Register(){
  const[form,setForm]=useState({name:"",email:"",password:"",phone:"",role:"citizen",department:""});
  const[loading,setLoading]=useState(false);
  const{login,toast}=useApp();const navigate=useNavigate();
  const upd=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const submit=async e=>{
    e.preventDefault();setLoading(true);
    try{const r=await authAPI.register(form);login(r.data.user,r.data.access_token);toast("Account created!","success");
      const role=r.data.user.role;navigate(role==="admin"?"/admin":role==="officer"?"/officer":"/dashboard");}
    catch(err){toast(err.response?.data?.detail||"Registration failed","error");}
    finally{setLoading(false);}
  };
  return<div style={{minHeight:"100vh",background:"#0e1420",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{width:"100%",maxWidth:460,background:"rgba(26,34,54,.85)",border:"1px solid rgba(45,180,155,.2)",borderRadius:20,padding:36,backdropFilter:"blur(24px)",boxShadow:"0 24px 80px rgba(0,0,0,.5)"}}>
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:24,color:"#fff",margin:"0 auto 14px"}}>E</div>
        <h2 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:6}}>Create Account</h2>
        <p style={{fontSize:14,color:"#94a3b8"}}>Join EYEWAY Smart Governance</p>
      </div>
      <form onSubmit={submit}>
        <FormField label="Full Name" placeholder="Your full name" value={form.name} onChange={upd("name")} required/>
        <FormField label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={upd("email")} required/>
        <FormField label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={upd("password")} required/>
        <FormField label="Phone" placeholder="10-digit mobile" value={form.phone} onChange={upd("phone")}/>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",marginBottom:7,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>Register As</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {[["citizen","👤","Citizen"],["officer","🎖️","Officer"]].map(([v,i,l])=>(
              <button key={v} type="button" onClick={()=>setForm(p=>({...p,role:v}))}
                style={{padding:"11px",borderRadius:9,cursor:"pointer",textAlign:"center",fontSize:13,fontWeight:600,transition:"all .15s",background:form.role===v?"rgba(45,180,155,.18)":"rgba(255,255,255,.04)",border:`1px solid ${form.role===v?"rgba(45,180,155,.5)":"rgba(255,255,255,.09)"}`,color:form.role===v?"#fff":"#94a3b8"}}>
                {i} {l}
              </button>
            ))}
          </div>
        </div>
        {form.role==="officer"&&<FormField label="Department" type="select" value={form.department} onChange={upd("department")} options={[{value:"",label:"Select Department"},...DEPTS.map(d=>({value:d,label:d}))]}/>}
        <button type="submit" disabled={loading} style={{width:"100%",padding:"13px",background:loading?"rgba(45,180,155,.5)":"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",borderRadius:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px rgba(45,180,155,.4)"}}>
          {loading?<><InlineSpinner size={16}/>Creating...</>:"Create Account →"}
        </button>
      </form>
      <p style={{textAlign:"center",marginTop:18,fontSize:14,color:"#94a3b8"}}>Have an account? <Link to="/login" style={{color:"#2db49b",fontWeight:600}}>Sign in</Link></p>
    </div>
  </div>;
}
