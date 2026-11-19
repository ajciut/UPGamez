const cors={ "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"GET,POST,OPTIONS", "Access-Control-Allow-Headers":"Content-Type,x-admin-password" };
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json"}})}
export default {async fetch(request,env){
 if(request.method==="OPTIONS")return new Response(null,{headers:cors});
 const url=new URL(request.url);if(!url.pathname.startsWith("/api/"))return json({ok:false,error:"Not found"},404);
 const path=url.pathname.replace("/api","");const admin=path.startsWith("/admin");
 if(admin){const supplied=request.headers.get("x-admin-password")||"";if(!env.ADMIN_PASSWORD||supplied!==env.ADMIN_PASSWORD)return json({ok:false,error:"Akses admin ditolak"},401)}
 if(!env.APPS_SCRIPT_URL||!env.API_SECRET)return json({ok:false,error:"Konfigurasi Worker belum lengkap"},500);
 let payload={};if(request.method==="POST"){try{payload=await request.json()}catch{return json({ok:false,error:"JSON tidak valid"},400)}}
 const actionMap={"/products":"products","/orders":"createOrder","/admin/dashboard":"adminDashboard","/admin/products":"adminProducts","/admin/orders":"adminOrders","/admin/settings":"adminSettings","/admin/product-save":"adminProductSave","/admin/product-delete":"adminProductDelete","/admin/order-status":"adminOrderStatus","/admin/settings-save":"adminSettingsSave"};
 const action=actionMap[path];if(!action)return json({ok:false,error:"Endpoint tidak ditemukan"},404);
 try{const upstream=await fetch(env.APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secret:env.API_SECRET,action,payload})});const data=await upstream.json();return json(data,data.ok?200:400)}catch(e){return json({ok:false,error:"Backend Apps Script tidak dapat dihubungi"},502)}
}};
