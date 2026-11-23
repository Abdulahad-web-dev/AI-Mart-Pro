import 'dotenv/config';
import {PrismaClient} from '@prisma/client';import bcrypt from 'bcryptjs';
const db=new PrismaClient();
const people=[['Customer Demo','customer@aimart.test','CUSTOMER'],['Vendor Demo','vendor@aimart.test','VENDOR'],['Admin Demo','admin@aimart.test','ADMIN'],['Delivery Demo','delivery@aimart.test','DELIVERY']];
const categories=['Electronics','Fashion','Home & Living','Beauty','Sports','Books'];
const products=[
['Noise Cancelling Headphones','Electronics',18999,24999,24,'Premium wireless over-ear headphones with deep bass, clear calls and comfortable all-day wear.','🎧'],
['Pro Wireless Earbuds','Electronics',8999,12999,43,'Compact true wireless earbuds with charging case, crisp audio and everyday comfort.','🎵'],
['Smart Fitness Watch','Electronics',13999,16999,31,'Track your workouts, daily steps, heart rate and notifications in a lightweight smart watch.','⌚'],
['Mechanical Keyboard','Electronics',10999,14999,18,'Mechanical keyboard with tactile switches, backlighting and a sturdy desktop-friendly design.','⌨️'],
['Portable Bluetooth Speaker','Electronics',7499,9999,36,'Room-filling sound in a portable package with wireless connectivity and long battery life.','🔊'],
['Minimal Everyday Backpack','Fashion',4999,6999,23,'Smart everyday backpack with organized compartments and breathable padded straps.','🎒'],
['Classic Canvas Sneakers','Fashion',6499,8499,27,'Comfortable versatile sneakers with a clean silhouette for casual outfits.','👟'],
['Premium Cotton Hoodie','Fashion',3599,4999,47,'Relaxed-fit premium cotton blend hoodie built for everyday comfort and style.','🧥'],
['Modern Ceramic Table Lamp','Home & Living',7999,9999,12,'Sculptural ceramic lamp with warm light and understated minimalist styling.','💡'],
['Aroma Diffuser','Home & Living',5499,7499,29,'Quiet aroma diffuser with ambient glow to create a calm atmosphere at home.','🪔'],
['Insulated Travel Mug','Home & Living',2199,3299,65,'Leak-resistant insulated travel mug that keeps drinks at the ideal temperature.','☕'],
['Skin Care Essentials Kit','Beauty',6299,7999,19,'Daily skincare kit with gentle cleanser, moisturizer and serum for a simple routine.','🧴'],
['Hydrating Face Serum','Beauty',2999,3999,33,'Lightweight hydration-focused serum designed to layer easily into your routine.','✨'],
['Yoga & Exercise Mat','Sports',4299,5799,40,'Non-slip cushioned mat suitable for stretching, yoga and at-home exercises.','🧘'],
['Adjustable Dumbbell Set','Sports',11999,14999,9,'Space-saving adjustable dumbbell set for versatile strength training at home.','🏋️'],
['Stainless Steel Water Bottle','Sports',1999,2699,71,'Reusable insulated bottle with a secure lid for the gym, work or travel.','💧'],
['The Creative Habit','Books',1999,2499,28,'A practical paperback guide to building everyday routines for creative work.','📚'],
['Productivity Planner','Books',1599,2199,38,'Undated productivity planner with goal pages and structured weekly layouts.','📔']
];
async function main(){
 const passwordHash=await bcrypt.hash('Demo12345!',12);const users={};for(const [name,email,role] of people){users[role]=await db.user.upsert({where:{email},update:{},create:{name,email,role,passwordHash,...(role==='VENDOR'?{vendorProfile:{create:{storeName:'Northstar Collective',city:'Lahore',description:'Curated everyday essentials for modern living.'}}}:{})}})}
 const cats={};for(const name of categories){const slug=name.toLowerCase().replace(/[^a-z]+/g,'-').replace(/-$/,'');cats[name]=await db.category.upsert({where:{slug},update:{},create:{slug,name}})}
 const origin=process.env.SEED_IMAGE_ORIGIN||'http://localhost:3000';const seeded=[];
 for(let i=0;i<products.length;i++){const [name,cat,price,comparePrice,stock,description]=products[i];const slug='demo-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-');const p=await db.product.upsert({where:{slug},update:{},create:{slug,name,description,price,comparePrice,stock,categoryId:cats[cat].id,vendorId:users.VENDOR.id,featured:i<6,images:{create:[{url:`${origin}/images/${i}.${i<3?"jpg":"svg"}`,sortOrder:0}]}}});seeded.push(p)}
 if(!await db.order.count({where:{customerId:users.CUSTOMER.id}})){
   const statuses=['PLACED','CONFIRMED','PACKED','SHIPPED','DELIVERED'];const now=Date.now();
   for(let i=0;i<38;i++){const p=seeded[i%seeded.length],quantity=1+(i%3),day=i*2+1,status=i<4?statuses[i]: 'DELIVERED';const total=Number(p.price)*quantity;
    await db.order.create({data:{customerId:users.CUSTOMER.id,total,status,address:'Demo Street 12, Lahore, Pakistan',phone:'03001234567',paymentMethod:'COD',createdAt:new Date(now-day*86400000),items:{create:[{productId:p.id,vendorId:users.VENDOR.id,nameSnapshot:p.name,priceSnapshot:Number(p.price),quantity,status}]},payment:{create:{method:'COD',status:status==='DELIVERED'?'PAID':'PENDING',amount:total}}}})
   }
   await db.review.create({data:{userId:users.CUSTOMER.id,productId:seeded[0].id,rating:5,text:'Amazing quality and very comfortable. Battery life is excellent!'}});
   await db.review.create({data:{userId:users.CUSTOMER.id,productId:seeded[3].id,rating:4,text:'Good build quality, fast typing and nice design.'}});
 }
 console.log('Seed complete. Demo accounts: customer@aimart.test, vendor@aimart.test, admin@aimart.test, delivery@aimart.test / password Demo12345!');
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());
