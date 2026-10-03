
const $=id=>document.getElementById(id);
const store={
 get(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch(e){return f}},
 set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
const API_BASE = String(window.CAPE_CONFIG?.API_BASE_URL || '').replace(/\/$/,'');
let authToken = null;

function apiUrl(path){return (API_BASE || '') + path}
async function apiFetch(path, options={}){
  if(!API_BASE){
    const err=new Error('CAPE BANK is running in GitHub Pages demo mode. Connect a CAPE BANK API to enable account authentication and cross-device data.');
    err.status=0;
    throw err;
  }
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  const token = authToken || sessionStorage.getItem('capeBankAccessToken') || localStorage.getItem('capeBankAccessToken');
  if(token) headers.Authorization = 'Bearer '+token;
  const res = await fetch(apiUrl(path), {...options, headers});
  let data={}; try{data=await res.json()}catch(e){}
  if(!res.ok){const err=new Error(data.message||data.error||`Request failed (${res.status})`); err.status=res.status; err.data=data; throw err}
  return data;
}

function setToken(token,remember=false){
  authToken=token;
  sessionStorage.setItem('capeBankAccessToken',token);
  if(remember) localStorage.setItem('capeBankAccessToken',token);
  else localStorage.removeItem('capeBankAccessToken');
}
function clearToken(){authToken=null;sessionStorage.removeItem('capeBankAccessToken');localStorage.removeItem('capeBankAccessToken')}
function initials(u){return (u?.first?.[0]||'C')+(u?.last?.[0]||'B')}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function cacheProfile(profile){if(profile?.email)store.set('capeBankProfile_'+profile.email,profile)}
function getCachedProfile(email){return email?store.get('capeBankProfile_'+email,null):null}
function currentUser(){return store.get('capeBankCurrentUser',null)}
function setCurrentUser(profile){store.set('capeBankCurrentUser',profile);cacheProfile(profile)}
function getActiveProfile(){return currentUser()}

function landing(){
document.getElementById('app').innerHTML=`
<header class="top"><div class="topbar"><div class="brand"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" width="24" height="24"><path d="M20 4 34 10v9c0 8-5.7 13.7-14 17-8.3-3.3-14-9-14-17v-9z" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M26.5 14.5c-1.8-1.6-3.8-2.4-6.5-2.4-5 0-8.6 3.2-8.6 7.9s3.6 7.9 8.6 7.9c2.7 0 4.8-.8 6.5-2.4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg></span>CAPE BANK</div><div class="top-spacer"></div><button class="btn secondary" onclick="showAuth('login')">Sign in</button></div></header>
<main class="hero"><div class="hero-inner"><div class="hero-logo"><svg viewBox="0 0 80 80" width="58" height="58" aria-hidden="true"><path d="M40 7 68 19v18c0 16-11.5 27.5-28 35-16.5-7.5-28-19-28-35V19z" fill="none" stroke="currentColor" stroke-width="5"/><path d="M51 28c-3.7-3.3-7.7-4.8-13-4.8-10 0-17.2 6.4-17.2 15.8S28 54.8 38 54.8c5.3 0 9.3-1.5 13-4.8" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg></div><h1>Banking, simplified.</h1><p>A polished, mobile-first CAPE BANK interface for testing account access across devices. This is a fictional banking prototype; it does not connect to real accounts or move money.</p><div class="hero-actions"><button class="btn primary" onclick="showAuth('signup')">Create account</button><button class="btn secondary" onclick="showAuth('login')">Sign in</button></div></div></main>`;
}
function showAuth(mode){
document.getElementById('app').innerHTML=`
<header class="top"><div class="topbar"><div class="brand"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" width="24" height="24"><path d="M20 4 34 10v9c0 8-5.7 13.7-14 17-8.3-3.3-14-9-14-17v-9z" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M26.5 14.5c-1.8-1.6-3.8-2.4-6.5-2.4-5 0-8.6 3.2-8.6 7.9s3.6 7.9 8.6 7.9c2.7 0 4.8-.8 6.5-2.4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg></span>CAPE BANK</div><div class="top-spacer"></div></div></header>
<main class="auth-shell"><section class="auth-card"><div class="auth-brand"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" width="24" height="24"><path d="M20 4 34 10v9c0 8-5.7 13.7-14 17-8.3-3.3-14-9-14-17v-9z" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M26.5 14.5c-1.8-1.6-3.8-2.4-6.5-2.4-5 0-8.6 3.2-8.6 7.9s3.6 7.9 8.6 7.9c2.7 0 4.8-.8 6.5-2.4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg></span><div style="margin-top:7px">CAPE BANK</div></div>
${mode==='login'?loginHtml():signupHtml()}
</section></main>`;
}
function loginHtml(){return `<h1>Welcome back</h1><p class="muted">Sign in securely to your CAPE BANK prototype account.</p><div class="pill" style="margin-bottom:14px" id="apiStatus">Checking API…</div><form onsubmit="login(event)"><div class="field"><label for="loginUser">Email address</label><input id="loginUser" type="email" autocomplete="username" autocapitalize="none" placeholder="you@example.com" required></div><div class="field"><label for="loginPass">Password</label><div class="password-wrap"><input id="loginPass" type="password" autocomplete="current-password" required><button type="button" class="link-btn password-toggle" onclick="togglePassword('loginPass',this)">Show</button></div></div><div class="auth-tools"><label class="check"><input id="remember" type="checkbox"> Remember me</label><button type="button" class="link-btn" onclick="showResetInfo()">Need help?</button></div><div id="authMsg"></div><button class="btn primary full">Sign in</button></form><p class="fine">The same account can be used on another phone or computer when both devices can reach the deployed CAPE BANK API.</p><button class="btn secondary" onclick="showAuth('signup')">Create an account</button><button class="btn secondary" style="margin-left:7px" onclick="landing()">Back</button>`}
function signupHtml(){return `<h1>Create your account</h1><p class="muted">Create a CAPE BANK prototype account.</p><form onsubmit="signup(event)"><div class="form-grid"><div class="field"><label>First name</label><input id="first" required></div><div class="field"><label>Last name</label><input id="last" required></div></div><div class="field"><label>Email</label><input id="email" type="email" autocomplete="email" required></div><div class="field"><label>Username</label><input id="newUser" minlength="3" autocomplete="username" required></div><div class="form-grid"><div class="field"><label>Password</label><div class="password-wrap"><input id="newPass" type="password" minlength="8" autocomplete="new-password" required><button type="button" class="link-btn password-toggle" onclick="togglePassword('newPass',this)">Show</button></div></div><div class="field"><label>Confirm password</label><div class="password-wrap"><input id="confirm" type="password" minlength="8" autocomplete="new-password" required><button type="button" class="link-btn password-toggle" onclick="togglePassword('confirm',this)">Show</button></div></div></div><label class="check" style="margin:4px 0 14px"><input id="agree" type="checkbox" required> I understand this is a fictional prototype account.</label><div id="authMsg"></div><button class="btn primary full">Create account</button></form><p class="fine">Passwords are handled by the CAPE BANK API. This project is a prototype and should not be used for real banking credentials.</p><button class="btn secondary" onclick="showAuth('login')">Sign in</button><button class="btn secondary" style="margin-left:7px" onclick="landing()">Back</button>`}
async function signup(e){
 e.preventDefault();
 const u=$('newUser').value.trim().toLowerCase(), p=$('newPass').value, c=$('confirm').value;
 const first=$('first').value.trim(), last=$('last').value.trim(), email=$('email').value.trim().toLowerCase();
 if(!$('agree').checked)return authMsg('Please confirm that this is a fictional prototype account.');
 if(p!==c)return authMsg('Passwords do not match.');
 if(p.length<8)return authMsg('Password must contain at least 8 characters.');
 try{
   const data=await apiFetch('/auth/register',{method:'POST',body:JSON.stringify({firstName:first,lastName:last,email,username:u,password:p})});
   authMsg(data.message||'Account created. You can now sign in.',true);
   setTimeout(()=>showAuth('login'),700);
 }catch(err){authMsg(err.message||'Account creation failed.')}
}
async function login(e){
 e.preventDefault();
 const email=$('loginUser').value.trim().toLowerCase(), p=$('loginPass').value, remember=$('remember')?.checked;
 try{
   const data=await apiFetch('/auth/login',{method:'POST',body:JSON.stringify({email,password:p})});
   setToken(data.accessToken,remember); setCurrentUser(data.user); appShell('home');
 }catch(err){authMsg(err.message||'Sign-in failed.')}
}
function togglePassword(id,button){
 const input=$(id); if(!input)return;
 const show=input.type==='password'; input.type=show?'text':'password';
 button.textContent=show?'Hide':'Show'; button.setAttribute('aria-pressed',String(show));
}
function showResetInfo(){
 modal(`<h2>Password reset</h2><p class="muted">For this prototype, password reset is handled through the API. Enter your email and the server will issue a reset token in development mode.</p><div class="field"><label>Email address</label><input id="resetEmail" type="email" required></div><div id="resetMsg"></div><div class="modal-actions"><button class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="sendReset()">Request reset</button></div>`);
}
async function sendReset(){
 const e=$('resetEmail').value.trim().toLowerCase();
 try{const d=await apiFetch('/auth/request-reset',{method:'POST',body:JSON.stringify({email:e})});$('resetMsg').innerHTML=`<div class="success-box">${escapeHtml(d.message||'Reset requested.')}${d.devToken?`<br><small>Development reset token: <code>${escapeHtml(d.devToken)}</code></small>`:''}</div>`}
 catch(err){$('resetMsg').innerHTML=`<div class="error-box">${escapeHtml(err.message)}</div>`}
}
function resetDemoData(){if(confirm('Clear local CAPE BANK session data on this browser?')){clearToken();localStorage.removeItem('capeBankCurrentUser');sessionStorage.clear();landing()}}
function authMsg(t,ok=false){$('authMsg').innerHTML=`<div class="${ok?'success-box':'error-box'}" style="margin-bottom:12px">${escapeHtml(t)}</div>`}
async function restoreSession(){
 const token=sessionStorage.getItem('capeBankAccessToken')||localStorage.getItem('capeBankAccessToken');
 if(!token)return false;
 authToken=token;
 try{const data=await apiFetch('/auth/me');setCurrentUser(data.user);return true}catch(e){clearToken();localStorage.removeItem('capeBankCurrentUser');return false}
}
function appShell(page='home'){
let u=currentUser(), user=getActiveProfile();if(!user){landing();return}
document.getElementById('app').innerHTML=`
<header class="top"><div class="topbar"><button class="menu-btn" onclick="toggleSide()" aria-label="Menu">☰</button><div class="brand"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40" width="24" height="24"><path d="M20 4 34 10v9c0 8-5.7 13.7-14 17-8.3-3.3-14-9-14-17v-9z" fill="none" stroke="currentColor" stroke-width="2.8"/><path d="M26.5 14.5c-1.8-1.6-3.8-2.4-6.5-2.4-5 0-8.6 3.2-8.6 7.9s3.6 7.9 8.6 7.9c2.7 0 4.8-.8 6.5-2.4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg></span>CAPE BANK</div><div class="top-spacer"></div><button class="top-icon" onclick="navigate('notifications')" aria-label="Notifications">♧<span class="badge">3</span></button><button class="top-icon" onclick="navigate('profile')" aria-label="Profile">●</button></div></header>
<div class="layout"><aside id="side" class="side"><div class="side-title">MENU <button class="menu-close" onclick="closeSide()">×</button></div>
${nav('home','⌂','Home')}${nav('notifications','♢','Notifications')}${nav('accounts','▣','Accounts')}${nav('transfers','⇄','Transfers')}${nav('bills','▤','Bills')}${nav('deposit','＋','Deposit Check')}${nav('loans','▰','Loans')}${nav('budgets','◫','Budgets')}${nav('services','◉','Online Services')}${nav('profile','◉','Manage Profile')}
<div style="padding:15px 8px"><button class="btn danger full" onclick="logout()">Sign out</button></div>
</aside><div id="overlay" class="mobile-overlay" onclick="closeSide()"></div><main id="content" class="content"></main></div>`;
navigate(page);
}
function nav(id,ico,label){return `<button id="nav-${id}" class="nav-item" onclick="navigate('${id}')"><span class="nav-ico">${ico}</span>${label}</button>`}
function toggleSide(){$('side').classList.toggle('open');$('overlay').classList.toggle('show')}
function closeSide(){$('side')?.classList.remove('open');$('overlay')?.classList.remove('show')}
function navigate(page){closeSide();document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));$('nav-'+page)?.classList.add('active');let f={home:homePage,notifications:notificationsPage,accounts:accountsPage,transfers:transfersPage,bills:billsPage,deposit:depositPage,loans:loansPage,budgets:budgetsPage,services:servicesPage,profile:profilePage}[page]||homePage;f()}
function pageHead(title,sub,button=''){return `<div class="page-head"><div><h1>${title}</h1><p class="muted">${sub}</p></div>${button}</div>`}
async function homePage(){
 let u=getActiveProfile()||{first:'Customer',last:'',email:''};
 let summary={account:{balance:12450,type:'Demo Checking',number:'•••• 4821'},transactions:[]};
 try{summary=await apiFetch('/account/summary')}catch(e){}
 const acct=summary.account||{}; $('content').innerHTML=`<div class="page">${pageHead('Good afternoon, '+escapeHtml(u.first)+' 👋','Here is your account overview.')}
<div class="grid2"><div class="card balance-card"><div class="eyebrow">AVAILABLE BALANCE</div><div class="balance">$${Number(acct.balance||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</div><div class="account-no">${escapeHtml(acct.type||'Demo Checking')} ${escapeHtml(acct.number||'•••• 4821')}</div><div class="balance-actions"><button class="light-btn" onclick="navigate('accounts')">View account</button><button class="light-btn" onclick="navigate('transfers')">Transfer</button></div></div>
<div class="card"><div class="profile"><div class="avatar">${initials(u)}</div><div><b>${escapeHtml(u.first)} ${escapeHtml(u.last)}</b><div class="muted" style="font-size:12px">${escapeHtml(u.email)}</div></div></div><hr style="border:0;border-top:1px solid var(--line);margin:17px 0"><div class="section-title"><b>Account status</b><span class="pill">Active</span></div><div class="muted" style="font-size:12px">Prototype account synced through the CAPE BANK API</div></div></div>
<div class="card" style="margin-top:17px"><div class="section-title"><h3>Quick actions</h3></div><div class="quick"><button onclick="navigate('transfers')"><span>⇄</span>Transfer</button><button onclick="navigate('bills')"><span>▤</span>Pay bill</button><button onclick="navigate('deposit')"><span>＋</span>Deposit</button><button onclick="navigate('accounts')"><span>▣</span>Accounts</button></div></div>
<div class="grid2" style="margin-top:17px"><div class="card"><div class="section-title"><h3>Recent transactions</h3><button class="btn secondary" onclick="navigate('transfers')">View all</button></div>${txList(summary.transactions||[])}</div><div class="card"><div class="section-title"><h3>Upcoming</h3></div><div class="list-row"><div><b>Electric bill</b><div class="list-sub">Due Oct 08</div></div><b>$125.00</b></div><div class="list-row"><div><b>Rent</b><div class="list-sub">Due Oct 01</div></div><b>$950.00</b></div></div></div>
<div class="card notice" style="margin-top:17px"><b>Prototype mode</b><br>This account summary is served by your CAPE BANK API for cross-device testing. No real funds are connected.</div></div>`;
}
function txList(items=[]){if(!items.length)return '<div class="empty">No transactions yet.</div>';return `<div class="list">${items.map(t=>`<div class="list-row"><div class="list-left"><div class="ico-box">${t.kind==='credit'?'↓':t.title?.toLowerCase().includes('grocery')?'🛒':'⇄'}</div><div><div class="list-title">${escapeHtml(t.title)}</div><div class="list-sub">${escapeHtml(t.date)}</div></div></div><span class="${t.kind==='credit'?'credit':'debit'}">${t.amount>=0?'+':'−'}$${Math.abs(Number(t.amount)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span></div>`).join('')}</div>`}

function notificationsPage(){$('content').innerHTML=`<div class="page">${pageHead('Notifications','Account alerts and messages.')}<div class="card">${['New sign-in detected','Monthly statement is ready','Security settings reviewed'].map((x,i)=>`<div class="list-row"><div class="list-left"><div class="ico-box">${i===0?'🔐':'●'}</div><div><div class="list-title">${x}</div><div class="list-sub">${i===0?'Just now':'Today'}</div></div></div><span class="pill ${i?'gray':''}">${i?'Read':'New'}</span></div>`).join('')}</div></div>`}
function accountsPage(){$('content').innerHTML=`<div class="page">${pageHead('Accounts','View your demo account balances.')}<div class="grid2"><div class="card balance-card"><div class="eyebrow">CHECKING</div><h2 style="margin:7px 0">Demo Checking</h2><div class="balance">$12,450.00</div><div class="account-no">•••• 4821</div></div><div class="card"><div class="label">ACCOUNT DETAILS</div><div class="list"><div class="list-row"><span>Available</span><b>$12,450.00</b></div><div class="list-row"><span>Pending</span><b>$0.00</b></div><div class="list-row"><span>Status</span><span class="pill">Active</span></div></div></div></div><div class="card" style="margin-top:17px">${txList()}</div></div>`}
function transfersPage(){$('content').innerHTML=`<div class="page">${pageHead('Transfers','Move demo funds between fictional recipients.')}<div class="grid2"><div class="card"><div class="section-title"><h3>Make a transfer</h3><span class="pill warn">Demo</span></div><form onsubmit="simulateTransfer(event)"><div class="field"><label>Recipient username</label><input id="recipient" value="recipient.demo" required></div><div class="form-grid"><div class="field"><label>Amount (USD)</label><input id="amount" type="number" min=".01" step=".01" value="250.00" required></div><div class="field"><label>Transfer type</label><select><option>Internal demo transfer</option><option>External demo transfer</option></select></div></div><div class="notice" style="margin-bottom:14px">Transfers are intentionally blocked in this prototype. Continuing shows the test error workflow.</div><button class="btn primary">Continue</button></form></div><div class="card"><h3>Transfer limits</h3><div class="list-row"><span>Daily demo limit</span><b>$5,000</b></div><div class="list-row"><span>Used today</span><b>$0</b></div><div class="list-row"><span>Status</span><span class="pill">Available</span></div></div></div><div class="card" style="margin-top:17px"><div class="section-title"><h3>Transfer history</h3></div>${txList()}</div></div>`}
async function simulateTransfer(e){
 e.preventDefault(); let r=$('recipient').value.trim(), a=Number($('amount').value);
 if(!r)return alert('Enter a recipient username.'); if(!Number.isFinite(a)||a<=0)return alert('Enter a valid positive amount.'); if(a>5000)return alert('Demo daily transfer limit is $5,000.');
 try{await apiFetch('/transfers',{method:'POST',body:JSON.stringify({recipient:r,amount:a})});}
 catch(err){
   if(err.status===403 && err.data?.code==='CB-DEMO-403') return modal(`<h2>Transfer not completed</h2><div class="error-box"><b>Demo error code: <span style="font-family:monospace">CB-DEMO-403</span></b><p style="margin-bottom:0">${escapeHtml(err.message)}</p></div><div class="form-grid" style="margin-top:12px"><div class="field"><label>Username</label><input id="errorRecipient" value="${escapeHtml(r)}"></div><div class="field"><label>Amount</label><input id="errorAmount" type="number" value="${escapeHtml(a)}"></div></div><p class="fine">Changing these fields only changes the demo dialog; no transaction can be executed.</p><div class="modal-actions"><button class="btn secondary" onclick="closeModal()">Dismiss</button><button class="btn primary" onclick="demoErrorUpdate()">Update test values</button></div>`);
   alert(err.message||'Transfer request failed.');
 }
}
function demoErrorUpdate(){let r=$('errorRecipient').value.trim(),a=$('errorAmount').value;if(!r||!a)return alert('Enter both test values.');closeModal();alert('Demo values updated locally: '+r+' / $'+a);}
function billsPage(){$('content').innerHTML=`<div class="page">${pageHead('Bills','Manage fictional bill payments.')}<div class="card"><div class="section-title"><h3>Pay a bill</h3><span class="pill warn">Demo</span></div><form onsubmit="billDemo(event)"><div class="form-grid"><div class="field"><label>Payee</label><select id="payee"><option>Electric Company</option><option>Internet Provider</option><option>Mobile Service</option></select></div><div class="field"><label>Amount</label><input id="billAmount" type="number" min=".01" step=".01" value="125"></div></div><div class="field"><label>Payment date</label><input type="date"></div><button class="btn primary">Review payment</button></form></div><div class="card" style="margin-top:17px"><h3>Scheduled bills</h3><div class="list-row"><span>Electric Company<br><small class="muted">Due Oct 08</small></span><b>$125.00</b></div><div class="list-row"><span>Internet Provider<br><small class="muted">Due Oct 12</small></span><b>$79.99</b></div></div></div>`}
function billDemo(e){e.preventDefault();modal(`<h2>Payment review</h2><div class="success-box">This is a demo review. No bill payment will be submitted.</div><p><b>Payee:</b> ${escapeHtml($('payee').value)}</p><p><b>Amount:</b> $${escapeHtml($('billAmount').value)}</p><div class="modal-actions"><button class="btn secondary" onclick="closeModal()">Close</button></div>`)}
function depositPage(){$('content').innerHTML=`<div class="page">${pageHead('Deposit Check','Mobile deposit interface — demo only.')}<div class="card"><div class="notice">For safety and privacy, this prototype does not upload or process check images.</div><div class="field" style="margin-top:16px"><label>Deposit amount</label><input id="depAmount" type="number" min=".01" step=".01" value="500"></div><div class="form-grid"><button class="btn secondary" onclick="alert('Camera access is disabled in this prototype.')">📷 Front of check</button><button class="btn secondary" onclick="alert('Camera access is disabled in this prototype.')">📷 Back of check</button></div><button class="btn primary" style="margin-top:15px" onclick="depositDemo()">Review deposit</button></div></div>`}
function depositDemo(){modal(`<h2>Deposit review</h2><div class="success-box">Demo deposit prepared for $${escapeHtml($('depAmount').value)}. Nothing will be submitted or credited.</div><div class="modal-actions"><button class="btn secondary" onclick="closeModal()">Close</button></div>`)}
function loansPage(){$('content').innerHTML=`<div class="page">${pageHead('Loans','Explore fictional loan options.')}<div class="grid2"><div class="card"><h3>Personal loan</h3><p class="muted">Example only — not a lending offer.</p><div class="stat"><div class="small">Illustrative range</div><div class="num">$1,000–$10,000</div></div><button class="btn primary" onclick="modal('<h2>Loan application</h2><div class=&quot;notice&quot;>Loan applications are disabled in this prototype.</div><div class=&quot;modal-actions&quot;><button class=&quot;btn secondary&quot; onclick=&quot;closeModal()&quot;>Close</button></div>')">Learn more</button></div><div class="card"><h3>Auto loan</h3><p class="muted">Example financing interface.</p><span class="pill gray">Not available</span></div></div></div>`}
function budgetsPage(){$('content').innerHTML=`<div class="page">${pageHead('Budgets','Track fictional spending categories.')}<div class="grid3"><div class="card stat"><div class="small">Housing</div><div class="num">$950</div><div class="small">of $1,200</div></div><div class="card stat"><div class="small">Food</div><div class="num">$386</div><div class="small">of $600</div></div><div class="card stat"><div class="small">Transport</div><div class="num">$145</div><div class="small">of $300</div></div></div><div class="card" style="margin-top:17px"><h3>Budget settings</h3><p class="muted">Create and edit categories for your prototype dashboard.</p><button class="btn primary" onclick="modal('<h2>Add budget</h2><div class=&quot;field&quot;><label>Category</label><input placeholder=&quot;e.g. Entertainment&quot;></div><div class=&quot;field&quot;><label>Monthly limit</label><input type=&quot;number&quot; value=&quot;200&quot;></div><div class=&quot;modal-actions&quot;><button class=&quot;btn primary&quot; onclick=&quot;closeModal()&quot;>Save demo</button></div>')">Add budget</button></div></div>`}
function servicesPage(){$('content').innerHTML=`<div class="page">${pageHead('Online Services','Useful account tools.')}<div class="grid3">${[['🔒','Security','Review sign-in and password settings.'],['📄','Statements','View downloadable statement placeholders.'],['💬','Support','Open a support contact form.'],['⚙️','Preferences','Customize app preferences.'],['📍','Branches','Demo branch locator placeholder.'],['❓','Help Center','Frequently asked questions.']].map(x=>`<div class="card"><div class="ico-box">${x[0]}</div><h3>${x[1]}</h3><p class="muted" style="font-size:13px">${x[2]}</p><button class="btn secondary" onclick="alert('This demo service is not connected.')">Open</button></div>`).join('')}</div></div>`}
function profilePage(){let u=getActiveProfile();$('content').innerHTML=`<div class="page">${pageHead('Manage Profile','Update your demo account information.')}<div class="card"><div class="profile" style="margin-bottom:18px"><div class="avatar">${initials(u)}</div><div><h3 style="margin:0">${escapeHtml(u.first)} ${escapeHtml(u.last)}</h3><div class="muted">${escapeHtml(u.email)}</div></div></div><form onsubmit="saveProfile(event)"><div class="form-grid"><div class="field"><label>First name</label><input id="pf" value="${escapeHtml(u.first)}" required></div><div class="field"><label>Last name</label><input id="pl" value="${escapeHtml(u.last)}" required></div></div><div class="field"><label>Email</label><input id="pe" type="email" value="${escapeHtml(u.email)}" required></div><button class="btn primary">Save changes</button></form></div><div class="card" style="margin-top:17px"><h3>Security</h3><p class="muted">Change the demo password stored in this browser.</p><button class="btn secondary" onclick="changePassword()">Change password</button></div></div>`}
async function saveProfile(e){
 e.preventDefault();
 const profile=getActiveProfile()||{};
 try{
   const data=await apiFetch('/profile',{method:'PUT',body:JSON.stringify({firstName:$('pf').value.trim(),lastName:$('pl').value.trim(),email:$('pe').value.trim().toLowerCase()})});
   setCurrentUser(data.user); alert('Profile updated.'); navigate('profile');
 }catch(err){alert(err.message||'Profile update failed.')}
}
async function changePassword(){
 const current=prompt('Enter your current password:'); if(!current)return;
 const next=prompt('Enter a new password (8+ characters):'); if(!next||next.length<8)return alert('Password must contain at least 8 characters.');
 try{await apiFetch('/auth/change-password',{method:'POST',body:JSON.stringify({currentPassword:current,newPassword:next})});alert('Password changed successfully.')}catch(err){alert(err.message||'Password change failed.')}
}
function modal(body){let d=document.createElement('div');d.id='globalModal';d.className='modal-bg';d.innerHTML='<div class="modal">'+body+'</div>';document.body.appendChild(d)}
function closeModal(){$('globalModal')?.remove()}
async function logout(){
 try{await apiFetch('/auth/logout',{method:'POST'})}catch(e){}
 clearToken();localStorage.removeItem('capeBankCurrentUser');sessionStorage.clear();landing();
}
addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeSide()}})
addEventListener('load',async()=>{
 // Render the page immediately. GitHub Pages is static hosting, so the UI must
 // not wait for an API request before showing the landing screen.
 landing();
 if(API_BASE){
   const ok=await restoreSession().catch(()=>false);
   if(ok) appShell('home');
 }
});