/* XN-L 설치 체크리스트 · app */
(function(){
  var S=PM.SCHEMA, KEY="xnl-inst-app-v1", $=function(id){return document.getElementById(id)};
  var data=blank();
  function blank(){return {schema:S.id+" "+S.version,header:{facility:"",model:"",sn:"",date:"",dealer:"",engineer:"",result:"",ret:false},items:{},remarks:"",createdAt:""}}
  function load(){try{var t=localStorage.getItem(KEY);if(t){var d=JSON.parse(t);if(d&&d.items)data=d;}}catch(e){}}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
  $("ver").textContent="기준: Sysmex XN-L Series Installation Checklist "+S.version;
  PM.MODELS.forEach(function(m){var o=document.createElement("option");o.value=m;o.textContent=m;$("h_model").appendChild(o)});

  function rec(id){return data.items[id]||(data.items[id]={})}
  function field(lbl,key,it,ph,type){
    var r=rec(it.id),l=document.createElement("label");l.className="f";l.textContent=lbl;
    var i=document.createElement("input");i.value=r[key]||"";i.placeholder=ph||"";i.inputMode=type==="num"?"decimal":"text";
    i.addEventListener("input",function(){rec(it.id)[key]=i.value;changed(it)});l.appendChild(i);return l;
  }
  var rows={};
  function build(){
    var root=$("groups");root.innerHTML="";rows={};
    S.groups.forEach(function(g){
      var sec=document.createElement("section");sec.className="card";
      var h=document.createElement("h2"),gn=document.createElement("span"),gt=document.createElement("span"),gs=document.createElement("span"),gc=document.createElement("span");gs.className="gsec";gs.textContent=g.sec||"";
      gn.className="gno";gn.textContent=String(S.groups.indexOf(g)+1);gt.textContent=g.title;gc.className="gcnt";gc.id="gc_"+S.groups.indexOf(g);
      h.appendChild(gn);h.appendChild(gt);h.appendChild(gs);h.appendChild(gc);sec.appendChild(h);
      g.items.forEach(function(it){
        var row=document.createElement("div");row.className="item";rows[it.id]=row;
        var left=document.createElement("div");
        var lb=document.createElement("div");lb.className="lbl";lb.textContent=it.label;left.appendChild(lb);
        var hn=[];if(it.hint)hn.push(it.hint);if(it.crit)hn.push("기준 "+it.crit);if(it.type==="sens")hn.push("허용 ±"+it.tol+" "+it.unit);if(it.interval)hn.push("주기 "+it.interval);if(it.models)hn.push(it.models.join(" · ")+" 전용");
        if(hn.length){var hd=document.createElement("div");hd.className="hint";hd.textContent=hn.join(" · ");left.appendChild(hd)}
        row.appendChild(left);
        var seg=document.createElement("div");seg.className="seg";seg.setAttribute("role","group");seg.setAttribute("aria-label",it.label+" 상태");
        [["Y","완료","y"],["N","미실시","n"],["NA","해당 없음","na"]].forEach(function(b){
          var bt=document.createElement("button");bt.type="button";bt.textContent=b[1];bt.className=b[2];bt.dataset.v=b[0];
          bt.addEventListener("click",function(){var r=rec(it.id);r.s=(r.s===b[0]?undefined:b[0]);changed(it);paint(it)});seg.appendChild(bt)});
        row.appendChild(seg);
        var ex=document.createElement("div");ex.className="extra";
        if(it.type==="range")ex.appendChild(field("측정값"+(it.unit?" ("+it.unit+")":""),"v",it,it.crit,"num"));
        if(it.type==="adjust"){ex.appendChild(field("조정 전","b",it,it.crit,"num"));ex.appendChild(field("조정 후 (조정 시)","a",it,"","num"))}
        if(it.type==="sens"){ex.appendChild(field("Target","g",it,"","num"));ex.appendChild(field("측정 (조정 전)","b",it,"","num"));ex.appendChild(field("조정 후","a",it,"","num"))}
        if(it.type==="part")ex.appendChild(field("동작 횟수","c",it,"카운터 값","num"));
        if(it.type==="text")ex.appendChild(field(it.field||"기록","t",it,""));
        var bd=document.createElement("span");bd.className="badge";bd.hidden=true;ex.appendChild(bd);
        row.appendChild(ex);
        var na=document.createElement("div");na.className="na-note";na.hidden=true;row.appendChild(na);
        sec.appendChild(row);
      });
      root.appendChild(sec);
    });
  }
  function paint(it){
    var row=rows[it.id],r=data.items[it.id]||{},app=PM.applicable(it,data.header);
    row.querySelectorAll(".seg button").forEach(function(b){b.setAttribute("aria-pressed",String(r.s===b.dataset.v));b.disabled=!app});
    var exEl=row.querySelector(".extra");exEl.hidden=!app||r.s==="NA"||r.s==="N"||!exEl.querySelector("input");
    var na=row.querySelector(".na-note");na.hidden=app;na.textContent=app?"":"이 장비 모델에는 해당 없음 (자동)";
    row.classList.toggle("dim",!app);
    var j=PM.judge(it,r,data.header),bd=row.querySelector(".badge");
    bd.hidden=!(j.state==="ok"||j.state==="bad")||it.type==="check"||it.type==="text"||it.type==="part";
    bd.className="badge "+j.state;bd.textContent=j.state==="bad"?"기준 벗어남":"기준 안";
    row.classList.toggle("bad",j.state==="bad");
  }
  function paintAll(){S.groups.forEach(function(g){g.items.forEach(paint)});progress()}
  function changed(it){if(it)paint(it);save();progress()}
  function progress(){
    var s=PM.summary(data),pct=s.total?Math.round(s.done/s.total*100):0;
    $("progT").innerHTML="<b>"+s.done+" / "+s.total+"</b> 항목 기록 · 미실시 <b>"+s.skip+"</b>";
    $("progI").style.width=pct+"%";
    S.groups.forEach(function(g,gi){var t=0,d=0;g.items.forEach(function(it){var j=PM.judge(it,data.items[it.id]||{},data.header);if(j.state==="na"&&!PM.applicable(it,data.header))return;t++;if(j.state!=="none")d++});var el=$("gc_"+gi);if(el){el.textContent=d+" / "+t;el.classList.toggle("done",t>0&&d===t)}});
  }
  var H=["facility","model","sn","date","dealer","engineer","result"];
  function bindHeader(){
    H.forEach(function(k){var el=$("h_"+k);el.value=data.header[k]||"";el.addEventListener("input",function(){data.header[k]=el.value;if(k==="model")paintAll();save();progress()})});
    $("h_ret").checked=!!data.header.ret;$("h_ret").addEventListener("change",function(){data.header.ret=$("h_ret").checked;paintAll();save()});
    $("remarks").value=data.remarks||"";$("remarks").addEventListener("input",function(){data.remarks=$("remarks").value;save()});
  }
  function msg(kind,html){$("msg").innerHTML=html?'<div class="notice '+kind+'" role="status">'+html+"</div>":"";if(html)$("msg").scrollIntoView({behavior:"smooth",block:"center"})}
  function download(name,text,type){var b=new Blob([text],{type:type}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
  var CFG=window.PM_CONFIG||{};
  function p2(n){return(n<10?"0":"")+n}
  function stamp(){var d=new Date();return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())+" "+p2(d.getHours())+":"+p2(d.getMinutes())}
  function check(force,again){
    var miss=H.filter(function(k){return !String(data.header[k]||"").trim()}),s=PM.summary(data);
    if(miss.length){msg("warn","<b>장비 · 설치 정보</b>의 필수 항목을 먼저 채워 주세요.");return false}
    if(s.none&&!force){msg("warn","아직 기록하지 않은 항목이 <b>"+s.none+"개</b> 있습니다.<ul>"+s.missing.slice(0,8).map(function(x){return"<li>"+PM.esc(x)+"</li>"}).join("")+(s.none>8?"<li>…</li>":"")+'</ul><div style="margin-top:8px"><button class="btn ghost" type="button" id="bForce">그래도 계속</button></div>');$("bForce").onclick=function(){again(true)};return false}
    return true;
  }
  function snapshot(){var sub={schema:data.schema,header:JSON.parse(JSON.stringify(data.header)),items:JSON.parse(JSON.stringify(data.items)),remarks:data.remarks||"",createdAt:stamp()};sub.hash=PM.sha256(PM.canon(PM.payloadOf(sub)));return sub}
  function baseName(sub){var h=sub.header;return "Install_Report_"+h.model+"_"+String(h.sn).replace(/[^\w-]/g,"")+"_"+String(h.date).replace(/-/g,"")}
  /* ---------- PDF ---------- */
  function makePdf(sub){
    var src="<style>"+PM.REPORT_CSS+".rp{max-width:none}.rp-mini{break-inside:auto!important;page-break-inside:auto!important}</style>"+PM.reportBody(sub,null);
    var opt={margin:[11,10,12,10],filename:baseName(sub)+".pdf",image:{type:"jpeg",quality:0.95},
      html2canvas:{scale:2,backgroundColor:"#ffffff",scrollX:0,scrollY:0,logging:false},
      jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},
      pagebreak:{mode:["css","legacy"],avoid:["tr","thead",".rp-sign",".rp-tiles",".rp-info",".rp-top",".rp-verdict","h2",".rp-rem"]}};
    var waitLib=function(){return new Promise(function(res,rej){var n=0;(function w(){if(window.html2pdf)return res();if(++n>100)return rej(new Error("PDF 모듈을 불러오지 못했습니다"));setTimeout(w,100)})()})};
    return waitLib().then(function(){
      var w=html2pdf().set(opt).from(src,"string").toPdf().get("pdf").then(function(pdf){
        var n=pdf.internal.getNumberOfPages();
        for(var i=1;i<=n;i++){pdf.setPage(i);pdf.setFontSize(8);pdf.setTextColor(150);pdf.text(i+" / "+n,200,290,{align:"right"})}
      });
      return w.outputPdf("blob");
    }).then(function(blob){return new File([blob],opt.filename,{type:"application/pdf"})});
  }
  function canShareFile(f){try{return !!(navigator.canShare&&navigator.share&&navigator.canShare({files:[f]}))}catch(e){return false}}
  function saveFile(f){var u=URL.createObjectURL(f),a=document.createElement("a");a.href=u;a.download=f.name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(u);a.remove()},4000)}
  function openFile(f){var u=URL.createObjectURL(f);var w=window.open(u,"_blank");if(!w)location.href=u}
  function busy(text){msg("ok",'<span class="spin" aria-hidden="true"></span>'+text)}
  function printReport(force,keep){
    if(!check(force,printReport))return;if(!keep)msg("","");
    var sub=snapshot();$("printArea").innerHTML="<style>"+PM.REPORT_CSS+"</style>"+PM.reportBody(sub,null);
    var old=document.title;document.title=baseName(sub);window.print();document.title=old;
  }
  function pdfFlow(force){
    if(!check(force,pdfFlow))return;
    var sub=snapshot();busy("보고서 PDF를 만드는 중입니다…");
    makePdf(sub).then(function(file){
      var share=canShareFile(file);
      msg("ok",'<b>보고서 PDF가 준비되었습니다.</b> <span style="color:var(--muted)">'+PM.esc(file.name)+'</span><div class="row2">'+
        (share?'<button class="btn pri big" type="button" id="pShare">공유 · 저장 · 인쇄</button>':'<button class="btn pri big" type="button" id="pSave">PDF 저장</button>')+
        '<button class="btn ghost" type="button" id="pOpen">PDF 열기</button><button class="btn ghost" type="button" id="pPrint">바로 인쇄</button></div>'+
        (share?'<div style="margin-top:8px;font-size:12.5px;color:var(--muted)">공유 화면에서 <b>파일에 저장</b>, <b>프린트</b>, 메일·메신저 보내기를 고를 수 있습니다.</div>':''));
      if(share)$("pShare").onclick=function(){navigator.share({files:[file],title:file.name}).catch(function(){})};
      else $("pSave").onclick=function(){saveFile(file)};
      $("pOpen").onclick=function(){openFile(file)};
      $("pPrint").onclick=function(){printReport(true,true)};
    },function(e){msg("warn","PDF를 만들지 못했습니다 ("+PM.esc(e.message||e)+"). <b>바로 인쇄</b>로 인쇄 화면에서 PDF로 저장할 수 있습니다."+'<div class="row2"><button class="btn ghost" type="button" id="pPrint">바로 인쇄</button></div>');$("pPrint").onclick=function(){printReport(true,true)}});
  }
  function mailBody(sub,full){
    var h=sub.header,s=PM.summary(sub),L=[],bad=[];
    S.groups.forEach(function(g){g.items.forEach(function(it){var j=PM.judge(it,(sub.items||{})[it.id]||{},h);if(j.state==="bad")bad.push(it.label+": "+j.value);if(j.state==="skip")bad.push("미실시 - "+it.label)})});
    L.push("안녕하세요, "+h.dealer+" "+h.engineer+"입니다.","XN-L 설치를 마쳐 설치 확인 보고서를 보내드립니다.","","병원: "+h.facility,"장비: "+h.model+" / S/N "+h.sn+(h.ret?" (RET)":""),"설치일: "+h.date,"설치 결과: "+h.result,"확인 항목: "+s.total+" · 완료 "+s.ok+" · 미실시 "+s.skip+" · 미입력 "+s.none);
    if(full&&bad.length){L.push("","확인 필요:");bad.slice(0,full===2?20:3).forEach(function(b){L.push("- "+b)});if(bad.length>(full===2?20:3))L.push("- 외 "+(bad.length-(full===2?20:3))+"건 (보고서 참고)")}
    if(sub.remarks)L.push("","비고: "+sub.remarks.replace(/\n/g," / ").slice(0,full===2?500:80));
    L.push("","첨부: "+baseName(sub)+".pdf, 분석 데이터","무결성 코드: "+sub.hash.slice(0,16));
    return L.join("\n");
  }
  function copyText(btn,text,box){
    var ok=function(){var o=btn.textContent;btn.textContent="복사됨";setTimeout(function(){btn.textContent=o},1500)};
    var fb=function(){var ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();try{document.execCommand("copy");ok()}catch(e){if(box){var r=document.createRange();r.selectNodeContents(box);var sl=getSelection();sl.removeAllRanges();sl.addRange(r)}}ta.remove()};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(ok,fb);else fb();
  }
  function sendMail(force){
    if(!check(force,sendMail))return;
    var sub=snapshot(),h=sub.header,toList=String(CFG.MAIL_TO||"").split(",").map(function(x){return x.trim()}).filter(Boolean),to=toList.join("; ");
    var subj="[설치 완료] "+h.facility+" · "+h.model+" "+h.sn+" · "+h.date,body=mailBody(sub,2),E=PM.esc;
    busy("메일에 첨부할 보고서 PDF를 만드는 중입니다…");
    makePdf(sub).then(function(file){
      var share=canShareFile(file);
      var copyRow=function(id,label,val,tall){return '<div class="mailbox" id="m'+id+'"'+(tall?'':' style="max-height:none"')+'>'+E(val)+'</div><div class="row2"><button class="btn ghost" type="button" id="c'+id+'">'+label+'</button></div>'};
      var html='<b>Sysmex에 보고서 보내기</b>'+(share?' · 아래 두 단계면 끝납니다.':' · 아래 순서대로 진행하세요.')+'<ol class="steps">';
      if(share){
        html+='<li><span class="no">1</span><div><b>받는 사람 복사</b> — 메일 앱에서 받는 사람 칸에 붙여 넣습니다.'+copyRow("To","받는 사람 복사",to||"(받는 사람 주소가 설정되지 않았습니다)")+'</div></li>'+
          '<li><span class="no">2</span><div><b>메일 앱으로 보내기</b> — 공유 화면에서 <b>Outlook</b>(또는 메일)을 고르면 보고서 PDF가 첨부된 새 메일이 열립니다. 제목·본문도 채워집니다.<div class="row2"><button class="btn pri big" type="button" id="sShare">메일 앱으로 보내기</button></div></div></li>';
      }else{
        html+='<li><span class="no">1</span><div><b>보고서 PDF 저장</b><div class="row2"><button class="btn pri" type="button" id="sSave">PDF 저장</button><button class="btn ghost" type="button" id="sOpen">PDF 열기</button></div></div></li>'+
          '<li><span class="no">2</span><div><b>Outlook에서 새 메일</b>을 열고 받는 사람·제목·본문을 붙여 넣습니다.'+copyRow("To","받는 사람 복사",to||"(받는 사람 주소가 설정되지 않았습니다)")+copyRow("Subj","제목 복사",subj)+'</div></li>'+
          '<li><span class="no">3</span><div>저장한 <b>PDF와 분석 데이터를 첨부</b>하고 보내기를 누릅니다.</div></li>';
      }
      html+='</ol><details style="margin-top:12px"><summary style="cursor:pointer;font-size:13px;color:var(--muted)">제목 · 본문 보기 / 복사</summary>'+(share?copyRow("Subj","제목 복사",subj):'')+copyRow("Body","본문 복사",body,true)+'</details>'+
        '<div style="margin-top:10px;font-size:12.5px;color:var(--muted)">메일 앱이 바로 열리는 기기라면 <button class="btn ghost" type="button" id="mOpen" style="padding:4px 10px;font-size:12.5px">받는 사람까지 채워진 새 메일 열기</button> 후 PDF만 첨부해도 됩니다.</div>';
      msg("ok",html);
      if(share)$("sShare").onclick=function(){navigator.share({files:[file],title:subj,text:body}).then(function(){$("sShare").textContent="다시 보내기"}).catch(function(){})};
      else{$("sSave").onclick=function(){saveFile(file)};$("sOpen").onclick=function(){openFile(file)}}
      $("cTo").onclick=function(){copyText(this,to,$("mTo"))};
      $("cSubj").onclick=function(){copyText(this,subj,$("mSubj"))};
      $("cBody").onclick=function(){copyText(this,body,$("mBody"))};
      $("mOpen").onclick=function(){var mk=function(b){return "mailto:"+toList.join(",")+"?"+(CFG.MAIL_CC?"cc="+encodeURIComponent(CFG.MAIL_CC)+"&":"")+"subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(b)};var u=mk(mailBody(sub,1));if(u.length>1900)u=mk(mailBody(sub,0));location.href=u};
    },function(e){msg("warn","PDF를 만들지 못했습니다 ("+E(e.message||e)+"). 잠시 후 다시 눌러 주세요.")});
  }
  $("bPdf").onclick=function(){pdfFlow(false)};
  $("bMail").onclick=function(){sendMail(false)};
  $("bReset").onclick=function(){if(!confirm("입력한 내용을 모두 지우고 새로 작성할까요?"))return;data=blank();save();bindFresh()};
  function bindFresh(){var c=document.querySelector(".wrap");H.forEach(function(k){var o=$("h_"+k),n=o.cloneNode(true);o.parentNode.replaceChild(n,o)});var r=$("h_ret"),r2=r.cloneNode(true);r.parentNode.replaceChild(r2,r);var t=$("remarks"),t2=t.cloneNode(true);t.parentNode.replaceChild(t2,t);bindHeader();build();paintAll();msg("","")}
  load();bindHeader();build();paintAll();
  /* ---------- app shell: install, offline ---------- */
  var deferred=null,standalone=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;$("bInstall").hidden=false});
  $("bInstall").onclick=function(){if(!deferred)return;deferred.prompt();deferred.userChoice.finally(function(){deferred=null;$("bInstall").hidden=true})};
  window.addEventListener("appinstalled",function(){$("bInstall").hidden=true});
  var ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  var tipOff=false;try{tipOff=localStorage.getItem("xnl-inst-tip-off")==="1"}catch(e){}
  if(ios&&!standalone&&!tipOff)$("iosTip").hidden=false;
  $("bTipClose").onclick=function(){$("iosTip").hidden=true;try{localStorage.setItem("xnl-inst-tip-off","1")}catch(e){}};
  var net=function(){$("net").textContent=navigator.onLine?"":"오프라인 · 입력과 PDF 만들기는 그대로 됩니다"};
  window.addEventListener("online",net);window.addEventListener("offline",net);net();
  if("serviceWorker" in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js").catch(function(){});
})();
