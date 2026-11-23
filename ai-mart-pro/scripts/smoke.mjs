// Non-destructive API smoke checks; all services and seed must be running.
const API=process.env.SMOKE_API||'http://localhost:4000';
async function request(path,method='GET',body,token=''){
 const r=await fetch(API+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Cookie:`aimart_session=${token}`}:{})},body:body?JSON.stringify(body):undefined});
 const obj=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`${method} ${path}: ${r.status} ${obj.error||'unknown'}`);return {obj,r};
}
const fail=m=>{console.error('FAIL:',m);process.exitCode=1};
const ok=m=>console.log('PASS:',m);
try{
 await request('/health');ok('API + PostgreSQL health');
 const categories=(await request('/api/categories')).obj;if(categories.length<2)throw Error('Missing seeded categories');ok('Categories');
 const products=(await request('/api/products?limit=3')).obj;if(products.products.length<3)throw Error('Missing seeded products');ok('Product list and pagination');
 const first=products.products[0];await request('/api/products/'+first.id);ok('Product details');
 const creds=[['CUSTOMER','customer@aimart.test'],['VENDOR','vendor@aimart.test'],['ADMIN','admin@aimart.test'],['DELIVERY','delivery@aimart.test']];
 const sessions={};for(const [role,email] of creds){const r=await request('/api/auth/login','POST',{email,password:'Demo12345!'});const cookie=r.r.headers.get('set-cookie')||'';const match=cookie.match(/aimart_session=([^;]+)/);if(!match)throw Error('No auth cookie for '+role);sessions[role]=match[1];ok(`${role} login + HTTP-only cookie`)}
 const vendorProducts=(await request('/api/vendor/products','GET',undefined,sessions.VENDOR)).obj;
 if(!vendorProducts.length)throw Error('No vendor products');ok('Vendor product ownership list');
 const analytics=(await request('/api/vendor/analytics','GET',undefined,sessions.VENDOR)).obj;if(!Number.isFinite(analytics.revenue))throw Error('Invalid analytics');ok('Vendor analytics');
 await request('/api/admin/overview','GET',undefined,sessions.ADMIN);ok('Admin dashboard');
 await request('/api/delivery/jobs','GET',undefined,sessions.DELIVERY);ok('Delivery assigned jobs');
 const rec=(await request('/api/ai/recommendations')).obj;if(!Array.isArray(rec.products))throw Error('Invalid recommendation list');ok('Recommended products and fallback');
 // Verify CUSTOMER cannot read vendor analytics.
 const denied=await fetch(API+'/api/vendor/analytics',{headers:{Cookie:`aimart_session=${sessions.CUSTOMER}`}});if(denied.status!==403)throw Error(`Role guard failed: ${denied.status}`);ok('Role-based access control');
 const forecast=(await request('/api/ai/sales-prediction?productId='+vendorProducts[0].id+'&horizon=7','GET',undefined,sessions.VENDOR)).obj;if(!forecast.is_estimate||!forecast.model_version)throw Error('Missing estimate metadata');ok('Protected AI forecast + version');
 const stock=(await request('/api/ai/inventory?productId='+vendorProducts[0].id,'GET',undefined,sessions.VENDOR)).obj;if(!stock.is_estimate)throw Error('Invalid inventory estimate');ok('Inventory guidance');
 const sentiment=(await request('/api/ai/sentiment','POST',{productId:vendorProducts[0].id},sessions.VENDOR)).obj;if(!sentiment.model_version)throw Error('Sentiment model version missing');ok('Review sentiment');
 console.log('\nSMOKE CHECKS COMPLETE. This script does NOT test checkout, image upload, production hosting or browser UI.');
}catch(e){fail(e.message)}
