export function getCompared():string[]{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem('aimart_compare')||'[]')}catch{return []}}
export function toggleCompare(id:string){const items=getCompared();const next=items.includes(id)?items.filter(x=>x!==id):[...items,id].slice(-4);localStorage.setItem('aimart_compare',JSON.stringify(next));return next}
export function clearCompared(){if(typeof window!=='undefined')localStorage.removeItem('aimart_compare')}
