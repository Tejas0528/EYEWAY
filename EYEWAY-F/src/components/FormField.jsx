import{useState}from"react";
export default function FormField({label,type="text",placeholder,value,onChange,required,rows,options,helpText,error}){
  const[f,setF]=useState(false);
  const base={width:"100%",padding:"11px 14px",background:"rgba(255,255,255,.05)",border:`1px solid ${error?"rgba(239,68,68,.6)":f?"rgba(45,180,155,.6)":"rgba(255,255,255,.1)"}`,borderRadius:9,color:"#fff",fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",transition:"all .2s",resize:type==="textarea"?"vertical":"none"};
  return<div style={{marginBottom:18}}>
    {label&&<label style={{display:"block",marginBottom:7,fontSize:13,fontWeight:600,color:"rgba(255,255,255,.7)"}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:3}}>*</span>}</label>}
    {type==="textarea"?<textarea style={{...base,minHeight:rows?rows*40:110}} placeholder={placeholder} value={value} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)} rows={rows||4}/>
    :type==="select"?<select style={{...base,cursor:"pointer"}} value={value} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)}>{options?.map(o=><option key={o.value??o} value={o.value??o} style={{background:"#1a2236"}}>{o.label??o}</option>)}</select>
    :<input type={type} style={base} placeholder={placeholder} value={value} onChange={onChange} onFocus={()=>setF(true)} onBlur={()=>setF(false)} required={required}/>}
    {helpText&&!error&&<p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:5}}>{helpText}</p>}
    {error&&<p style={{fontSize:12,color:"#ef4444",marginTop:5}}>{error}</p>}
  </div>;
}
