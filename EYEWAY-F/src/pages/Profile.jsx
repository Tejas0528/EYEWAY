import{useState}from"react";
import DashboardLayout from"../layouts/DashboardLayout";
import FormField from"../components/FormField";
import{authAPI,useApp}from"../context/AppContext";
import{InlineSpinner}from"../components/Spinner";
export default function Profile(){
  const{user,refreshUser,toast}=useApp();
  const[form,setForm]=useState({name:user?.name||"",email:user?.email||"",phone:user?.phone||"",department:user?.department||""});
  const[loading,setLoading]=useState(false);
  const upd=k=>e=>setForm(p=>({...p,[k]:e.target.value}));
  const submit=async e=>{e.preventDefault();setLoading(true);try{await authAPI.updateMe(form);await refreshUser();toast("Profile updated!","success");}catch(err){toast(err.response?.data?.detail||"Update failed","error");}finally{setLoading(false);};};
  return<DashboardLayout>
    <div style={{maxWidth:560}}>
      <div style={{marginBottom:24,paddingBottom:14,borderBottom:"1px solid rgba(255,255,255,.1)"}}><h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,marginBottom:4}}>My Profile</h1><p style={{fontSize:14,color:"#94a3b8"}}>Manage your account details.</p></div>
      <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:28,padding:"18px 22px",background:"rgba(26,34,54,.7)",border:"1px solid rgba(45,180,155,.2)",borderRadius:14}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#1a7a6b,#2db49b)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:800,color:"#fff",flexShrink:0}}>{user?.name?.[0]?.toUpperCase()}</div>
        <div><div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:18,color:"#fff"}}>{user?.name}</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:3}}>{user?.email} · <span style={{color:"#2db49b",textTransform:"capitalize",fontWeight:600}}>{user?.role}</span></div></div>
      </div>
      <div style={{background:"rgba(26,34,54,.7)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:24}}>
        <form onSubmit={submit}>
          <FormField label="Full Name" placeholder="Your full name" value={form.name} onChange={upd("name")} required/>
          <FormField label="Email" type="email" placeholder="your@email.com" value={form.email} onChange={upd("email")} required/>
          <FormField label="Phone" placeholder="10-digit mobile" value={form.phone} onChange={upd("phone")}/>
          {user?.role==="officer"&&<FormField label="Department" placeholder="Your department" value={form.department} onChange={upd("department")}/>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"13px",background:loading?"rgba(45,180,155,.5)":"linear-gradient(135deg,#1a7a6b,#2db49b)",border:"none",color:"#fff",borderRadius:10,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:15,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px rgba(45,180,155,.4)"}}>
            {loading?<><InlineSpinner size={16}/>Saving...</>:"Save Changes"}
          </button>
        </form>
      </div>
    </div>
  </DashboardLayout>;
}
