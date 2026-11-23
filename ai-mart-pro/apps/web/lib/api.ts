export const API_URL=process.env.NEXT_PUBLIC_API_URL||'/backend';
export type Role='CUSTOMER'|'VENDOR'|'ADMIN'|'DELIVERY';
export type User={id:string;name:string;email:string;role:Role;phone?:string;address?:string;store?:string};
export type Category={id:string;name:string;slug:string};
export type Product={id:string;name:string;slug:string;description:string;price:number;comparePrice:number|null;stock:number;featured:boolean;active:boolean;rating:number;reviewCount:number;category:Category;categoryId:string;vendorId:string;vendor?:{id:string;name:string;vendorProfile?:{storeName:string;city:string}};images:{id:string;url:string;sortOrder:number}[];reviews?:Review[];moderation?:string;createdAt?:string;updatedAt?:string};
export type Review={id:string;rating:number;text:string;user?:{name:string};createdAt:string};
export type CartItem={id:string;quantity:number;product:Product};
export type OrderItem={id:string;nameSnapshot:string;priceSnapshot:number;quantity:number;status:string;vendorId:string;productId:string;product?:{images:{url:string}[]}};
export type Order={id:string;total:number;status:string;createdAt:string;address:string;phone:string;paymentMethod:string;items:OrderItem[];payment?:{status:string;method:string};customer?:{name:string;email:string};delivery?:{id:string;status:string;agent?:{name:string}}};
export async function api<T=any>(path:string,opts:RequestInit={}):Promise<T>{
  const headers=new Headers(opts.headers);
  if(opts.body && !(opts.body instanceof FormData))headers.set('Content-Type','application/json');
  let response:Response;
  try{response=await fetch(`${API_URL}${path}`,{...opts,headers,credentials:'include',cache:'no-store'})}
  catch{throw new Error('Cannot connect to API. Start the backend at localhost:4000.')}
  let data:any=null;try{data=await response.json()}catch{}
  if(!response.ok)throw new Error(data?.error||`Request failed (${response.status})`);
  return data as T;
}
export const post=<T=any>(url:string,obj:unknown)=>api<T>(url,{method:'POST',body:JSON.stringify(obj)});
export const patch=<T=any>(url:string,obj:unknown)=>api<T>(url,{method:'PATCH',body:JSON.stringify(obj)});
export const del=<T=any>(url:string)=>api<T>(url,{method:'DELETE'});
export const money=(n:number|string)=>'Rs. '+Number(n||0).toLocaleString('en-PK',{maximumFractionDigits:0});
export const shortDate=(d:string)=>new Date(d).toLocaleDateString('en-PK',{month:'short',day:'numeric',year:'numeric'});
export const initials=(n:string)=>n.trim().split(/\s+/).slice(0,2).map(s=>s[0]?.toUpperCase()).join('');
export const imageSrc=(p:Product)=>p?.images?.[0]?.url||'/images/0.jpg';
