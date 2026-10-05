const views={landing:document.getElementById("landingView"),bank:document.getElementById("bankView"),wallet:document.getElementById("walletView"),duitnow:document.getElementById("duitnowView"),qr:document.getElementById("qrView"),fail:document.getElementById("failView")};
let current="landing",method=null,selectedBank=null,selectedWallet=null,bankPage=0,qrInterval=null;

const banks=[
["assets/bank/bank-maybank.svg","Maybank"],["assets/bank/bank-Cimb.svg","CIMB Bank"],["assets/bank/bank-Pb.svg","Public Bank"],
["assets/bank/bank-RHB.svg","RHB Bank"],["assets/bank/bank-HLB.svg","Hong Leong Bank"],["assets/bank/bank-AmBank.svg","AmBank"],
["assets/bank/bank-affin-l.svg","Affin Bank"],["assets/bank/bank-alliance-l.svg","Alliance Bank"],["assets/bank/bank-bsn-l.svg","Bank Simpanan Nasional"],
["assets/bank/bank-ISLAM-l.svg","Bank Islam"],["assets/bank/bank-ocbc-l.svg","OCBC Bank"]
];
const wallets=[
["assets/icn-grabpay.svg","GrabPay"],["assets/icn-touchnGo.svg","Touch n Go eWallet"],["assets/icn-shopeepay.svg","ShopeePay"],["assets/icn-boost.svg","Boost"]
];

function show(name){
 Object.values(views).forEach(v=>v.classList.add("hidden"));
 views[name].classList.remove("hidden"); current=name;
 document.querySelector(".topbar").classList.toggle("has-back",["bank","wallet","duitnow"].includes(name));
 window.scrollTo({top:0,behavior:"smooth"});
}
function updateMethod(){
 const b=document.getElementById("methodProceed");
 b.innerHTML=method?`Proceed with ${method==="bank"?"Banks":method==="wallet"?"E-Wallet":"DuitNow QR"} <img src="assets/icn-arrow-w.svg">`:`Select a Payment Method <img src="assets/icn-arrow-w.svg">`;
 document.querySelectorAll(".method").forEach(x=>x.classList.toggle("selected",x.dataset.method===method));
}
document.querySelectorAll(".method").forEach(el=>el.onclick=()=>{method=el.dataset.method;updateMethod()});
document.getElementById("methodProceed").onclick=()=>{if(!method)return;show(method);if(method==="bank")renderBanks();if(method==="wallet")renderWallets()};

function renderBanks(){
 const grid=document.getElementById("bankGrid"),dots=document.getElementById("bankDots"),start=bankPage*6;
 const isMobile=window.matchMedia("(max-width:640px)").matches;
 grid.innerHTML="";

 if(isMobile){
   // Mobile: 3 columns x 2 rows per swipe page (6 banks per page).
   for(let page=0; page<Math.ceil(banks.length/6); page++){
     const pageEl=document.createElement("div");
     pageEl.className="bank-page";
     banks.slice(page*6,page*6+6).forEach(([src,name])=>{
       const b=document.createElement("button");
       b.type="button";
       b.className="bank"+(selectedBank===name?" selected":"");
       b.innerHTML=`<img class="bank-logo" src="${src}" alt="${name}"><span class="check">✓</span>`;
       b.onclick=()=>{selectedBank=name;renderBanks();updateBankButton()};
       pageEl.appendChild(b);
     });
     grid.appendChild(pageEl);
   }
 }else{
   banks.slice(start,start+6).forEach(([src,name])=>{
     const b=document.createElement("button");
     b.type="button";
     b.className="bank"+(selectedBank===name?" selected":"");
     b.innerHTML=`<img class="bank-logo" src="${src}" alt="${name}"><span class="check">✓</span>`;
     b.onclick=()=>{selectedBank=name;renderBanks();updateBankButton()};
     grid.appendChild(b);
   });
 }

 dots.innerHTML="";
 if(!isMobile){
   for(let i=0;i<Math.ceil(banks.length/6);i++){const d=document.createElement("button");d.className=i===bankPage?"active":"";d.onclick=()=>{bankPage=i;renderBanks()};dots.appendChild(d)}
 }
 updateBankButton();
}
function updateBankButton(){document.getElementById("bankProceed").innerHTML=selectedBank?`Proceed with ${selectedBank} <img src="assets/icn-arrow-w.svg">`:`Select a Bank <img src="assets/icn-arrow-w.svg">`}
document.getElementById("bankProceed").onclick=()=>{if(!selectedBank)flashButton("bankProceed","Please Select a Bank");};

function renderWallets(){
 const grid=document.getElementById("walletGrid"),dots=document.getElementById("walletDots");grid.innerHTML="";
 wallets.forEach(([src,name])=>{const w=document.createElement("button");w.type="button";w.className="wallet"+(selectedWallet===name?" selected":"");w.innerHTML=`<img src="${src}" alt="${name}"><span class="check">✓</span>`;w.onclick=()=>{selectedWallet=name;renderWallets();updateWalletButton()};grid.appendChild(w)});
 dots.innerHTML='<button class="active"></button>';updateWalletButton();
}
function updateWalletButton(){document.getElementById("walletProceed").innerHTML=selectedWallet?`Proceed with ${selectedWallet.replace(" eWallet","")} <img src="assets/icn-arrow-w.svg">`:`Select a Wallet <img src="assets/icn-arrow-w.svg">`}
document.getElementById("walletProceed").onclick=()=>{
 if(!selectedWallet){flashButton("walletProceed","Please Select a Wallet");return;}
 openQR("wallet");
};

document.getElementById("duitnowOption").onclick=()=>document.getElementById("duitnowOption").classList.toggle("selected");
document.getElementById("duitnowProceed").onclick=()=>{if(document.getElementById("duitnowOption").classList.contains("selected"))openQR("duitnow")};

function openQR(type="duitnow"){
 show("qr");
 clearInterval(qrInterval);

 const logo=document.getElementById("qrBrandLogo");
 const name=document.getElementById("qrBrandName");
 const timer=document.getElementById("qrTimer");

 if(type==="wallet" && selectedWallet){
   const wallet=wallets.find(([src,n])=>n===selectedWallet);
   if(wallet){
     if(logo) logo.src=wallet[0];
     if(logo) logo.alt=selectedWallet;
     if(name) name.textContent=selectedWallet.replace(" eWallet","");
   }
 }else{
   if(logo) logo.src="assets/icn-duitnow.svg";
   if(logo) logo.alt="DuitNow";
   if(name) name.textContent="DuitNow";
 }

 let q=60;
 if(timer) timer.textContent="01:00 minutes";

 qrInterval=setInterval(()=>{
   q--;
   if(timer){
     timer.textContent=`${String(Math.floor(q/60)).padStart(2,"0")}:${String(q%60).padStart(2,"0")} minutes`;
   }
   if(q<=0){
     clearInterval(qrInterval);
     showFail(type);
   }
 },1000);
}
function showFail(type="duitnow"){
 const logo=document.getElementById("failBrandLogo");
 const name=document.getElementById("failBrandName");

 if(type==="wallet" && selectedWallet){
   const wallet=wallets.find(([src,n])=>n===selectedWallet);
   if(wallet){
     if(logo) logo.src=wallet[0];
     if(logo) logo.alt=selectedWallet;
     if(name) name.textContent=selectedWallet.replace(" eWallet","");
   }
 }else{
   if(logo) logo.src="assets/icn-duitnow.svg";
   if(logo) logo.alt="DuitNow";
   if(name) name.textContent="DuitNow";
 }
 show("fail");
}
document.getElementById("qrConfirm").onclick=()=>{
 // Payment submission is handled by the real payment integration.
 // No Payment Successful page is shown in this UI prototype.
};




document.getElementById("failRetry").onclick=()=>{
 clearInterval(qrInterval);
 const logo=document.getElementById("failBrandLogo");
 const name=document.getElementById("failBrandName");
 const title=document.querySelector("#failView h1");
 const msg=document.querySelector("#failView .fail-message");
 if(logo){logo.style.display="";}
 if(name){name.textContent="DuitNow";}
 if(title){title.textContent="Payment Unsuccessful";}
 if(msg){msg.textContent="Your transaction was declined or timed out during authorization.";}
 show("landing");
 method=null;
 selectedBank=null;
 selectedWallet=null;
 updateMethod();
};
document.getElementById("backBtn").onclick=()=>{
 if(current==="qr" || current==="fail"){
   clearInterval(qrInterval);
 }
 if(current!=="landing"){
   show("landing");
   method=null;
   selectedBank=null;
   selectedWallet=null;
   updateMethod();
 }
};

document.querySelectorAll(".important").forEach(btn=>btn.onclick=()=>{const box=document.getElementById(btn.dataset.notes);const open=box.classList.toggle("open");btn.classList.toggle("open",open)});

function flashButton(id,text){const b=document.getElementById(id),old=b.innerHTML;b.innerHTML=`${text} <img src="assets/icn-arrow-w.svg">`;setTimeout(()=>b.innerHTML=old,1400)}
let seconds=256;setInterval(()=>{if(seconds>0)seconds--;document.getElementById("timer").textContent=`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`},1000);
show("landing");updateMethod();
