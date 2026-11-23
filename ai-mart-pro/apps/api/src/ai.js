import {fail} from './core.js';
export async function aiFetch(path,data){
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),12000);
  try {
    const response=await fetch(`${process.env.AI_SERVICE_URL||'http://localhost:8000'}${path}`,{method:'POST',headers:{'Content-Type':'application/json','X-AI-Key':process.env.AI_SERVICE_KEY||'replace_this_shared_secret'},body:JSON.stringify(data),signal:ctrl.signal});
    if(!response.ok)throw fail(`AI service unavailable (${response.status})`,503);
    return await response.json();
  }catch(e){throw fail('AI estimation is temporarily unavailable. The marketplace remains usable.',503)}
  finally{clearTimeout(timer)}
}
