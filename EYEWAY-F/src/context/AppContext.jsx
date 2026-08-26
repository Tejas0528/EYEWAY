import{createContext,useContext,useState}from"react";
import axios from"axios";
const API=axios.create({baseURL:"http://127.0.0.1:8000"});
API.interceptors.request.use(c=>{const t=localStorage.getItem("token");if(t)c.headers.Authorization=`Bearer ${t}`;return c;});
API.interceptors.response.use(r=>r,e=>{if(e.response?.status===401){localStorage.clear();window.location.href="/login";}return Promise.reject(e);});
export const authAPI={register:d=>API.post("/auth/register",d),login:d=>API.post("/auth/login",d),me:()=>API.get("/auth/me"),updateMe:d=>API.patch("/auth/me",d),users:()=>API.get("/auth/users"),officers:()=>API.get("/auth/officers"),toggle:id=>API.patch(`/auth/users/${id}/toggle`)};
export const complaintsAPI={create:d=>API.post("/complaints/complaint",d),mine:p=>API.get("/complaints/my-complaints",{params:p}),public:p=>API.get("/complaints/public-complaints",{params:p}),assigned:p=>API.get("/complaints/assigned-complaints",{params:p}),all:p=>API.get("/complaints/all-complaints",{params:p}),getOne:id=>API.get(`/complaints/complaint/${id}`),updateStatus:(id,d)=>API.put(`/complaints/update-status/${id}`,d),remove:id=>API.delete(`/complaints/complaint/${id}`)};
export const analyticsAPI={dashboard:()=>API.get("/analytics/"),officerStats:()=>API.get("/analytics/officer-stats")};
const Ctx=createContext();
export function AppProvider({children}){
  const[user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("user"));}catch{return null;}});
  const[toasts,setToasts]=useState([]);
  const[lang,setLang]=useState(()=>localStorage.getItem("eyeway_lang")||"en");
  const[theme,setTheme]=useState("dark");
  const login=(u,t)=>{localStorage.setItem("token",t);localStorage.setItem("user",JSON.stringify(u));setUser(u);};
  const logout=()=>{localStorage.clear();setUser(null);};
  const refreshUser=async()=>{try{const r=await authAPI.me();localStorage.setItem("user",JSON.stringify(r.data));setUser(r.data);}catch{}};
  const switchLang=l=>{setLang(l);localStorage.setItem("eyeway_lang",l);};
  const toggleTheme=()=>setTheme(t=>t==="dark"?"light":"dark");
  const toast=(msg,type="success")=>{const id=Date.now();setToasts(p=>[...p,{id,message:msg,type}]);setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),4000);};
  return<Ctx.Provider value={{user,login,logout,refreshUser,toast,toasts,lang,switchLang,theme,toggleTheme}}>{children}</Ctx.Provider>;
}
export const useApp=()=>useContext(Ctx);
