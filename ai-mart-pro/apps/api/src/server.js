import 'dotenv/config';
import express from 'express';import cors from 'cors';import helmet from 'helmet';import cookieParser from 'cookie-parser';import { z } from 'zod';
import fs from 'node:fs';import path from 'node:path';
import {db,wrap,fail,auth,role,parse,userSchema,signinSchema,hash,checkHash,safeUser,sign,putCookie,clearCookie,slugify,productOut,productInclude,audit} from './core.js';
import {canAdvanceFulfilment,canAdvanceDelivery,overallFulfilment} from './logic.js';
import {aiFetch} from './ai.js';import {uploadFiles,saveImage} from './upload.js';import {analyzePublicURL} from './public-url.js';
import {executeNaturalLanguageSearch, getUnmetDemandSearches} from './search/index.js';
import {processNovaChat} from './nova/index.js';
import {generateVendorDailyBrief} from './brief/index.js';
const app=express();app.disable('x-powered-by');app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));app.use(cors({origin:(process.env.WEB_ORIGIN||'http://localhost:3000').split(','),credentials:true}));app.use(express.json({limit:'100kb'}));app.use(cookieParser());
const uploadPath=path.resolve('uploads');if(!fs.existsSync(uploadPath))fs.mkdirSync(uploadPath,{recursive:true});app.use('/uploads',express.static(uploadPath));
app.get('/health',wrap(async(req,res)=>{await db.$queryRaw`SELECT 1`;res.json({status:'ok',service:'api',time:new Date().toISOString()})}));
app.get('/api/categories',wrap(async(req,res)=>res.json(await db.category.findMany({orderBy:{name:'asc'}}))));
app.post('/api/auth/register',wrap(async(req,res)=>{const x=parse(userSchema,req.body);if(await db.user.findUnique({where:{email:x.email.toLowerCase()}}))throw fail('Email is already registered',409);const u=await db.user.create({data:{name:x.name,email:x.email.toLowerCase(),role:x.role,passwordHash:await hash(x.password),...(x.role==='VENDOR'?{vendorProfile:{create:{storeName:x.storeName||`${x.name}'s Store`}}}:{})},include:{vendorProfile:true}});putCookie(res,sign(u));res.status(201).json(safeUser(u))}));
app.post('/api/auth/login',wrap(async(req,res)=>{const x=parse(signinSchema,req.body);const u=await db.user.findUnique({where:{email:x.email.toLowerCase()},include:{vendorProfile:true}});if(!u||!(await checkHash(x.password,u.passwordHash))||u.suspended)throw fail('Invalid email/password or suspended account',401);putCookie(res,sign(u));res.json(safeUser(u))}));
app.post('/api/auth/logout',(req,res)=>{clearCookie(res);res.json({ok:true})});
app.get('/api/auth/me',auth,(req,res)=>res.json(safeUser(req.user)));
app.patch('/api/profile',auth,wrap(async(req,res)=>{const x=parse(z.object({name:z.string().min(2).max(80).optional(),phone:z.string().max(30).optional(),address:z.string().max(500).optional(),storeName:z.string().min(2).max(100).optional(),storeDescription:z.string().max(800).optional()}),req.body);const {storeName,storeDescription,...other}=x;const u=await db.user.update({where:{id:req.user.id},data:{...other,...(req.user.role==='VENDOR'&&(storeName||storeDescription)?{vendorProfile:{upsert:{create:{storeName:storeName||'My Store',description:storeDescription||''},update:{...(storeName?{storeName}:{}),...(storeDescription?{description:storeDescription}:{})}}}}:{})},include:{vendorProfile:true}});res.json(safeUser(u))}));
const number=(v,d)=>v===undefined?d:Number(v);
app.get('/api/products',wrap(async(req,res)=>{const {q,category,minPrice,maxPrice,sort='new',featured}=req.query;const page=Math.max(1,Math.trunc(number(req.query.page,1)||1));const limit=Math.min(250,Math.max(1,Math.trunc(number(req.query.limit,12)||12)));const where={active:true,moderation:'VISIBLE',...(category?{category:{slug:String(category)}}:{}),...(featured==='true'?{featured:true}:{}),...(q?{OR:[{name:{contains:String(q),mode:'insensitive'}},{description:{contains:String(q),mode:'insensitive'}}]}:{}),...((minPrice||maxPrice)?{price:{...(minPrice?{gte:Number(minPrice)}:{}),...(maxPrice?{lte:Number(maxPrice)}:{})}}:{})};const orderBy=sort==='price_asc'?{price:'asc'}:sort==='price_desc'?{price:'desc'}:{createdAt:'desc'};if(req.query.rating){const all=await db.product.findMany({where,include:productInclude,orderBy});const match=all.map(productOut).filter(p=>p.rating>=Number(req.query.rating));return res.json({products:match.slice((page-1)*limit,page*limit),total:match.length,page,pages:Math.ceil(match.length/limit)})}const [total,rows]=await db.$transaction([db.product.count({where}),db.product.findMany({where,include:productInclude,orderBy,skip:(page-1)*limit,take:limit})]);res.json({products:rows.map(productOut),total,page,pages:Math.ceil(total/limit)})}));
app.get('/api/products/:id',wrap(async(req,res)=>{const p=await db.product.findFirst({where:{OR:[{id:req.params.id},{slug:req.params.id}],active:true,moderation:'VISIBLE'},include:productInclude});if(!p)throw fail('Product not found',404);res.json(productOut(p))}));
const productInput=z.object({name:z.string().min(3).max(140),description:z.string().min(10).max(4000),categoryId:z.string().min(1),price:z.coerce.number().positive().max(100000000),comparePrice:z.coerce.number().nonnegative().optional().nullable(),stock:z.coerce.number().int().min(0).max(1000000),featured:z.boolean().optional()});
app.get('/api/vendor/products',auth,role('VENDOR'),wrap(async(req,res)=>res.json((await db.product.findMany({where:{vendorId:req.user.id},include:productInclude,orderBy:{createdAt:'desc'}})).map(productOut))));
app.post('/api/vendor/products',auth,role('VENDOR'),wrap(async(req,res)=>{const x=parse(productInput,req.body);const p=await db.product.create({data:{...x,featured:false,slug:slugify(x.name),vendorId:req.user.id},include:productInclude});await audit(req.user.id,'PRODUCT_CREATED','Product',p.id);res.status(201).json(productOut(p))}));
app.patch('/api/vendor/products/:id',auth,role('VENDOR'),wrap(async(req,res)=>{const p=await db.product.findUnique({where:{id:req.params.id}});if(!p||p.vendorId!==req.user.id)throw fail('Product not found or not owned',404);const x=parse(productInput.partial().extend({active:z.boolean().optional()}),req.body);const up=await db.product.update({where:{id:p.id},data:x,include:productInclude});await audit(req.user.id,'PRODUCT_UPDATED','Product',p.id);res.json(productOut(up))}));
app.post('/api/vendor/products/:id/images',auth,role('VENDOR'),uploadFiles,wrap(async(req,res)=>{const p=await db.product.findUnique({where:{id:req.params.id},include:{images:true}});if(!p||p.vendorId!==req.user.id)throw fail('Product not owned',404);if(!req.files?.length)throw fail('Choose JPEG, PNG or WebP files (max 5 MB)');if(p.images.length+req.files.length>8)throw fail('Maximum 8 images per product');const results=[];for(const f of req.files){const url=await saveImage(f);const im=await db.productImage.create({data:{productId:p.id,url,sortOrder:p.images.length+results.length}});results.push(im)}res.status(201).json(results)}));
app.delete('/api/vendor/products/:id/images/:imageId',auth,role('VENDOR'),wrap(async(req,res)=>{const p=await db.product.findUnique({where:{id:req.params.id}});if(!p||p.vendorId!==req.user.id)throw fail('Not found',404);await db.productImage.deleteMany({where:{id:req.params.imageId,productId:p.id}});res.json({ok:true})}));
app.get('/api/cart',auth,role('CUSTOMER'),wrap(async(req,res)=>{const items=await db.cartItem.findMany({where:{userId:req.user.id},include:{product:{include:productInclude}}});res.json(items.map(i=>({...i,product:productOut(i.product)})))}));
app.post('/api/cart/items',auth,role('CUSTOMER'),wrap(async(req,res)=>{const x=parse(z.object({productId:z.string(),quantity:z.coerce.number().int().min(1).max(100)}),req.body);const p=await db.product.findFirst({where:{id:x.productId,active:true,moderation:'VISIBLE'}});if(!p||p.stock<x.quantity)throw fail('Product unavailable or insufficient stock',409);const old=await db.cartItem.findUnique({where:{userId_productId:{userId:req.user.id,productId:x.productId}}});const qty=(old?.quantity||0)+x.quantity;if(qty>p.stock)throw fail('Cart quantity exceeds stock',409);const item=await db.cartItem.upsert({where:{userId_productId:{userId:req.user.id,productId:x.productId}},create:{userId:req.user.id,...x},update:{quantity:qty}});res.status(201).json(item)}));
app.patch('/api/cart/items/:id',auth,role('CUSTOMER'),wrap(async(req,res)=>{const {quantity}=parse(z.object({quantity:z.coerce.number().int().min(1).max(100)}),req.body);const old=await db.cartItem.findFirst({where:{id:req.params.id,userId:req.user.id},include:{product:true}});if(!old)throw fail('Cart item not found',404);if(quantity>old.product.stock)throw fail('Not enough stock',409);res.json(await db.cartItem.update({where:{id:old.id},data:{quantity}}))}));
app.delete('/api/cart/items/:id',auth,role('CUSTOMER'),wrap(async(req,res)=>{await db.cartItem.deleteMany({where:{id:req.params.id,userId:req.user.id}});res.json({ok:true})}));
app.get('/api/wishlist',auth,role('CUSTOMER'),wrap(async(req,res)=>res.json((await db.wishlistItem.findMany({where:{userId:req.user.id},include:{product:{include:productInclude}}})).map(w=>productOut(w.product)))));
app.post('/api/wishlist/:id',auth,role('CUSTOMER'),wrap(async(req,res)=>{const x={userId:req.user.id,productId:req.params.id};if(!await db.product.findUnique({where:{id:x.productId}}))throw fail('Product not found',404);await db.wishlistItem.upsert({where:{userId_productId:x},create:x,update:{}});res.json({ok:true})}));
app.delete('/api/wishlist/:id',auth,role('CUSTOMER'),wrap(async(req,res)=>{await db.wishlistItem.deleteMany({where:{userId:req.user.id,productId:req.params.id}});res.json({ok:true})}));
const orderInclude={items:{include:{product:{include:{images:{take:1,orderBy:{sortOrder:'asc'}}}}}},delivery:{include:{agent:{select:{id:true,name:true,phone:true}}}},payment:true,customer:{select:{name:true,email:true}}};
function orderOut(o){return {...o,total:Number(o.total),items:o.items?.map(i=>({...i,priceSnapshot:Number(i.priceSnapshot)})),payment:o.payment?{...o.payment,amount:Number(o.payment.amount)}:null}}
app.post('/api/orders',auth,role('CUSTOMER'),wrap(async(req,res)=>{const x=parse(z.object({address:z.string().min(8).max(500),phone:z.string().min(7).max(30),paymentMethod:z.enum(['COD','BANK_TRANSFER']).default('COD')}),req.body);
 const order=await db.$transaction(async tx=>{const cart=await tx.cartItem.findMany({where:{userId:req.user.id},include:{product:true}});if(!cart.length)throw fail('Cart is empty',400);let total=0;const rows=[];for(const i of cart){const p=i.product;if(!p.active||p.moderation!=='VISIBLE')throw fail(`${p.name} unavailable`,409);const upd=await tx.product.updateMany({where:{id:p.id,stock:{gte:i.quantity}},data:{stock:{decrement:i.quantity}}});if(upd.count!==1)throw fail(`Not enough stock for ${p.name}`,409);const price=Number(p.price);total+=price*i.quantity;rows.push({productId:p.id,vendorId:p.vendorId,nameSnapshot:p.name,priceSnapshot:price,quantity:i.quantity})}
 const newOrder=await tx.order.create({data:{customerId:req.user.id,total,status:'PLACED',address:x.address,phone:x.phone,paymentMethod:x.paymentMethod,items:{create:rows},payment:{create:{method:x.paymentMethod,status:'PENDING',amount:total}}}});await tx.cartItem.deleteMany({where:{userId:req.user.id}});return newOrder});res.status(201).json(orderOut(await db.order.findUnique({where:{id:order.id},include:orderInclude})))
}));
app.get('/api/orders/my',auth,role('CUSTOMER'),wrap(async(req,res)=>res.json((await db.order.findMany({where:{customerId:req.user.id},include:orderInclude,orderBy:{createdAt:'desc'}})).map(orderOut))));
app.get('/api/vendor/orders',auth,role('VENDOR'),wrap(async(req,res)=>res.json((await db.order.findMany({where:{items:{some:{vendorId:req.user.id}}},include:orderInclude,orderBy:{createdAt:'desc'}})).map(o=>orderOut({...o,items:o.items.filter(i=>i.vendorId===req.user.id)})))));
app.patch('/api/vendor/order-items/:id',auth,role('VENDOR'),wrap(async(req,res)=>{const {status}=parse(z.object({status:z.enum(['CONFIRMED','PACKED','SHIPPED'])}),req.body);const item=await db.orderItem.findFirst({where:{id:req.params.id,vendorId:req.user.id}});if(!item)throw fail('Order item not found',404);if(!canAdvanceFulfilment(item.status,status))throw fail('Invalid fulfilment transition');await db.$transaction(async tx=>{await tx.orderItem.update({where:{id:item.id},data:{status}});const siblings=await tx.orderItem.findMany({where:{orderId:item.orderId},select:{status:true}});const orderStatus=overallFulfilment(siblings);await tx.order.update({where:{id:item.orderId},data:{status:orderStatus}})});await audit(req.user.id,'FULFILLMENT_UPDATED','OrderItem',item.id,{status});res.json({ok:true})}));
app.get('/api/products/:id/reviews',wrap(async(req,res)=>res.json(await db.review.findMany({where:{productId:req.params.id,status:'VISIBLE'},include:{user:{select:{name:true}}},orderBy:{createdAt:'desc'}}))));
app.post('/api/products/:id/reviews',auth,role('CUSTOMER'),wrap(async(req,res)=>{const x=parse(z.object({rating:z.coerce.number().int().min(1).max(5),text:z.string().min(5).max(1200)}),req.body);const purchased=await db.orderItem.count({where:{productId:req.params.id,order:{customerId:req.user.id,status:{not:'CANCELLED'}}}});if(!purchased)throw fail('Only customers who purchased the product can review it',403);const r=await db.review.upsert({where:{productId_userId:{productId:req.params.id,userId:req.user.id}},create:{...x,productId:req.params.id,userId:req.user.id},update:{rating:x.rating,text:x.text,status:'VISIBLE'}});res.json(r)}));
app.post('/api/reports',auth,wrap(async(req,res)=>{const x=parse(z.object({productId:z.string().optional(),reviewId:z.string().optional(),reason:z.string().min(5).max(500)}).refine(o=>o.productId||o.reviewId),req.body);const r=await db.report.create({data:{...x,userId:req.user.id}});res.status(201).json(r)}));
// Delivery role: only assigned deliveries and limited delivery details.
app.get('/api/delivery/jobs',auth,role('DELIVERY'),wrap(async(req,res)=>{const jobs=await db.delivery.findMany({where:{agentId:req.user.id},include:{order:{select:{id:true,address:true,phone:true,status:true,createdAt:true,items:{select:{nameSnapshot:true,quantity:true}}}}},orderBy:{updatedAt:'desc'}});res.json(jobs)}));
app.patch('/api/delivery/jobs/:id',auth,role('DELIVERY'),wrap(async(req,res)=>{const x=parse(z.object({status:z.enum(['PICKED_UP','IN_TRANSIT','DELIVERED','FAILED']),notes:z.string().max(500).optional()}),req.body);const d=await db.delivery.findFirst({where:{id:req.params.id,agentId:req.user.id}});if(!d)throw fail('Delivery not assigned to you',404);if(!canAdvanceDelivery(d.status,x.status))throw fail('Invalid delivery status transition');await db.$transaction(async tx=>{await tx.delivery.update({where:{id:d.id},data:x});if(x.status==='DELIVERED'){await tx.order.update({where:{id:d.orderId},data:{status:'DELIVERED'}});await tx.orderItem.updateMany({where:{orderId:d.orderId},data:{status:'DELIVERED'}})}});await audit(req.user.id,'DELIVERY_UPDATED','Delivery',d.id,{status:x.status});res.json({ok:true})}));
// Admin routes
app.get('/api/admin/overview',auth,role('ADMIN'),wrap(async(req,res)=>{const [users,products,orders,reports,revenue]=await Promise.all([db.user.count(),db.product.count(),db.order.count(),db.report.count({where:{status:'OPEN'}}),db.order.aggregate({where:{status:{not:'CANCELLED'}},_sum:{total:true}})]);res.json({users,products,orders,reports,revenue:Number(revenue._sum.total||0)})}));
app.get('/api/admin/users',auth,role('ADMIN'),wrap(async(req,res)=>res.json((await db.user.findMany({select:{id:true,name:true,email:true,role:true,suspended:true,createdAt:true},orderBy:{createdAt:'desc'}})))));
app.patch('/api/admin/users/:id',auth,role('ADMIN'),wrap(async(req,res)=>{const x=parse(z.object({suspended:z.boolean().optional(),role:z.enum(['CUSTOMER','VENDOR','ADMIN','DELIVERY']).optional()}),req.body);if(req.params.id===req.user.id)throw fail('Cannot change your own account',400);const u=await db.user.update({where:{id:req.params.id},data:x});await audit(req.user.id,'USER_UPDATED','User',u.id,x);res.json({id:u.id,role:u.role,suspended:u.suspended})}));
app.post('/api/admin/categories',auth,role('ADMIN'),wrap(async(req,res)=>{const x=parse(z.object({name:z.string().min(2).max(60)}),req.body);res.status(201).json(await db.category.create({data:{name:x.name,slug:slugify(x.name)}}))}));
app.get('/api/admin/reports',auth,role('ADMIN'),wrap(async(req,res)=>res.json(await db.report.findMany({include:{user:{select:{name:true}},product:{select:{name:true}},},orderBy:{createdAt:'desc'}}))));
app.patch('/api/admin/reports/:id',auth,role('ADMIN'),wrap(async(req,res)=>{const x=parse(z.object({status:z.enum(['RESOLVED','DISMISSED']),moderation:z.enum(['VISIBLE','HIDDEN','REMOVED']).optional()}),req.body);const old=await db.report.findUnique({where:{id:req.params.id}});if(!old)throw fail('Report not found',404);await db.$transaction(async tx=>{await tx.report.update({where:{id:old.id},data:{status:x.status}});if(x.moderation&&old.productId)await tx.product.update({where:{id:old.productId},data:{moderation:x.moderation}});if(x.moderation&&old.reviewId)await tx.review.update({where:{id:old.reviewId},data:{status:x.moderation}})});await audit(req.user.id,'REPORT_MODERATED','Report',old.id,x);res.json({ok:true})}));
app.get('/api/admin/orders',auth,role('ADMIN'),wrap(async(req,res)=>res.json((await db.order.findMany({include:orderInclude,orderBy:{createdAt:'desc'},take:150})).map(orderOut))));
app.post('/api/admin/deliveries',auth,role('ADMIN'),wrap(async(req,res)=>{const x=parse(z.object({orderId:z.string(),agentId:z.string()}),req.body);const agent=await db.user.findFirst({where:{id:x.agentId,role:'DELIVERY',suspended:false}});if(!agent)throw fail('Delivery agent unavailable');const order=await db.order.findUnique({where:{id:x.orderId}});if(!order)throw fail('Order not found',404);const delivery=await db.delivery.upsert({where:{orderId:x.orderId},create:{orderId:x.orderId,agentId:x.agentId},update:{agentId:x.agentId,status:'ASSIGNED'}});await audit(req.user.id,'DELIVERY_ASSIGNED','Delivery',delivery.id);res.json(delivery)}));
app.get('/api/admin/audit',auth,role('ADMIN'),wrap(async(req,res)=>res.json(await db.auditLog.findMany({orderBy:{createdAt:'desc'},take:50}))));
app.get('/api/vendor/analytics',auth,role('VENDOR'),wrap(async(req,res)=>{const items=await db.orderItem.findMany({where:{vendorId:req.user.id,order:{status:{not:'CANCELLED'}}},include:{order:{select:{createdAt:true}}}});const products=await db.product.findMany({where:{vendorId:req.user.id},select:{id:true,name:true,stock:true}});const chart={};for(const i of items){const day=i.order.createdAt.toISOString().slice(0,10);chart[day]=(chart[day]||0)+Number(i.priceSnapshot)*i.quantity}const lowStock=products.filter(p=>p.stock<=5);res.json({revenue:items.reduce((s,i)=>s+Number(i.priceSnapshot)*i.quantity,0),units:items.reduce((s,i)=>s+i.quantity,0),products:products.length,lowStock,chart:Object.entries(chart).sort().map(([date,revenue])=>({date,revenue})),topProducts:products.map(p=>({...p,units:items.filter(i=>i.productId===p.id).reduce((s,i)=>s+i.quantity,0)})).sort((a,b)=>b.units-a.units).slice(0,6)})}));
// AI endpoints: protected gateway; Python service not called directly by browser.
app.get('/api/ai/sales-prediction',auth,role('VENDOR'),wrap(async(req,res)=>{const p=await db.product.findFirst({where:{id:String(req.query.productId||''),vendorId:req.user.id}});if(!p)throw fail('Product not owned',404);const horizon=Math.min(90,Math.max(7,Number(req.query.horizon)||30));const items=await db.orderItem.findMany({where:{productId:p.id,order:{status:{not:'CANCELLED'}}},include:{order:{select:{createdAt:true}}}});const history=items.map(i=>({date:i.order.createdAt.toISOString().slice(0,10),units:i.quantity}));const prediction=await aiFetch('/forecast',{product_id:p.id,horizon,price:Number(p.price),history});const record=await db.predictionRecord.create({data:{userId:req.user.id,productId:p.id,horizon,predictedUnits:prediction.predicted_units,version:prediction.model_version,metadata:prediction}});res.json({...prediction,record_id:record.id,current_stock:p.stock})}));
app.get('/api/ai/predictions',auth,role('VENDOR'),wrap(async(req,res)=>res.json(await db.predictionRecord.findMany({where:{userId:req.user.id},orderBy:{createdAt:'desc'},take:25,include:{product:{select:{name:true}}}}))));
app.get('/api/ai/inventory',auth,role('VENDOR'),wrap(async(req,res)=>{const p=await db.product.findFirst({where:{id:String(req.query.productId||''),vendorId:req.user.id}});if(!p)throw fail('Product not owned',404);const latest=await db.predictionRecord.findFirst({where:{productId:p.id,userId:req.user.id},orderBy:{createdAt:'desc'}});if(!latest)throw fail('Please generate a sales forecast first');const days=Math.min(60,Math.max(1,Number(req.query.leadTime)||7));const result=await aiFetch('/inventory',{predicted_units:latest.predictedUnits,horizon:latest.horizon,current_stock:p.stock,lead_time_days:days,safety_days:3});res.json(result)}));
app.get('/api/ai/recommendations',wrap(async(req,res)=>{const id=String(req.query.productId||'');const base=id?await db.product.findUnique({where:{id}}):null;const products=await db.product.findMany({where:{active:true,moderation:'VISIBLE',...(base?{id:{not:base.id}}:{})},take:40,include:productInclude});if(!products.length)return res.json({products:[],items:[],bundleOffer:null,method:'empty'});let coCounts={};if(base){try{const coItems=await db.orderItem.findMany({where:{order:{items:{some:{productId:base.id}},status:{not:'CANCELLED'}},productId:{not:base.id}},select:{productId:true}});for(const item of coItems){coCounts[item.productId]=(coCounts[item.productId]||0)+1}}catch{}}try{const ranked=await aiFetch('/recommend',{base:base?{id:base.id,name:base.name,category_id:base.categoryId,price:Number(base.price)}:null,products:products.map(p=>({id:p.id,name:p.name,category_id:p.categoryId,price:Number(p.price)})),co_counts:coCounts});const items=ranked.ids.map((pid,idx)=>{const prod=products.find(p=>p.id===pid);if(!prod)return null;return {product:productOut(prod),reason:ranked.reasons?.[idx]||'Recommended match',matchScore:ranked.match_scores?.[idx]||85.0}}).filter(Boolean).slice(0,8);let bundleOffer=null;if(base&&items.length>=2){const bItems=[productOut(base),items[0].product,items[1].product];const regularTotal=bItems.reduce((acc,it)=>acc+Number(it.price),0);const discountPct=15;const bundlePrice=Math.round(regularTotal*(1-discountPct/100));bundleOffer={items:bItems,regularPrice:regularTotal,bundlePrice,savingsPkr:regularTotal-bundlePrice,discountPct}}res.json({products:items.map(it=>it.product),items,bundleOffer,method:ranked.method,is_estimate:true})}catch{const fallbackItems=products.slice(0,8).map(p=>({product:productOut(p),reason:'Popular in catalog',matchScore:80.0}));res.json({products:fallbackItems.map(it=>it.product),items:fallbackItems,bundleOffer:null,method:'popular-fallback',is_estimate:true})}}));
app.post('/api/ai/sentiment',auth,role('VENDOR'),wrap(async(req,res)=>{const {productId}=parse(z.object({productId:z.string()}),req.body);const p=await db.product.findFirst({where:{id:productId,vendorId:req.user.id}});if(!p)throw fail('Product not owned',404);const reviews=await db.review.findMany({where:{productId:p.id,status:'VISIBLE'},select:{text:true,rating:true}});res.json(await aiFetch('/sentiment',{reviews}))}));
app.post('/api/ai/live-forecast',wrap(async(req,res)=>{const x=parse(z.object({productId:z.string().optional(),horizon:z.coerce.number().int().min(7).max(90).default(30),price:z.coerce.number().nonnegative().optional()}),req.body);const p=x.productId?await db.product.findFirst({where:{id:x.productId}}):null;const price=x.price!==undefined?Number(x.price):(p?Number(p.price):18999);const items=p?await db.orderItem.findMany({where:{productId:p.id},include:{order:{select:{createdAt:true}}}}):[];const history=items.map(i=>({date:i.order.createdAt.toISOString().slice(0,10),units:i.quantity}));const prediction=await aiFetch('/forecast',{product_id:p?.id||'demo-preview',horizon:x.horizon,price,history});res.json({...prediction,product_name:p?.name||'Interactive Simulation',current_stock:p?.stock??24})}));
app.post('/api/ai/live-sentiment',wrap(async(req,res)=>{const x=parse(z.object({text:z.string().min(1).max(3000),rating:z.coerce.number().int().min(1).max(5).default(5)}),req.body);const result=await aiFetch('/sentiment',{reviews:[{text:x.text,rating:x.rating}]});res.json(result)}));
app.get('/api/ai/status',wrap(async(req,res)=>{const t0=Date.now();try{const r=await fetch((process.env.AI_SERVICE_URL||'http://localhost:8000')+'/health',{signal:AbortSignal.timeout(4000)});const h=await r.json();res.json({online:true,latencyMs:Date.now()-t0,salesModelLoaded:!!h.sales_model_loaded,sentimentModelLoaded:!!h.sentiment_model_loaded})}catch{res.json({online:false,latencyMs:null,salesModelLoaded:false,sentimentModelLoaded:false})}}));
app.post('/api/ai/live-inventory',wrap(async(req,res)=>{const x=parse(z.object({predicted_units:z.coerce.number().nonnegative(),horizon:z.coerce.number().int().min(1).max(365),current_stock:z.coerce.number().int().nonnegative(),lead_time_days:z.coerce.number().int().min(1).max(120),safety_days:z.coerce.number().int().min(0).max(60).default(3)}),req.body);res.json(await aiFetch('/inventory',x))}));
app.post('/api/ai/product-analysis',wrap(async(req,res)=>{const {url}=parse(z.object({url:z.string().url().max(1500)}),req.body);res.json(await analyzePublicURL(url))}));
app.get('/api/admin/agents',auth,role('ADMIN'),wrap(async(req,res)=>res.json(await db.user.findMany({where:{role:'DELIVERY',suspended:false},select:{id:true,name:true}}))));

// Natural-Language Search & Autocomplete
app.get('/api/search', wrap(async (req, res) => {
  const query = String(req.query.q || '');
  const products = await db.product.findMany({
    where: { active: true },
    include: productInclude
  });
  const categories = await db.category.findMany();
  res.json(executeNaturalLanguageSearch({
    query,
    products: products.map(productOut),
    categories,
    userId: req.user?.id || null
  }));
}));

app.get('/api/search/suggestions', wrap(async (req, res) => {
  const prefix = String(req.query.q || '').toLowerCase().trim();
  const products = await db.product.findMany({ where: { active: true }, take: 80, select: { name: true, category: { select: { name: true } } } });
  const suggestions = new Set();
  for (const p of products) {
    if (p.name.toLowerCase().includes(prefix)) suggestions.add(p.name);
    if (p.category?.name.toLowerCase().includes(prefix)) suggestions.add(p.category.name);
  }
  res.json(Array.from(suggestions).slice(0, 8));
}));

// Server-side Nova AI Commerce Copilot with Tool Calling
app.post('/api/nova/chat', wrap(async (req, res) => {
  const { message, history } = parse(z.object({
    message: z.string().min(1).max(2000),
    history: z.array(z.any()).optional()
  }), req.body);
  const result = await processNovaChat({
    message,
    history,
    user: req.user || null,
    db
  });
  res.json(result);
}));

// Vendor Daily Brief & Unmet Demand
app.get('/api/vendor/daily-brief', auth, role('VENDOR'), wrap(async (req, res) => {
  res.json(await generateVendorDailyBrief({ vendorId: req.user.id, db }));
}));

app.get('/api/vendor/unmet-demand', auth, role('VENDOR'), wrap(async (req, res) => {
  res.json(getUnmetDemandSearches(10));
}));

// Live What-If Price Scenario Analysis
app.post('/api/ai/live-whatif', wrap(async (req, res) => {
  const x = parse(z.object({
    productId: z.string().optional(),
    horizon: z.coerce.number().int().min(7).max(90).default(30),
    basePrice: z.coerce.number().positive(),
    scenarioPrice: z.coerce.number().positive(),
    baseDiscount: z.coerce.number().min(0).max(0.9).default(0),
    scenarioDiscount: z.coerce.number().min(0).max(0.9).default(0),
    currentStock: z.coerce.number().int().nonnegative().default(25)
  }), req.body);
  const p = x.productId ? await db.product.findFirst({ where: { id: x.productId } }) : null;
  const items = p ? await db.orderItem.findMany({ where: { productId: p.id, order: { status: { not: 'CANCELLED' } } }, include: { order: { select: { createdAt: true } } } }) : [];
  const history = items.map(i => ({ date: i.order.createdAt.toISOString().slice(0, 10), units: i.quantity }));
  const result = await aiFetch('/forecast/whatif', {
    product_id: p?.id || 'demo-preview',
    horizon: x.horizon,
    base_price: x.basePrice,
    scenario_price: x.scenarioPrice,
    base_discount_pct: x.baseDiscount,
    scenario_discount_pct: x.scenarioDiscount,
    current_stock: x.currentStock,
    history
  });
  res.json(result);
}));

// Sentiment Summary with Aspect Breakdown & Grounded Pros/Cons
app.get('/api/ai/sentiment/summary', wrap(async (req, res) => {
  const productId = String(req.query.productId || '');
  const reviews = await db.review.findMany({
    where: { ...(productId ? { productId } : {}), status: 'VISIBLE' },
    select: { text: true, rating: true, createdAt: true },
    take: 100
  });
  if (!reviews.length) {
    return res.json({
      distribution: { positive: 0, neutral: 0, negative: 0 },
      aspect_scores: {},
      pros_summary: 'No verified reviews submitted yet.',
      cons_summary: 'No critical complaints reported.',
      recurring_concerns: [],
      model_version: 'sentiment-multilingual-v2',
      is_estimate: true
    });
  }
  const result = await aiFetch('/sentiment', { reviews });
  res.json(result);
}));

// Model Registry Listing
app.get('/api/ai/models', wrap(async (req, res) => {
  const r = await fetch((process.env.AI_SERVICE_URL || 'http://localhost:8000') + '/models');
  res.json(await r.json());
}));

// Marketplace Public Stats & Contact Endpoints
app.get('/api/stats', wrap(async (req, res) => {
  try {
    const [vendors, products, orders, customers] = await Promise.all([
      db.user.count({ where: { role: 'VENDOR' } }),
      db.product.count({ where: { active: true } }),
      db.order.count(),
      db.user.count({ where: { role: 'CUSTOMER' } })
    ]);
    const hasData = vendors > 0 || products > 0;
    res.json({
      vendors: vendors > 0 ? vendors : 1250,
      products: products > 0 ? products : 45000,
      cities: 120,
      customers: customers > 0 ? customers : 250000,
      isSample: !hasData
    });
  } catch {
    res.json({
      vendors: 1250,
      products: 45000,
      cities: 120,
      customers: 250000,
      isSample: true
    });
  }
}));

app.post('/api/contact', wrap(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().min(7, 'Phone must be at least 7 characters').max(25),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000)
  });
  const data = parse(schema, req.body);
  console.log('[Contact Message Received]:', data);
  res.json({ ok: true, message: 'Message sent successfully' });
}));
app.use((req,res)=>res.status(404).json({error:'Endpoint not found'}));
app.use((err,req,res,next)=>{if(err.code==='P2002')return res.status(409).json({error:'A record with that value already exists'});if(err.code==='P2025')return res.status(404).json({error:'Record not found'});if(err.code==='LIMIT_FILE_SIZE')return res.status(413).json({error:'Image must be at most 5 MB'});if(err.status)return res.status(err.status).json({error:err.message});console.error('API error:',err.name,err.message);res.status(500).json({error:'Internal server error'})});
const port=Number(process.env.PORT||4000);app.listen(port,()=>console.log(`AI Mart Pro API listening on http://localhost:${port}`));
