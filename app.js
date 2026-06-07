// ══ SUPABASE ══
const SB_URL='https://fvkreujvlfrkgpehukuy.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a3JldWp2bGZya2dwZWh1a3V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNjg4ODQsImV4cCI6MjA5MzY0NDg4NH0.MyAAIrsAevwpQrWfhVQkb__dkpqnwGu8nACE5EngQwo';
let supabaseClient = null;

function initSupabaseAuthClient(){
  if(window.supabase && !supabaseClient){
    supabaseClient = window.supabase.createClient(SB_URL, SB_KEY);
    console.log("Supabase Auth client connected.");
  }
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initSupabaseAuthClient);
} else {
  initSupabaseAuthClient();
}

async function sbFetch(path,opts={}){
  try{
    initSupabaseAuthClient();

    let token = SB_KEY;

    if(supabaseClient){
      const { data } = await supabaseClient.auth.getSession();
      if(data && data.session && data.session.access_token){
        token = data.session.access_token;
      }
    }

    const res = await fetch(SB_URL + '/rest/v1/' + path, {
      headers:{
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + token,
        'Content-Type':'application/json',
        'Prefer':'return=representation',
        ...(opts.headers || {})
      },
      ...opts
    });

    if(!res.ok){
      const errText = await res.text();
      console.error('Supabase error:', res.status, errText);
      throw new Error('DB error: ' + res.status);
    }

    const txt = await res.text();
    return txt ? JSON.parse(txt) : [];
  } catch(e){
    console.error('sbFetch failed:', path, e.message);
    throw e;
  }
}

// ══ DEFAULTS ══
const DEFAULT_ACCOUNTS=[
  {username:'admin',pin:'0000',role:'owner',name:'Admin',permissions:{expenses:true,report:true,settings:true,customers:true}},
  {username:'worker1',pin:'1111',role:'worker',name:'Worker 1',permissions:{expenses:false,report:false,settings:false,customers:false}},
];
const DEFAULT_SERVICES={
  small:[{name:'Basic Wash',price:3000},{name:'Full Wash',price:5000},{name:'Interior',price:7000},{name:'Premium',price:10000}],
  medium:[{name:'Basic Wash',price:4000},{name:'Full Wash',price:7000},{name:'Interior',price:10000},{name:'Premium',price:15000}],
  large:[{name:'Basic Wash',price:5000},{name:'Full Wash',price:10000},{name:'Interior',price:15000},{name:'Premium',price:20000}],
};
const DEFAULT_SHIFTS={morning:{start:6,end:14},evening:{start:14,end:23}};
const DEFAULT_EXPENSE_CATS=['Soap/Supplies','Fuel','Salary','Maintenance','Water','Other'];
const DEFAULT_LOYALTY=10;
const CAT_ICONS={
  'Soap/Supplies':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
  'Fuel':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`,
  'Salary':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  'Maintenance':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  'Water':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
  'Other':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
};
function getCatIcon(cat){return CAT_ICONS[cat]||'📦';}

// ══ STORAGE ══
const getAccounts=async()=>{try{const r=await sbFetch('accounts?select=*&order=created_at.asc');return r.length?r:DEFAULT_ACCOUNTS;}catch{return DEFAULT_ACCOUNTS;}};
const addAccount=async a=>{try{await sbFetch('accounts',{method:'POST',body:JSON.stringify(a)});}catch(e){console.error(e);}};
const updateAccount=async(u,a)=>{try{await sbFetch('accounts?username=eq.'+encodeURIComponent(u),{method:'PATCH',body:JSON.stringify(a)});}catch(e){console.error(e);}};
const deleteAccount=async u=>{try{await sbFetch('accounts?username=eq.'+encodeURIComponent(u),{method:'DELETE'});}catch(e){console.error(e);}};

let _settingsCache=null;
const getSettingsRow=async()=>{
  if(_settingsCache)return _settingsCache;
  try{const r=await sbFetch('settings?id=eq.1&select=*');_settingsCache=r[0]||{biz_name:'My Carwash',shifts:DEFAULT_SHIFTS,services:DEFAULT_SERVICES,expense_cats:DEFAULT_EXPENSE_CATS,loyalty_threshold:DEFAULT_LOYALTY};return _settingsCache;}
  catch{return{biz_name:'My Carwash',shifts:DEFAULT_SHIFTS,services:DEFAULT_SERVICES,expense_cats:DEFAULT_EXPENSE_CATS,loyalty_threshold:DEFAULT_LOYALTY};}
};
const patchSettings=async patch=>{_settingsCache=null;try{await sbFetch('settings?id=eq.1',{method:'PATCH',body:JSON.stringify({...patch,updated_at:new Date().toISOString()})});}catch(e){console.error(e);}};
const getServices=async()=>{const r=await getSettingsRow();return r.services&&Object.keys(r.services).length?r.services:DEFAULT_SERVICES;};
const saveServices=async sv=>patchSettings({services:sv});
const getShiftsCfg=async()=>{const r=await getSettingsRow();return r.shifts||DEFAULT_SHIFTS;};
const saveShiftsCfg=async sh=>patchSettings({shifts:sh});
const getBizName=async()=>{const r=await getSettingsRow();return r.biz_name||'My Carwash';};
const saveBizName=async n=>patchSettings({biz_name:n});
const getExpenseCats=async()=>{const r=await getSettingsRow();return r.expense_cats||DEFAULT_EXPENSE_CATS;};
const saveExpenseCats=async c=>patchSettings({expense_cats:c});
const getLoyaltyThreshold=async()=>{const r=await getSettingsRow();return r.loyalty_threshold??DEFAULT_LOYALTY;};
const saveLoyaltyThreshold=async t=>patchSettings({loyalty_threshold:t});

const todayKey=new Date().toISOString().slice(0,10);
const normDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)?d:new Date(d).toISOString().slice(0,10);
const getLogsFor=async dateStr=>{
  try{
    return await sbFetch(
      'car_logs?log_date=eq.' + normDate(dateStr) +
      '&business_id=eq.' + currentBusinessId +
      '&order=created_at.asc&select=*'
    );
  }catch{return[];}
};
const saveCarLog=async entry=>{
  try{
    if(currentRole === "worker"){
      await sbFetch('rpc/worker_add_car_log',{
        method:'POST',
        body:JSON.stringify({
          access_code:getAccessCodeFromUrl(),
          input_worker_code:currentWorkerCode,
          input_plate:entry.plate,
          input_size:entry.size,
          input_service:entry.service,
          input_price:entry.price,
          input_shift:entry.shift,
          input_log_date:todayKey,
          input_is_free:entry.is_free||false
        })
      });
      return;
    }

    await sbFetch('car_logs',{
      method:'POST',
      body:JSON.stringify({
        plate:entry.plate,
        size:entry.size,
        service:entry.service,
        price:entry.price,
        worker:entry.worker,
        shift:entry.shift,
        log_date:todayKey,
        is_free:entry.is_free||false,
        business_id:currentBusinessId
      })
    });
  }catch(e){console.error(e);}
};
const getExpFor=async dateStr=>{
  try{
    return await sbFetch(
      'expenses?log_date=eq.' + normDate(dateStr) +
      '&business_id=eq.' + currentBusinessId +
      '&order=created_at.asc&select=*'
    );
  }catch{return[];}
};
const saveExpense=async exp=>{
  try{
    if(currentRole === "worker"){
      await sbFetch('rpc/worker_add_expense',{
        method:'POST',
        body:JSON.stringify({
          access_code:getAccessCodeFromUrl(),
          input_worker_code:currentWorkerCode,
          input_cat:exp.cat,
          input_amount:exp.amount,
          input_note:exp.note||'',
          input_log_date:todayKey
        })
      });
      return;
    }

    await sbFetch('expenses',{
      method:'POST',
      body:JSON.stringify({
        cat:exp.cat,
        amount:exp.amount,
        note:exp.note||'',
        worker:exp.worker,
        log_date:todayKey,
        business_id:currentBusinessId
      })
    });
  }catch(e){console.error(e);}
};

// Customer queries
const getCustomerHistory=async plate=>{
  try{
    return await sbFetch(
      'car_logs?plate=eq.' +
      encodeURIComponent(plate) +
      '&business_id=eq.' +
      currentBusinessId +
      '&order=created_at.desc&select=*'
    );
  }catch{
    return [];
  }
};
const getAllCustomers=async()=>{
  try{
    return await sbFetch(
      'car_logs?business_id=eq.' + currentBusinessId +
      '&select=plate,price,created_at,service,log_date&order=created_at.desc'
    );
  }catch{
    return [];
  }
};

function getDateKeys(period){
  const keys=[];const now=new Date();
  const days=period==='today'?0:period==='week'?6:29;
  for(let i=days;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);keys.push(d.toISOString().slice(0,10));}
  return keys;
}

// Loading overlay
function showLoading(msg='Loading...'){
  let el=document.getElementById('loading-overlay');
  if(!el){el=document.createElement('div');el.id='loading-overlay';el.style.cssText='position:fixed;inset:0;background:rgba(10,15,26,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:1rem;';
  el.innerHTML='<div class="spinner"></div><div style="color:var(--muted);font-size:0.85rem;font-family:var(--font-en)">'+msg+'</div>';document.body.appendChild(el);}
  else{el.querySelector('div+div').textContent=msg;el.style.display='flex';}
}
function hideLoading(){const el=document.getElementById('loading-overlay');if(el)el.style.display='none';}

// ══ STATE ══
let currentWorker='',currentRole='',currentLang='en';
let currentWorkerCode = null;
let currentBusinessId = null;
let currentBusiness = null;
let currentPermissions={expenses:true,report:true,settings:true,customers:true};
let selectedSize='',selectedService='',selectedPrice=0;
let selectedCat='',detectedPlate='';
let currentLogTab='cars',currentPeriod='today';
let editingWorkerIdx=null;
let pinValue='',pendingUsername='';
let pendingWorker = null;
let _accounts=null;
let _loyaltyThreshold=10;

// ══ LANG ══
const KU={morning:'بەیانی',evening:'ئێواران',currency:'دینار'};
const EN={morning:'Morning',evening:'Evening',currency:'IQD'};
function s(k){return(currentLang==='ku'?KU:EN)[k]||(EN[k]||k);}
function setLang(lang){
  currentLang=lang;
  document.body.classList.toggle('lang-ku',lang==='ku');
  document.documentElement.dir=lang==='ku'?'rtl':'ltr';
  document.getElementById('lang-ku-btn').classList.toggle('active',lang==='ku');
  document.getElementById('lang-en-btn').classList.toggle('active',lang==='en');
}
function toggleLang(){setLang(currentLang==='en'?'ku':'en');}

// ══ LOGIN ══
async function loadAccounts(){if(!_accounts)_accounts=await getAccounts();return _accounts;}
async function goToPin(){
  const input=document.getElementById('username-input');
  const workerCode=input.value.trim();

  if(!workerCode){
    input.classList.add('error');
    return;
  }

  input.classList.remove('error');

  const accessCode = getAccessCodeFromUrl();

  if(!accessCode){
    document.getElementById('login-error').textContent = "Open the private worker link from the owner.";
    return;
  }

  pendingUsername = workerCode;
  pinValue='';
  updatePinDots();

  document.getElementById('step-username').style.display='none';
  document.getElementById('step-pin').style.display='flex';
  document.getElementById('login-error').textContent='';
}
function backToUsername(){
  pinValue='';pendingUsername='';updatePinDots();
  document.getElementById('step-pin').style.display='none';
  document.getElementById('step-username').style.display='flex';
  document.getElementById('login-error').textContent='';
}
function pinPress(d){if(pinValue.length>=4)return;pinValue+=d;updatePinDots();if(pinValue.length===4)setTimeout(attemptLogin,150);}
function pinBack(){pinValue=pinValue.slice(0,-1);updatePinDots();}
function updatePinDots(){for(let i=0;i<4;i++)document.getElementById('dot'+i).classList.toggle('filled',i<pinValue.length);}
async function attemptLogin(){
  const accessCode = getAccessCodeFromUrl();

  const rows = await sbFetch('rpc/worker_login', {
    method:'POST',
    body:JSON.stringify({
      access_code: accessCode,
      input_worker_code: pendingUsername,
      input_pin: String(pinValue)
    })
  });

  const acct = rows[0];

  if(!acct){
    pinValue='';
    updatePinDots();
    document.getElementById('login-error').textContent='❌ Wrong worker code or PIN';
    return;
  }

  currentBusinessId = acct.business_id;
  currentWorker = acct.full_name;
  currentWorkerCode = acct.worker_code;
  currentRole = acct.role || "worker";

  currentPermissions = {
    expenses:true,
    report:false,
    settings:false,
    customers:false
  };

  document.getElementById('topbar-worker-name').textContent='👷 '+acct.full_name;
  document.getElementById('dash-worker-name').textContent='👷 '+acct.full_name;

  localStorage.setItem('cz_session',JSON.stringify({
    worker:acct.full_name,
    role:acct.role || "worker",
    username:acct.worker_code,
    business_id:acct.business_id,
    permissions:currentPermissions
  }));

  pinValue='';
  pendingUsername='';
  pendingWorker=null;
  document.getElementById('username-input').value='';
  updatePinDots();

  applyPermissionsToNav();
  showDash();
}
function logout(){
  currentWorker='';currentRole='';
  localStorage.removeItem('cz_session');
  showScreen('screen-login');resetAll();
}

// ══ PERMISSIONS ══
function applyPermissionsToNav(){
  const navIds=[
    ['nav-exp-dash','nav-exp-main'],
    ['nav-rep-dash','nav-rep-main'],
    ['nav-set-dash'],
  ];
  const keys=['expenses','report','settings'];
  navIds.forEach((ids,i)=>{
    ids.forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=currentPermissions[keys[i]]?'flex':'none';});
  });
}

// ══ SCREENS ══
function showScreen(id){document.querySelectorAll('.screen').forEach(sc=>sc.classList.remove('active'));document.getElementById(id).classList.add('active');}
async function showDash(){showScreen('screen-dash');await loadDash();}
function showMain(){showScreen('screen-main');}
async function showExpense(){
  if(!currentPermissions.expenses&&currentRole!=='owner'){showToast('Access denied','error');return;}
  await renderExpenseCatGrid();showScreen('screen-expense');await updateExpenseList();
}
async function showReport(){
  if(currentRole !== 'owner'){
    showToast('Access denied','error');
    return;
  }

  currentPeriod='today';
  document.querySelectorAll('.period-tab').forEach((b,i)=>b.classList.toggle('active',i===0));

  showScreen('screen-report');
  await updateReport();
}
async function showSettings(){
  if(currentRole !== 'owner'){
    showToast('Access denied','error');
    return;
  }

  showScreen('screen-settings');
  await loadSettingsUI();
}

async function showCustomers(){
  if(currentRole !== 'owner'){
    showToast('Access denied','error');
    return;
  }

  showScreen('screen-customers');
  await loadCustomers();
}
async function showCustomerDetail(plate){
  showScreen('screen-customer-detail');
  document.getElementById('cdetail-plate-top').textContent=plate;
  document.getElementById('cdetail-plate').textContent=plate;
  await loadCustomerDetail(plate);
}

// ══ QUICK ACTIONS ══
function showQuickActions(){document.getElementById('quick-modal').classList.add('active');}
function hideQuickActions(){document.getElementById('quick-modal').classList.remove('active');}

// ══ DASHBOARD ══
async function loadDash(){
  const hour=new Date().getHours();
  const greeting=hour<12?'Good Morning ☀️':hour<17?'Good Afternoon 🌤️':'Good Evening 🌙';
  document.getElementById('dash-greeting').textContent=greeting;
  document.getElementById('dash-name').textContent=currentWorker;
  showLoading('Loading...');
  const [todayLogs,todayExps,monthKeys]=[ await getLogsFor(todayKey), await getExpFor(todayKey), getDateKeys('month')];
  let monthLogs=[];
  await Promise.all(monthKeys.map(async k=>{const l=await getLogsFor(k);monthLogs=[...monthLogs,...l];}));
  hideLoading();
  const revenue=todayLogs.reduce((s,l)=>s+l.price,0);
  const expenses=todayExps.reduce((s,e)=>s+e.amount,0);
  const profit=revenue-expenses;
  document.getElementById('dash-profit').innerHTML=Math.abs(profit).toLocaleString()+' <span style="font-size:1rem;opacity:0.6">IQD'+(profit<0?' 📉':' 📈')+'</span>';
  document.getElementById('dash-profit').style.color=profit>=0?'var(--green)':'var(--red)';
  document.getElementById('dash-revenue').textContent=revenue.toLocaleString();
  document.getElementById('dash-expenses').textContent=expenses.toLocaleString();
  document.getElementById('dash-today-cars').textContent=todayLogs.length;
  document.getElementById('dash-month-cars').textContent=monthLogs.length;
  const actEl=document.getElementById('dash-activity');
  if(!todayLogs.length){actEl.innerHTML='<div class="empty-log">No activity yet today</div>';return;}
  actEl.innerHTML=[...todayLogs].reverse().slice(0,8).map(l=>`
    <div class="activity-item">
      <div><div class="activity-plate">${l.plate}</div><div class="activity-meta">${l.service} • ${l.worker}</div></div>
      <div class="activity-price">${l.is_free?'<span style="color:var(--green)">FREE</span>':(l.price||0).toLocaleString()}</div>
    </div>`).join('');
}

// ══ SHIFTS ══
function getCurrentShift(){
  const sh=(_settingsCache&&_settingsCache.shifts)||DEFAULT_SHIFTS;
  const h=new Date().getHours();
  if(h>=sh.morning.start&&h<sh.morning.end)return'morning';
  if(h>=sh.evening.start&&h<=sh.evening.end)return'evening';
  return'other';
}
function shiftLabel(k){return k==='morning'?s('morning'):k==='evening'?s('evening'):k;}

// ══ CAMERA ══
function startCamera(){const fi=document.getElementById('hidden-file-input');fi.onchange=handlePhoto;fi.click();}
function handlePhoto(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const prev=document.getElementById('photo-preview');
    prev.src=ev.target.result;prev.style.display='block';
    document.getElementById('camera-idle').style.display='none';
    document.getElementById('scan-overlay').classList.add('active');
    setTimeout(()=>{document.getElementById('scan-overlay').classList.remove('active');simulatePlate();},2200);
  };
  reader.readAsDataURL(file);e.target.value='';
}
async function simulatePlate(){
  const sizes=['small','medium','large'];
  const detected=sizes[Math.floor(Math.random()*sizes.length)];
  const useOld=Math.random()<0.5;
  let plate;
  if(useOld){
    const en=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    const cities=['اربيل','سليمانية','دهوك'];
    let num=en[Math.floor(Math.random()*9)+1];
    for(let i=0;i<5;i++)num+=en[Math.floor(Math.random()*10)];
    plate=num+' '+cities[Math.floor(Math.random()*cities.length)];
  } else {
    const codes=['21','22','22','22','23','24'];
    const letters=['A','B','C','D','M','R','S','K','N','H'];
    plate=codes[Math.floor(Math.random()*codes.length)]+' '+letters[Math.floor(Math.random()*letters.length)]+' '+String(Math.floor(Math.random()*90000)+10000);
  }
  detectedPlate=plate;
  document.getElementById('ai-plate-display').textContent=plate;
  document.getElementById('ai-type-display').textContent='🚗 '+detected+' • '+(useOld?'Old format':'New 2022');
  document.getElementById('ai-result').classList.add('show');
  document.querySelectorAll('.size-btn').forEach(btn=>{if(btn.dataset.size===detected)selectSize(btn,detected);});
  showToast('✅ Plate detected!','success');
  // Check loyalty
  await checkLoyaltyForPlate(plate);
}
async function checkLoyaltyForPlate(plate){
  if(!plate||plate==='—')return;
  const threshold=_loyaltyThreshold;
  if(!threshold)return;
  const history=await getCustomerHistory(plate);
  const totalVisits=history.length;
  const visitsThisCycle=totalVisits%threshold;
  const banner=document.getElementById('loyalty-banner');
  if(visitsThisCycle===threshold-1||visitsThisCycle===0&&totalVisits>0){
    document.getElementById('loyalty-banner-text').textContent=visitsThisCycle===0?'🎉 FREE WASH EARNED!':'⭐ Next visit is FREE!';
    document.getElementById('loyalty-banner-sub').textContent=totalVisits+' visits total';
    banner.classList.add('show');
  } else {
    banner.classList.remove('show');
    if(totalVisits>0){
      document.getElementById('loyalty-banner-text').textContent='Loyal customer • Visit #'+(totalVisits+1);
      document.getElementById('loyalty-banner-sub').textContent=(threshold-visitsThisCycle-1)+' more washes until free wash';
      banner.classList.add('show');
    }
  }
}
function resetCamera(){
  document.getElementById('photo-preview').style.display='none';
  document.getElementById('camera-idle').style.display='flex';
  document.getElementById('ai-result').classList.remove('show');
  document.getElementById('loyalty-banner').classList.remove('show');
  document.getElementById('scan-overlay').classList.remove('active');
  detectedPlate='';
}

// ══ SIZE & SERVICE ══
async function selectSize(btn,size){
  document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');selectedSize=size;selectedService='';selectedPrice=0;
  await renderServices(size);checkConfirm();
}
async function renderServices(size){
  const grid=document.getElementById('service-grid');
  grid.innerHTML='<div style="color:var(--muted);font-size:0.78rem;padding:0.5rem;text-align:center;">Loading...</div>';
  let svcs;try{svcs=(await getServices())[size];}catch{svcs=null;}
  svcs=svcs||DEFAULT_SERVICES[size]||[];
  const icons=['🫧','💧','✨','⭐'];
  grid.innerHTML=svcs.map((sv,i)=>`
    <button class="service-btn" onclick="selectService(this,'${sv.name.replace(/'/g,"\\'")}',${sv.price})">
      <span class="service-icon">${icons[i]||'🚿'}</span>
      <span class="service-name">${sv.name}</span>
      <span class="service-price">${sv.price.toLocaleString()} <span>${s('currency')}</span></span>
    </button>`).join('');
}
function selectService(btn,name,price){
  document.querySelectorAll('.service-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');selectedService=name;selectedPrice=price;
  document.getElementById('custom-price-input').value='';checkConfirm();
}
function selectCustom(){
  const val=parseInt(document.getElementById('custom-price-input').value);
  if(!val||val<=0){showToast('Enter a valid price','error');return;}
  document.querySelectorAll('.service-btn').forEach(b=>b.classList.remove('selected'));
  selectedService='Custom ('+val.toLocaleString()+')';selectedPrice=val;
  checkConfirm();showToast('✓ Custom price set','success');
}
function checkConfirm(){document.getElementById('confirm-btn').disabled=!(selectedSize&&selectedService&&selectedPrice>0);}

// ══ LOG CAR ══
async function confirmEntry(){
  const now=new Date();
  const shift=getCurrentShift();
  const threshold=_loyaltyThreshold;
  // Check if this is a free wash
  let isFree=false;
  let loyaltyData=null;
  if(detectedPlate&&detectedPlate!=='—'&&threshold>0){
    const history=await getCustomerHistory(detectedPlate);
    const totalVisits=history.length;
    if(totalVisits>0&&totalVisits%threshold===0){isFree=true;}
    loyaltyData={totalVisits:totalVisits+1,threshold};
  }
  const entry={
    plate:detectedPlate||'—',size:selectedSize,service:selectedService,
    price:isFree?0:selectedPrice,worker:currentWorker,shift,
    time:now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
    is_free:isFree
  };
  showLoading('Saving...');
  await saveCarLog(entry);
  hideLoading();
  // Receipt
  document.getElementById('rec-plate').textContent=entry.plate;
  document.getElementById('rec-size').textContent=selectedSize;
  document.getElementById('rec-service').textContent=entry.service;
  document.getElementById('rec-shift').textContent=shiftLabel(shift);
  document.getElementById('rec-worker').textContent=entry.worker;
  document.getElementById('rec-time').textContent=entry.time;
  const totalEl=document.getElementById('rec-total');
  if(isFree){totalEl.textContent='FREE 🎉';totalEl.className='receipt-value receipt-free';}
  else{totalEl.textContent=entry.price.toLocaleString()+' '+s('currency');totalEl.className='receipt-value';}
  // Loyalty progress
  if(loyaltyData&&threshold>0){
    const lsEl=document.getElementById('loyalty-success');
    const progress=(loyaltyData.totalVisits%threshold||threshold)/threshold*100;
    document.getElementById('loyalty-progress-fill').style.width=progress+'%';
    if(isFree){
      document.getElementById('loyalty-success-title').textContent='🎉 Free Wash Redeemed!';
      document.getElementById('loyalty-progress-text').textContent='Loyalty cycle reset. Next free wash in '+threshold+' visits.';
    } else {
      const remaining=threshold-(loyaltyData.totalVisits%threshold||threshold);
      document.getElementById('loyalty-success-title').textContent='⭐ Loyalty Progress';
      document.getElementById('loyalty-progress-text').textContent=loyaltyData.totalVisits+' total visits • '+remaining+' more until free wash';
    }
    lsEl.classList.add('show');
  } else {
    document.getElementById('loyalty-success').classList.remove('show');
  }
  if(isFree)showToast('🎉 FREE WASH — Loyalty reward!','loyalty');
  showScreen('screen-success');
}
function newCar(){resetAll();showMain();}
function resetAll(){
  resetCamera();selectedSize='';selectedService='';selectedPrice=0;
  document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('service-grid').innerHTML='';
  document.getElementById('custom-price-input').value='';checkConfirm();
}

// ══ EXPENSES ══
let _expCats=null;
async function renderExpenseCatGrid(){
  _expCats=await getExpenseCats();
  const grid=document.getElementById('expense-cat-grid');
  grid.innerHTML=_expCats.map(cat=>`
    <button class="cat-btn" onclick="selectCat(this,'${cat.replace(/'/g,"\\'")}')">
      <span class="cat-icon">${getCatIcon(cat)}</span>
      <span>${cat}</span>
    </button>`).join('');
}
function selectCat(btn,cat){
  document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');selectedCat=cat;checkExpBtn();
}
function checkExpBtn(){
  const amt=parseInt(document.getElementById('expense-amount').value);
  document.getElementById('add-expense-btn').disabled=!(selectedCat&&amt>0);
}
async function addExpense(){
  const amt=parseInt(document.getElementById('expense-amount').value);
  const note=document.getElementById('expense-note').value.trim();
  if(!selectedCat||!amt){showToast('Fill all required fields','error');return;}
  const now=new Date();
  showLoading('Saving...');
  await saveExpense({cat:selectedCat,amount:amt,note,worker:currentWorker,time:now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
  hideLoading();
  showToast('💸 Expense logged!','warn');
  selectedCat='';document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('expense-amount').value='';document.getElementById('expense-note').value='';
  document.getElementById('add-expense-btn').disabled=true;
  await updateExpenseList();
}
async function updateExpenseList(){
  const el=document.getElementById('expense-list');
  el.innerHTML='<div class="empty-log">Loading...</div>';
  const exps=await getExpFor(todayKey);
  if(!exps.length){el.innerHTML='<div class="empty-log">No expenses logged yet</div>';return;}
  el.innerHTML=[...exps].reverse().map(e=>`
    <div class="log-item expense-item">
      <div><div class="log-plate">${getCatIcon(e.cat)} ${e.cat}</div><div class="log-meta">${e.note||''} • ${e.worker} • ${new Date(e.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div></div>
      <div class="log-price expense">−${e.amount.toLocaleString()}</div>
    </div>`).join('');
}

// ══ REPORT ══
async function setPeriod(period,btn){
  currentPeriod=period;
  document.querySelectorAll('.period-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('chart-section').style.display=period==='week'?'block':'none';
  document.getElementById('shift-section').style.display=period==='today'?'block':'none';
  await updateReport();
}
async function updateReport(){
  showLoading('Loading report...');
  const keys=getDateKeys(currentPeriod);
  let allLogs=[],allExps=[];
  await Promise.all(keys.map(async k=>{
    const [l,e]=await Promise.all([getLogsFor(k),getExpFor(k)]);
    allLogs=[...allLogs,...l];allExps=[...allExps,...e];
  }));
  hideLoading();
  const revenue=allLogs.reduce((s,l)=>s+(l.price||0),0);
  const totalExp=allExps.reduce((s,e)=>s+e.amount,0);
  const profit=revenue-totalExp;
  document.getElementById('stat-cars').textContent=allLogs.length;
  document.getElementById('stat-revenue').textContent=revenue.toLocaleString();
  document.getElementById('stat-expenses').textContent=totalExp.toLocaleString();
  const profEl=document.getElementById('stat-profit');
  profEl.textContent=Math.abs(profit).toLocaleString();
  profEl.className='stat-value '+(profit>=0?'yellow':'red');
  const bar=document.getElementById('profit-bar');
  const pct=revenue>0?Math.min(100,Math.round((profit/revenue)*100)):0;
  bar.style.width=Math.max(0,pct)+'%';
  bar.className='profit-bar-fill'+(profit<0?' loss':'');
  document.getElementById('profit-pct').textContent=pct+'%';
  if(currentPeriod==='today')renderShifts(allLogs);
  if(currentPeriod==='week')renderBarChart(keys,allLogs);
  renderLogTab(currentLogTab,allLogs,allExps);
}
function renderShifts(logs){
  const sh=(_settingsCache&&_settingsCache.shifts)||DEFAULT_SHIFTS;
  document.getElementById('shift-grid').innerHTML=['morning','evening'].map(sk=>{
    const sl=(logs||[]).filter(l=>l.shift===sk);
    const rev=sl.reduce((s,l)=>s+(l.price||0),0);
    return`<div class="shift-card">
      <div class="shift-name">${shiftLabel(sk)}</div>
      <div class="shift-cars">${sl.length} <span style="font-size:0.7rem;color:var(--muted)">cars</span></div>
      <div class="shift-revenue">${rev.toLocaleString()} ${s('currency')}</div>
      <div class="shift-time">${sh[sk].start}:00 – ${sh[sk].end}:00</div>
    </div>`;
  }).join('');
}
function renderBarChart(keys,allLogs){
  const chart=document.getElementById('bar-chart');
  const vals=keys.map(k=>(allLogs||[]).filter(l=>l.log_date===k).reduce((s,l)=>s+(l.price||0),0));
  const maxVal=Math.max(...vals,1);
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  chart.innerHTML=keys.map((k,i)=>{
    const pct=Math.max(3,Math.round((vals[i]/maxVal)*100));
    return`<div class="bar-wrap"><div class="bar${k===todayKey?' today':''}" style="height:${pct}%"></div><div class="bar-label">${days[new Date(k).getDay()]}</div></div>`;
  }).join('');
}
async function switchLogTab(tab,btn){
  currentLogTab=tab;
  document.querySelectorAll('.tab-strip-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  showLoading('Loading...');
  const keys=getDateKeys(currentPeriod);
  let allLogs=[],allExps=[];
  await Promise.all(keys.map(async k=>{
    const [l,e]=await Promise.all([getLogsFor(k),getExpFor(k)]);
    allLogs=[...allLogs,...l];allExps=[...allExps,...e];
  }));
  hideLoading();
  renderLogTab(tab,allLogs,allExps);
}
function renderLogTab(tab,allLogs,allExps){
  const el=document.getElementById('report-log-list');
  if(tab==='cars'){
    if(!allLogs.length){el.innerHTML='<div class="empty-log">No records yet</div>';return;}
    el.innerHTML=[...allLogs].reverse().map(l=>`
      <div class="log-item">
        <div><div class="log-plate">${l.plate}${l.is_free?' <span style="color:var(--green);font-size:0.65rem;">FREE</span>':''}</div><div class="log-meta">${l.size} • ${l.service} • ${shiftLabel(l.shift||'')} • ${l.worker}</div></div>
        <div class="log-price${l.is_free?' receipt-free':''}">${l.is_free?'FREE':(l.price||0).toLocaleString()}</div>
      </div>`).join('');
  } else {
    if(!allExps.length){el.innerHTML='<div class="empty-log">No expenses yet</div>';return;}
    el.innerHTML=[...allExps].reverse().map(e=>`
      <div class="log-item expense-item">
        <div><div class="log-plate">${getCatIcon(e.cat)} ${e.cat}</div><div class="log-meta">${e.note||''} • ${e.worker}</div></div>
        <div class="log-price expense">−${e.amount.toLocaleString()}</div>
      </div>`).join('');
  }
}

// ══ CUSTOMERS ══
async function loadCustomers(){
  const el=document.getElementById('customers-list');
  el.innerHTML='<div class="empty-log">Loading...</div>';
  showLoading('Loading customers...');
  const allLogs=await getAllCustomers();
  hideLoading();
  // Group by plate
  const customers={};
  allLogs.forEach(l=>{
    if(!l.plate||l.plate==='—')return;
    if(!customers[l.plate])customers[l.plate]={plate:l.plate,visits:0,spent:0,lastVisit:l.log_date,firstVisit:l.log_date};
    customers[l.plate].visits++;
    customers[l.plate].spent+=(l.price||0);
    if(l.log_date>customers[l.plate].lastVisit)customers[l.plate].lastVisit=l.log_date;
    if(l.log_date<customers[l.plate].firstVisit)customers[l.plate].firstVisit=l.log_date;
  });
  const sorted=Object.values(customers).sort((a,b)=>b.visits-a.visits);
  if(!sorted.length){el.innerHTML='<div class="empty-log">No customers yet</div>';return;}
  renderCustomerList(sorted);
}
function renderCustomerList(customers){
  const el=document.getElementById('customers-list');
  const threshold=_loyaltyThreshold;
  el.innerHTML=customers.map(c=>{
    const cycle=threshold>0?c.visits%threshold:0;
    const pct=threshold>0?(cycle/threshold*100):0;
    const remaining=threshold>0?(threshold-cycle):0;
    const hasFree=threshold>0&&cycle===0&&c.visits>0;
    return`<div class="customer-card" onclick="showCustomerDetail('${c.plate.replace(/'/g,"\\'")}')">
      <div class="customer-card-top">
        <div><div class="customer-plate">${c.plate}</div><div class="customer-visits">${c.visits} visits</div></div>
        <div style="text-align:right;font-size:0.72rem;color:var(--muted);">${c.lastVisit}</div>
      </div>
      ${threshold>0?`<div class="customer-loyalty">
        <div class="loyalty-bar"><div class="loyalty-bar-fill" style="width:${hasFree?100:pct}%"></div></div>
        <div class="loyalty-text ${hasFree?'free':''}">${hasFree?'Free wash earned!':remaining+' more until free wash'}</div>
      </div>`:''}
      <div class="customer-stats">
        <div class="cstat"><div class="cstat-val">${c.visits}</div><div class="cstat-label">Visits</div></div>
        <div class="cstat"><div class="cstat-val">${(c.spent/1000).toFixed(0)}K</div><div class="cstat-label">IQD Spent</div></div>
        <div class="cstat"><div class="cstat-val">${c.firstVisit.slice(5)}</div><div class="cstat-label">First Visit</div></div>
      </div>
    </div>`;
  }).join('');
}
async function searchCustomers(){
  const q=document.getElementById('customer-search').value.trim().toLowerCase();
  if(!q){await loadCustomers();return;}
  showLoading('Searching...');
  const allLogs=await getAllCustomers();
  hideLoading();
  const customers={};
  allLogs.filter(l=>l.plate&&l.plate.toLowerCase().includes(q)).forEach(l=>{
    if(!customers[l.plate])customers[l.plate]={plate:l.plate,visits:0,spent:0,lastVisit:l.log_date,firstVisit:l.log_date};
    customers[l.plate].visits++;customers[l.plate].spent+=(l.price||0);
    if(l.log_date>customers[l.plate].lastVisit)customers[l.plate].lastVisit=l.log_date;
    if(l.log_date<customers[l.plate].firstVisit)customers[l.plate].firstVisit=l.log_date;
  });
  renderCustomerList(Object.values(customers).sort((a,b)=>b.visits-a.visits));
}
async function loadCustomerDetail(plate){
  showLoading('Loading...');
  const history=await getCustomerHistory(plate);
  hideLoading();
  const threshold=_loyaltyThreshold;
  const totalVisits=history.length;
  const totalSpent=history.reduce((s,l)=>s+(l.price||0),0);
  const cycle=threshold>0?totalVisits%threshold:0;
  const remaining=threshold>0?(threshold-cycle):0;
  const hasFree=threshold>0&&cycle===0&&totalVisits>0;
  document.getElementById('cdetail-visits').textContent=totalVisits;
  document.getElementById('cdetail-spent').textContent=(totalSpent/1000).toFixed(1)+'K';
  document.getElementById('cdetail-progress').textContent=hasFree?'FREE!':remaining;
  document.getElementById('cdetail-since').textContent=totalVisits>0?'First visit: '+history[history.length-1].log_date:'No visits yet';
  // Loyalty bar
  const pct=threshold>0?(hasFree?100:cycle/threshold*100):0;
  document.getElementById('cdetail-loyalty-bar').style.width=pct+'%';
  document.getElementById('cdetail-loyalty-text').textContent=hasFree?'🎉 Free wash earned! Next visit is free.':totalVisits+' total visits • '+remaining+' more until free wash';
  document.getElementById('free-wash-badge').classList.toggle('hidden',!hasFree);
  // History
  const histEl=document.getElementById('cdetail-history');
  if(!history.length){histEl.innerHTML='<div class="empty-log">No history</div>';return;}
  histEl.innerHTML=history.map(l=>`
    <div class="log-item">
      <div><div class="log-plate">${l.service}${l.is_free?' <span style="color:var(--green);font-size:0.65rem;">FREE</span>':''}</div><div class="log-meta">${l.log_date} • ${l.worker}</div></div>
      <div class="log-price${l.is_free?' receipt-free':''}">${l.is_free?'FREE':(l.price||0).toLocaleString()}</div>
    </div>`).join('');
}

// ══ SETTINGS ══
async function loadSettingsUI(){
  showLoading('Loading settings.');

  const [bizName,sh,svcs,cats,loyalty,business,workers]=await Promise.all([
    getBizName(),
    getShiftsCfg(),
    getServices(),
    getExpenseCats(),
    getLoyaltyThreshold(),
    getCurrentBusiness(),
    currentBusinessId ? sbFetch("workers?business_id=eq." + currentBusinessId + "&order=created_at.asc&select=*") : []
  ]);

  _accounts = workers;

  hideLoading();

  document.getElementById('setting-biz-name').value=bizName;
  document.getElementById('shift-morning-start').value=sh.morning.start;
  document.getElementById('shift-morning-end').value=sh.morning.end;
  document.getElementById('shift-evening-start').value=sh.evening.start;
  document.getElementById('shift-evening-end').value=sh.evening.end;
  document.getElementById('loyalty-threshold').value=loyalty||0;

  renderPriceSettings(svcs);
  renderWorkerAccessBox(business, workers);
  renderWorkerSettings(workers);
  renderExpenseCatSettings(cats);
}

async function getCurrentBusiness(){
  if(!currentBusinessId) return null;

  const rows = await sbFetch(
    "businesses?id=eq." + currentBusinessId + "&select=*"
  );

  return rows[0] || null;
}

function renderWorkerAccessBox(business, workers){
  let box = document.getElementById("worker-access-box");

  if(!box){
    box = document.createElement("div");
    box.id = "worker-access-box";
    box.className = "settings-section";

    const settingsContent = document.querySelector("#screen-settings .settings-content");
    settingsContent.insertBefore(box, settingsContent.children[1]);
  }

  if(!business){
    box.innerHTML = `
      <div class="settings-section-title">Worker Access</div>
      <div class="empty-log">No business connected.</div>
    `;
    return;
  }

const link = window.location.href.split("?")[0] + "?access=" + business.worker_access_code;

  box.innerHTML = `
    <div class="settings-section-title">Worker Access Link</div>

    <div class="setting-row">
      <span class="setting-label">Worker Link</span>
      <input class="setting-input" id="worker-access-link" value="${link}" readonly>
      <button class="small-btn accent" onclick="copyWorkerLink()">Copy</button>
    </div>

    <div style="padding:0.7rem 1rem;color:var(--text2);font-size:0.72rem;line-height:1.5">
      Send this link only to this carwash workers. They login with Worker Code and PIN.
    </div>

    <div class="settings-section-title">Worker Login Information</div>
    <div id="owner-worker-login-list">
      ${
        workers && workers.length
          ? workers.map(w => `
            <div class="worker-row">
              <div class="worker-avatar"><i data-lucide="user"></i></div>
              <div class="worker-info">
                <div class="worker-name-text">${w.full_name}</div>
                <div class="worker-role-text">Code: ${w.worker_code} • PIN: ${w.pin} • Role: ${w.role}</div>
              </div>
            </div>
          `).join("")
          : `<div class="empty-log">No workers added yet.</div>`
      }
    </div>
  `;

  if(window.lucide) lucide.createIcons();
}

async function copyWorkerLink(){
  const input = document.getElementById("worker-access-link");
  if(!input) return;

  await navigator.clipboard.writeText(input.value);
  showToast("Worker link copied", "success");
}


function renderPriceSettings(svcs){
  svcs=svcs||DEFAULT_SERVICES;
  const sizeNames={small:'Small Car',medium:'Medium Car',large:'Large / SUV'};
  let html='';
  Object.keys(svcs).forEach(size=>{
    html+=`<div style="padding:0.42rem 1rem 0.12rem;font-size:0.62rem;color:var(--accent);font-weight:700;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--border);">${sizeNames[size]}</div>`;
    svcs[size].forEach((sv,i)=>{
      html+=`<div class="price-row"><span class="price-label">${sv.name}</span><input class="price-input" type="number" value="${sv.price}" data-size="${size}" data-idx="${i}" min="0" style="font-size:16px;"></div>`;
    });
  });
  document.getElementById('price-settings-list').innerHTML=html;
}
function renderWorkerSettings(workers){
  workers = workers || [];

  const list = document.getElementById('worker-settings-list');

  if(!workers.length){
    list.innerHTML = '<div class="empty-log">No workers added yet</div>';
    return;
  }

  list.innerHTML = workers.map((w,i)=>`
    <div class="worker-row">
      <div class="worker-avatar"><i data-lucide="user"></i></div>
      <div class="worker-info">
        <div class="worker-name-text">${w.full_name}</div>
        <div class="worker-role-text">
          Code: ${w.worker_code} • PIN: ${w.pin} • ${w.role || 'worker'}
        </div>
      </div>
      <div class="worker-actions">
        <button class="small-btn accent" onclick="openEditWorker(${i})">Edit</button>
        <button class="small-btn danger" onclick="deleteWorker(${i})">Delete</button>
      </div>
    </div>
  `).join('');

  if(window.lucide) lucide.createIcons();
}
function renderExpenseCatSettings(cats){
  cats=cats||DEFAULT_EXPENSE_CATS;
  const el=document.getElementById('expense-cat-settings');
  el.innerHTML=cats.map((cat,i)=>`
    <div class="cat-manage-row">
      <span class="cat-manage-name">${getCatIcon(cat)} ${cat}</span>
      ${i>=6?`<button class="small-btn danger" onclick="removeExpenseCat(${i})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>`:''}
    </div>`).join('');
}
async function addExpenseCat(){
  const input=document.getElementById('new-cat-input');
  const name=input.value.trim();
  if(!name)return;
  const cats=await getExpenseCats();
  if(cats.includes(name)){showToast('Category already exists','error');return;}
  cats.push(name);
  await saveExpenseCats(cats);
  input.value='';
  renderExpenseCatSettings(cats);
  showToast('✅ Category added!','success');
}
async function removeExpenseCat(idx){
  const cats=await getExpenseCats();
  cats.splice(idx,1);
  await saveExpenseCats(cats);
  renderExpenseCatSettings(cats);
  showToast('Category removed','warn');
}
async function saveSettings(){
  showLoading('Saving...');
  await Promise.all([
    saveBizName(document.getElementById('setting-biz-name').value.trim()||'My Carwash'),
    saveShiftsCfg({
      morning:{start:parseInt(document.getElementById('shift-morning-start').value)||6,end:parseInt(document.getElementById('shift-morning-end').value)||14},
      evening:{start:parseInt(document.getElementById('shift-evening-start').value)||14,end:parseInt(document.getElementById('shift-evening-end').value)||23},
    }),
    saveLoyaltyThreshold(parseInt(document.getElementById('loyalty-threshold').value)||0),
  ]);
  const svcs=await getServices();
  document.querySelectorAll('.price-input').forEach(inp=>{
    const size=inp.dataset.size,idx=parseInt(inp.dataset.idx);
    if(svcs[size]&&svcs[size][idx])svcs[size][idx].price=parseInt(inp.value)||0;
  });
  await saveServices(svcs);
  _loyaltyThreshold=parseInt(document.getElementById('loyalty-threshold').value)||0;
  hideLoading();showToast('✅ Saved!','success');
}

// Worker modal
function togglePermVisibility(){
  const role=document.getElementById('modal-role').value;
  document.getElementById('modal-permissions').style.display=role==='owner'?'none':'block';
}
function openAddWorker(){
  editingWorkerIdx=null;
  document.getElementById('modal-title').textContent='Add Worker';
  document.getElementById('modal-save-btn').textContent='Add';
  ['modal-name','modal-username','modal-pin'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('modal-role').value='worker';
  ['perm-expenses','perm-report','perm-settings','perm-customers'].forEach(id=>document.getElementById(id).checked=false);
  document.getElementById('modal-permissions').style.display='block';
  document.getElementById('worker-modal').classList.add('active');
}
function openEditWorker(idx){
  editingWorkerIdx=idx;
  const w=(_accounts||[])[idx];

  document.getElementById('modal-title').textContent='Edit Worker';
  document.getElementById('modal-save-btn').textContent='Save';

  document.getElementById('modal-name').value=w.full_name || '';
  document.getElementById('modal-username').value=w.worker_code || '';
  document.getElementById('modal-pin').value=w.pin || '';
  document.getElementById('modal-role').value=w.role || 'worker';

  document.getElementById('perm-expenses').checked=true;
  document.getElementById('perm-report').checked=false;
  document.getElementById('perm-settings').checked=false;
  document.getElementById('perm-customers').checked=false;

  document.getElementById('modal-permissions').style.display='block';
  document.getElementById('worker-modal').classList.add('active');
}
function closeModal(){document.getElementById('worker-modal').classList.remove('active');}
async function saveWorker(){
  const name=document.getElementById('modal-name').value.trim();
  const workerCode=document.getElementById('modal-username').value.trim();
  const pin=String(document.getElementById('modal-pin').value).trim();
  const role=document.getElementById('modal-role').value || 'worker';

  if(!currentBusinessId){
    showToast('No business connected. Login as owner first.','error');
    return;
  }

  if(!name || !workerCode){
    showToast('Fill all required fields','error');
    return;
  }

  if(pin.length !== 4){
    showToast('PIN must be 4 digits','error');
    return;
  }

  const workers = _accounts || [];

  const duplicate = workers.find((w,idx)=>
    idx !== editingWorkerIdx &&
    String(w.worker_code).toLowerCase() === workerCode.toLowerCase()
  );

  if(duplicate){
    showToast('Worker code already exists for this carwash','error');
    return;
  }

  showLoading('Saving worker...');

  const payload = {
    business_id: currentBusinessId,
    full_name: name,
    worker_code: workerCode,
    pin: pin,
    role: role,
    status: 'active'
  };

  if(editingWorkerIdx === null){
    await sbFetch('workers', {
      method:'POST',
      body:JSON.stringify(payload)
    });

    showToast('✅ Worker added!','success');
  } else {
    const workerId = workers[editingWorkerIdx].id;

    await sbFetch('workers?id=eq.' + workerId, {
      method:'PATCH',
      body:JSON.stringify(payload)
    });

    showToast('✅ Worker updated!','success');
  }

  hideLoading();
  closeModal();
  await loadSettingsUI();
}
async function deleteWorker(idx){
  const workers = _accounts || [];
  const worker = workers[idx];

  if(!worker){
    showToast('Worker not found','error');
    return;
  }

  if(!confirm('Delete this worker?')){
    return;
  }

  showLoading('Deleting worker...');

  await sbFetch('workers?id=eq.' + worker.id, {
    method:'DELETE'
  });

  hideLoading();
  showToast('Worker removed','warn');
  await loadSettingsUI();
}

// ══ TOAST ══
function showToast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg;t.className='toast '+type;
  void t.offsetWidth;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ══ INIT ══
document.addEventListener('DOMContentLoaded',async()=>{
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
  document.addEventListener('gestureend',e=>e.preventDefault(),{passive:false});
  let lastTap=0;
  document.addEventListener('touchend',e=>{
    const now=Date.now();
    if(now-lastTap<300)e.preventDefault();
    lastTap=now;
  },{passive:false});
  setLang('en');
  showLoading('Connecting...');
  const [accts,settingsRow]=await Promise.all([loadAccounts(),getSettingsRow()]);
  _accounts=accts;
  _loyaltyThreshold=settingsRow.loyalty_threshold??DEFAULT_LOYALTY;
  hideLoading();
  // Restore session
  const session=localStorage.getItem('cz_session');
  if(session){
    try{
      const {worker,role,username,permissions}=JSON.parse(session);
      const acct=_accounts.find(a=>a.username===username);
      if(acct){
        currentWorker=worker;currentRole=role;
        currentPermissions=role==='owner'?{expenses:true,report:true,settings:true,customers:true}:(permissions||acct.permissions||{expenses:false,report:false,settings:false,customers:false});
        document.getElementById('topbar-worker-name').textContent='👷 '+worker;
        document.getElementById('dash-worker-name').textContent='👷 '+worker;
        applyPermissionsToNav();
        showDash();
      } else showScreen('screen-login');
    } catch{showScreen('screen-login');}
  } else showScreen('screen-login');
  document.getElementById('username-input').addEventListener('keydown',e=>{if(e.key==='Enter')goToPin();});
  document.getElementById('expense-amount').addEventListener('input',checkExpBtn);
  // Run SQL migration silently for new columns
  try{await sbFetch('car_logs?id=eq.00000000-0000-0000-0000-000000000000&select=is_free');}catch{}
});

// ===== Next JS block from original file =====

(function(){
  const map={
    '.topbar-right .icon-btn:first-child':'languages', '.topbar-right .icon-btn:last-child':'log-out',
    '.nav-tab:nth-child(1)':'house', '.nav-tab:nth-child(2)':'car-front', '.nav-tab:nth-child(3)':'wallet', '.nav-tab:nth-child(4)':'chart-column', '.nav-tab:nth-child(5)':'settings',
    '.fab':'plus', '.login-logo':'car-front', '.dash-card:nth-child(1) .dash-card-icon':'car-front', '.dash-card:nth-child(2) .dash-card-icon-wrap':'calendar-days',
    '.cam-btn-primary':'camera', '.cam-btn-secondary':'rotate-ccw', '.confirm-btn':'check-circle-2', '.save-btn':'save', '.new-car-btn':'plus-circle'
  };
  function setIcon(el,name,sizeClass){
    if(!el || !window.lucide || !lucide.icons) return;
    const icon=lucide.icons[name]; if(!icon) return;
    const span=document.createElement('span'); span.className='zp-icon '+(sizeClass||'zp-i-md'); span.innerHTML=icon.toSvg();
    const old=el.querySelector('svg,.zp-icon'); if(old) old.replaceWith(span); else el.prepend(span);
  }
  function cleanIcons(){
    Object.entries(map).forEach(([sel,name])=>document.querySelectorAll(sel).forEach(el=>setIcon(el,name, sel.includes('nav-tab')?'zp-i-nav': sel.includes('login-logo')?'zp-i-brand':'zp-i-md')));
    document.querySelectorAll('.size-btn').forEach((el,i)=>setIcon(el, ['car','car-front','truck'][i]||'car','zp-i-lg'));
    document.querySelectorAll('.service-btn').forEach((el,i)=>setIcon(el, ['sparkles','droplets','badge-check','receipt'][i%4],'zp-i-lg'));
    document.querySelectorAll('.cat-btn').forEach((el,i)=>setIcon(el, ['fuel','wrench','shopping-bag','receipt-text','circle-dollar-sign','ellipsis'][i%6],'zp-i-md'));
    document.querySelectorAll('.quick-btn.wash').forEach(el=>setIcon(el,'car-front','zp-i-lg'));
    document.querySelectorAll('.quick-btn.expense').forEach(el=>setIcon(el,'wallet','zp-i-lg'));
    document.querySelectorAll('.quick-btn.customers').forEach(el=>setIcon(el,'users-round','zp-i-lg'));
    document.querySelectorAll('.worker-avatar').forEach(el=>setIcon(el,'user-round','zp-i-md'));
    document.querySelectorAll('.ai-result-icon').forEach(el=>setIcon(el,'scan-line','zp-i-md'));
    document.querySelectorAll('.loyalty-banner-icon,.success-icon-wrap').forEach(el=>setIcon(el,'crown','zp-i-lg'));
    document.querySelectorAll('.free-wash-badge').forEach(el=>setIcon(el,'gift','zp-i-md'));
  }
  document.addEventListener('DOMContentLoaded', cleanIcons);
  window.addEventListener('load', cleanIcons);
  window.zpRefreshIcons=cleanIcons;
})();

// ===== Next JS block from original file =====

(function(){
  const iconMap={
    'Soap/Supplies':'droplets','Fuel':'fuel','Salary':'briefcase-business','Maintenance':'wrench','Water':'waves','Other':'package'
  };
  function safeLucide(name, cls){
    if(!window.lucide || !lucide.icons || !lucide.icons[name]) return '';
    return '<span class="zp-icon '+(cls||'zp-i-md')+'">'+lucide.icons[name].toSvg()+'</span>';
  }
  function replaceCategoryIconStrings(){
    try{
      if(window.CAT_ICONS){
        Object.keys(iconMap).forEach(k=>{ CAT_ICONS[k]=safeLucide(iconMap[k],'zp-i-md') || CAT_ICONS[k]; });
      }
    }catch(e){}
  }
  function cleanExistingIcons(){
    replaceCategoryIconStrings();
    document.querySelectorAll('.cat-icon').forEach((el,i)=>{
      const label=(el.parentElement&&el.parentElement.textContent||'').trim();
      const name=Object.keys(iconMap).find(k=>label.includes(k));
      if(name && window.lucide && lucide.icons[iconMap[name]]) el.innerHTML=safeLucide(iconMap[name],'zp-i-md');
    });
    document.querySelectorAll('.worker-name-text span svg').forEach(svg=>{svg.setAttribute('width','12');svg.setAttribute('height','12');});
    document.querySelectorAll('.worker-avatar svg,.small-btn svg,.cat-btn svg,.size-btn svg,.tab-strip-btn svg,.period-tab svg').forEach(svg=>{
      svg.removeAttribute('style');
      svg.setAttribute('vector-effect','non-scaling-stroke');
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{replaceCategoryIconStrings();setTimeout(cleanExistingIcons,80);setTimeout(cleanExistingIcons,500);});
  window.addEventListener('load',()=>{replaceCategoryIconStrings();cleanExistingIcons();});
  const oldRefresh=window.zpRefreshIcons;
  window.zpRefreshIcons=function(){ if(typeof oldRefresh==='function') oldRefresh(); cleanExistingIcons(); };
  const obs=new MutationObserver(()=>{clearTimeout(window.__zpIconFixTimer);window.__zpIconFixTimer=setTimeout(cleanExistingIcons,50);});
  document.addEventListener('DOMContentLoaded',()=>obs.observe(document.body,{childList:true,subtree:true}));
})();

// ===== Next JS block from original file =====

/* ═════════ ZIRAKPOS MANUAL CARWASH FEATURE PACK LOGIC ═════════ */
(function(){
  const LS={
    receipt:'zp_receipts_v1',requests:'zp_requests_v1',cash:'zp_cash_reconcile_v1',inventory:'zp_inventory_v1',branches:'zp_branches_v1',activeBranch:'zp_active_branch_v1'
  };
  let currentReceipt=null;
  function read(k,fallback){try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}}
  function write(k,v){localStorage.setItem(k,JSON.stringify(v));}
  function branch(){return localStorage.getItem(LS.activeBranch)||'Main Branch'}
  function branches(){return read(LS.branches,['Main Branch'])}
  function nowStamp(){return new Date().toISOString()}
  function money(n){return (Number(n)||0).toLocaleString()}
  window.handleReceiptUpload=function(e){
    const file=e.target.files&&e.target.files[0];
    if(!file)return;
    const label=document.getElementById('receipt-file-label'),prev=document.getElementById('receipt-preview');
    label.textContent=file.name.length>28?file.name.slice(0,25)+'...':file.name;
    prev.style.display='block';
    const reader=new FileReader();
    reader.onload=function(){currentReceipt={name:file.name,type:file.type,size:file.size,data:reader.result,at:nowStamp(),branch:branch()};};
    reader.readAsDataURL(file);
  };
  const oldAddExpense=window.addExpense;
  window.addExpense=async function(){
    await oldAddExpense.apply(this,arguments);
    if(currentReceipt){
      const arr=read(LS.receipt,[]);
      arr.push({...currentReceipt,worker:window.currentWorker||'',amount:document.getElementById('expense-amount')?.value||'',cat:window.selectedCat||'',date:new Date().toISOString().slice(0,10)});
      write(LS.receipt,arr);
      currentReceipt=null;
      const input=document.getElementById('expense-receipt'); if(input)input.value='';
      const label=document.getElementById('receipt-file-label'); if(label)label.textContent='Upload receipt photo';
      const prev=document.getElementById('receipt-preview'); if(prev)prev.style.display='none';
    }
  };
  window.submitPurchaseRequest=function(){
    const item=document.getElementById('request-item')?.value.trim();
    const qty=document.getElementById('request-qty')?.value.trim();
    const reason=document.getElementById('request-reason')?.value.trim();
    if(!item||!qty){ if(window.showToast)showToast('Item and quantity are required','error'); return; }
    const arr=read(LS.requests,[]);
    arr.unshift({id:Date.now(),item,qty,reason,status:'pending',worker:window.currentWorker||'Worker',branch:branch(),created_at:nowStamp()});
    write(LS.requests,arr);
    ['request-item','request-qty','request-reason'].forEach(id=>{const el=document.getElementById(id); if(el)el.value='';});
    renderRequests(); if(window.showToast)showToast('Request sent to owner','success');
  };
  window.updateRequestStatus=function(id,status){
    const arr=read(LS.requests,[]).map(r=>r.id==id?{...r,status,reviewed_at:nowStamp()}:r);
    write(LS.requests,arr); renderRequests(); if(window.showToast)showToast('Request '+status,'success');
  };
  function renderRequests(){
    const arr=read(LS.requests,[]);
    const workerEl=document.getElementById('worker-request-list');
    const ownerEl=document.getElementById('owner-request-list');
    const card=r=>`<div class="request-card"><div class="request-main"><div class="request-name">${r.item} • ${r.qty}</div><div class="request-meta">${r.reason||'No reason'}<br>${r.worker} • ${r.branch} • ${new Date(r.created_at).toLocaleString()}</div></div><span class="request-status ${r.status}">${r.status}</span></div>`;
    if(workerEl){const mine=arr.filter(r=>!window.currentWorker||r.worker===window.currentWorker).slice(0,5); workerEl.innerHTML=mine.length?mine.map(card).join(''):'<div class="empty-log">No requests yet</div>';}
    if(ownerEl){ownerEl.innerHTML=arr.length?arr.map(r=>`<div class="request-card"><div class="request-main"><div class="request-name">${r.item} • ${r.qty}</div><div class="request-meta">${r.reason||'No reason'}<br>${r.worker} • ${r.branch} • ${new Date(r.created_at).toLocaleString()}</div></div><div style="display:grid;gap:.35rem"><span class="request-status ${r.status}">${r.status}</span>${r.status==='pending'?`<button class="small-btn accent" onclick="updateRequestStatus(${r.id},'approved')">Approve</button><button class="small-btn danger" onclick="updateRequestStatus(${r.id},'rejected')">Reject</button>`:''}</div></div>`).join(''):'<div class="empty-log">No supply requests</div>';}
  }
  window.addInventoryItem=function(){
    const name=document.getElementById('stock-name')?.value.trim(); const unit=document.getElementById('stock-unit')?.value.trim()||'unit';
    const current=Number(document.getElementById('stock-current')?.value||0); const min=Number(document.getElementById('stock-min')?.value||0);
    if(!name){ if(window.showToast)showToast('Enter item name','error'); return; }
    let arr=read(LS.inventory,[]); const idx=arr.findIndex(x=>x.name.toLowerCase()===name.toLowerCase()&&x.branch===branch());
    const item={name,unit,current,min,branch:branch(),updated_at:nowStamp()}; if(idx>=0)arr[idx]=item; else arr.unshift(item); write(LS.inventory,arr);
    ['stock-name','stock-unit','stock-current','stock-min'].forEach(id=>{const el=document.getElementById(id); if(el)el.value='';});
    renderInventory(); if(window.showToast)showToast('Inventory updated','success');
  };
  window.deleteInventoryItem=function(name){write(LS.inventory,read(LS.inventory,[]).filter(x=>!(x.name===name&&x.branch===branch())));renderInventory();}
  function renderInventory(){
    const el=document.getElementById('inventory-list'); if(!el)return;
    const arr=read(LS.inventory,[]).filter(x=>x.branch===branch());
    if(!arr.length){el.innerHTML='<div class="empty-log">No inventory items yet</div>';return;}
    el.innerHTML=arr.map(x=>{const pct=x.min>0?Math.min(100,Math.round((x.current/(x.min*2))*100)):80; const low=x.min>0&&x.current<=x.min; return `<div class="inventory-card"><div class="inventory-main"><div class="inventory-name">${x.name} ${low?'⚠️':''}</div><div class="inventory-meta">${money(x.current)} ${x.unit} remaining • Alert at ${money(x.min)} ${x.unit}</div><div class="stock-bar"><div class="stock-fill ${low?'low':''}" style="width:${pct}%"></div></div></div><button class="small-btn danger" onclick="deleteInventoryItem('${x.name.replace(/'/g,"\\'")}')">Delete</button></div>`}).join('');
  }
  window.addBranch=function(){const input=document.getElementById('new-branch-name'); const name=input?.value.trim(); if(!name)return; const arr=branches(); if(!arr.includes(name))arr.push(name); write(LS.branches,arr); input.value=''; renderBranches();}
  window.setActiveBranch=function(name){localStorage.setItem(LS.activeBranch,name); renderBranches(); renderInventory(); renderRequests(); renderBranchBadges(); if(window.showToast)showToast('Branch changed to '+name,'success');}
  window.deleteBranch=function(name){if(name==='Main Branch')return; let arr=branches().filter(b=>b!==name); write(LS.branches,arr); if(branch()===name)localStorage.setItem(LS.activeBranch,'Main Branch'); renderBranches();}
  function renderBranches(){
    const selector=document.getElementById('branch-selector'),list=document.getElementById('branch-list'); const arr=branches();
    if(selector)selector.innerHTML=arr.map(b=>`<button class="branch-chip ${b===branch()?'active':''}" onclick="setActiveBranch('${b.replace(/'/g,"\\'")}')">${b}</button>`).join('');
    if(list)list.innerHTML=arr.map(b=>`<div class="branch-card"><div class="branch-main"><div class="branch-name">${b}</div><div class="branch-meta">${b===branch()?'Active branch':'Tap branch chip to switch'}</div></div>${b!=='Main Branch'?`<button class="small-btn danger" onclick="deleteBranch('${b.replace(/'/g,"\\'")}')">Delete</button>`:''}</div>`).join('');
  }
  window.saveCashReconciliation=function(){
    const sh=document.getElementById('cash-shift')?.value||'morning'; const counted=Number(document.getElementById('cash-counted')?.value||0);
    const arr=read(LS.cash,[]); arr.unshift({id:Date.now(),shift:sh,counted,worker:window.currentWorker||'',branch:branch(),date:new Date().toISOString().slice(0,10),created_at:nowStamp()}); write(LS.cash,arr);
    const inp=document.getElementById('cash-counted'); if(inp)inp.value=''; renderCash(); if(window.showToast)showToast('Cash count saved','success');
  };
  async function renderCash(){
    const el=document.getElementById('cash-reconcile-list'); if(!el)return;
    const today=new Date().toISOString().slice(0,10); const arr=read(LS.cash,[]).filter(x=>x.date===today&&x.branch===branch());
    let logs=[]; try{logs=await (window.getLogsFor?getLogsFor(today):Promise.resolve([]));}catch{}
    if(!arr.length){el.innerHTML='<div class="empty-log">No cash count saved yet</div>';return;}
    el.innerHTML=arr.map(c=>{const expected=logs.filter(l=>l.shift===c.shift).reduce((s,l)=>s+(l.price||0),0); const diff=c.counted-expected; return `<div class="cash-card"><div class="cash-main"><div class="cash-name">${c.shift} shift • Counted ${money(c.counted)} IQD</div><div class="cash-meta">Expected by system: ${money(expected)} IQD • ${new Date(c.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div></div><div class="cash-diff ${diff===0?'good':'bad'}">${diff>=0?'+':''}${money(diff)}</div></div>`}).join('');
  }
  function renderBranchBadges(){document.querySelectorAll('.topbar-left').forEach(el=>{let b=el.querySelector('.topbar-branch'); if(!b){b=document.createElement('div'); b.className='topbar-branch'; el.appendChild(b);} b.textContent=branch();});}
  const oldLoadCustomers=window.loadCustomers;
  window.loadCustomers=async function(){await oldLoadCustomers.apply(this,arguments); updateCustomerStats();}
  const oldSearchCustomers=window.searchCustomers;
  window.searchCustomers=async function(){await oldSearchCustomers.apply(this,arguments); updateCustomerStats();}
  async function updateCustomerStats(){
    try{const logs=await getAllCustomers(); const map={}; logs.forEach(l=>{if(!l.plate||l.plate==='—')return; if(!map[l.plate])map[l.plate]={spent:0,visits:0}; map[l.plate].spent+=(l.price||0); map[l.plate].visits++;}); const vals=Object.entries(map); const total=vals.reduce((s,[,v])=>s+v.spent,0); const top=vals.sort((a,b)=>b[1].spent-a[1].spent)[0];
      const a=document.getElementById('cust-total-count'),b=document.getElementById('cust-total-spent'),c=document.getElementById('cust-top-spender'); if(a)a.textContent=vals.length; if(b)b.textContent=(total/1000).toFixed(0)+'K'; if(c)c.textContent=top?top[0]:'—';
    }catch(e){}
  }
  const oldUpdateReport=window.updateReport;
  window.updateReport=async function(){await oldUpdateReport.apply(this,arguments); await renderCash();}
  const oldLoadSettings=window.loadSettingsUI;
  window.loadSettingsUI=async function(){await oldLoadSettings.apply(this,arguments); renderBranches(); renderInventory(); renderRequests();}
  const oldShowExpense=window.showExpense;
  if(oldShowExpense) window.showExpense=function(){oldShowExpense.apply(this,arguments); setTimeout(()=>{renderRequests();renderBranchBadges();},100)};
  document.addEventListener('DOMContentLoaded',()=>{renderBranches();renderInventory();renderRequests();renderBranchBadges();setTimeout(renderCash,500);});
  window.addEventListener('load',()=>{renderBranches();renderInventory();renderRequests();renderBranchBadges();});
})();

// ===== Next JS block from original file =====

/* ===== SIDEBAR + EXTRA PAGES LOGIC PATCH ===== */
(function(){
  const EXTRA_LS={workerExtra:'zp_worker_extra_v1',wa:'zp_whatsapp_report_settings_v1'};
  const readLS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const writeLS=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const oldShowScreen=window.showScreen;
  window.showScreen=function(id){
    oldShowScreen(id);
    document.body.classList.toggle('zp-auth',id==='screen-login'||id==='screen-success');
    document.querySelectorAll('.zp-side-btn').forEach(b=>b.classList.toggle('active',b.dataset.target===id));
    if(id==='screen-workers') renderWorkersProfilePage();
    if(id==='screen-inventory'&&window.renderInventory) renderInventory();
    if(id==='screen-requests'&&window.renderRequests) renderRequests();
    if(id==='screen-cash'&&window.renderCash) renderCash();
    if(id==='screen-branches'&&window.renderBranches) renderBranches();
    if(id==='screen-whatsapp') renderWhatsAppSettings();
    if(window.lucide) lucide.createIcons();
  };
  window.showWorkersPage=async function(){showScreen('screen-workers'); await renderWorkersProfilePage();};
  window.showInventoryPage=function(){showScreen('screen-inventory'); if(window.renderInventory)renderInventory();};
  window.showRequestsPage=function(){showScreen('screen-requests'); if(window.renderRequests)renderRequests();};
  window.showCashPage=function(){showScreen('screen-cash'); if(window.renderCash)renderCash();};
  window.showBranchesPage=function(){showScreen('screen-branches'); if(window.renderBranches)renderBranches();};
  window.showWhatsAppPage=function(){showScreen('screen-whatsapp'); renderWhatsAppSettings();};

  async function getWorkerAccounts(){try{return await getAccounts()}catch(e){return window._accounts||DEFAULT_ACCOUNTS||[]}}
  window.renderWorkersProfilePage=async function(){
    const list=document.getElementById('workers-profile-list'); if(!list)return;
    const accounts=await getWorkerAccounts(); const extra=readLS(EXTRA_LS.workerExtra,{});
    list.innerHTML=accounts.map((a,i)=>{const ex=extra[a.username]||{}; const initials=(a.name||a.username||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
      return `<div class="worker-profile-card">
        <label class="worker-photo" title="Upload worker image"><input type="file" accept="image/*" style="display:none" onchange="saveWorkerPhoto('${a.username}',this)">${ex.photo?`<img src="${ex.photo}">`:initials}</label>
        <div><div class="worker-profile-top"><div><div class="worker-profile-name">${a.name||'Unnamed Worker'}</div><div class="worker-profile-meta">@${a.username} • ${a.role||'worker'} • PIN ${a.pin||'----'}</div></div><span class="worker-status-pill">${ex.status||'Active'}</span></div>
        <div class="worker-profile-fields"><input class="mini-input" id="w_phone_${i}" placeholder="Phone number" value="${ex.phone||''}"><input class="mini-input" id="w_salary_${i}" placeholder="Salary / month" value="${ex.salary||''}"><input class="mini-input" id="w_shift_${i}" placeholder="Shift e.g. Morning" value="${ex.shift||''}"><select class="mini-select" id="w_status_${i}"><option ${ex.status==='Active'?'selected':''}>Active</option><option ${ex.status==='On Leave'?'selected':''}>On Leave</option><option ${ex.status==='Left Work'?'selected':''}>Left Work</option></select></div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button class="small-btn accent" onclick="saveWorkerExtra('${a.username}',${i})">Save Info</button><button class="small-btn" onclick="openEditWorker(${i})">Edit Login</button></div></div>
      </div>`}).join('')||'<div class="empty-log">No workers found</div>';
    if(window.lucide)lucide.createIcons();
  };
  window.saveWorkerExtra=function(username,i){const extra=readLS(EXTRA_LS.workerExtra,{});extra[username]={...(extra[username]||{}),phone:document.getElementById('w_phone_'+i)?.value||'',salary:document.getElementById('w_salary_'+i)?.value||'',shift:document.getElementById('w_shift_'+i)?.value||'',status:document.getElementById('w_status_'+i)?.value||'Active'};writeLS(EXTRA_LS.workerExtra,extra); if(window.showToast)showToast('Worker information saved','success'); renderWorkersProfilePage();};
  window.saveWorkerPhoto=function(username,input){const file=input.files&&input.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{const extra=readLS(EXTRA_LS.workerExtra,{});extra[username]={...(extra[username]||{}),photo:reader.result};writeLS(EXTRA_LS.workerExtra,extra);renderWorkersProfilePage(); if(window.showToast)showToast('Worker image saved','success');}; reader.readAsDataURL(file);};
  window.saveWhatsAppSettings=function(){const data={phone:document.getElementById('wa-owner-phone')?.value||'',daily:document.getElementById('wa-daily')?.value||'on',delay:Number(document.getElementById('wa-delay')?.value||2),weekly:document.getElementById('wa-weekly')?.value||'on',monthly:document.getElementById('wa-monthly')?.value||'on'}; writeLS(EXTRA_LS.wa,data); renderWhatsAppSettings(); if(window.showToast)showToast('WhatsApp report settings saved','success');};
  window.renderWhatsAppSettings=function(){const d=readLS(EXTRA_LS.wa,{phone:'',daily:'on',delay:2,weekly:'on',monthly:'on'}); const set=(id,val)=>{const el=document.getElementById(id); if(el)el.value=val}; set('wa-owner-phone',d.phone); set('wa-daily',d.daily); set('wa-delay',d.delay); set('wa-weekly',d.weekly); set('wa-monthly',d.monthly); const p=document.getElementById('wa-preview'); if(p)p.textContent=`ZirakPOS Daily Report
Branch: ${localStorage.getItem('zp_active_branch_v1')||'Main Branch'}
Cars washed: 42
Revenue: 850,000 IQD
Expenses: 120,000 IQD
Net profit: 730,000 IQD

Morning shift: 18 cars — 360,000 IQD
Evening shift: 24 cars — 490,000 IQD

This report will send to: ${d.phone||'+9647XXXXXXXXX'}
Timing: ${d.delay} hour(s) after shift ends`; if(window.lucide)lucide.createIcons();};
  document.addEventListener('DOMContentLoaded',()=>{document.body.classList.toggle('zp-auth',!!document.querySelector('#screen-login.active')); if(window.lucide)lucide.createIcons();});
})();

// ===== Next JS block from original file =====

/* ===== RESPONSIVE SIDEBAR TOGGLE ===== */
(function(){
  function isDesktop(){return window.matchMedia('(min-width:980px)').matches;}
  window.toggleZpSidebar=function(){
    if(document.body.classList.contains('zp-auth')) return;
    if(isDesktop()){
      document.body.classList.toggle('zp-sidebar-collapsed');
      document.body.classList.remove('zp-sidebar-open');
    }else{
      document.body.classList.toggle('zp-sidebar-open');
      document.body.classList.remove('zp-sidebar-collapsed');
    }
  };
  window.closeZpSidebar=function(){document.body.classList.remove('zp-sidebar-open');};
  function addMenuButtons(){
    document.querySelectorAll('.topbar-right').forEach(function(right){
      if(right.querySelector('.zp-menu-btn')) return;
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='zp-menu-btn';
      btn.setAttribute('aria-label','Open menu');
      btn.innerHTML='<i data-lucide="menu"></i>';
      btn.onclick=window.toggleZpSidebar;
      right.insertBefore(btn,right.firstChild);
    });
    if(window.lucide) lucide.createIcons();
  }
  document.addEventListener('DOMContentLoaded',addMenuButtons);
  window.addEventListener('load',addMenuButtons);
  window.addEventListener('resize',function(){
    if(isDesktop()) document.body.classList.remove('zp-sidebar-open');
    else document.body.classList.remove('zp-sidebar-collapsed');
  });
  document.addEventListener('click',function(e){
    if(!isDesktop() && e.target.closest('.zp-side-btn')) closeZpSidebar();
  });
})();

// ===== Next JS block from original file =====

/* ===== ZIRAKPOS DATE RANGE REPORT + EXCEL EXPORT + RECEIPT PATCH ===== */
(function(){
  let reportStartDate = null;
  let reportEndDate = null;
  let reportQuick = 'today';
  let lastReportData = {logs:[], expenses:[], start:'', end:''};
  window.zpLastReceipt = null;

  function iso(d){return new Date(d).toISOString().slice(0,10)}
  function today(){return iso(new Date())}
  function addDays(base,days){const d=new Date(base);d.setDate(d.getDate()+days);return d}
  function monthStart(d=new Date()){return new Date(d.getFullYear(),d.getMonth(),1)}
  function monthEnd(d=new Date()){return new Date(d.getFullYear(),d.getMonth()+1,0)}
  function fmtDate(d){try{return new Date(d+'T00:00:00').toLocaleDateString([], {year:'numeric',month:'short',day:'numeric'})}catch{return d}}
  function currency(n){return (Number(n)||0).toLocaleString()+' IQD'}
  function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  function keysBetween(start,end){
    const out=[];let d=new Date(start+'T00:00:00');const e=new Date(end+'T00:00:00');
    let guard=0;while(d<=e && guard<800){out.push(iso(d));d.setDate(d.getDate()+1);guard++;}
    return out;
  }
  async function safeRangeFetch(table,start,end){
    try{return await sbFetch(`${table}?log_date=gte.${start}&log_date=lte.${end}&order=log_date.asc,created_at.asc&select=*`)}catch(err){
      let all=[];for(const k of keysBetween(start,end)){try{const rows=table==='car_logs'?await getLogsFor(k):await getExpFor(k);all=all.concat(rows)}catch{}}
      return all;
    }
  }
  async function getReportData(start,end){
    const [logs,expenses]=await Promise.all([safeRangeFetch('car_logs',start,end),safeRangeFetch('expenses',start,end)]);
    return {logs:logs||[],expenses:expenses||[],start,end};
  }
  function currentRangeFromPeriod(){
    const now=new Date();
    if(reportStartDate && reportEndDate) return {start:reportStartDate,end:reportEndDate};
    if(window.currentPeriod==='week'){const s=addDays(now,-6);return {start:iso(s),end:iso(now)}}
    if(window.currentPeriod==='month'){return {start:iso(monthStart(now)),end:iso(monthEnd(now))}}
    return {start:today(),end:today()};
  }
  function setInputs(start,end){
    const s=document.getElementById('report-start-date'), e=document.getElementById('report-end-date');
    if(s)s.value=start;if(e)e.value=end;
    const label=document.getElementById('report-range-label');
    if(label)label.textContent=start===end?fmtDate(start):`${fmtDate(start)} → ${fmtDate(end)}`;
  }
  function syncQuickButtons(active){
    document.querySelectorAll('.report-chip').forEach(b=>b.classList.toggle('active',b.dataset.range===active));
  }
  function injectReportControls(){
    if(document.getElementById('report-range-panel')) return;
    const content=document.querySelector('#screen-report .report-content');
    if(!content) return;
    const tabs=content.querySelector('.period-tabs');
    const panel=document.createElement('div');
    panel.className='report-range-panel';
    panel.id='report-range-panel';
    panel.innerHTML=`
      <div class="report-range-title"><span>Custom Report Period</span><span id="report-range-label">Today</span></div>
      <div class="report-quick">
        <button class="report-chip active" data-range="today" onclick="setReportQuickRange('today')">Today</button>
        <button class="report-chip" data-range="yesterday" onclick="setReportQuickRange('yesterday')">Yesterday</button>
        <button class="report-chip" data-range="7days" onclick="setReportQuickRange('7days')">Last 7 Days</button>
        <button class="report-chip" data-range="thisMonth" onclick="setReportQuickRange('thisMonth')">This Month</button>
        <button class="report-chip" data-range="lastMonth" onclick="setReportQuickRange('lastMonth')">Last Month</button>
        <button class="report-chip" data-range="custom" onclick="setReportQuickRange('custom')">Custom</button>
      </div>
      <div class="report-range-grid">
        <div class="report-field"><label>From</label><input class="report-input" id="report-start-date" type="date"></div>
        <div class="report-field"><label>To</label><input class="report-input" id="report-end-date" type="date"></div>
        <button class="report-btn" onclick="applyCustomReportRange()">Apply</button>
        <button class="report-btn secondary" onclick="exportReportExcel()">Export Excel</button>
      </div>
      <div class="report-range-note">Choose any date range, for example only March 1–3, or all of March and April, then export the exact report to Excel.</div>`;
    if(tabs) tabs.insertAdjacentElement('afterend', panel); else content.prepend(panel);
    const breakdown=document.createElement('div');
    breakdown.id='range-breakdown-section';
    breakdown.className='profit-bar-wrap';
    breakdown.innerHTML='<div class="stat-label">PERIOD BREAKDOWN</div><div class="breakdown-list" id="range-breakdown-list"></div>';
    const chart=document.getElementById('chart-section');
    if(chart) chart.insertAdjacentElement('beforebegin', breakdown); else content.appendChild(breakdown);
    const r=currentRangeFromPeriod();setInputs(r.start,r.end);
  }

  window.setReportQuickRange = async function(type){
    reportQuick=type;syncQuickButtons(type);
    const now=new Date();let start,end;
    if(type==='today'){start=end=today();window.currentPeriod='today';}
    else if(type==='yesterday'){start=end=iso(addDays(now,-1));window.currentPeriod='custom';}
    else if(type==='7days'){start=iso(addDays(now,-6));end=today();window.currentPeriod='week';}
    else if(type==='thisMonth'){start=iso(monthStart(now));end=iso(monthEnd(now));window.currentPeriod='month';}
    else if(type==='lastMonth'){const d=new Date(now.getFullYear(),now.getMonth()-1,1);start=iso(monthStart(d));end=iso(monthEnd(d));window.currentPeriod='custom';}
    else {const r=currentRangeFromPeriod();start=r.start;end=r.end;window.currentPeriod='custom';}
    reportStartDate=start;reportEndDate=end;setInputs(start,end);await updateReport();
  }
  window.applyCustomReportRange = async function(){
    const s=document.getElementById('report-start-date')?.value;
    const e=document.getElementById('report-end-date')?.value;
    if(!s||!e){showToast('Choose start and end date','error');return}
    if(s>e){showToast('Start date cannot be after end date','error');return}
    reportStartDate=s;reportEndDate=e;window.currentPeriod='custom';syncQuickButtons('custom');setInputs(s,e);await updateReport();
  }

  function renderRangeBreakdown(logs,expenses,start,end){
    const el=document.getElementById('range-breakdown-list'); if(!el) return;
    const days=keysBetween(start,end).length;
    const groupByMonth=days>45;
    const map={};
    function key(row){const d=row.log_date||iso(row.created_at||new Date());return groupByMonth?d.slice(0,7):d}
    logs.forEach(l=>{const k=key(l);map[k]??={cars:0,revenue:0,expenses:0};map[k].cars++;map[k].revenue+=Number(l.price)||0});
    expenses.forEach(e=>{const k=key(e);map[k]??={cars:0,revenue:0,expenses:0};map[k].expenses+=Number(e.amount)||0});
    const entries=Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0]));
    if(!entries.length){el.innerHTML='<div class="empty-log">No records in this period</div>';return}
    el.innerHTML=entries.map(([k,v])=>{
      const profit=v.revenue-v.expenses;
      const label=groupByMonth?new Date(k+'-01T00:00:00').toLocaleDateString([], {year:'numeric',month:'long'}):fmtDate(k);
      return `<div class="breakdown-item"><div><div class="breakdown-label">${label}</div><div class="breakdown-meta">${v.cars} cars</div></div><div class="breakdown-val" style="color:var(--green)">${currency(v.revenue)}</div><div class="breakdown-val" style="color:var(--red)">-${currency(v.expenses)}</div><div class="breakdown-val" style="color:${profit>=0?'var(--yellow)':'var(--red)'}">${currency(profit)}</div></div>`
    }).join('')
  }

  const oldShowReport=window.showReport;
  window.showReport=async function(){
    injectReportControls();
    reportStartDate=today();reportEndDate=today();reportQuick='today';syncQuickButtons('today');setInputs(reportStartDate,reportEndDate);
    if(oldShowReport) await oldShowReport(); else {showScreen('screen-report');await updateReport();}
    injectReportControls();
  }
  const oldSetPeriod=window.setPeriod;
  window.setPeriod=async function(period,btn){
    reportStartDate=null;reportEndDate=null;reportQuick=period==='today'?'today':period==='week'?'7days':period==='month'?'thisMonth':'custom';syncQuickButtons(reportQuick);
    if(oldSetPeriod) return oldSetPeriod(period,btn);
    window.currentPeriod=period;await updateReport();
  }
  window.updateReport=async function(){
    injectReportControls();
    showLoading('Loading report...');
    const r=currentRangeFromPeriod();setInputs(r.start,r.end);
    const data=await getReportData(r.start,r.end);lastReportData=data;window.zpLastReportData=data;
    hideLoading();
    const allLogs=data.logs, allExps=data.expenses;
    const revenue=allLogs.reduce((s,l)=>s+(Number(l.price)||0),0);
    const totalExp=allExps.reduce((s,e)=>s+(Number(e.amount)||0),0);
    const profit=revenue-totalExp;
    document.getElementById('stat-cars').textContent=allLogs.length;
    document.getElementById('stat-revenue').textContent=revenue.toLocaleString();
    document.getElementById('stat-expenses').textContent=totalExp.toLocaleString();
    const profEl=document.getElementById('stat-profit');profEl.textContent=Math.abs(profit).toLocaleString();profEl.className='stat-value '+(profit>=0?'yellow':'red');
    const bar=document.getElementById('profit-bar');const pct=revenue>0?Math.round((profit/revenue)*100):0;
    bar.style.width=Math.max(0,Math.min(100,pct))+'%';bar.className='profit-bar-fill'+(profit<0?' loss':'');
    document.getElementById('profit-pct').textContent=pct+'%';
    const oneDay=r.start===r.end;
    const shift=document.getElementById('shift-section'); if(shift){shift.style.display=oneDay?'block':'block'; shift.querySelector('.section-label').textContent=oneDay?'SHIFT BREAKDOWN':'SHIFT BREAKDOWN — SELECTED PERIOD';}
    renderShifts(allLogs);
    const chart=document.getElementById('chart-section');if(chart) chart.style.display=keysBetween(r.start,r.end).length>1?'block':'none';
    if(keysBetween(r.start,r.end).length>1) renderBarChart(keysBetween(r.start,r.end), allLogs);
    renderRangeBreakdown(allLogs,allExps,r.start,r.end);
    renderLogTab(window.currentLogTab||'cars',allLogs,allExps);
  }
  window.switchLogTab=async function(tab,btn){
    window.currentLogTab=tab;
    document.querySelectorAll('.tab-strip-btn').forEach(b=>b.classList.remove('active'));
    if(btn)btn.classList.add('active');
    renderLogTab(tab,lastReportData.logs||[],lastReportData.expenses||[]);
  }
  window.exportReportExcel=function(){
    const data=lastReportData||{};const logs=data.logs||[], exps=data.expenses||[];
    if(!logs.length && !exps.length){showToast('No data to export','warn');return}
    const revenue=logs.reduce((s,l)=>s+(Number(l.price)||0),0), expenses=exps.reduce((s,e)=>s+(Number(e.amount)||0),0), profit=revenue-expenses;
    const table=(title,headers,rows)=>`<h2>${title}</h2><table border="1"><tr>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</table>`;
    const html=`<html><head><meta charset="UTF-8"></head><body>
      ${table('Summary',['From','To','Cars','Revenue IQD','Expenses IQD','Net Profit IQD'],[[data.start,data.end,logs.length,revenue,expenses,profit]])}
      ${table('Cars',['Date','Plate','Size','Service','Shift','Worker','Price IQD','Free Wash'],logs.map(l=>[l.log_date,l.plate,l.size,l.service,l.shift,l.worker,l.price||0,l.is_free?'Yes':'No']))}
      ${table('Expenses',['Date','Category','Amount IQD','Worker','Note'],exps.map(e=>[e.log_date,e.cat,e.amount||0,e.worker,e.note||'']))}
      </body></html>`;
    const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8;'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ZirakPOS_Report_${data.start}_to_${data.end}.xls`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);
    showToast('Excel report exported','success');
  }

  function buildReceiptText(r){
    return `ZirakPOS Receipt\nReceipt: ${r.no}\nPlate: ${r.plate}\nSize: ${r.size}\nService: ${r.service}\nShift: ${r.shift}\nWorker: ${r.worker}\nTime: ${r.time}\nTotal: ${r.total}`;
  }
  function injectReceiptButtons(){
    if(document.getElementById('receipt-actions')) return;
    const receipt=document.querySelector('#screen-success .receipt'); if(!receipt)return;
    receipt.id='print-receipt-area';
    const no=document.createElement('div');no.className='receipt-no';no.id='receipt-no-line';no.textContent='Receipt No: —';receipt.insertAdjacentElement('beforebegin',no);
    const send=document.createElement('div');send.className='receipt-send-row';send.innerHTML='<input id="receipt-phone-input" class="receipt-phone" placeholder="Customer WhatsApp number"><button class="receipt-btn primary" onclick="sendReceiptWhatsApp()">Send</button>';receipt.insertAdjacentElement('afterend',send);
    const actions=document.createElement('div');actions.className='receipt-actions';actions.id='receipt-actions';actions.innerHTML='<button class="receipt-btn" onclick="printReceipt()">Print Receipt</button><button class="receipt-btn" onclick="copyReceiptText()">Copy Text</button>';send.insertAdjacentElement('afterend',actions);
  }
  window.printReceipt=function(){injectReceiptButtons();window.print();}
  window.copyReceiptText=async function(){const r=window.zpLastReceipt;if(!r){showToast('No receipt found','error');return}try{await navigator.clipboard.writeText(buildReceiptText(r));showToast('Receipt copied','success')}catch{showToast('Copy failed','error')}}
  window.sendReceiptWhatsApp=function(){
    const r=window.zpLastReceipt;if(!r){showToast('No receipt found','error');return}
    let phone=(document.getElementById('receipt-phone-input')?.value||'').replace(/[^0-9]/g,'');
    if(!phone){showToast('Enter customer WhatsApp number','error');return}
    if(phone.startsWith('0')) phone='964'+phone.slice(1);
    const url='https://wa.me/'+phone+'?text='+encodeURIComponent(buildReceiptText(r));
    window.open(url,'_blank');
  }
  const oldConfirm=window.confirmEntry;
  window.confirmEntry=async function(){
    await oldConfirm();
    injectReceiptButtons();
    const no='ZR-'+new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
    const r={
      no, plate:document.getElementById('rec-plate')?.textContent||'—', size:document.getElementById('rec-size')?.textContent||'—', service:document.getElementById('rec-service')?.textContent||'—', shift:document.getElementById('rec-shift')?.textContent||'—', worker:document.getElementById('rec-worker')?.textContent||'—', time:document.getElementById('rec-time')?.textContent||'—', total:document.getElementById('rec-total')?.textContent||'—'
    };
    window.zpLastReceipt=r;
    const line=document.getElementById('receipt-no-line');if(line)line.textContent='Receipt No: '+no;
  }
  document.addEventListener('DOMContentLoaded',()=>{injectReportControls();injectReceiptButtons();});
})();

// ===== Next JS block from original file =====

/* ===== SIMPLE CAR READY REMINDER FEATURE ===== */
(function(){
  const LS_KEY='zp_car_ready_reminders_v1';
  function read(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'[]')}catch{return []}}
  function write(arr){localStorage.setItem(LS_KEY,JSON.stringify(arr))}
  function normPlate(p){return String(p||'').trim().toUpperCase().replace(/\s+/g,' ')}
  function normalizePhone(p){let n=String(p||'').replace(/[^0-9]/g,''); if(n.startsWith('0'))n='964'+n.slice(1); return n}
  function nowTime(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}

  window.showRemindersPage=function(){showScreen('screen-reminders');renderRemindersPage(); if(window.closeZpSidebar)closeZpSidebar();}
  window.renderRemindersPage=function(){
    const list=document.getElementById('reminder-list'); if(!list)return;
    const arr=read();
    if(!arr.length){list.innerHTML='<div class="empty-log">No reminders yet</div>'; if(window.lucide)lucide.createIcons(); return;}
    list.innerHTML=arr.map((r,i)=>`
      <div class="reminder-item">
        <div>
          <div class="reminder-plate">${r.plate}</div>
          <div class="reminder-meta">${r.phoneDisplay||r.phone||''} • Added ${r.time||''} • ${r.worker||window.currentWorker||''}</div>
          <span class="reminder-status">Waiting for ready WhatsApp</span>
        </div>
        <div class="reminder-item-actions">
          <button class="small-btn accent" onclick="sendReadyReminder(${i})"><i data-lucide="send"></i> Send WhatsApp</button>
          <button class="small-btn danger" onclick="removeCarReminder(${i})"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`).join('');
    if(window.lucide)lucide.createIcons();
  }
  window.focusReminderPlate=function(){const el=document.getElementById('reminder-plate'); if(el)el.focus();}
  window.startReminderScan=function(){
    const fi=document.getElementById('hidden-file-input');
    if(!fi){showToast('Scanner input not found','error');return;}
    fi.onchange=handleReminderPhoto;
    fi.click();
  }
  function handleReminderPhoto(e){
    const file=e.target.files&&e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=document.getElementById('reminder-photo-preview'); const empty=document.getElementById('reminder-scan-empty');
      if(img){img.src=ev.target.result;img.style.display='block'} if(empty)empty.style.display='none';
      setTimeout(()=>{
        const codes=['21','22','23','24']; const letters=['A','B','C','D','M','R','S','K','N','H'];
        const plate=codes[Math.floor(Math.random()*codes.length)]+' '+letters[Math.floor(Math.random()*letters.length)]+' '+String(Math.floor(Math.random()*90000)+10000);
        const input=document.getElementById('reminder-plate'); if(input)input.value=plate;
        showToast('Plate scanned for reminder','success');
      },1000);
    };
    reader.readAsDataURL(file); e.target.value='';
  }
  window.addCarReminder=function(){
    const phoneEl=document.getElementById('reminder-phone'), plateEl=document.getElementById('reminder-plate');
    const phoneDisplay=(phoneEl?.value||'').trim(); const phone=normalizePhone(phoneDisplay); const plate=normPlate(plateEl?.value);
    if(!phone||!plate){showToast('Enter customer number and plate','error');return;}
    let arr=read().filter(r=>normPlate(r.plate)!==plate);
    arr.unshift({id:'REM-'+Date.now(),plate,phone,phoneDisplay:phoneDisplay||phone,time:nowTime(),created_at:new Date().toISOString(),worker:window.currentWorker||'—'});
    write(arr);
    if(phoneEl)phoneEl.value=''; if(plateEl)plateEl.value='';
    const img=document.getElementById('reminder-photo-preview'), empty=document.getElementById('reminder-scan-empty'); if(img){img.style.display='none';img.src=''} if(empty)empty.style.display='block';
    renderRemindersPage(); showToast('Reminder added','success');
  }
  window.sendReadyReminder=function(i){
    const arr=read(); const r=arr[i]; if(!r)return;
    const msg=`ZirakPOS Reminder\nYour car ${r.plate} is ready ✅\nYou can come pick it up now.`;
    window.open('https://wa.me/'+r.phone+'?text='+encodeURIComponent(msg),'_blank');
    showToast('WhatsApp opened for reminder','success');
  }
  window.removeCarReminder=function(i){const arr=read(); arr.splice(i,1); write(arr); renderRemindersPage(); showToast('Reminder removed','warn');}
  window.autoRemoveReminderByPlate=function(plate){
    const p=normPlate(plate); if(!p||p==='—')return;
    const arr=read(); const next=arr.filter(r=>normPlate(r.plate)!==p);
    if(next.length!==arr.length){write(next); if(document.getElementById('screen-reminders')?.classList.contains('active'))renderRemindersPage(); showToast('Reminder auto-removed for '+p,'success');}
  }
  const prevShowScreen=window.showScreen;
  if(prevShowScreen && !window.__zpReminderShowWrapped){
    window.__zpReminderShowWrapped=true;
    window.showScreen=function(id){prevShowScreen(id); if(id==='screen-reminders')renderRemindersPage();};
  }
  const prevConfirm=window.confirmEntry;
  if(prevConfirm && !window.__zpReminderConfirmWrapped){
    window.__zpReminderConfirmWrapped=true;
    window.confirmEntry=async function(){
      await prevConfirm();
      const p=document.getElementById('rec-plate')?.textContent || window.detectedPlate || '';
      autoRemoveReminderByPlate(p);
    };
  }
  document.addEventListener('DOMContentLoaded',()=>{if(window.lucide)lucide.createIcons();});
})();

// ===== Next JS block from original file =====

/* ===== FINAL UX FIXES PATCH ===== */
(function(){
  const LS_RECEIPTS='zp_receipts_v1';
  const LS_REQUESTS='zp_requests_v1';
  const WORKER_EXTRA='zp_worker_extra_v1';
  let pendingRequestImage=null;
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const money=n=>(Number(n)||0).toLocaleString();
  function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  window.closeZpDetailModal=function(){document.getElementById('zp-detail-modal')?.classList.remove('active');document.body.classList.remove('zp-print-detail')};
  function openDetail(title,body){document.getElementById('zp-detail-title').textContent=title;document.getElementById('zp-detail-body').innerHTML=body;document.getElementById('zp-detail-modal').classList.add('active');if(window.lucide)lucide.createIcons();}
  window.zpPrintDetail=function(){document.body.classList.add('zp-print-detail');setTimeout(()=>window.print(),50);setTimeout(()=>document.body.classList.remove('zp-print-detail'),700)};
  window.zpCopyDetail=async function(text){try{await navigator.clipboard.writeText(text); if(window.showToast)showToast('Copied','success')}catch{if(window.showToast)showToast('Copy failed','error')}};

  // 1) Move Purchase Request form to its own section and add image upload.
  function setupPurchaseRequests(){
    const expenseRequestCard=[...document.querySelectorAll('#screen-expense .expense-form')].find(el=>el.textContent.includes('REQUEST SUPPLIES FROM OWNER'));
    if(expenseRequestCard) expenseRequestCard.classList.add('zp-hidden');
    const reqScreen=document.querySelector('#screen-requests .settings-content');
    if(reqScreen && !document.getElementById('request-create-card')){
      const card=document.createElement('div');
      card.className='zp-page-card full';
      card.id='request-create-card';
      card.innerHTML=`<div class="zp-card-title"><i data-lucide="package-plus"></i> New Purchase Request</div>
      <div class="request-form">
        <input class="mini-input" id="request-item" placeholder="Product name, e.g. Foam soap, towels, wax">
        <input class="mini-input" id="request-qty" placeholder="Quantity needed, e.g. 20L or 5 pieces">
        <textarea class="mini-textarea" id="request-reason" placeholder="Why do you need it?"></textarea>
        <label class="upload-box"><span id="request-image-label">Upload product image</span><input id="request-image" type="file" accept="image/*" onchange="handleRequestImageUpload(event)"><i data-lucide="image-plus"></i></label>
        <img class="request-img-preview" id="request-image-preview" alt="Product image preview">
        <button class="mini-btn" onclick="submitPurchaseRequest()"><i data-lucide="send"></i> Send Request</button>
      </div>`;
      reqScreen.insertBefore(card,reqScreen.firstChild);
    }
    const plus=document.querySelector('#screen-requests .topbar-right .icon-btn');
    if(plus) plus.setAttribute('onclick',"document.getElementById('request-item')?.focus()");
  }
  window.handleRequestImageUpload=function(e){
    const file=e.target.files&&e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{pendingRequestImage={name:file.name,type:file.type,data:reader.result}; const img=document.getElementById('request-image-preview'); if(img){img.src=reader.result;img.style.display='block'} const label=document.getElementById('request-image-label'); if(label)label.textContent=file.name.length>28?file.name.slice(0,25)+'...':file.name;};
    reader.readAsDataURL(file);
  };
  window.submitPurchaseRequest=function(){
    const item=document.getElementById('request-item')?.value.trim();
    const qty=document.getElementById('request-qty')?.value.trim();
    const reason=document.getElementById('request-reason')?.value.trim();
    if(!item||!qty){ if(window.showToast)showToast('Item and quantity are required','error'); return; }
    const arr=read(LS_REQUESTS,[]);
    arr.unshift({id:Date.now(),item,qty,reason,status:'pending',worker:window.currentWorker||'Worker',branch:localStorage.getItem('zp_active_branch_v1')||'Main Branch',created_at:new Date().toISOString(),image:pendingRequestImage});
    write(LS_REQUESTS,arr); pendingRequestImage=null;
    ['request-item','request-qty','request-reason'].forEach(id=>{const el=document.getElementById(id); if(el)el.value='';});
    const img=document.getElementById('request-image-preview'); if(img){img.removeAttribute('src');img.style.display='none'}
    const file=document.getElementById('request-image'); if(file)file.value=''; const label=document.getElementById('request-image-label'); if(label)label.textContent='Upload product image';
    renderRequests(); if(window.showToast)showToast('Request sent to owner','success');
  };
  window.renderRequests=function(){
    const arr=read(LS_REQUESTS,[]);
    const ownerEl=document.getElementById('owner-request-list');
    const workerEl=document.getElementById('worker-request-list');
    const card=(r,owner=false)=>`<div class="request-card with-img"><div style="display:flex;gap:10px;align-items:center;min-width:0">${r.image?.data?`<img class="request-thumb" src="${r.image.data}" alt="Product image">`:''}<div class="request-main"><div class="request-name">${escapeHtml(r.item)} • ${escapeHtml(r.qty)}</div><div class="request-meta">${escapeHtml(r.reason||'No reason')}<br>${escapeHtml(r.worker||'Worker')} • ${escapeHtml(r.branch||'Main Branch')} • ${new Date(r.created_at).toLocaleString()}</div></div></div><div style="display:grid;gap:.35rem;justify-items:end"><span class="request-status ${r.status}">${r.status}</span>${owner&&r.status==='pending'?`<button class="small-btn accent" onclick="updateRequestStatus(${r.id},'approved')">Approve</button><button class="small-btn danger" onclick="updateRequestStatus(${r.id},'rejected')">Reject</button>`:''}</div></div>`;
    if(ownerEl) ownerEl.innerHTML=arr.length?arr.map(r=>card(r,true)).join(''):'<div class="empty-log">No supply requests</div>';
    if(workerEl) workerEl.innerHTML=arr.length?arr.slice(0,5).map(r=>card(r,false)).join(''):'<div class="empty-log">No requests yet</div>';
    if(window.lucide)lucide.createIcons();
  };

  // 2) Inventory units as dropdown instead of typed text.
  function setupUnitDropdown(){
    const old=document.getElementById('stock-unit');
    if(old && old.tagName!=='SELECT'){
      const select=document.createElement('select'); select.className=old.className||'mini-select'; select.id='stock-unit';
      select.innerHTML='<option value="L">Liter (L)</option><option value="ml">Milliliter (ml)</option><option value="pcs">Pieces (pcs)</option><option value="box">Box</option><option value="kg">Kilogram (kg)</option><option value="pack">Pack</option><option value="roll">Roll</option><option value="bottle">Bottle</option>';
      old.replaceWith(select);
    }
  }

  // 3) Workers as ID cards; edit only when Edit clicked.
  async function getAccountsSafe(){try{return await getAccounts()}catch{return window._accounts||window.DEFAULT_ACCOUNTS||[]}}
  window.renderWorkersProfilePage=async function(){
    const list=document.getElementById('workers-profile-list'); if(!list)return;
    const accounts=await getAccountsSafe(); const extra=read(WORKER_EXTRA,{});
    list.className='worker-id-grid';
    list.innerHTML=(accounts||[]).map((a,i)=>{const ex=extra[a.username]||{}; const initials=(a.name||a.username||'?').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
      return `<div class="worker-id-card">
        <label class="worker-id-photo" title="Upload worker image"><input type="file" accept="image/*" style="display:none" onchange="saveWorkerPhoto('${escapeHtml(a.username)}',this)">${ex.photo?`<img src="${ex.photo}" alt="${escapeHtml(a.name)}">`:initials}</label>
        <div><div class="worker-id-name">${escapeHtml(a.name||'Unnamed Worker')}</div><div class="worker-id-role">${escapeHtml(a.role||'worker')} • ${escapeHtml(ex.status||'Active')}</div>
          <div class="worker-id-line"><i data-lucide="phone"></i><span>${escapeHtml(ex.phone||'No phone added')}</span></div>
          <div class="worker-id-line"><i data-lucide="banknote"></i><span>${escapeHtml(ex.salary||'No salary added')}</span></div>
          <div class="worker-id-actions"><button class="small-btn accent" onclick="toggleWorkerEdit(${i})">Edit</button><button class="small-btn" onclick="openEditWorker(${i})">Edit Login</button></div>
          <div class="worker-edit-panel" id="worker-edit-${i}"><input class="mini-input" id="w_phone_${i}" placeholder="Phone number" value="${escapeHtml(ex.phone||'')}"><input class="mini-input" id="w_salary_${i}" placeholder="Salary / month" value="${escapeHtml(ex.salary||'')}"><input class="mini-input" id="w_shift_${i}" placeholder="Shift e.g. Morning" value="${escapeHtml(ex.shift||'')}"><select class="mini-select" id="w_status_${i}"><option ${ex.status==='Active'?'selected':''}>Active</option><option ${ex.status==='On Leave'?'selected':''}>On Leave</option><option ${ex.status==='Left Work'?'selected':''}>Left Work</option></select><button class="mini-btn" onclick="saveWorkerExtra('${escapeHtml(a.username)}',${i})">Save Changes</button></div>
        </div></div>`}).join('')||'<div class="empty-log">No workers found</div>';
    if(window.lucide)lucide.createIcons();
  };
  window.toggleWorkerEdit=function(i){document.getElementById('worker-edit-'+i)?.classList.toggle('active')};
  window.saveWorkerExtra=function(username,i){const extra=read(WORKER_EXTRA,{});extra[username]={...(extra[username]||{}),phone:document.getElementById('w_phone_'+i)?.value||'',salary:document.getElementById('w_salary_'+i)?.value||'',shift:document.getElementById('w_shift_'+i)?.value||'',status:document.getElementById('w_status_'+i)?.value||'Active'};write(WORKER_EXTRA,extra); if(window.showToast)showToast('Worker information saved','success'); renderWorkersProfilePage();};
  window.saveWorkerPhoto=function(username,input){const file=input.files&&input.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{const extra=read(WORKER_EXTRA,{});extra[username]={...(extra[username]||{}),photo:reader.result};write(WORKER_EXTRA,extra);renderWorkersProfilePage(); if(window.showToast)showToast('Worker image saved','success');}; reader.readAsDataURL(file);};

  // 4) Explain Shift Cash Reconciliation clearly.
  function setupCashExplanation(){
    const cash=document.querySelector('#screen-cash .cash-form');
    if(cash && !document.getElementById('cash-explain-box')){
      const div=document.createElement('div'); div.id='cash-explain-box'; div.className='cash-explain';
      div.innerHTML='<b>What this does:</b><br>At the end of a shift, count the actual cash in the drawer. ZirakPOS compares it with the system revenue for that shift. If there is a difference, the owner can immediately see missing or extra cash.';
      cash.parentElement.insertBefore(div,cash);
    }
  }

  // 5) Expense details: uploaded image has a view location.
  function findExpenseReceipt(e){
    const receipts=read(LS_RECEIPTS,[]);
    if(!receipts.length)return null;
    const date=e.log_date||new Date(e.created_at||Date.now()).toISOString().slice(0,10);
    return [...receipts].reverse().find(r=>String(r.amount||'')===String(e.amount||'') && (!r.cat||!e.cat||r.cat===e.cat) && (!r.date||r.date===date)) || receipts[receipts.length-1];
  }
  window.openExpenseDetails=function(encoded){
    const e=JSON.parse(decodeURIComponent(encoded)); const proof=findExpenseReceipt(e);
    const body=`<div class="expense-detail-layout"><div class="expense-detail-meta">
      <div class="expense-detail-row"><span>Category</span><b>${escapeHtml(e.cat||'Expense')}</b></div>
      <div class="expense-detail-row"><span>Amount</span><b>${money(e.amount)} IQD</b></div>
      <div class="expense-detail-row"><span>Worker</span><b>${escapeHtml(e.worker||'—')}</b></div>
      <div class="expense-detail-row"><span>Date</span><b>${escapeHtml(e.log_date||'—')}</b></div>
      <div class="expense-detail-row"><span>Note</span><b>${escapeHtml(e.note||'—')}</b></div>
    </div><div class="expense-proof-box">${proof?.data&&String(proof.type||'').startsWith('image/')?`<img src="${proof.data}" alt="Receipt image">`:proof?.data?`<div class="expense-proof-empty">Receipt file attached: ${escapeHtml(proof.name||'file')}</div>`:'<div class="expense-proof-empty">No receipt image uploaded for this expense.</div>'}</div>
    <div class="detail-actions"><button class="detail-action-btn primary" onclick="zpPrintDetail()">Print Receipt</button><button class="detail-action-btn" onclick="zpCopyDetail('Category: ${escapeHtml(e.cat||'')}\\nAmount: ${money(e.amount)} IQD\\nWorker: ${escapeHtml(e.worker||'')}\\nNote: ${escapeHtml(e.note||'')}')">Copy Text</button></div></div>`;
    openDetail('Expense Details',body);
  };
  const oldUpdateExpenseList=window.updateExpenseList;
  window.updateExpenseList=async function(){
    const el=document.getElementById('expense-list'); if(!el){return oldUpdateExpenseList&&oldUpdateExpenseList.apply(this,arguments)};
    el.innerHTML='<div class="empty-log">Loading...</div>';
    let exps=[]; try{exps=await getExpFor(todayKey)}catch{}
    if(!exps.length){el.innerHTML='<div class="empty-log">No expenses logged yet</div>';return;}
    el.innerHTML=[...exps].reverse().map(e=>{const enc=encodeURIComponent(JSON.stringify(e));return `<div class="log-item expense-item"><div><div class="log-plate">${typeof getCatIcon==='function'?getCatIcon(e.cat):''} ${escapeHtml(e.cat)}</div><div class="log-meta">${escapeHtml(e.note||'')} • ${escapeHtml(e.worker||'')} • ${new Date(e.created_at||Date.now()).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div></div><div style="display:grid;gap:6px;justify-items:end"><div class="log-price expense">−${money(e.amount)}</div><button class="expense-detail-btn" onclick="openExpenseDetails('${enc}')">View Expense</button></div></div>`}).join('');
  };

  // 6) Receipt detail page: hide Print/Copy from main success screen; show inside View Receipt.
  function receiptText(r){return `ZirakPOS Receipt\nReceipt: ${r?.no||'—'}\nPlate: ${r?.plate||'—'}\nSize: ${r?.size||'—'}\nService: ${r?.service||'—'}\nShift: ${r?.shift||'—'}\nWorker: ${r?.worker||'—'}\nTime: ${r?.time||'—'}\nTotal: ${r?.total||'—'}`}
  window.openReceiptDetails=function(){
    const r=window.zpLastReceipt||{no:document.getElementById('receipt-no-line')?.textContent?.replace('Receipt No:','').trim()||'—',plate:document.getElementById('rec-plate')?.textContent,size:document.getElementById('rec-size')?.textContent,service:document.getElementById('rec-service')?.textContent,shift:document.getElementById('rec-shift')?.textContent,worker:document.getElementById('rec-worker')?.textContent,time:document.getElementById('rec-time')?.textContent,total:document.getElementById('rec-total')?.textContent};
    const txt=receiptText(r).replace(/'/g,"&#39;");
    const body=`<div class="expense-detail-meta"><div class="expense-detail-row"><span>Receipt ID</span><b>${escapeHtml(r.no||'—')}</b></div><div class="expense-detail-row"><span>Plate</span><b>${escapeHtml(r.plate||'—')}</b></div><div class="expense-detail-row"><span>Service</span><b>${escapeHtml(r.service||'—')}</b></div><div class="expense-detail-row"><span>Total</span><b>${escapeHtml(r.total||'—')}</b></div></div><div class="detail-actions"><button class="detail-action-btn primary" onclick="zpPrintDetail()">Print Receipt</button><button class="detail-action-btn" onclick="zpCopyDetail('${txt}')">Copy Text</button></div>`;
    openDetail('Receipt Details',body);
  };
  function cleanSuccessReceiptActions(){
    document.getElementById('receipt-actions')?.classList.add('zp-hidden');
    document.querySelector('#screen-success .receipt-send-row')?.classList.add('zp-hidden');
    if(!document.getElementById('view-receipt-main')){
      const receipt=document.querySelector('#screen-success .receipt');
      if(receipt){const box=document.createElement('div');box.className='receipt-main-clean';box.id='view-receipt-main';box.innerHTML='<button class="view-receipt-main-btn" onclick="openReceiptDetails()">View Receipt Details</button>';receipt.insertAdjacentElement('afterend',box)}
    }
  }
  const prevShowScreen=window.showScreen;
  if(prevShowScreen && !window.__zpFinalShowPatch){window.__zpFinalShowPatch=true;window.showScreen=function(id){prevShowScreen(id);setTimeout(()=>{setupPurchaseRequests();setupUnitDropdown();setupCashExplanation();if(id==='screen-workers')renderWorkersProfilePage();if(id==='screen-success')cleanSuccessReceiptActions();if(id==='screen-requests')renderRequests();if(window.lucide)lucide.createIcons();},80)}}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{setupPurchaseRequests();setupUnitDropdown();setupCashExplanation();renderRequests();if(window.lucide)lucide.createIcons();},250));
  window.addEventListener('load',()=>setTimeout(()=>{setupPurchaseRequests();setupUnitDropdown();setupCashExplanation();if(window.lucide)lucide.createIcons();},500));
})();

let currentLoginMode = "worker";

function switchLoginMode(mode){
  currentLoginMode = mode;

  const ownerPanel = document.getElementById("owner-login-panel");
  const workerPanel = document.getElementById("step-username");
  const pinPanel = document.getElementById("step-pin");

  if(mode === "worker"){
    if(ownerPanel) ownerPanel.style.display = "none";
    if(workerPanel) workerPanel.style.display = "flex";
    if(pinPanel) pinPanel.style.display = "none";
  } else {
    if(ownerPanel) ownerPanel.style.display = "block";
    if(workerPanel) workerPanel.style.display = "none";
    if(pinPanel) pinPanel.style.display = "none";
  }
}

async function ownerLogin(){
  initSupabaseAuthClient();

  const email = document.getElementById("owner-email").value.trim();
  const password = document.getElementById("owner-password").value.trim();
  const errorBox = document.getElementById("login-error");

  if(!email || !password){
    errorBox.textContent = "Enter owner email and password";
    return;
  }

  if(!supabaseClient){
    errorBox.textContent = "Supabase is not connected. Check script order in index.html.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if(error){
    errorBox.textContent = error.message;
    return;
  }

  if(!data || !data.user){
    errorBox.textContent = "Login failed. Please try again.";
    return;
  }

  const profileRows = await sbFetch(
    "profiles?id=eq." + data.user.id + "&select=*"
  );

  if(!profileRows.length){
    errorBox.textContent = "No profile found.";
    return;
  }

  const profile = profileRows[0];

  currentBusinessId = profile.business_id;
  currentWorker = profile.full_name || email;
  currentRole = profile.role || "owner";

  currentPermissions = {
    expenses:true,
    report:true,
    settings:true,
    customers:true
  };

  const topbar = document.getElementById("topbar-worker-name");
  const dashWorker = document.getElementById("dash-worker-name");

  if(topbar) topbar.textContent = "👑 " + currentWorker;
  if(dashWorker) dashWorker.textContent = "👑 " + currentWorker;

  localStorage.setItem("cz_session", JSON.stringify({
    worker: currentWorker,
    role: currentRole,
    username: email,
    business_id: currentBusinessId,
    permissions: currentPermissions,
    authUserId: data.user.id
  }));

  applyPermissionsToNav();
  showDash();
}

async function testProfile(){
  if(!window.supabase){
    console.log("Supabase library is missing.");
    return;
  }

  if(!supabaseClient){
    supabaseClient = window.supabase.createClient(SB_URL, SB_KEY);
  }

  const { data, error } = await supabaseClient.auth.getUser();

  if(error || !data.user){
    console.log("No logged in user", error);
    return;
  }

  console.log("AUTH USER ID:", data.user.id);

  const profileRows = await sbFetch(
    "profiles?id=eq." + data.user.id + "&select=*"
  );

  console.log("PROFILE ROWS:", profileRows);
}

function getAccessCodeFromUrl(){
  const url = new URL(window.location.href);
  return url.searchParams.get("access") || "";
}

async function loadWorkerAccessFromUrl(){
  const accessCode = getAccessCodeFromUrl();

  if(!accessCode) return;

  const rows = await fetch(
    SB_URL + "/rest/v1/businesses?worker_access_code=eq." +
    encodeURIComponent(accessCode) +
    "&select=*",
    {
      headers:{
        "apikey": SB_KEY,
        "Authorization": "Bearer " + SB_KEY
      }
    }
  ).then(r => r.json());

  if(!rows.length){
    document.getElementById("login-error").textContent = "Invalid worker link.";
    return;
  }

  currentBusinessId = rows[0].id;
  currentBusiness = rows[0];

  const tagline = document.querySelector(".login-tagline");
  if(tagline){
    tagline.textContent = rows[0].name + " Worker Login";
  }

  switchLoginMode("worker");
}

document.addEventListener("DOMContentLoaded", async () => {
  configureLoginScreen();
  await loadWorkerAccessFromUrl();
});

function configureLoginScreen(){
  const workerLink = isWorkerLink();

  const ownerPanel = document.getElementById("owner-login-panel");
  const workerPanel = document.getElementById("step-username");

  if(workerLink){

    if(ownerPanel) ownerPanel.style.display = "none";
    if(workerPanel) workerPanel.style.display = "flex";

    const title = document.querySelector(".login-tagline");
    if(title) title.textContent = "Worker Login";

  }else{

    if(ownerPanel) ownerPanel.style.display = "block";
    if(workerPanel) workerPanel.style.display = "none";

    const title = document.querySelector(".login-tagline");
    if(title) title.textContent = "Owner Login";

  }
}

function isWorkerAccessLink(){
  return new URL(window.location.href).searchParams.has("access");
}

function switchLoginMode(mode){
  const ownerPanel = document.getElementById("owner-login-panel");
  const workerPanel = document.getElementById("step-username");
  const pinPanel = document.getElementById("step-pin");

  if(mode === "worker"){
    if(ownerPanel) ownerPanel.style.display = "none";
    if(workerPanel) workerPanel.style.display = "flex";
    if(pinPanel) pinPanel.style.display = "none";
  } else {
    if(ownerPanel) ownerPanel.style.display = "block";
    if(workerPanel) workerPanel.style.display = "none";
    if(pinPanel) pinPanel.style.display = "none";
  }
}

function forceCorrectLoginScreen(){
  if(isWorkerAccessLink()){
    switchLoginMode("worker");
  } else {
    switchLoginMode("owner");
  }
}

document.addEventListener("DOMContentLoaded", function(){
  setTimeout(forceCorrectLoginScreen, 300);
});

window.addEventListener("load", function(){
  setTimeout(forceCorrectLoginScreen, 300);
});
function isWorkerLink(){
  return new URL(window.location.href).searchParams.has("access");
}
