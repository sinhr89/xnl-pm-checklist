XN-L PM 체크리스트 웹앱 · 배포 안내

1) 이 폴더 전체를 HTTPS 웹 주소에 그대로 올립니다.
   (예: GitHub Pages, Netlify, 사내 웹 서버) 
   ※ 파일을 더블클릭해서 여는 방식(file://)으로는 앱 설치·오프라인 기능이 동작하지 않습니다.
2) 대리점에 주소(URL)만 보내면 됩니다.
   - iPhone/iPad: Safari로 열기 → 공유 버튼 → 홈 화면에 추가
   - Android: Chrome으로 열기 → "앱 설치" 버튼 또는 메뉴 → 앱 설치
   - PC: Chrome/Edge 주소창 오른쪽 설치 아이콘
3) 받는 사람 메일 주소를 바꾸려면 config.js만 고쳐서 다시 올리면 됩니다.
   앱을 쓰는 기기는 다음에 열 때 자동으로 새 버전을 받습니다.

파일 구성
 index.html / app.js / common.js(점검 항목·판정·보고서) / config.js(메일 주소)
 sw.js(오프라인 캐시) / manifest.webmanifest / icons/ / vendor/(PDF 생성 라이브러리)

설치(Installation) 체크리스트 (install/ 폴더)
 주소: 이 앱 주소 뒤에 install/ 를 붙이면 됩니다. (예: https://sinhr89.github.io/xnl-pm-checklist/install/)
 PM 체크리스트와 따로 설치되는 별도 앱이며(초록색 아이콘), 입력 내용도 따로 저장됩니다.
 두 앱 위쪽의 버튼으로 서로 이동할 수 있습니다.
 메일 받는 사람은 PM과 같은 config.js를 함께 씁니다.
 install/ : index.html / app.js / common.js(설치 항목·보고서) / sw.js / manifest.webmanifest / icons/
