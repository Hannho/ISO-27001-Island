// ISO 27001 資安島：三個頁面共用（資料 / 登入與專案 / 側邊面板）
window.addEventListener("error", e => { let d = document.getElementById("errbox"); if (!d) { d = document.createElement("pre"); d.id = "errbox"; d.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99;max-width:60vw;max-height:30vh;overflow:auto;background:#7f1d1d;color:#fff;padding:8px;font:11px monospace;margin:0;border-radius:8px"; document.body.appendChild(d); } d.textContent += e.message + " (" + String(e.filename || "").split("/").pop() + ":" + e.lineno + ")\n"; });
const $ = s => document.querySelector(s);

// ==========================================
// 地圖與資料庫設定 (ISO 27001 附錄 A)
// ==========================================
const Zs = [
  { n: "4–6 條款建立階段", p: "管理階層・資安室・顧問", e: "📋", c: "#64748b", x: -9, z: -6, r: 4.6, edge: "stripe", why: "ISMS 本文條款 4–6 是「建立」ISMS 的階段：範圍、領導承諾、政策、角色、風險評鑑與處理、SoA、目標。它們不是附錄 A 的控制措施，所以單獨成島（條款 5.2 是資訊安全政策，附錄 A 5.2 才是角色及責任）；島名與卡片都標示「條款」，不會和附錄 A 混淆。" },
  { n: "7–10 條款運作改進", p: "資安室・內稽・管理階層", e: "🔁", c: "#94a3b8", x: 9, z: -6, r: 4.6, edge: "brick", why: "ISMS 本文條款 7–10 是「運作與改進」階段：能力、認知、溝通、文件管制、績效量測、內部稽核、管理審查、矯正措施。與條款 4–6 分兩島，是因為 8 項一島剛好，而且兩個階段的完成時間不同。" },
  { n: "A.5.1–5.8 政策與治理", p: "管理階層・資安室", e: "📜", c: "#f59e0b", x: 0, z: 2, r: 5.4, edge: "mosaic", why: "附錄 A 第 5 章「組織控制」共 37 項，一座島放不下，所以依條次連續區段拆成 5 島。5.1–5.8：政策、角色、職務區隔、管理責任、聯繫、威脅情資、專案資安——都是管理階層與資安室要定調的事。" },
  { n: "A.5.9–5.18 資產與存取", p: "資產擁有者・IT", e: "🗂️", c: "#f97316", x: -14, z: 4, r: 4.9, edge: "brick", why: "5.9–5.18：資產清冊、可接受使用、資產歸還、分類、標示、傳送，以及身分、鑑別與存取權限。前半談『有什麼資產』，後半談『誰能碰』，連續的 10 項放同一島。" },
  { n: "A.5.19–5.23 供應商與雲端", p: "採購・法務・IT", e: "🤝", c: "#eab308", x: 14, z: 4, r: 4.6, edge: "stripe", why: "5.19–5.23：供應商關係、協議、ICT 供應鏈、供應商服務監督、雲端服務。5 項連續，主題一致。" },
  { n: "A.5.24–5.30 事件與營運持續", p: "應變小組・IT 主管", e: "🚨", c: "#fb923c", x: -23, z: -4, r: 4.6, edge: "mosaic", why: "5.24–5.30：事故管理的規劃、評鑑、回應、學習、證據，以及中斷期間的資安與 ICT 營運持續。共 7 項。" },
  { n: "A.5.31–5.37 法遵與審查", p: "法務・資安室・內稽", e: "⚖️", c: "#d97706", x: 23, z: -4, r: 4.6, edge: "brick", why: "5.31–5.37：法規與契約要求、智慧財產權、紀錄保護、隱私與個資、獨立審查、遵循檢查、作業程序書。共 7 項。" },
  { n: "A.6 人員控制", p: "人資", e: "👥", c: "#3b82f6", x: -7, z: 13, r: 4.6, edge: "stripe", why: "附錄 A 第 6 章「人員控制」共 8 項（6.1–6.8），數量不多，整章放一島，不拆。" },
  { n: "A.7.1–7.6 場域與進出", p: "總務・設施", e: "🏢", c: "#10b981", x: -15, z: 18, r: 4.6, edge: "mosaic", why: "附錄 A 第 7 章「實體控制」共 14 項，拆成兩島。7.1–7.6：安全周界、進入、辦公室保全、實體監視、環境威脅、安全區域內工作——針對『空間』。" },
  { n: "A.7.7–7.14 設備與公用設施", p: "IT・總務", e: "💻", c: "#84cc16", x: -10, z: 28, r: 4.6, edge: "brick", why: "7.7–7.14：桌面淨空、設備安置、場所外資產、儲存媒體、公用設施、佈纜、設備維護、設備汰除——針對『設備』。" },
  { n: "A.8.1–8.8 端點與弱點", p: "IT 維運・系統管理員", e: "🔧", c: "#8b5cf6", x: 7, z: 13, r: 4.6, edge: "mosaic", why: "附錄 A 第 8 章「技術控制」共 34 項，拆成 4 島。8.1–8.8：端點、特權與存取限制、原始碼、鑑別、容量、惡意軟體、技術脆弱性。" },
  { n: "A.8.9–8.14 組態資料備份", p: "IT 維運・DPO", e: "🗄️", c: "#6366f1", x: 15, z: 18, r: 4.6, edge: "stripe", why: "8.9–8.14：組態管理、資訊刪除、資料遮蔽、資料洩露預防、備份、備援。共 6 項。" },
  { n: "A.8.15–8.24 日誌網路加密", p: "網管・SOC", e: "📡", c: "#0ea5e9", x: 0, z: 22, r: 4.9, edge: "brick", why: "8.15–8.24：日誌、監視、時鐘同步、特權公用程式、軟體安裝、網路安全、網路服務、網路區隔、網頁過濾、密碼技術。10 項連續，屬於偵測與網路防護。" },
  { n: "A.8.25–8.34 安全開發", p: "研發團隊", e: "🛠️", c: "#14b8a6", x: 9, z: 27, r: 4.9, edge: "mosaic", why: "8.25–8.34：安全開發生命週期、應用程式安全要求、架構、安全程式碼、安全測試、委外開發、環境區隔、變更管理、測試資訊、稽核測試保護。整段都是開發流程。" }
];

const COURT_LANDMARKS = [
  { title: "🏛️ 驗證機構 (Certification Body)", x: 0, y: 19.5, z: -27.5,
    historyTitle: "第三方外部稽核與驗證",
    historyDesc: "企業實作 ISO 27001 後，需經過如 BSI、SGS 等第三方驗證機構的嚴格稽核，確認管理系統符合國際標準要求，方能取得證書。這是證明企業資安實力的最高榮譽。" }
];

const EGGS = [
  { id: 0, icon: "🦠", title: "WannaCry 勒索軟體 (2017)", desc: "利用 Windows 漏洞 (EternalBlue) 大規模擴散，感染全球數十萬台電腦。提醒我們「8.8 技術脆弱性管理」（弱點掃描與修補）的重要性。", x: -20, z: 2, found: false },
  { id: 1, icon: "🏭", title: "Stuxnet 震網病毒 (2010)", desc: "史上第一個專門破壞實體工業設施（伊朗核電廠）的蠕蟲病毒。彰顯了「7.x 實體安全」與「8.22 網路區隔」的重要性。", x: 20, z: 2, found: false },
  { id: 2, icon: "💔", title: "Heartbleed 心跳出血 (2014)", desc: "OpenSSL 密碼學函式庫的嚴重漏洞，導致伺服器記憶體資料外洩。這突顯了「8.24 密碼技術之使用」與「8.8 技術脆弱性管理」的重要。", x: 0, z: 12, found: false },
  { id: 3, icon: "🎣", title: "CEO 變臉詐騙 (BEC)", desc: "駭客偽冒高階主管發送電子郵件，要求財務匯款。防禦此類攻擊高度仰賴「6.3 資訊安全認知、教育及訓練」。", x: -19, z: 31, found: false },
  { id: 4, icon: "🔥", title: "OVH 雲端機房大火 (2021)", desc: "法國知名雲端服務商機房失火，導致數百萬網站停擺，且部分客戶資料永久遺失。「5.30 營運持續之 ICT 備妥」與「8.13 資訊備份」至關重要。", x: 15, z: 28, found: false }
];

const CD = `5.1|資訊安全政策|Policies for information security|資訊安全政策聲明、高階核准與全員公告紀錄
5.2|資訊安全角色及責任|Information security roles and responsibilities|資安組織圖、角色職責說明、任命文件
5.3|職務區隔|Segregation of duties|職務區隔矩陣、衝突職務的補償性控制
5.4|管理階層責任|Management responsibilities|管理審查會議紀錄、主管資安承諾與要求
5.5|與主管機關之聯繫|Contact with authorities|主管機關聯絡清單、通報窗口與流程
5.6|與特殊利害團體之聯繫|Contact with special interest groups|協會／社群會員資格、資安論壇參與紀錄
5.7|威脅情資|Threat intelligence|情資來源清單（如 TWCERT、N-ISAC）、閱讀紀錄、據以更新風險的紀錄
5.8|專案管理之資訊安全|Information security in project management|專案資安風險評估、專案資安查核表
5.9|資訊及其他相關聯資產之清冊|Inventory of information and other associated assets|資產清冊、資產擁有者指派紀錄
5.10|資訊及資產之可接受使用|Acceptable use of information and other associated assets|可接受使用規範、員工簽收紀錄
5.11|資產之歸還|Return of assets|離職／調職資產歸還單
5.12|資訊分類分級|Classification of information|資訊分類分級規範、分級結果
5.13|資訊標示|Labelling of information|標示規範與標示範例
5.14|資訊傳送|Information transfer|資訊傳送政策、保密／傳輸協議
5.15|存取控制|Access control|存取控制政策、權限矩陣
5.16|身分管理|Identity management|帳號申請／停用流程與帳號清冊
5.17|鑑別資訊|Authentication information|密碼／MFA 規範、初始密碼發放程序
5.18|存取權限|Access rights|權限申請單、定期權限審查紀錄
5.19|供應者關係之資訊安全|Information security in supplier relationships|供應商資安政策、供應商分級清單
5.20|供應者協議中之資訊安全|Addressing information security within supplier agreements|合約資安條款、NDA、稽核權條款
5.21|ICT 供應鏈之資訊安全管理|Managing information security in the ICT supply chain|供應鏈風險評估、關鍵元件／服務清單
5.22|供應者服務之監視、審查及變更管理|Monitoring, review and change management of supplier services|供應商定期評鑑報告、變更通知紀錄
5.23|雲端服務使用之資訊安全|Information security for use of cloud services|雲端服務採用與退出程序、責任分擔矩陣、供應商評估
5.24|資訊安全事故管理之規劃及準備|Information security incident management planning and preparation|事故管理程序、應變小組名單與演練紀錄
5.25|資訊安全事件之評鑑及決策|Assessment and decision on information security events|事件分級準則、事件評估紀錄
5.26|資訊安全事故之回應|Response to information security incidents|事故處理紀錄、通報單
5.27|從資訊安全事故中學習|Learning from information security incidents|根因分析報告、檢討會議紀錄
5.28|證據之蒐集|Collection of evidence|證據保全程序、監管鏈紀錄
5.29|中斷期間之資訊安全|Information security during disruption|中斷期間資安要求、BCP 中的資安章節
5.30|營運持續之 ICT 備妥|ICT readiness for business continuity|BIA、RTO／RPO 設定、DR 演練紀錄
5.31|法律、法令、法規及契約要求|Legal, statutory, regulatory and contractual requirements|適用法規與契約要求清單、遵循評估
5.32|智慧財產權|Intellectual property rights|軟體授權清冊、正版軟體管理紀錄
5.33|紀錄之保護|Protection of records|紀錄保存期限表、保護措施
5.34|隱私及個人可識別資訊之保護|Privacy and protection of PII|個資盤點、隱私政策、當事人權利處理程序
5.35|資訊安全之獨立審查|Independent review of information security|內部稽核計畫與報告、第三方審查紀錄
5.36|資訊安全政策、規則及標準之遵循|Compliance with policies, rules and standards for information security|遵循性檢查紀錄、缺失追蹤表
5.37|書面化作業程序|Documented operating procedures|作業程序書清單與版本管制
6.1|背景查核|Screening|背景查核程序與結果紀錄
6.2|聘用條款及條件|Terms and conditions of employment|聘僱合約中的資安條款
6.3|資訊安全認知、教育及訓練|Information security awareness, education and training|訓練計畫、簽到與測驗、社交工程演練結果
6.4|懲處過程|Disciplinary process|懲處辦法與處理紀錄
6.5|聘用終止或變更後之責任|Responsibilities after termination or change of employment|離職／調職保密義務告知、權限交接單
6.6|保密協議|Confidentiality or non-disclosure agreements|NDA 範本與簽署紀錄
6.7|遠距工作|Remote working|遠距工作政策、VPN／MFA 設定
6.8|資訊安全事件通報|Information security event reporting|事件通報管道、通報單、員工通報宣導
7.1|實體安全周界|Physical security perimeters|安全區域劃分圖、周界防護設施
7.2|實體進入|Physical entry|門禁權限清單、訪客登記表
7.3|辦公室、房間及設施之保全|Securing offices, rooms and facilities|辦公室／機房保全措施檢查紀錄
7.4|實體安全監視|Physical security monitoring|CCTV、門禁日誌、入侵告警與審閱紀錄
7.5|防範實體及環境威脅|Protecting against physical and environmental threats|火災、水災、地震等威脅評估與防護檢查紀錄
7.6|於安全區域內工作|Working in secure areas|安全區域工作規則、人員陪同紀錄
7.7|桌面淨空及螢幕淨空|Clear desk and clear screen|淨空政策、巡檢紀錄
7.8|設備安置及保護|Equipment siting and protection|設備放置規劃、機櫃與環境巡檢紀錄
7.9|場所外資產之安全|Security of assets off-premises|設備攜出申請單、外出設備保護規範
7.10|儲存媒體|Storage media|媒體管理程序、媒體清冊與傳送紀錄
7.11|支援之公用服務設施|Supporting utilities|UPS／發電機測試、空調與電力維護紀錄
7.12|佈纜安全|Cabling security|佈線圖、纜線標示與保護措施
7.13|設備維護|Equipment maintenance|設備維護計畫與保養紀錄
7.14|設備之安全汰除或再使用|Secure disposal or re-use of equipment|資料抹除／銷毀紀錄、報廢單
8.1|使用者端點裝置|User endpoint devices|端點安全基準、MDM 設定、硬碟加密紀錄
8.2|特殊存取權限|Privileged access rights|特權帳號清冊、核准與定期審查紀錄
8.3|資訊存取限制|Information access restriction|系統／資料夾權限設定與權限矩陣
8.4|原始碼之存取|Access to source code|程式碼庫權限清單與存取紀錄
8.5|安全鑑別|Secure authentication|MFA 啟用範圍、登入安全設定
8.6|容量管理|Capacity management|容量監控報表與擴充規劃
8.7|防範惡意軟體|Protection against malware|防毒／EDR 部署與更新紀錄、掃描報告
8.8|技術脆弱性管理|Management of technical vulnerabilities|弱點掃描報告、修補追蹤表
8.9|組態管理|Configuration management|安全基準組態（如 GCB）、組態變更紀錄
8.10|資訊刪除|Information deletion|資料保存期限表、刪除／銷毀紀錄
8.11|資料遮蔽|Data masking|個資遮罩規則、測試環境去識別化
8.12|資料洩露預防|Data leakage prevention|DLP 政策與告警紀錄
8.13|資訊備份|Information backup|備份政策、備份與還原測試紀錄
8.14|資訊處理設施之備援|Redundancy of information processing facilities|備援架構圖、容錯／切換測試紀錄
8.15|存錄（日誌）|Logging|日誌管理程序、日誌保存與保護設定
8.16|監視活動|Monitoring activities|SIEM 規則、告警處理與升級紀錄
8.17|時鐘同步|Clock synchronization|NTP 設定與同步檢查紀錄
8.18|具特殊權限公用程式之使用|Use of privileged utility programs|特權工具清單、使用核准與紀錄
8.19|運作中系統之軟體安裝|Installation of software on operational systems|軟體安裝白名單、變更核准紀錄
8.20|網路安全|Networks security|網路架構圖、防火牆規則審查紀錄
8.21|網路服務之安全|Security of network services|網路服務安全需求、網路服務 SLA
8.22|網路區隔|Segregation of networks|網路區段規劃、VLAN／防火牆區隔設定
8.23|網頁過濾|Web filtering|網頁過濾政策與阻擋類別
8.24|密碼技術之使用|Use of cryptography|密碼技術政策、金鑰管理程序、憑證清冊
8.25|安全開發生命週期|Secure development life cycle|SSDLC 規範、各階段查核紀錄
8.26|應用程式安全要求|Application security requirements|安全需求規格、威脅建模／風險評估
8.27|安全系統架構及工程原則|Secure system architecture and engineering principles|安全架構原則文件、架構審查紀錄
8.28|安全程式碼撰寫|Secure coding|安全開發規範、Code review、SAST／相依套件掃描結果
8.29|開發及驗收中之安全測試|Security testing in development and acceptance|滲透測試／弱點掃描報告、驗收測試紀錄
8.30|委外開發|Outsourced development|委外開發合約資安條款、交付物檢測紀錄
8.31|開發、測試及運作環境之區隔|Separation of development, test and production environments|環境隔離架構圖、存取權限分離紀錄
8.32|變更管理|Change management|變更申請與核准單、回復計畫
8.33|測試資訊|Test information|測試資料選用與去識別化規則
8.34|稽核測試期間資訊系統之保護|Protection of information systems during audit testing|稽核測試計畫與授權、唯讀存取紀錄
C4.3|ISMS 範圍|Scope of the ISMS|ISMS 範圍文件（含介面與相依性、利害關係人）
C5.1|領導與承諾|Leadership and commitment|高階主管資訊安全聲明、資源承諾
C5.2|資訊安全政策|Information security policy|資訊安全政策（已文件化、已溝通、利害關係人可取得）
C5.3|角色與責任|Roles, responsibilities and authorities|ISMS 角色與責任文件
C6.1.2|資訊安全風險評鑑|Information security risk assessment|風險評鑑準則、流程與結果（風險登記簿）
C6.1.3|資訊安全風險處理|Information security risk treatment|風險處理計畫（選定的處理選項與行動）
C6.1.3d|適用性聲明（SoA）|Statement of Applicability|SoA：選定控制措施、理由、實作狀態與排除理由
C6.2|資訊安全目標|Information security objectives|ISMS 目標文件、達成計畫、溝通紀錄
C7.2|能力|Competence|訓練與能力紀錄（人員能力矩陣）
C7.3|認知|Awareness|員工認知宣導紀錄
C7.4|溝通|Communication|內外部溝通計畫與溝通內容
C7.5|文件化資訊|Documented information|文件管制證據（更新、核准紀錄）
C9.1|監視與量測|Monitoring, measurement, analysis and evaluation|ISMS 績效監控與量測報告
C9.2|內部稽核|Internal audit|內部稽核計畫與報告
C9.3|管理審查|Management review|管理審查會議紀錄（決議與行動）
C10.2|不符合事項與矯正措施|Nonconformity and corrective action|不符合事項紀錄與矯正措施追蹤`;
const GRP = ["C4.3 C5.1 C5.2 C5.3 C6.1.2 C6.1.3 C6.1.3d C6.2", "C7.2 C7.3 C7.4 C7.5 C9.1 C9.2 C9.3 C10.2", "5.1 5.2 5.3 5.4 5.5 5.6 5.7 5.8", "5.9 5.10 5.11 5.12 5.13 5.14 5.15 5.16 5.17 5.18", "5.19 5.20 5.21 5.22 5.23", "5.24 5.25 5.26 5.27 5.28 5.29 5.30", "5.31 5.32 5.33 5.34 5.35 5.36 5.37", "6.1 6.2 6.3 6.4 6.5 6.6 6.7 6.8", "7.1 7.2 7.3 7.4 7.5 7.6", "7.7 7.8 7.9 7.10 7.11 7.12 7.13 7.14", "8.1 8.2 8.3 8.4 8.5 8.6 8.7 8.8", "8.9 8.10 8.11 8.12 8.13 8.14", "8.15 8.16 8.17 8.18 8.19 8.20 8.21 8.22 8.23 8.24", "8.25 8.26 8.27 8.28 8.29 8.30 8.31 8.32 8.33 8.34"];
const NEWC = "5.7 5.23 5.30 7.4 8.9 8.10 8.11 8.12 8.16 8.23 8.28".split(" ");
const CM = {}; CD.split("\n").forEach(l => { const parts = l.split("|"); if(parts.length===4) { const [no, zh, en, ev] = parts; CM[no] = { no, zh, en, ev }; } });
const N = [];
GRP.forEach((g, i) => g.split(" ").forEach((no, j) => { const c = CM[no]; if(c) { N.push({ z: i, j, id: N.length, no, ti: c.zh, en: c.en, ev: c.ev, nw: NEWC.includes(no), cl: no[0] === "C", th: no[0] === "C" ? "管理系統條款" : { 5: "組織", 6: "人員", 7: "實體", 8: "技術" }[no.split(".")[0]] }); } }));
const SUM = Zs.map((z, i) => { const zn = N.filter(n => n.z === i); return `主責：${z.p}・共 ${zn.length} 項${zn.some(n => n.cl) ? "條款" : "控制措施"}`; });

const F = [
  { a: 2, b: 0, e: "🛡️", c: "政策與條款", t: "條款 5.2 的資訊安全政策與附錄 A 5.1 是同一份文件的兩種要求。" },
  { a: 2, b: 1, e: "📈", c: "管理責任與審查", t: "管理階層責任（5.4）要靠管理審查（條款 9.3）留下證據。" }
];
const BRIDGE_PAIRS = F.map(f => [f.a, f.b]);

// ==========================================
// 帳號與多專案權限管理系統 (無後端伺服器版本)
// ==========================================
const readSession = () => { try { return JSON.parse(sessionStorage.getItem("iso_session")); } catch (e) { return null; } };
let currentUser = readSession();
const PAGE = (document.body && document.body.dataset.page) || "";
let USERS = [
  { u: "admin", p: "123", r: "admin", name: "管理員" },
  { u: "audit", p: "123", r: "auditor", name: "稽核員" },
  { u: "user", p: "123", r: "user", name: "使用者" }
];

const isAdmin = () => currentUser && currentUser.r === "admin";
const isAuditor = () => currentUser && currentUser.r === "auditor";
const isUser = () => currentUser && currentUser.r === "user";
const canEdit = () => isAdmin(); // 只有 admin 可以改進度與基本資訊
const canAudit = () => isAdmin() || isAuditor(); // admin 和 audit 可以留稽核缺失

// 資料庫：改為多專案字典結構，純靠 localStorage
const PKEY = "iso27001_island_multi_progress";
let DB = {
  "proj_default": {
    name: "預設導入專案", client: "測試公司", start: "2026-01", auditor: "",
    st: {}, na: {}, why: {}, own: {}, nc: {}
  }
};
let currentProjectId = "proj_default";
let P = DB[currentProjectId];
let TL = [];

try { 
  const saved = localStorage.getItem(PKEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if(parsed.proj_default) { DB = parsed; } 
    else { DB = { "proj_default": parsed }; } 
  }
} catch (e) {}

const saveDB = () => { try { localStorage.setItem(PKEY, JSON.stringify(DB)); } catch (e) {} };
const loadProject = (pid) => { currentProjectId = pid; P = DB[pid]; refresh(); };

const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const isNA = no => !!P.na[no];
const stOf = no => P.st[no] || 0;
const ncOf = no => P.nc[no] || 0; 
const zCtl = i => N.filter(n => n.z === i && !isNA(n.no));
const zTot = i => zCtl(i).length;
const zDone = i => zCtl(i).filter(n => stOf(n.no) === 2).length;
const totAll = () => N.filter(n => !isNA(n.no)).length;
const totDone = () => N.filter(n => !isNA(n.no) && stOf(n.no) === 2).length;
const ZDUE = [5, 9, 3, 4, 8, 9, 7, 3, 5, 5, 6, 7, 7, 8]; 
const curMonth = () => { if (!P.start) return 0; const [a, b] = P.start.split("-").map(Number), d = new Date(); return Math.max(1, (d.getFullYear() - a) * 12 + d.getMonth() + 1 - b + 1); };
const zState = i => {
  const d = zDone(i), t = zTot(i), m = curMonth();
  if (!t) return { t: "全數排除", c: "#9ca3af" };
  if (d === t && t > 0) return { t: "已完成", c: "#10b981" };
  if (m && m > ZDUE[i]) return { t: "逾期", c: "#ef4444" };
  return d || zCtl(i).some(n => stOf(n.no) === 1) ? { t: "進行中", c: "#3b82f6" } : { t: "未開始", c: "#9ca3af" };
};
const dn = no => no[0] === "C" ? no.slice(1) : no;
const dnl = no => no[0] === "C" ? "條款" + no.slice(1) : no;
const fmtSz = b => b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
const ico = n => /\.(docx?|dotx?)$/i.test(n) ? "📝" : /\.(xlsx?|csv)$/i.test(n) ? "📊" : /\.pdf$/i.test(n) ? "📕" : /\.pptx?$/i.test(n) ? "📽️" : "📄";
const tplN = no => TL.filter(f => f.ctl && f.ctl.includes(no)).length;

const TPL = {
  list: async () => {
    try { const res = await fetch("files.json", { cache: "no-store" }); if (!res.ok) return []; const data = await res.json(); return data.map(f => ({ ...f, ctl: (f.ctl || []).filter(c => N.some(n => n.no === c)) })); } catch (e) { return []; }
  },
  get: async id => { const m = TL.find(f => f.id === id); if (!m) return; const a = document.createElement("a"); a.href = "Files/" + (m.path || m.name).split("/").map(encodeURIComponent).join("/"); a.download = m.name; a.click(); }
};


// ==========================================
// 登入狀態 / 專案選擇 / 右上角使用者列（三個頁面共用）
// ==========================================
let USERS_LOADED = false;
const loadUsers = async () => {
  try { const ur = await fetch("users.json", { cache: "no-store" }); if (ur.ok) { const j = await ur.json(); if (Array.isArray(j)) { USERS = j; USERS_LOADED = true; } } } catch (e) {}
  return USERS_LOADED;
};

const showProjectLobby = () => {
  let html = `<div id="projLobby" style="position:fixed;inset:0;background:var(--panel);z-index:9998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);">
    <div style="background:var(--card-bg);padding:40px;border-radius:24px;box-shadow:0 20px 50px rgba(0,0,0,0.2);width:500px;max-width:90vw;max-height:80vh;overflow-y:auto;border:1px solid var(--line);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="margin:0;font-size:22px;">選擇專案 (${currentUser.name})</h2>
        ${isAdmin() ? '<button class="btn" style="padding:6px 12px;font-size:12px;" onclick="createNewProject()">＋ 新增</button>' : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">`;
  
  let projCount = 0;
  for (const [pid, proj] of Object.entries(DB)) {
    // 權限過濾：稽核員只能看指派給自己的；一般使用者只能看，不能改；管理員看全部
    if (isAuditor() && proj.auditor !== currentUser.u) continue; 
    
    projCount++;
    html += `<button class="row" style="background:#fff;" onclick="selectProject('${pid}')">
      <div class="fn" style="text-align:left;">
        <b style="font-size:15px;color:var(--ink);">${esc(proj.name)}</b>
        <small>客戶：${esc(proj.client) || '未設定'} | 稽核員：${proj.auditor || '未指派'}</small>
      </div>
      ${isAdmin() ? `<span onclick="event.stopPropagation(); deleteProject('${pid}')" style="color:#ef4444;font-size:16px;">🗑️</span>` : ''}
    </button>`;
  }

  if (projCount === 0) {
    html += `<p class="mute">目前沒有可用的專案。</p>`;
  }

  html += `</div>
    <button class="sim-btn" style="position:static;width:100%;justify-content:center;padding:12px;margin-top:20px;background:#ef4444" onclick="doLogout()">登出</button>
    </div></div>`;
  
  const existing = document.getElementById("projLobby");
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', html);
};


window.createNewProject = () => {
  if (!isAdmin()) return;
  const name = prompt("請輸入新專案名稱：");
  if (!name) return;
  const pid = "proj_" + Date.now();
  DB[pid] = { name: name, client: "", start: "", auditor: "", st: {}, na: {}, why: {}, own: {}, nc: {} };
  saveDB();
  showProjectLobby();
};

window.deleteProject = (pid) => {
  if (!isAdmin()) return;
  if (confirm("確定要刪除此專案嗎？此操作無法復原。")) {
    delete DB[pid];
    saveDB();
    showProjectLobby();
  }
};

window.selectProject = (pid) => {
  const lobby = document.getElementById("projLobby"); if (lobby) lobby.remove();
  try { sessionStorage.setItem("iso_pid", pid); } catch (e) {}
  loadProject(pid);
  renderUserBar();
  if (window.onProjectSelected) window.onProjectSelected();
};

window.renderUserBar = () => {
  let b = document.getElementById("userBar");
  if (!currentUser) { if (b) b.remove(); document.body.classList.remove("has-user"); return; }
  if (!b) { b = document.createElement("div"); b.id = "userBar"; document.body.appendChild(b); }
  const role = { admin: "管理員", auditor: "稽核員", user: "一般員工" }[currentUser.r] || currentUser.r;
  const other = currentUser.r !== "user" ? "" : (PAGE === "island"
    ? `<button onclick="location.href='dashboard.html'">📊 儀表板</button>`
    : `<button onclick="location.href='island.html'">🏝️ 3D 島嶼</button>`);
  b.innerHTML = `<span class="ub-av">${esc(String(currentUser.name || currentUser.u).slice(0, 1))}</span><span class="ub-n"><b>${esc(currentUser.name)}</b><small>${role}・${esc(currentUser.u)}</small></span><span class="ub-p" title="目前專案">📁 ${esc(P.name || "")}</span>${other}<button onclick="showProjectLobby()">切換專案</button><button class="out" onclick="doLogout()">登出</button>`;
  document.body.classList.add("has-user");
};

window.doLogout = () => {
  try { sessionStorage.removeItem("iso_session"); sessionStorage.removeItem("iso_pid"); } catch (e) {}
  location.href = "index.html";
};

// 進入頁面：沿用上次選的專案，否則顯示專案列表
window.enterApp = () => {
  if (!currentUser) { location.replace("index.html"); return; }
  const pid = (() => { try { return sessionStorage.getItem("iso_pid"); } catch (e) { return null; } })();
  if (pid && DB[pid] && !(isAuditor() && DB[pid].auditor !== currentUser.u)) selectProject(pid); else showProjectLobby();
};

// 頁面權限：沒登入 → 登入頁；管理員／稽核員不能進 3D 頁
if (PAGE !== "login" && !currentUser) location.replace("index.html");
else if (PAGE === "island" && (isAdmin() || isAuditor())) location.replace("dashboard.html");

// ==========================================
// 側邊面板（條文總覽 / 輔導進度 / 模板庫 / 合規索引）— 3D 頁與儀表板頁共用
// ==========================================
// 與 3D 場景溝通的掛鉤；儀表板頁沒有 3D，這些都是空操作
function sync() { if (window.sync3d) window.sync3d(); }

  window.setNC = (no, v) => { if (!canAudit()) return; P.nc[no] = +v; saveDB(); refresh(); };
  window.pgSet = (k, v) => { if (!canEdit()) return; P[k] = v; saveDB(); refresh(); };
  window.pgOwn = (i, v) => { if (!canEdit()) return; P.own[i] = v; saveDB(); refresh(); };
  window.setSt = (no, v) => { if (!canEdit()) return; P.st[no] = +v; saveDB(); refresh(); };
  window.setNA = (no, c) => { if (!canEdit()) return; if (c) P.na[no] = true; else delete P.na[no]; saveDB(); refresh(); };
  window.setWhy = (no, v) => { if (!canEdit()) return; P.why[no] = v; saveDB(); };
  window.assignAuditor = (auditorId) => { if (!canEdit()) return; P.auditor = auditorId; saveDB(); refresh(); };

// 條文詳情卡（點任一條條文會開啟）
function openItemCard(n) {
    const disableEdit = !canEdit() ? "disabled" : "";
    const disableAudit = !canAudit() ? "disabled" : "";

    $("#cc").innerHTML = `<button class="btn g" onclick="document.getElementById('card').hidden=true">← 返回</button>
      <div class="ch"><div class="tile">${Zs[n.z].e}</div><div><div class="eb">${n.cl ? n.th + "・條款 " + n.no.slice(1) : n.th + "控制・" + n.no}${n.nw ? "・★ 2022 新增" : ""}</div><h2>${n.ti}</h2></div></div>
      <p class="lede" style="color:var(--mute); margin-top:0">${n.en}</p>
      <div class="blk"><h4>${n.nw ? "稽核常見證據" : n.cl ? "必備文件／紀錄（條款要求）" : "建議文件／紀錄"}</h4><p>${n.ev}</p></div>
      <div class="blk"><h4>SoA 與實作狀態</h4><div class="zp" style="display:block">
        <select ${disableEdit} onchange="setSt('${n.no}', this.value)">${["未開始", "進行中", "已完成"].map((t, k) => `<option value="${k}" ${stOf(n.no) === k ? "selected" : ""}>${t}</option>`).join("")}</select>
        <label style="font-weight:600${n.cl ? ";display:none" : ""}"><input type="checkbox" ${isNA(n.no) ? "checked" : ""} ${disableEdit} onchange="setNA('${n.no}', this.checked)"> 不適用（SoA 排除）</label>
        <input placeholder="排除理由（需與風險評鑑一致）" value="${esc(P.why[n.no])}" ${disableEdit} onchange="setWhy('${n.no}', this.value)" style="width:100%; box-sizing:border-box; margin-top:8px;${n.cl ? "display:none" : ""}">
      </div></div>
      <div class="blk"><h4>稽核狀態</h4><div class="zp">
        <select ${disableAudit} onchange="setNC('${n.no}', this.value)" style="border-color:${ncOf(n.no) > 1 ? '#ef4444' : 'var(--line)'}; color:${ncOf(n.no) > 1 ? '#ef4444' : 'inherit'}">
          ${["無稽核缺失", "觀察事項 (OFI)", "次要缺失 (Minor NC)", "主要缺失 (Major NC)"].map((t, k) => `<option value="${k}" ${ncOf(n.no) === k ? "selected" : ""}>${t}</option>`).join("")}
        </select>
      </div></div>
      <div class="blk"><h4>模板與佐證文件</h4><div id="tplBox"></div></div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;"><button class="btn" id="shareBtn" style="background:#3b82f6;">📸 儲存圖卡</button></div>`;
    renderTplBox(n.no);
    $("#card").hidden = false; sync();

    setTimeout(() => {
      const shareBtn = $("#shareBtn");
      if(shareBtn) {
        shareBtn.onclick = async () => {
          shareBtn.innerHTML = "處理中..."; 
          if (window.render3D) window.render3D();
          try {
            const canvas = await html2canvas(document.body, { useCORS: true, ignoreElements: (el) => { return el.id === 'sb' || el.id === 'cx' || el.classList.contains('tools') || el.classList.contains('hud') || el.classList.contains('tracker') || (el.tagName === 'BUTTON' && el.classList.contains('btn')); } });
            const link = document.createElement("a"); link.download = `ISO27001_案例_${n.ti}.png`; link.href = canvas.toDataURL("image/png"); link.click();
          } catch(e) { console.error("截圖發生錯誤", e); } finally { shareBtn.innerHTML = "📸 儲存圖卡"; }
        };
      }
    }, 50);
}

  const rowC = n => `<button class="row" onclick="pins[${n.id}].onclick()"><span class="cno">${dn(n.no)}</span><span class="rt">${n.ti}${n.nw ? " ★" : ""}<small>${n.en}</small></span><em style="color:${isNA(n.no) ? "#9ca3af" : stOf(n.no) === 2 ? "#10b981" : stOf(n.no) === 1 ? "#3b82f6" : "#d1d5db"}">${isNA(n.no) ? "N/A" : ["○", "◐", "✓"][stOf(n.no)]}</em></button>`;
  const chips = i => F.map((f, k) => [f, k]).filter(([f]) => f.a === i || f.b === i).map(([f, k]) => {
    const o = f.a === i ? f.b : f.a; return `<button class="chip" onclick="openFlow(${k})"><b>F${k + 1}</b>${f.c} ↔ ${Zs[o].n.split(" ")[0]}</button>`;
  }).join("");

  function fill(q) {
    const b = $("#bd"); q = (q || "").trim(); window.searchQ = q; 
    if (q) {
      const m = N.filter(n => [n.no, n.ti, n.en, n.ev, Zs[n.z].n].join("").includes(q));
      b.innerHTML = m.length ? m.map(rowC).join("") : `<p class="mute">找不到相關合規案例。</p>`; sync(); return;
    }
    b.innerHTML = `<div id="tree">` + Zs.map((z, i) => `
      <details data-z="${i}">
        <summary><b>${z.n.split(" ")[0]}</b><span>${z.n.split(" ")[1]}</span><em>${N.filter(q => q.z === i).length} ↗</em></summary>
        <div class="kids"><button class="go" onclick="openZone(${i})">探索此控制域 (${z.p}) ↗</button>
        ${N.filter(n => n.z === i).map(n => `<button onclick="pins[${n.id}].onclick()"><i class="no" style="width:auto; padding:0 6px; border-radius:99px;">${dn(n.no)}</i>${n.ti}</button>`).join("")}</div>
      </details>
    `).join("") + `</div>`;
    sync();
  }

  if (document.getElementById("sb")) sb.innerHTML = `
    <button class="sbx" onclick="document.getElementById('sb').classList.remove('open')">✕</button>
    <div class="eb">ISO 27001 INDEX</div><h2 id="sbProjName">落實資安防護網</h2><p class="mute">${Zs.length} 座島 / ${N.filter(n => !n.cl).length} 項控制措施（附錄 A）＋ ${N.filter(n => n.cl).length} 項核心條款</p>
    <div class="tabs"><button data-tab="ov" class="on">條文總覽</button><button data-tab="pg">輔導進度</button><button data-tab="tp">模板庫</button><button data-tab="idx">合規索引</button></div>
    <div id="tabOv"><div id="ovSum"></div><div id="ovCtl"><input id="ovQ" class="search" type="search" placeholder="搜尋條次、措施名稱…（例：8.13、備份）"></div><div id="ovList"></div></div>
    <div id="tabPg" hidden></div>
    <div id="tabTp" hidden></div>
    <div id="tabIdx" hidden><input id="q" class="search" type="search" placeholder="搜尋條次、措施名稱、證據關鍵字…"><div id="bd"></div></div>
  `;
  if (document.getElementById("sb")) {
  fill(""); $("#q").oninput = e => fill(e.target.value);
  $("#ovQ").oninput = e => { ovQ = e.target.value.trim(); renderOv(); };
  }

  // ==========================================
  // 條文總覽：每一條條文的進度一目了然
  // ==========================================
  let ovFilter = "all", ovQ = ""; const ovClosed = new Set();
  const ST_TXT = ["未開始", "進行中", "已完成"], NC_TXT = ["", "OFI", "Minor NC", "Major NC"];
  window.ovSet = f => { ovFilter = (ovFilter === f ? "all" : f); renderOv(); };
  window.ovTog = (i, o) => { if (o) ovClosed.delete(i); else ovClosed.add(i); };
  function ovInfo(n) {
    const na = isNA(n.no), s = stOf(n.no), m = curMonth();
    return { na, s, nc: ncOf(n.no), late: !na && s < 2 && m > 0 && m > ZDUE[n.z] };
  }
  function ovMatch(n, f) {
    const x = ovInfo(n);
    if (ovQ && ![n.no, n.ti, n.en, n.ev].join(" ").toLowerCase().includes(ovQ.toLowerCase())) return false;
    switch (f) {
      case "todo": return !x.na && x.s === 0; case "doing": return !x.na && x.s === 1; case "done": return !x.na && x.s === 2;
      case "na": return x.na; case "nc": return x.nc > 0; case "late": return x.late; default: return true;
    }
  }
  function renderOv() {
    const box = $("#ovList"); if (!box) return;
    const keep = sb.scrollTop, I = N.map(ovInfo);
    const cnt = { all: N.length, todo: 0, doing: 0, done: 0, na: 0, nc: 0, late: 0 };
    I.forEach(x => { if (x.na) cnt.na++; else cnt[["todo", "doing", "done"][x.s]]++; if (x.nc) cnt.nc++; if (x.late) cnt.late++; });
    const pctOf = list => { const a = list.filter(n => !isNA(n.no)), d = a.filter(n => stOf(n.no) === 2).length; return [d, a.length, a.length ? Math.round(d * 100 / a.length) : 0]; };
    const [aD, aT, aP] = pctOf(N), [cD, cT, cP] = pctOf(N.filter(n => n.cl)), [xD, xT, xP] = pctOf(N.filter(n => !n.cl));
    const card = (f, t, c) => `<button class="ov-card ${ovFilter === f ? "on" : ""}" style="--c:${c}" onclick="ovSet('${f}')"><b>${cnt[f]}</b><span>${t}</span></button>`;
    $("#ovSum").innerHTML = `
      <div class="ov-big"><div><b>${aP}%</b><span>${aD} / ${aT} 項已完成</span></div>
        <div class="ov-sub"><div>核心條款 <b>${cD}/${cT}</b><i style="--w:${cP}%"></i></div><div>附錄 A 控制措施 <b>${xD}/${xT}</b><i style="--w:${xP}%"></i></div></div></div>
      <div class="ov-cards">${card("all", "全部", "#64748b")}${card("done", "已完成", "#10b981")}${card("doing", "進行中", "#3b82f6")}${card("todo", "未開始", "#9ca3af")}${card("late", "逾期", "#ef4444")}${card("nc", "有稽核缺失", "#f59e0b")}${card("na", "不適用", "#a1a1aa")}</div>`;
    let html = "", shown = 0;
    Zs.forEach((z, i) => {
      const rows = N.filter(n => n.z === i && ovMatch(n, ovFilter)); if (!rows.length) return; shown += rows.length;
      const zs = zState(i), d = zDone(i), t = zTot(i);
      html += `<details class="ov-z" id="ovz${i}" ${ovClosed.has(i) ? "" : "open"} ontoggle="ovTog(${i}, this.open)">
        <summary><span class="dot" style="background:${zs.c}"></span><b class="ov-zn">${z.e} ${z.n}</b><em style="color:${zs.c}">${zs.t}</em><span class="ov-zm">期限第 ${ZDUE[i]} 月${P.own[i] ? "・" + esc(P.own[i]) : ""}</span><span class="ov-zp"><i style="--w:${t ? d * 100 / t : 0}%;--c:${zs.c}"></i></span><strong>${d}/${t}</strong></summary>
        <div class="ov-rows"><div class="ov-row ov-h"><span>條次</span><span>條文</span><span>進度</span><span>狀態標記</span></div>
        ${rows.map(n => { const x = ovInfo(n), c = x.na ? "#a1a1aa" : ["#9ca3af", "#3b82f6", "#10b981"][x.s];
          const ctl = x.na ? `<span class="bdg" style="--c:#a1a1aa">不適用</span>` : canEdit() ? `<select class="ov-sel" style="--c:${c}" onchange="setSt('${n.no}', this.value)">${ST_TXT.map((q, k) => `<option value="${k}" ${x.s === k ? "selected" : ""}>${q}</option>`).join("")}</select>` : `<span class="bdg" style="--c:${c}">${ST_TXT[x.s]}</span>`;
          const tn = tplN(n.no);
          return `<div class="ov-row ${x.na ? "na" : ""}"><span class="cno" onclick="pins[${n.id}].onclick()">${dn(n.no)}</span>
            <span class="ov-t" onclick="pins[${n.id}].onclick()">${n.ti}${n.nw ? " ★" : ""}<small>${n.en}</small></span>
            <span class="ov-st"><span class="ov-pb"><i style="--w:${x.na ? 0 : x.s * 50}%;--c:${c}"></i></span>${ctl}</span>
            <span class="ov-fl">${x.late ? `<span class="bdg" style="--c:#ef4444">逾期</span>` : ""}${x.nc ? `<span class="bdg" style="--c:${x.nc > 1 ? "#ef4444" : "#f59e0b"}">${NC_TXT[x.nc]}</span>` : ""}${tn ? `<span class="bdg" style="--c:#6366f1">📎 ${tn}</span>` : ""}</span></div>`; }).join("")}
        </div></details>`;
    });
    box.innerHTML = html || `<p class="mute" style="margin-top:16px">沒有符合條件的條文。</p>`;
    sb.scrollTop = keep;
  }

  function renderPg() {
    const m = curMonth(), tot = totDone(), all = totAll(), pct = all ? Math.round(tot * 100 / all) : 0, ed = canEdit(), dis = ed ? "" : "disabled";
    const exp = Zs.reduce((s, _, i) => s + (m >= ZDUE[i] ? zTot(i) : 0), 0), nNA = N.length - all;
    const sts = !m ? "請先設定專案起始月，系統才能判斷是否逾期" : tot >= exp ? "🟢 進度正常" : tot >= exp - 5 ? "🟡 略為落後" : "🔴 明顯落後";
    const next = N.filter(n => !isNA(n.no) && stOf(n.no) < 2).sort((a, b) => ZDUE[a.z] - ZDUE[b.z] || stOf(b.no) - stOf(a.no)).slice(0, 5);
    
    // 找出有缺失的項目
    const hasNC = N.filter(n => ncOf(n.no) > 0).sort((a, b) => ncOf(b.no) - ncOf(a.no));
    const ncHTML = hasNC.length ? `<h3>⚠️ 缺失追蹤 (Findings)</h3><div class="rows" style="margin-bottom:16px;">${hasNC.map(n => `<button class="row" style="border-color:${ncOf(n.no) > 1 ? '#ef4444' : '#f59e0b'}; background:#fff" onclick="pins[${n.id}].onclick()"><span class="cno">${dn(n.no)}</span><span class="rt">${n.ti}<small>${["", "OFI", "Minor NC", "Major NC"][ncOf(n.no)]}</small></span></button>`).join("")}</div>` : "";
    
    const auditorSelect = isAdmin() ? `
      <div style="margin-top:10px;">
        <label style="font-size:12px;font-weight:700;">指派稽核員：</label>
        <select class="search" style="width:auto;padding:4px 8px;margin-bottom:0;" onchange="assignAuditor(this.value)">
          <option value="">無</option>
          ${USERS.filter(u=>u.r==="auditor").map(u => `<option value="${u.u}" ${P.auditor===u.u?'selected':''}>${u.name} (${u.u})</option>`).join("")}
        </select>
      </div>` 
      : (isAuditor() && P.auditor === currentUser.u ? `<p style="color:#f59e0b;font-weight:700;font-size:12px;">✅ 您是本專案的指派稽核員</p>` : '');

    $("#tabPg").innerHTML = `
      <div style="margin-bottom:12px;">
        <button class="btn" style="background:#4b5563;font-size:12px;padding:6px 12px;" onclick="showProjectLobby()">🔙 回專案列表</button>
      </div>
      <input class="search" placeholder="客戶 / 專案名稱" ${dis} value="${esc(P.client)}" onchange="pgSet('client', this.value)">
      <label class="pgl">專案起始月 <input type="month" class="search" ${dis} style="width:auto; margin:0 0 0 8px;" value="${esc(P.start)}" onchange="pgSet('start', this.value)"></label>
      ${auditorSelect}
      <div class="pgbox"><div class="pgbig">${tot}<small>/ ${all} 項已完成</small><span>${pct}%</span></div><div class="pgbar"><i style="width:${pct}%; background:#10b981"></i></div>
        <p class="mute" style="margin:8px 0 0">${m ? `目前第 ${m} 個月，依計畫應完成 ${exp} 項。` : ""}${sts}${nNA ? `（另有 ${nNA} 項不適用）` : ""}</p></div>
      <h3>接下來該做</h3>
      <div class="rows">${next.map(n => `<button class="row" onclick="pins[${n.id}].onclick()"><span class="cno">${dn(n.no)}</span><span class="rt">${n.ti}<small>${Zs[n.z].n.split(" ")[1]}・期限第 ${ZDUE[n.z]} 月${m > ZDUE[n.z] ? "・⚠️ 逾期" : ""}${stOf(n.no) === 1 ? "・進行中" : ""}</small></span></button>`).join("") || "<p class='mute'>🎉 全部完成，可以準備外部驗證了。</p>"}</div>
      ${ncHTML}
      <h3>各島進度</h3>
      <div class="rows">${Zs.map((z, i) => { const s = zState(i), d = zDone(i), t = zTot(i); return `<button class="row" onclick="openZone(${i})"><span class="dot" style="background:${s.c}"></span><span class="rt">${z.n}<small>${s.t}・期限第 ${ZDUE[i]} 月${P.own[i] ? "・" + esc(P.own[i]) : ""}</small><div class="pgbar"><i style="width:${t ? d * 100 / t : 0}%; background:${s.c}"></i></div></span><em style="color:${s.c}">${d}/${t}</em></button>`; }).join("")}</div>
      <div class="pgact" style="flex-wrap:wrap">
        <button class="btn" onclick="pgSoA()">匯出 SoA (CSV)</button>
        ${isAdmin() ? '<button class="btn" style="background:#9ca3af" onclick="pgReset()">重置進度</button>' : ''}
      </div>`;
  }
  function renderTp() {
    const cov = new Set(); TL.forEach(f => f.ctl.forEach(c => cov.add(c)));
    $("#tabTp").innerHTML = `
      <div class="pgbox"><div class="pgbig">${TL.length}<small>份模板</small><span>${cov.size}/${N.length}</span></div><p class="mute" style="margin:6px 0 0">已有模板的控制措施 ${cov.size} 項・來自 files.json（網站內建，唯讀）</p></div>
      <p class="note">模板來自 GitHub 的 files.json 與 Files 資料夾（唯讀）。新增模板請從 GitHub 儲存庫新增檔案。</p>
      <div>${TL.map(f => `<div class="fi2"><span class="fe">${ico(f.name)}</span><div class="fn"><b>${esc(f.name)}</b><small>${fmtSz(f.size)}・${f.ctl.length ? f.ctl.map(c => `<a onclick="openCtl('${c}')">${dnl(c)}</a>`).join("") : "通用"}</small></div><button class="mini" onclick="tpGet('${f.id}')">下載</button></div>`).join("") || "<p class='mute'>還沒有模板。</p>"}</div>`;
  }
  
  async function loadTpl() { try { TL = await TPL.list(); } catch (e) { TL = []; } renderTp(); refresh(); }
  
  window.renderTplBox = no => {
    const bx = $("#tplBox"); if (!bx) return;
    const mine = TL.filter(f => f.ctl.includes(no));
    bx.innerHTML = (mine.map(f => `<div class="fi2"><span class="fe">${ico(f.name)}</span><div class="fn"><b>${esc(f.name)}</b><small>${fmtSz(f.size)}</small></div><button class="mini" onclick="tpGet('${f.id}')">下載</button></div>`).join("") || "<p class='mute' style='margin:0 0 8px'>尚未對應模板。</p>");
  };
  
  window.tpGet = id => TPL.get(id).catch(e => alert("下載失敗：" + (e.message || "檔案可能遺失或未上傳至 GitHub")));
  window.openCtl = no => pins[N.find(n => n.no === no).id].onclick();
  
  function refresh() {
    if (currentUser) renderUserBar();
    if(P) {
      $("#sbProjName").innerText = P.name || "未命名專案";
    }
    if (window.on3dRefresh) window.on3dRefresh();
    sync(); renderPg(); renderOv();
    const t = totDone(), all = totAll() || 1; $("#realLabel").innerText = `輔導完成度：${t}/${totAll()} 項（${Math.round(t * 100 / all)}%）`; $("#tr-fill2").style.width = `${t * 100 / all}%`;
  }
  
  window.pgReset = () => { if (canEdit() && confirm("確定清除所有實作狀態、排除理由與負責人？")) { P.st = {}; P.na = {}; P.why = {}; P.own = {}; P.nc = {}; saveDB(); refresh(); } };
  window.pgSoA = () => {
    const q = s => '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"', ST = ["未開始", "進行中", "已完成"], NC_ST = ["無缺失", "OFI", "Minor NC", "Major NC"];
    const rows = [["條次", "措施（中文）", "English", "主題", "所屬島", "2022新增", "適用", "排除理由", "實作狀態", "稽核缺失", "負責人", "模板檔案", "建議文件／紀錄"]];
    N.filter(n => !n.cl).forEach(n => { const na = isNA(n.no); rows.push([n.no, n.ti, n.en, n.th, Zs[n.z].n, n.nw ? "是" : "", na ? "否" : "是", na ? P.why[n.no] : "", na ? "" : ST[stOf(n.no)], NC_ST[ncOf(n.no)], P.own[n.z] || "", TL.filter(f => f.ctl.includes(n.no)).map(f => f.name).join("；"), n.ev]); });
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + rows.map(r => r.map(q).join(",")).join("\r\n")], { type: "text/csv" })); a.download = `SoA_${P.client || "ISO27001"}.csv`; a.click();
  };
  
  if (document.getElementById("sb")) sb.querySelector(".tabs").onclick = e => { const bt = e.target.closest("button"); if (!bt) return; sb.querySelectorAll(".tabs button").forEach(x => x.classList.toggle("on", x === bt)); ["Ov", "Pg", "Tp", "Idx"].forEach(k => $("#tab" + k).hidden = bt.dataset.tab !== k.toLowerCase()); };
  
  async function init() {
    await loadUsers();
    await loadTpl();
  }
  
  if (document.getElementById("sb")) { renderTp(); init(); }