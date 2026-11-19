const SHEETS = {Products:'Products',Orders:'Orders',Settings:'Settings'};
function doGet(){return ContentService.createTextOutput('UPGamez API aktif.').setMimeType(ContentService.MimeType.TEXT)}
function doPost(e){
  try{
    const req=JSON.parse(e.postData.contents||'{}');
    if(!req.secret || req.secret!==PropertiesService.getScriptProperties().getProperty('API_SECRET'))return output({ok:false,error:'Unauthorized'});
    const p=req.payload||{};let result;
    switch(req.action){
      case 'products': result={ok:true,products:readRows_('Products').filter(x=>String(x.active)!=='false')};break;
      case 'createOrder': result=createOrder_(p);break;
      case 'adminDashboard': result=dashboard_();break;
      case 'adminProducts': result={ok:true,products:readRows_('Products')};break;
      case 'adminOrders': result={ok:true,orders:readRows_('Orders').reverse()};break;
      case 'adminSettings': result={ok:true,settings:settings_()};break;
      case 'adminProductSave': result=saveProduct_(p);break;
      case 'adminProductDelete': result=deleteProduct_(p.id);break;
      case 'adminOrderStatus': result=updateOrder_(p);break;
      case 'adminSettingsSave': result=saveSettings_(p);break;
      default: result={ok:false,error:'Action tidak dikenal'};
    }
    return output(result);
  }catch(err){return output({ok:false,error:String(err.message||err)})}
}
function output(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
function ss_(){const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw new Error('SPREADSHEET_ID belum disetel');return SpreadsheetApp.openById(id)}
function setupDatabase(){
 const ss=ss_();const defs={
  Products:['id','name','game','price','description','active'],
  Orders:['id','createdAt','productId','productName','price','playerId','serverId','phone','name','status'],
  Settings:['key','value']
 };
 Object.keys(defs).forEach(name=>{let sh=ss.getSheetByName(name)||ss.insertSheet(name);if(sh.getLastRow()===0)sh.appendRow(defs[name])});
 const sh=ss.getSheetByName('Products');if(sh.getLastRow()===1){sh.appendRow(['ml-86','Mobile Legends 86 Diamonds','Mobile Legends',20000,'Top up Mobile Legends',true]);sh.appendRow(['ff-70','Free Fire 70 Diamonds','Free Fire',10000,'Top up Free Fire',true]);sh.appendRow(['pubg-60','PUBG Mobile 60 UC','PUBG Mobile',15000,'Top up PUBG Mobile',true])}
 const st=ss.getSheetByName('Settings');if(st.getLastRow()===1)st.appendRow(['paymentMethod','Transfer Bank / QRIS']);st.appendRow(['paymentInstructions','Hubungi admin untuk instruksi pembayaran']);st.appendRow(['paymentName','UPGamez']);
}
function readRows_(name){const sh=ss_().getSheetByName(name);if(!sh||sh.getLastRow()<2)return[];const v=sh.getDataRange().getValues();const h=v.shift();return v.filter(r=>r.some(x=>x!=='')).map(r=>{let o={};h.forEach((k,i)=>o[k]=r[i]);return o})}
function createOrder_(p){const product=readRows_('Products').find(x=>String(x.id)===String(p.productId)&&String(x.active)!=='false');if(!product)throw new Error('Produk tidak ditemukan');if(!p.playerId||!p.phone||!p.name)throw new Error('Data pesanan belum lengkap');const id='UG'+Date.now().toString().slice(-9);ss_().getSheetByName('Orders').appendRow([id,new Date(),product.id,product.name,product.price,String(p.playerId),String(p.serverId||''),String(p.phone),String(p.name),'Menunggu Pembayaran']);return{ok:true,order:{id,price:product.price,productName:product.name},payment:settings_()}}
function dashboard_(){const orders=readRows_('Orders');return{ok:true,totalOrders:orders.length,pending:orders.filter(x=>x.status==='Menunggu Pembayaran').length,revenue:orders.filter(x=>x.status==='Sukses').reduce((a,x)=>a+Number(x.price||0),0)}}
function saveProduct_(p){if(!p.name||!p.game||!(Number(p.price)>0))throw new Error('Data produk tidak valid');const sh=ss_().getSheetByName('Products');const rows=readRows_('Products');let id=p.id||'prod-'+Date.now();const idx=rows.findIndex(x=>String(x.id)===String(id));const row=[id,p.name,p.game,Number(p.price),p.description||'',p.active!==false];if(idx<0)sh.appendRow(row);else sh.getRange(idx+2,1,1,row.length).setValues([row]);return{ok:true,id}}
function deleteProduct_(id){const sh=ss_().getSheetByName('Products');const idx=readRows_('Products').findIndex(x=>String(x.id)===String(id));if(idx<0)throw new Error('Produk tidak ditemukan');sh.deleteRow(idx+2);return{ok:true}}
function updateOrder_(p){const sh=ss_().getSheetByName('Orders');const rows=readRows_('Orders');const idx=rows.findIndex(x=>String(x.id)===String(p.id));const allowed=['Menunggu Pembayaran','Sudah Dibayar','Diproses','Sukses','Gagal'];if(idx<0||!allowed.includes(p.status))throw new Error('Pesanan/status tidak valid');sh.getRange(idx+2,10).setValue(p.status);return{ok:true}}
function settings_(){const rows=readRows_('Settings');const o={};rows.forEach(x=>o[x.key]=x.value);return o}
function saveSettings_(p){const sh=ss_().getSheetByName('Settings');Object.keys(p).forEach(k=>{const rows=readRows_('Settings');const idx=rows.findIndex(x=>x.key===k);if(idx<0)sh.appendRow([k,p[k]]);else sh.getRange(idx+2,2).setValue(p[k])});return{ok:true}}
