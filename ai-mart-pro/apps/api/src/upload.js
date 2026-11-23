import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
let sharp = null;
try {
  const mod = await import('sharp');
  sharp = mod.default || mod;
} catch (e) {
  // Sharp native binary not available on this platform; fallback to buffer
}
import {fail} from './core.js';
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:5},fileFilter:(req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype))});
export const uploadFiles=upload.array('images',5);
export async function saveImage(file){
 if(!file)throw fail('No image uploaded');
 let bytes = file.buffer;
 let ext = file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/jpeg' ? '.jpg' : '.webp';
 if (sharp) {
   try {
     bytes = await sharp(file.buffer, {limitInputPixels:20_000_000}).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:82}).toBuffer();
     ext = '.webp';
   } catch {
     bytes = file.buffer;
   }
 }
 const name = crypto.randomUUID() + ext;
 if(process.env.S3_BUCKET){
   const {S3Client,PutObjectCommand} = await import('@aws-sdk/client-s3');
   const client=new S3Client({region:process.env.S3_REGION||'us-east-1',endpoint:process.env.S3_ENDPOINT||undefined,forcePathStyle:!!process.env.S3_ENDPOINT,credentials:process.env.S3_ACCESS_KEY_ID?{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY}:undefined});
   await client.send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:`products/${name}`,Body:bytes,ContentType:ext === '.png' ? 'image/png' : ext === '.jpg' ? 'image/jpeg' : 'image/webp'}));
   if(!process.env.S3_PUBLIC_URL)throw fail('S3_PUBLIC_URL must be configured',500);
   return `${process.env.S3_PUBLIC_URL.replace(/\/$/,'')}/products/${name}`;
 }
 // Local development fallback; production SRS requires object storage.
 const dir=path.resolve('uploads'); await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,name),bytes);
 return `${process.env.PUBLIC_API_URL||'http://localhost:4000'}/uploads/${name}`;
}
