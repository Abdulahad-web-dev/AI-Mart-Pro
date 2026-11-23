import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from './db.js';
export { db };
export const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
export const fail = (msg,status=400) => Object.assign(new Error(msg),{status});
export const safeUser = u => ({id:u.id,name:u.name,email:u.email,role:u.role,phone:u.phone,address:u.address,store:u.vendorProfile?.storeName});
export const userSchema = z.object({name:z.string().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(128),role:z.enum(['CUSTOMER','VENDOR']).default('CUSTOMER'),storeName:z.string().max(100).optional()});
export const signinSchema = z.object({email:z.string().email(),password:z.string().min(1)});
export function parse(schema,body){const r=schema.safeParse(body);if(!r.success)throw fail(r.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));return r.data}
export const hash = p=>bcrypt.hash(p,12);
export const checkHash = (p,h)=>bcrypt.compare(p,h);
export function sign(user){if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32) throw fail('Configure a long JWT_SECRET in the API .env',500);return jwt.sign({sub:user.id},process.env.JWT_SECRET,{expiresIn:'8h'})}
export const COOKIE_NAME='aimart_session';
export function putCookie(res,token){res.cookie(COOKIE_NAME,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:8*3600_000,path:'/'})}
export function clearCookie(res){res.clearCookie(COOKIE_NAME,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'})}
export async function auth(req,res,next){try{const token=req.cookies?.[COOKIE_NAME] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7):null);if(!token)throw fail('Please log in first',401);const data=jwt.verify(token,process.env.JWT_SECRET);const user=await db.user.findUnique({where:{id:data.sub},include:{vendorProfile:true}});if(!user||user.suspended)throw fail('Session expired or account unavailable',401);req.user=user;next()}catch(e){next(e.status?e:fail('Invalid or expired session',401))}}
export function role(...allowed){return(req,res,next)=>allowed.includes(req.user?.role)?next():next(fail('You do not have permission for this action',403))}
export const slugify = s=>(s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'item')+'-'+Math.random().toString(36).slice(2,7);
export function money(v){return Number(v)}
export function productOut(p){const reviews=(p.reviews||[]).filter(r=>r.status==='VISIBLE');return {...p,price:money(p.price),comparePrice:p.comparePrice==null?null:money(p.comparePrice),rating:reviews.length?Math.round(reviews.reduce((n,r)=>n+r.rating,0)/reviews.length*10)/10:0,reviewCount:reviews.length,reviews:reviews.map(r=>({...r,user:r.user?{name:r.user.name}:undefined}))}}
export const productInclude={category:true,images:{orderBy:{sortOrder:'asc'}},vendor:{select:{id:true,name:true,vendorProfile:{select:{storeName:true,city:true}}}},reviews:{include:{user:{select:{name:true}}}}};
export async function audit(actor,action,type,id,details={}){await db.auditLog.create({data:{actorId:actor,action,entityType:type,entityId:id,details}})}
