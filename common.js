/* ===== XN-L PM checklist — shared schema & logic (dealer form + Sysmex approval page) ===== */
var PM = (function () {
  var MODELS = ["XN-350", "XN-450", "XN-550"];
  // type: check | range | adjust | sens | part | text
  var SCHEMA = {
    id: "XN-L-PM", version: "Rev.3 (2026-10-22)", title: "XN-L Series 예방정비(PM) 체크리스트",
    groups: [
      { id: "pre", title: "PM 전", items: [
        { id: "pre_explain", label: "고객에게 PM 내용 설명", type: "check" },
        { id: "pre_data", label: "사전 데이터 확인 (정상 검체 또는 QC 2회, 평균 기록)", type: "text", field: "평균값 / 메모", hint: "필요하면 HOST 연결 OFF" } ] },
      { id: "prep", title: "준비", items: [
        { id: "prep_cover", label: "본체 커버 분리", type: "check" } ] },
      { id: "fcm", title: "FCM 검출부", items: [
        { id: "fcm_rinse", label: "플로우셀 세척", type: "check", hint: "Menu › Maintenance › Rinse Instrument › Rinse Flowcell" },
        { id: "fcm_laser", label: "레이저 전류 확인", type: "range", min: 100, max: 140, unit: "mA", crit: "120 ± 20 mA", hint: "Service › Service/Factory Tools › Test › Laser Power" } ] },
      { id: "rbc", title: "RBC 검출부", items: [
        { id: "rbc_aperture", label: "RBC 검출부 아퍼처 세척", type: "check" },
        { id: "rbc_clog", label: "RBC 검출기 막힘 제거", type: "check", hint: "Rinse Instrument › Remove RBC Detector Clog" } ] },
      { id: "chamber", title: "챔버 세척 준비", items: [
        { id: "ch_iso", label: "RBC 분리 챔버 배수", type: "check" },
        { id: "ch_react", label: "반응 챔버 배수", type: "check" },
        { id: "ch_waste", label: "폐기물 챔버 배수", type: "check" } ] },
      { id: "vacuum", title: "진공라인 (Rev.3 절차)", items: [
        { id: "vac_line", label: "진공라인 세척 (증류수 → 에탄올)", type: "check", hint: "SV Test › [27] › SV2 › Pump 01 · 튜브는 분리한 채 건조, 재시작 시 재연결" },
        { id: "vac_trap", label: "공압 트랩(역류 방지) 챔버 세척", type: "check" } ] },
      { id: "ipu_off", title: "IPU 종료 · 백업", items: [
        { id: "ipu_exit", label: "IPU 종료 (Windows 모드)", type: "check" },
        { id: "backup", label: "백업 실행 (D:\\Sysmex\\TOOLS\\Backup.exe)", type: "check" } ] },
      { id: "filter", title: "필터", items: [
        { id: "flt_react", label: "반응 챔버 배수 라인 필터 세척 (역방향)", type: "check" },
        { id: "flt_rbc", label: "RBC/HGB 챔버 배수 라인 필터 세척 (역방향)", type: "check" } ] },
      { id: "waste", title: "폐액챔버 · 핀치밸브 튜브", items: [
        { id: "wc_rinse", label: "폐액챔버 1 · 2 세척", type: "check" },
        { id: "wc_trap", label: "트랩 챔버 세척", type: "check" },
        { id: "pv1", label: "핀치밸브 1 튜브 교체", type: "part", interval: "3년 또는 60,000회" },
        { id: "pv2", label: "핀치밸브 2 튜브 교체", type: "part", interval: "3년 또는 60,000회" },
        { id: "pv3", label: "핀치밸브 3 튜브 교체", type: "part", interval: "3년 또는 60,000회" } ] },
      { id: "pumps", title: "시린지 · 펌프 · 피어서", items: [
        { id: "sheath", label: "시스 시린지 누설 확인 · 청소 (L-60 윤활)", type: "part", interval: "동작 횟수 기록" },
        { id: "wbpump", label: "전혈 펌프 누설 확인 · 청소 (실리콘 그리스)", type: "part", interval: "동작 횟수 기록" },
        { id: "airpump", label: "공기 펌프 교체", type: "part", interval: "2년 또는 30,000회" },
        { id: "piercer", label: "피어서 교체", type: "part", interval: "필요 시 또는 120,000회" },
        { id: "rinsecup", label: "린스컵 · 흡입부 트레이 청소", type: "check" },
        { id: "inside", label: "본체 내부 혈액 잔여물 · 먼지 청소", type: "check" } ] },
      { id: "sampler", title: "샘플러 (XN-550)", items: [
        { id: "smp_clean", label: "샘플러 내부 청소", type: "check", models: ["XN-550"] },
        { id: "smp_lube", label: "구동부 윤활", type: "check", models: ["XN-550"] } ] },
      { id: "ipu_on", title: "IPU 재시작", items: [
        { id: "win_finish", label: "Windows 모드 종료 ([Finish])", type: "check" },
        { id: "ipu_start", label: "IPU 시작 ([Start IPU])", type: "check" },
        { id: "svc_login", label: "서비스 모드 로그인", type: "check" },
        { id: "cnt_reset", label: "교체 부품 동작 횟수 리셋", type: "check", hint: "Maintenance › Status Confirmation › Counter (교체한 항목만)" } ] },
      { id: "press", title: "압력 · 진공", items: [
        { id: "p_press", label: "0.06 MPa 압력 확인", type: "range", min: 0.048, max: 0.072, unit: "MPa", crit: "0.048 ~ 0.072" },
        { id: "p_vac", label: "−0.03 MPa 진공 확인", type: "range", min: -0.045, max: -0.024, unit: "MPa", crit: "−0.024 ~ −0.045" } ] },
      { id: "mech", title: "기계 조정", items: [
        { id: "m_piercer", label: "피어서 · 피펫 위치 확인/조정", type: "check" },
        { id: "m_holder", label: "튜브 홀더 위치 확인/조정", type: "check", models: ["XN-450"] },
        { id: "m_sampler", label: "샘플러(핸드) 위치 확인/조정", type: "check", models: ["XN-550"] },
        { id: "routine", label: "정기 청소 (Routine Cleaning)", type: "check" } ] },
      { id: "elec", title: "전기 조정", items: [
        { id: "e_clog", label: "RBC Clog 레벨", type: "adjust", min: 99, max: 101, unit: "", crit: "100 ± 1" },
        { id: "e_hgb", label: "HGB 블랭크 (전원 ON 후 약 10분)", type: "adjust", min: 4800, max: 5200, unit: "", crit: "5000 ± 200" },
        { id: "e_asb", label: "흡입 센서 Blank", type: "adjust", min: 4800, max: 5200, unit: "", crit: "5000 ± 200" },
        { id: "e_assb", label: "흡입 센서 Sample−Blank", type: "adjust", min: 12500, max: 13500, unit: "", crit: "13000 ± 500" } ] },
      { id: "sens", title: "감도 (XN CAL)", items: [
        { id: "cal_lot", label: "XN CAL Lot No.", type: "text", field: "Lot No." },
        { id: "s_wdfx", label: "WDF-X", type: "sens", tol: 3, unit: "ch" },
        { id: "s_wdfy", label: "WDF-Y", type: "sens", tol: 3, unit: "ch" },
        { id: "s_wdfz", label: "WDF-Z", type: "sens", tol: 2.5, unit: "ch" },
        { id: "s_retx", label: "RET-RBC-X", type: "sens", tol: 1, unit: "ch", opt: "RET" },
        { id: "s_rety", label: "RET-RBC-Y", type: "sens", tol: 3, unit: "ch", opt: "RET" },
        { id: "s_retz", label: "RET-RBC-Z", type: "sens", tol: 2, unit: "ch", opt: "RET" },
        { id: "s_mcv", label: "MCV", type: "sens", tol: 1, unit: "fL" },
        { id: "s_mpv", label: "MPV", type: "sens", tol: 0.3, unit: "fL" },
        { id: "s_hgb", label: "HGB", type: "sens", tol: 0.2, unit: "g/dL" } ] },
      { id: "cal", title: "데이터 확인 · 보정 (보정값 기록)", items: [
        { id: "c_wbc", label: "WBC", type: "text", field: "보정값" },
        { id: "c_wbcd", label: "WBC-D", type: "text", field: "보정값" },
        { id: "c_rbc", label: "RBC", type: "text", field: "보정값" },
        { id: "c_hgb", label: "HGB", type: "text", field: "보정값" },
        { id: "c_hct", label: "HCT", type: "text", field: "보정값" },
        { id: "c_plti", label: "PLT-I", type: "text", field: "보정값" },
        { id: "c_ret", label: "RET", type: "text", field: "보정값", opt: "RET" },
        { id: "c_rbco", label: "RBC-O", type: "text", field: "보정값", opt: "RET" },
        { id: "c_plto", label: "PLT-O", type: "text", field: "보정값", opt: "RET" } ] },
      { id: "ext", title: "외관 · IPU", items: [
        { id: "x_cover", label: "본체 커버 청소", type: "check" },
        { id: "x_fan", label: "후면 팬 필터 청소", type: "check" },
        { id: "x_periph", label: "주변기기 청소 (모니터 · 프린터 등)", type: "check" },
        { id: "x_ver", label: "프로그램 버전 확인", type: "text", field: "버전" } ] },
      { id: "after", title: "PM 후 · 작동 확인", items: [
        { id: "a_cover", label: "본체 커버 장착", type: "check" },
        { id: "a_data", label: "사후 데이터 확인 (사전 데이터와 비교)", type: "text", field: "평균값 / 비교 메모" },
        { id: "a_id", label: "ID 판독 테스트", type: "check" },
        { id: "a_host", label: "호스트 통신 테스트", type: "check" },
        { id: "a_clock", label: "IPU 시계 설정", type: "check" },
        { id: "a_final", label: "최종 작동 확인 (IPU · 본체 정상 모드)", type: "check" },
        { id: "a_drain", label: "배수 튜브 고정 확인 (배수구 · 폐액통)", type: "check" } ] }
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
    var no = "PM-" + (sub.hash ? sub.hash.slice(0, 8).toUpperCase() : "미발행");
    var o = '<div class="rp">';
    /* header */
    o += '<div class="rp-top"><div><div class="rp-eyebrow">SYSMEX KOREA · PREVENTIVE MAINTENANCE REPORT</div><h1>XN-L Series 예방정비 점검 보고서</h1><div class="rp-sub">PM Standard Procedure ' + esc(SCHEMA.version) + "</div></div>";
    o += '<div class="rp-doc"><div><span>보고서 번호</span><b>' + esc(no) + "</b></div><div><span>작업일</span><b>" + esc(h.date) + "</b></div>";
    if (approval && approval.status) {
      var lbl = approval.status === "approved" ? "승인" : approval.status === "rejected" ? "반려" : "검토 대기";
      o += '<div class="rp-stamp rp-' + esc(approval.status) + '"><b>' + lbl + "</b><span>" + esc(approval.by || "") + " " + esc(approval.at || "") + "</span></div>";
    }
    o += "</div></div>";
    /* info grid */
    var cell = function (k, v) { return '<div class="rp-cell"><span>' + k + "</span><b>" + (esc(v) || "—") + "</b></div>"; };
    o += '<div class="rp-info">' + cell("병원(시설)", h.facility) + cell("장비 모델", (h.model || "") + (h.ret ? " · RET 옵션" : "")) + cell("시리얼 번호", h.sn) + cell("작업일", h.date) +
      cell("대리점", h.dealer) + cell("점검 엔지니어", h.engineer) + cell("점검 항목", s.total + "개") + cell("작성", sub.createdAt) + "</div>";
    /* verdict + tiles */
    var good = !s.bad && !s.skip && !s.none;
    o += '<div class="rp-verdict ' + (s.bad ? "v-bad" : good ? "v-ok" : "v-warn") + '">' +
      (s.bad ? "기준을 벗어난 항목이 <b>" + s.bad + "건</b> 있습니다. 아래 ‘확인 필요 항목’을 참고해 주세요."
        : good ? "모든 점검 · 측정 항목이 기준을 만족합니다." : "기준을 벗어난 항목은 없으며, 미실시 · 미입력 항목이 있습니다.") + "</div>";
    o += '<div class="rp-tiles"><div><span>점검 항목</span><b>' + s.total + '</b></div><div class="t-ok"><span>적합</span><b>' + s.ok + '</b></div><div class="' + (s.bad ? "t-bad" : "") + '"><span>기준 벗어남</span><b>' + s.bad + '</b></div><div class="' + (s.skip + s.none ? "t-warn" : "") + '"><span>미실시 · 미입력</span><b>' + (s.skip + s.none) + "</b></div></div>";
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
      if (rows) blocks.push({ n: nrow + 1.4, html: '<table class="rp-t rp-mini"><colgroup><col><col style="width:78px"></colgroup><thead><tr><th colspan="2">' + esc(g.title) + "</th></tr></thead><tbody>" + rows + "</tbody></table>" });
    });
    if (att) o += '<h2>확인 필요 항목</h2><table class="rp-t"><colgroup><col style="width:38%"><col style="width:96px"><col></colgroup><thead><tr><th>항목</th><th class="c">상태</th><th>기록 · 기준</th></tr></thead><tbody>' + att + "</tbody></table>";
    if (meas) o += '<h2>측정 · 조정 결과</h2><table class="rp-t"><colgroup><col style="width:34%"><col style="width:24%"><col><col><col style="width:96px"></colgroup><thead><tr><th>항목</th><th>기준</th><th class="n">측정 (조정 전)</th><th class="n">조정 후</th><th class="c">판정</th></tr></thead><tbody>' + meas + "</tbody></table>";
    var tot = blocks.reduce(function (a, b) { return a + b.n; }, 0), acc = 0, colA = "", colB = "";
    var inB = false; blocks.forEach(function (b) { if (!inB && acc + b.n / 2 <= tot / 2) { colA += b.html; acc += b.n; } else { inB = true; colB += b.html; } });
    o += '<h2>점검 항목</h2><div class="rp-cols"><div class="rp-col">' + colA + '</div><div class="rp-col">' + colB + "</div></div>";
    o += '<h2>비고</h2><div class="rp-rem">' + (esc(sub.remarks) || '<span class="m">특이사항 없음</span>') + "</div>";
    if (approval && approval.comment) o += '<h2>검토 의견</h2><div class="rp-rem">' + esc(approval.comment) + "</div>";
    o += '<div class="rp-sign"><div><span>점검 엔지니어</span><b>' + esc(h.engineer) + " <small>(" + esc(h.dealer) + ')</small></b><i>서명</i></div><div><span>고객 확인</span><b>&nbsp;</b><i>성명 / 서명</i></div></div>';
    o += '<div class="rp-foot"><span>Sysmex Korea · XN-L Series PM Report</span><span>작성 ' + esc(sub.createdAt || "") + (sub.hash ? " · 무결성 코드 " + esc(sub.hash.slice(0, 16)) : "") + "</span></div></div>";
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
    return "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>PM 점검 보고서 " + esc(h.sn || "") + "</title><style>body{margin:24px;background:#fff}" + REPORT_CSS + "</style></head><body>" + reportBody(sub, approval) + "</body></html>";
  }

  return { SCHEMA: SCHEMA, MODELS: MODELS, applicable: applicable, judge: judge, summary: summary, canon: canon, sha256: sha256,
    payloadOf: payloadOf, verify: verify, esc: esc, reportBody: reportBody, reportDocument: reportDocument, REPORT_CSS: REPORT_CSS };
})();
