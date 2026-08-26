import{useState,useRef,useEffect}from"react";
export default function VoiceInput({onTranscript,lang="en"}){
  const[listening,setListening]=useState(false);
  const[status,setStatus]=useState("idle");
  const[transcript,setTranscript]=useState("");
  const[supported,setSupported]=useState(true);
  const rRef=useRef(null);
  useEffect(()=>{if(!("webkitSpeechRecognition"in window)&&!("SpeechRecognition"in window))setSupported(false);},[]);
  const start=()=>{
    if(!supported)return;
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const r=new SR();rRef.current=r;
    r.lang=lang==="ta"?"ta-IN":"en-IN";r.interimResults=true;r.continuous=false;
    r.onstart=()=>{setListening(true);setStatus("listening");setTranscript("");};
    r.onresult=e=>{const cur=Array.from(e.results).map(x=>x[0].transcript).join("");setTranscript(cur);if(e.results[e.results.length-1].isFinal){setStatus("processing");setTimeout(()=>{setStatus("done");onTranscript(cur);},400);}};
    r.onerror=()=>{setStatus("error");setListening(false);};
    r.onend=()=>setListening(false);
    r.start();
  };
  const stop=()=>{rRef.current?.stop();setListening(false);};
  if(!supported)return<div style={{padding:"10px 14px",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:9,fontSize:13,color:"rgba(239,68,68,.8)"}}>Speech recognition not supported in this browser.</div>;
  const sC={idle:"#94a3b8",listening:"#2db49b",processing:"#f59e0b",done:"#22c55e",error:"#ef4444"};
  const sL={idle:"Tap mic to speak",listening:"Listening...",processing:"Processing...",done:"Done!",error:"Error — try again"};
  return<div>
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <button type="button" onClick={listening?stop:start} style={{width:52,height:52,borderRadius:"50%",border:`2px solid ${listening?"#2db49b":"rgba(45,180,155,.3)"}`,cursor:"pointer",background:listening?"linear-gradient(135deg,#1a7a6b,#2db49b)":"rgba(45,180,155,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,transition:"all .25s"}}>{listening?"⏹":"🎤"}</button>
      {listening&&<div style={{display:"flex",alignItems:"center",gap:3,height:36}}>{Array.from({length:8},(_,i)=><div key={i} style={{width:4,height:8,borderRadius:2,background:"#2db49b",animation:`wave .8s ease ${i*.1}s infinite`,opacity:.8}}/>)}</div>}
      <div>
        <div style={{fontSize:13,fontWeight:600,color:sC[status]}}>{sL[status]}</div>
        {transcript&&<div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:2,maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{transcript}"</div>}
      </div>
    </div>
    {transcript&&status==="done"&&<div style={{marginTop:10,padding:"10px 14px",background:"rgba(45,180,155,.08)",border:"1px solid rgba(45,180,155,.25)",borderRadius:9,fontSize:13,color:"rgba(255,255,255,.8)",lineHeight:1.6}}><span style={{fontSize:11,fontWeight:700,color:"#2db49b",letterSpacing:"0.06em"}}>TRANSCRIBED: </span>{transcript}</div>}
    <style>{`@keyframes wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}`}</style>
  </div>;
}
