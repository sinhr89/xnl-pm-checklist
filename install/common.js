/* ===== XN-L Installation checklist — shared schema & logic (same structure as the PM checklist) ===== */
var PM = (function () {
  var MODELS = ["XN-350", "XN-450", "XN-550"];
  // type: check | range | adjust | sens | part | text
  var SCHEMA = {
    id: "XN-L-INST", version: "Rev.0 (2021-01-25)", title: "XN-L Series 설치 체크리스트",
    groups: [
      { id: "env", sec: "I. 설치 환경", title: "장소 · 공간 · 전원", items: [
        { id: "env_place", label: "설치 장소 환경이 적절함", type: "check", hint: "온도 · 습도 · 바람 · 먼지 · 진동 · 누수 · 직사광선 · 소음 · 조명" },
        { id: "env_space", label: "설치 공간이 충분함", type: "check" },
        { id: "env_floor", label: "설치 바닥(테이블) 강도가 충분함", type: "check" },
        { id: "env_power", label: "전원(용량 · 콘센트 수)과 접지가 적절함", type: "check" } ] },
      { id: "unpack", sec: "II. 개봉", title: "내용물 · 포장재", items: [
        { id: "up_contents", label: "본체 · 부속품 · 소모품 · 옵션이 모두 들어 있음", type: "check", hint: "포장 내용물 목록과 대조" },
        { id: "up_damage", label: "장비에 손상이 없음", type: "check" },
        { id: "up_waste", label: "포장재를 분리해 쓰레기 봉투에 담음", type: "check" } ] },
      { id: "fix", sec: "III. 설치", title: "운송 고정물 제거", items: [
        { id: "fx_all", label: "운송 고정 테이프와 고정물(클립 · 타이랩)을 모두 제거", type: "check" },
        { id: "fx_sampler", label: "샘플러 기구 고정물 제거", type: "check", models: ["XN-550"] } ] },
      { id: "conn", sec: "III. 설치", title: "시약 · 배수 튜브 · 전원 연결", items: [
        { id: "cn_drain", label: "배수 튜브를 연결하고 배출구에서 빠지지 않게 고정", type: "check" },
        { id: "cn_reagent", label: "시약 연결 (CELLPACK DCL · SULFOLYSER · Lysercell WDF)", type: "check", hint: "RET 옵션이면 CELLPACK DFL 포함 · 시약 용기는 장비 바닥면보다 낮은 위치에 둠" },
        { id: "cn_stain", label: "염색제(Fluorocell WDF)를 지정 홀더에 장착", type: "check", hint: "RET 옵션이면 Fluorocell RET 포함" },
        { id: "cn_power", label: "본체에 전원 케이블 연결", type: "check" } ] },
      { id: "periph", sec: "III. 설치", title: "주변기기 연결", items: [
        { id: "pe_input", label: "키보드 · 마우스 · 휴대용 바코드 리더기 연결", type: "check" },
        { id: "pe_monitor", label: "터치 패널 모니터 연결", type: "check", models: ["XN-550"] } ] },
      { id: "soft", sec: "III. 설치", title: "소프트웨어 설정", items: [
        { id: "sw_config", label: "IPU 시작 시 System Configuration으로 시스템 구성 설정", type: "check" },
        { id: "sw_shell", label: "SysmexCustomShell · 시스템 로캘 · 키보드 설정", type: "check" },
        { id: "sw_mcafee", label: "McAfee Embedded 설정", type: "check" },
        { id: "sw_gp", label: "GP 프린터 설정", type: "check", hint: "GP 프린터를 쓰지 않으면 ‘해당 없음’" },
        { id: "sw_touch", label: "터치 패널 설정", type: "check" } ] },
      { id: "op", sec: "III. 설치", title: "작동 확인", items: [
        { id: "op_power", label: "전원을 켰을 때 장비가 정상 동작함", type: "check" },
        { id: "op_prime", label: "프라이밍 후 장비 내부에 시약이 누설 없이 채워짐", type: "check" },
        { id: "op_blank", label: "자동 세정(Auto Rinse) 블랭크 값이 기준 이하", type: "text", field: "블랭크 값 / 메모" },
        { id: "op_adjust", label: "모든 조정 항목에 문제가 없음을 확인", type: "check" },
        { id: "op_optic", label: "광축 확인/조정 후 지그를 제거하고 원래 배선을 연결", type: "check", hint: "광축 확인/조정을 하지 않았으면 ‘해당 없음’" } ] },
      { id: "data", sec: "III. 설치", title: "데이터 확인", items: [
        { id: "dt_check", label: "각 분석값 데이터 확인 (분석 데이터 첨부)", type: "text", field: "확인 내용 / 첨부 파일명" } ] },
      { id: "final", sec: "IV. 최종 확인", title: "외관 · 정리", items: [
        { id: "fn_clean", label: "장비에 먼지 · 오염이 없음", type: "check" },
        { id: "fn_tube", label: "튜브 · 케이블 정리, 배수 튜브가 빠지지 않게 고정", type: "check" },
        { id: "fn_level", label: "장비가 테이블 위에 수평으로 놓임", type: "check" } ] }
    ]
  };

  function applicable(item, header) {
    if (item.models && item.models.indexOf(header.model) < 0) return false;
    if (item.opt === "RET" && !header.ret) return false;
    return true;
  }
  function num(v) { if (v === undefined || v === null || String(v).trim() === "") return null; var n = Number(String(v).replace(/[−–]/g, "-").replace(",", ".")); return isFinite(n) ? n : NaN; }
  function fmt(n) { return Math.round(n * 1000) / 1000; }

  /* judge one item → {state:'ok'|'bad'|'none'|'na'|'skip', value:'text', note:''} */
  function judge(item, r, header) {
    r = r || {};
    if (!applicable(item, header)) return { state: "na", value: "해당 모델·옵션 아님", note: "" };
    if (r.s === "NA") return { state: "na", value: "해당 없음", note: r.t || "" };
    if (r.s === "N") return { state: "skip", value: "미실시", note: r.t || "" };
    if (r.s !== "Y") return { state: "none", value: "", note: "" };
    if (item.type === "range") {
      var v = num(r.v); if (v === null || isNaN(v)) return { state: "none", value: "값 없음", note: "" };
      return { state: v >= item.min && v <= item.max ? "ok" : "bad", value: r.v + (item.unit ? " " + item.unit : ""), note: "기준 " + item.crit };
    }
    if (item.type === "adjust") {
      var b = num(r.b), a = num(r.a); var x = (a !== null && !isNaN(a)) ? a : b;
      if (x === null || isNaN(x)) return { state: "none", value: "값 없음", note: "" };
      var val = "조정 전 " + (r.b || "-") + (r.a ? " → 조정 후 " + r.a : "");
      return { state: x >= item.min && x <= item.max ? "ok" : "bad", value: val, note: "기준 " + item.crit };
    }
    if (item.type === "sens") {
      var t = num(r.g), b2 = num(r.b), a2 = num(r.a); var y = (a2 !== null && !isNaN(a2)) ? a2 : b2;
      if (t === null || isNaN(t) || y === null || isNaN(y)) return { state: "none", value: "값 없음", note: "" };
      var d = fmt(y - t);
      return { state: Math.abs(y - t) <= item.tol + 1e-9 ? "ok" : "bad", value: "Target " + r.g + " · 측정 " + (r.b || "-") + (r.a ? " → " + r.a : "") + " (차 " + (d > 0 ? "+" : "") + d + ")", note: "허용 ±" + item.tol + " " + item.unit };
    }
    if (item.type === "part") return { state: "ok", value: "실시" + (r.c ? " · 동작 횟수 " + r.c : ""), note: item.interval };
    if (item.type === "text") return { state: "ok", value: r.t || "실시", note: "" };
    return { state: "ok", value: "완료", note: r.t || "" };
  }

  function summary(data) {
    var s = { total: 0, done: 0, ok: 0, bad: 0, skip: 0, na: 0, none: 0, missing: [] };
    SCHEMA.groups.forEach(function (g) { g.items.forEach(function (it) {
      var j = judge(it, (data.items || {})[it.id], data.header || {});
      if (j.state === "na") { s.na++; return; }
      s.total++;
      if (j.state === "none") { s.none++; s.missing.push(it.label); return; }
      s.done++;
      if (j.state === "bad") s.bad++; else if (j.state === "skip") s.skip++; else s.ok++;
    }); });
    return s;
  }

  /* canonical JSON (sorted keys) + SHA-256 (pure JS, works offline / file://) */
  function canon(o) {
    if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
    if (o && typeof o === "object") return "{" + Object.keys(o).sort().map(function (k) { return JSON.stringify(k) + ":" + canon(o[k]); }).join(",") + "}";
    return JSON.stringify(o);
  }
  function sha256(str) {
    var bytes = unescape(encodeURIComponent(str)), K = [], H = [], i, j, isP = {}, n = 2, c = 0;
    while (c < 64) { if (!isP[n]) { for (i = n * n; i < 312; i += n) isP[i] = 1; var r = Math.pow(n, 1 / 2), r3 = Math.pow(n, 1 / 3); if (c < 8) H[c] = (r * 4294967296) | 0; K[c++] = (r3 * 4294967296) | 0; } n++; }
    var l = bytes.length * 8, w = []; bytes += "\x80"; while (bytes.length % 64 - 56) bytes += "\x00";
    for (i = 0; i < bytes.length; i++) { j = bytes.charCodeAt(i); w[i >> 2] |= j << ((3 - i) % 4) * 8; }
    w[w.length] = (l / 4294967296) | 0; w[w.length] = l | 0;
    var rot = function (v, s) { return (v >>> s) | (v << (32 - s)); };
    for (j = 0; j < w.length; j += 16) {
      var W = w.slice(j, j + 16), h = H.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = W[i - 15], w2 = W[i - 2], a = h[0], e = h[4];
        var t1 = h[7] + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & h[5]) ^ (~e & h[6])) + K[i] +
          (W[i] = i < 16 ? W[i] : (W[i - 16] + (rot(w15, 7) ^ rot(w15, 18) ^ (w15 >>> 3)) + W[i - 7] + (rot(w2, 17) ^ rot(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));
        h = [(t1 + t2) | 0].concat(h); h[4] = (h[4] + t1) | 0; h.pop();
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + h[i]) | 0;
    }
    var out = ""; for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (H[i] >> (j * 8)) & 255; out += (b < 16 ? "0" : "") + b.toString(16); }
    return out;
  }
  function payloadOf(sub) { return { schema: sub.schema, header: sub.header, items: sub.items, remarks: sub.remarks || "", createdAt: sub.createdAt }; }
  function verify(sub) { return !!sub && typeof sub.hash === "string" && sha256(canon(payloadOf(sub))) === sub.hash; }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }

  /* report body HTML (A4 report: used for print/PDF and the saved report) */
  function reportBody(sub, approval) {
    var h = sub.header || {}, s = summary(sub), items = sub.items || {};
    var TAG = { ok: ["완료", "ok"], bad: ["기준 벗어남", "bad"], skip: ["미실시", "skip"], na: ["해당 없음", "na"], none: ["미입력", "none"] };
    var tag = function (st, label) { var t = TAG[st]; return '<span class="tag tag-' + t[1] + '">' + (label || t[0]) + "</span>"; };
    var no = "INST-" + (sub.hash ? sub.hash.slice(0, 8).toUpperCase() : "미발행");
    var o = '<div class="rp">';
    /* header */
    o += '<div class="rp-top"><div><div class="rp-eyebrow">SYSMEX KOREA · INSTALLATION REPORT</div><h1>XN-L Series 설치 확인 보고서</h1><div class="rp-sub">Installation Checklist ' + esc(SCHEMA.version) + "</div></div>";
    o += '<div class="rp-doc"><div><span>보고서 번호</span><b>' + esc(no) + "</b></div><div><span>설치일</span><b>" + esc(h.date) + "</b></div>";
    if (approval && approval.status) {
      var lbl = approval.status === "approved" ? "승인" : approval.status === "rejected" ? "반려" : "검토 대기";
      o += '<div class="rp-stamp rp-' + esc(approval.status) + '"><b>' + lbl + "</b><span>" + esc(approval.by || "") + " " + esc(approval.at || "") + "</span></div>";
    }
    o += "</div></div>";
    /* info grid */
    var cell = function (k, v) { return '<div class="rp-cell"><span>' + k + "</span><b>" + (esc(v) || "—") + "</b></div>"; };
    o += '<div class="rp-info">' + cell("병원(시설)", h.facility) + cell("장비 모델", (h.model || "") + (h.ret ? " · RET 옵션" : "")) + cell("시리얼 번호", h.sn) + cell("설치일", h.date) +
      cell("대리점", h.dealer) + cell("설치 엔지니어", h.engineer) + cell("설치 결과", h.result) + cell("작성", sub.createdAt) + "</div>";
    /* verdict + tiles */
    var good = !s.bad && !s.skip && !s.none;
    o += '<div class="rp-verdict ' + (s.bad ? "v-bad" : good ? "v-ok" : "v-warn") + '">' +
      (s.bad ? "기준을 벗어난 항목이 <b>" + s.bad + "건</b> 있습니다. 아래 ‘확인 필요 항목’을 참고해 주세요."
        : good ? "모든 설치 확인 항목을 완료했습니다." : "미실시 · 미입력 항목이 있습니다. 아래 ‘확인 필요 항목’과 비고를 참고해 주세요.") + "</div>";
    o += '<div class="rp-tiles"><div><span>확인 항목</span><b>' + s.total + '</b></div><div class="t-ok"><span>완료</span><b>' + s.ok + '</b></div><div class="' + (s.skip ? "t-warn" : "") + '"><span>미실시</span><b>' + s.skip + '</b></div><div class="' + (s.none ? "t-warn" : "") + '"><span>미입력</span><b>' + s.none + "</b></div></div>";
    /* attention list */
    var att = "", meas = "", blocks = [];
    SCHEMA.groups.forEach(function (g) {
      var rows = "", nrow = 0;
      g.items.forEach(function (it) {
        if (!applicable(it, h)) return;
        var r = items[it.id] || {}, j = judge(it, r, h);
        if (j.state === "bad" || j.state === "skip" || j.state === "none")
          att += "<tr><td>" + esc(it.label) + '</td><td class="c">' + tag(j.state) + "</td><td>" + esc(j.state === "none" ? "기록 없음" : j.value) + (j.note && j.state !== "none" ? ' <span class="m">· ' + esc(j.note) + "</span>" : "") + "</td></tr>";
        if (it.type === "range" || it.type === "adjust" || it.type === "sens") {
          var crit = it.type === "sens" ? "Target " + (r.g ? esc(r.g) : "—") + " ± " + it.tol + " " + esc(it.unit) : esc(it.crit) + (it.unit && it.type === "range" ? " " + esc(it.unit) : "");
          var first = it.type === "range" ? r.v : r.b, after = it.type === "range" ? "" : r.a;
          var st = r.s === "Y" ? j.state : judge(it, r, h).state;
          meas += "<tr><td>" + esc(it.label) + "</td><td>" + crit + '</td><td class="n">' + (esc(first) || "—") + '</td><td class="n">' + (esc(after) || "—") + '</td><td class="c">' + tag(st, st === "ok" ? "적합" : null) + "</td></tr>";
          return;
        }
        var rec = j.state === "ok" ? (it.type === "part" ? (r.c ? "동작 횟수 " + esc(r.c) : "") + (it.interval ? ' <span class="m">주기 ' + esc(it.interval) + "</span>" : "") : it.type === "text" ? esc(r.t || "") : esc(r.t || "")) : esc(j.note || "");
        nrow += rec ? 1.6 : 1; rows += "<tr><td>" + esc(it.label) + (rec ? '<div class="rec">' + rec + "</div>" : "") + '</td><td class="c">' + tag(j.state) + "</td></tr>";
      });
      if (rows) blocks.push({ n: nrow + 1.4, html: '<table class="rp-t rp-mini"><colgroup><col><col style="width:78px"></colgroup><thead><tr><th colspan="2">' + esc(g.sec + " · " + g.title) + "</th></tr></thead><tbody>" + rows + "</tbody></table>" });
    });
    if (att) o += '<h2>확인 필요 항목</h2><table class="rp-t"><colgroup><col style="width:38%"><col style="width:96px"><col></colgroup><thead><tr><th>항목</th><th class="c">상태</th><th>기록</th></tr></thead><tbody>' + att + "</tbody></table>";
    if (meas) o += '<h2>측정 · 조정 결과</h2><table class="rp-t"><colgroup><col style="width:34%"><col style="width:24%"><col><col><col style="width:96px"></colgroup><thead><tr><th>항목</th><th>기준</th><th class="n">측정 (조정 전)</th><th class="n">조정 후</th><th class="c">판정</th></tr></thead><tbody>' + meas + "</tbody></table>";
    var tot = blocks.reduce(function (a, b) { return a + b.n; }, 0), acc = 0, colA = "", colB = "";
    var inB = false; blocks.forEach(function (b) { if (!inB && acc + b.n / 2 <= tot / 2) { colA += b.html; acc += b.n; } else { inB = true; colB += b.html; } });
    o += '<h2>설치 확인 항목</h2><div class="rp-cols"><div class="rp-col">' + colA + '</div><div class="rp-col">' + colB + "</div></div>";
    o += '<h2>비고</h2><div class="rp-rem">' + (esc(sub.remarks) || '<span class="m">특이사항 없음</span>') + "</div>";
    if (approval && approval.comment) o += '<h2>검토 의견</h2><div class="rp-rem">' + esc(approval.comment) + "</div>";
    o += '<div class="rp-sign"><div><span>설치 엔지니어</span><b>' + esc(h.engineer) + " <small>(" + esc(h.dealer) + ')</small></b><i>서명</i></div><div><span>고객 확인</span><b>&nbsp;</b><i>성명 / 서명</i></div></div>';
    o += '<div class="rp-foot"><span>Sysmex Korea · XN-L Series Installation Report</span><span>작성 ' + esc(sub.createdAt || "") + (sub.hash ? " · 무결성 코드 " + esc(sub.hash.slice(0, 16)) : "") + "</span></div></div>";
    return o;
  }
  var REPORT_CSS = [
    ".rp{font-family:'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',Arial,sans-serif;color:#26313D;max-width:860px;margin:0 auto;font-size:12px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}",
    ".rp-top{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;border-top:5px solid #005BAC;padding-top:14px;margin-bottom:14px}",
    ".rp-eyebrow{font-size:9.5px;font-weight:700;letter-spacing:.12em;color:#005BAC}.rp h1{font-size:21px;margin:4px 0 2px;color:#0B3E78;font-weight:700}.rp-sub{font-size:10.5px;color:#7A8594}",
    ".rp-doc{display:flex;gap:8px;align-items:stretch}.rp-doc>div{background:#F2F6FB;border-radius:8px;padding:6px 12px;display:flex;flex-direction:column;justify-content:center;min-width:104px}.rp-doc span{font-size:9.5px;color:#7A8594}.rp-doc b{font-size:12.5px;color:#0B3E78;white-space:nowrap}",
    ".rp-stamp{border:2px solid #7A8594;color:#7A8594;align-items:center;text-align:center}.rp-stamp b{font-size:15px;color:inherit}.rp-stamp span{font-size:9px;color:inherit}.rp-approved{border-color:#2E8B5E!important;color:#2E8B5E!important;background:#fff!important}.rp-rejected{border-color:#C94A47!important;color:#C94A47!important;background:#fff!important}",
    ".rp-info{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #E1E7EF;border-radius:10px;overflow:hidden}.rp-cell{padding:7px 12px;border-right:1px solid #E1E7EF;border-bottom:1px solid #E1E7EF;display:flex;flex-direction:column;min-width:0}.rp-cell:nth-child(4n){border-right:0}.rp-cell:nth-child(n+5){border-bottom:0}.rp-cell span{font-size:9.5px;color:#7A8594}.rp-cell b{font-size:12.5px;font-weight:600;overflow-wrap:anywhere}",
    ".rp-verdict{margin:14px 0 8px;border-radius:10px;padding:9px 14px;font-size:12.5px}.v-ok{background:#E7F5EE;color:#1F6E48}.v-bad{background:#FCEDEC;color:#A63A37}.v-warn{background:#FFF5E3;color:#8A5A00}",
    ".rp-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.rp-tiles div{background:#F5F7FA;border-radius:10px;padding:8px 12px}.rp-tiles span{display:block;font-size:10px;color:#7A8594}.rp-tiles b{font-size:20px;font-weight:700;color:#26313D;font-variant-numeric:tabular-nums}.rp-tiles .t-ok b{color:#2E8B5E}.rp-tiles .t-bad{background:#FCEDEC}.rp-tiles .t-bad b{color:#C94A47}.rp-tiles .t-warn{background:#FFF5E3}.rp-tiles .t-warn b{color:#9A6400}",
    ".rp h2{font-size:12.5px;color:#0B3E78;margin:18px 0 6px;padding-left:9px;border-left:3px solid #005BAC;break-after:avoid}",
    ".rp-t{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;border:1px solid #E1E7EF;border-radius:10px;overflow:hidden;font-size:11.5px}.rp-t th{background:#F2F6FB;color:#4A5868;font-weight:600;text-align:left;padding:6px 10px;font-size:10.5px;border-bottom:1px solid #E1E7EF}.rp-t td{padding:5px 10px;border-bottom:1px solid #EEF2F6;vertical-align:top;overflow-wrap:anywhere}.rp-t tbody tr:last-child td{border-bottom:0}.rp-t tr{break-inside:avoid}",
    ".rp-t .c{text-align:center}.rp-t .n{text-align:right;font-variant-numeric:tabular-nums}.rp-t tr.grp td{background:#FAFBFD;color:#005BAC;font-weight:700;font-size:10.5px;padding:5px 10px;border-bottom:1px solid #EEF2F6}.rp .m{color:#7A8594;font-size:10.5px}",
    ".tag{display:inline-block;padding:1px 9px;border-radius:999px;font-size:10px;font-weight:700;white-space:nowrap}.tag-ok{background:#E7F5EE;color:#2E7D55}.tag-bad{background:#C94A47;color:#fff}.tag-skip{background:#FFF0D6;color:#8A5A00}.tag-na{background:#EEF1F5;color:#7A8594}.tag-none{background:#fff;border:1px dashed #B5BEC9;color:#7A8594}",
    ".rp-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}.rp-col{min-width:0}.rp-mini{margin:0 0 10px;break-inside:avoid}.rp-mini th{color:#005BAC;font-size:10.5px;font-weight:700;background:#F5F8FC}.rp-mini td{padding:4px 10px}.rp-mini .rec{font-size:10px;color:#5E6B7A;margin-top:1px}.rp-mini .rec .m{font-size:9.5px}",
    ".rp-rem{border:1px solid #E1E7EF;border-radius:10px;padding:8px 12px;white-space:pre-wrap;min-height:34px;font-size:11.5px}",
    ".rp-sign{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;break-inside:avoid}.rp-sign div{border:1px solid #E1E7EF;border-radius:10px;padding:8px 12px;height:86px;position:relative}.rp-sign span{display:block;font-size:9.5px;color:#7A8594}.rp-sign b{font-size:12.5px;font-weight:600}.rp-sign small{font-weight:400;color:#7A8594}.rp-sign i{position:absolute;right:12px;bottom:8px;font-style:normal;font-size:9.5px;color:#A0AAB6;border-top:1px solid #C9D1DB;padding-top:2px;width:45%;text-align:right}",
    ".rp-foot{display:flex;justify-content:space-between;gap:12px;margin-top:14px;padding-top:8px;border-top:1px solid #E1E7EF;font-size:9.5px;color:#9AA4B0}",
    "@media print{.rp{max-width:none}@page{size:A4;margin:12mm 11mm}}"
  ].join("");

  function reportDocument(sub, approval) {
    var h = sub.header || {};
    return "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>설치 확인 보고서 " + esc(h.sn || "") + "</title><style>body{margin:24px;background:#fff}" + REPORT_CSS + "</style></head><body>" + reportBody(sub, approval) + "</body></html>";
  }

  return { SCHEMA: SCHEMA, MODELS: MODELS, applicable: applicable, judge: judge, summary: summary, canon: canon, sha256: sha256,
    payloadOf: payloadOf, verify: verify, esc: esc, reportBody: reportBody, reportDocument: reportDocument, REPORT_CSS: REPORT_CSS };
})();
