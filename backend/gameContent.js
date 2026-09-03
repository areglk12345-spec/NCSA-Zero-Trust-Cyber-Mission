// Game content: missions + scoring rules for the Zero Trust Cyber Mission demo.
// Each mission carries everything a round needs: briefing text, the interaction
// pattern to render, and the data required to score that pattern server-side.

const RECOMMENDED_TIME = { single: 30, risk: 45, multi: 60, sequence: 90, defense: 150 };

const DEFENSE_LAYERS = [
  { id:'mfa', label:'Multi-Factor Authentication', icon:'⚿', detail:'บังคับให้ผู้ใช้ยืนยันตัวตนมากกว่าหนึ่งวิธี (เช่น รหัสผ่าน + OTP) ก่อนเข้าสู่ระบบ ช่วยสกัด Credential ที่ถูกขโมยไม่ให้ใช้งานได้ทันที',
    question:'เพราะเหตุใด MFA จึงป้องกัน Credential ที่ถูกขโมยได้?', options:[
      {id:'a', label:'เพราะรหัสผ่านอย่างเดียวไม่พอ ต้องมีการยืนยันอีกชั้นที่ผู้โจมตีไม่มี', correct:true},
      {id:'b', label:'เพราะทำให้รหัสผ่านยากขึ้นเท่านั้น', correct:false},
      {id:'c', label:'เพราะเปลี่ยนรหัสผ่านให้บ่อยขึ้นโดยอัตโนมัติ', correct:false},
      {id:'d', label:'เพราะซ่อนชื่อผู้ใช้ไม่ให้ผู้โจมตีเห็น', correct:false}
    ],
    reason:'ถูกต้อง — MFA เพิ่มปัจจัยยืนยันตัวตนอีกชั้นที่ผู้โจมตีไม่มี แม้จะขโมยรหัสผ่านไปได้ก็ยังผ่านเข้าระบบไม่ได้',
    setupQuestion:'ควรตั้งค่า MFA อย่างไรให้ได้ผลจริง?', setupOptions:[
      {id:'a', label:'บังคับใช้ MFA กับทุกบัญชีที่มีสิทธิ์สูง และเลือกวิธียืนยันที่สองที่เชื่อถือได้ เช่น Authenticator App', correct:true},
      {id:'b', label:'เปิด MFA ไว้เฉยๆ โดยไม่บังคับให้บัญชีสำคัญต้องใช้', correct:false},
      {id:'c', label:'ใช้ MFA เฉพาะตอน Login ครั้งแรกที่สร้างบัญชีเท่านั้น', correct:false},
      {id:'d', label:'ให้ผู้ใช้เลือกเปิดหรือปิด MFA ได้เองตามใจชอบ', correct:false}
    ], setupReason:'ถูกต้อง — MFA ต้องบังคับใช้กับบัญชีสำคัญและใช้วิธียืนยันที่น่าเชื่อถือ ไม่ใช่เปิดไว้แบบเลือกได้เอง'},
  { id:'device', label:'Device Verification', icon:'▣', detail:'ตรวจสอบว่าอุปกรณ์ที่ใช้ Login เป็นอุปกรณ์ที่ลงทะเบียนและปลอดภัยหรือไม่ ก่อนอนุญาตให้เข้าถึงระบบ',
    question:'เหตุใดต้องตรวจสอบอุปกรณ์ก่อนอนุญาตเข้าระบบ?', options:[
      {id:'a', label:'เพื่อให้ระบบทำงานเร็วขึ้น', correct:false},
      {id:'b', label:'เพื่อยืนยันว่าอุปกรณ์ไม่ได้ถูกใช้สวมรอยหรือมีมัลแวร์', correct:true},
      {id:'c', label:'เพื่อให้ผู้ใช้จำรหัสผ่านได้ง่ายขึ้น', correct:false},
      {id:'d', label:'เพื่อลดค่าใช้จ่ายด้านฮาร์ดแวร์', correct:false}
    ],
    reason:'ถูกต้อง — Login ด้วยรหัสผ่านที่ถูกต้องไม่ได้แปลว่าอุปกรณ์นั้นปลอดภัย จึงต้องตรวจสอบอุปกรณ์เพื่อคัดกรองการสวมรอยหรือมัลแวร์',
    setupQuestion:'ขั้นตอนใดจำเป็นที่สุดในการตั้งค่า Device Verification?', setupOptions:[
      {id:'a', label:'ตั้งกฎ Conditional Access ให้บล็อกอุปกรณ์ที่ไม่ได้ลงทะเบียนไว้ก่อน', correct:true},
      {id:'b', label:'อนุญาตทุกอุปกรณ์เข้าก่อนแล้วค่อยตรวจสอบทีหลัง', correct:false},
      {id:'c', label:'ให้ผู้ใช้ตั้งชื่ออุปกรณ์เองโดยไม่ต้องยืนยันตัวจริง', correct:false},
      {id:'d', label:'ปล่อยให้ทุกอุปกรณ์เข้าถึงได้เท่ากันโดยไม่แยกประเภท', correct:false}
    ], setupReason:'ถูกต้อง — ต้องบล็อกอุปกรณ์ที่ไม่ได้ลงทะเบียนไว้ก่อนเป็นค่าเริ่มต้น แล้วอนุญาตเฉพาะอุปกรณ์ที่ผ่านการตรวจสอบ'},
  { id:'least', label:'Least Privilege Access', icon:'◈', detail:'จำกัดสิทธิ์การเข้าถึงของผู้ใช้และบัญชีให้เหลือเท่าที่จำเป็นต่องานจริงเท่านั้น ลดความเสียหายหากบัญชีถูกเจาะ',
    question:'Least Privilege ช่วยลดความเสียหายอย่างไร?', options:[
      {id:'a', label:'จำกัดสิ่งที่ผู้โจมตีเข้าถึงได้แม้ยึดบัญชีได้สำเร็จ', correct:true},
      {id:'b', label:'ทำให้ผู้ใช้ทำงานได้เร็วขึ้น', correct:false},
      {id:'c', label:'เพิ่มพื้นที่จัดเก็บข้อมูลให้บัญชีผู้ใช้', correct:false},
      {id:'d', label:'ทำให้รหัสผ่านคาดเดายากขึ้น', correct:false}
    ],
    reason:'ถูกต้อง — หากผู้โจมตียึดบัญชีที่มีสิทธิ์จำกัดได้ ความเสียหายก็ถูกจำกัดตามสิทธิ์นั้นด้วย ไม่ลุกลามไปทั้งระบบ',
    setupQuestion:'เมื่อทบทวนสิทธิ์ผู้ใช้ (Access Review) แล้วพบสิทธิ์ที่ไม่ได้ใช้งาน ควรทำอย่างไร?', setupOptions:[
      {id:'a', label:'ยกเลิกสิทธิ์ที่ไม่ได้ใช้งานหรือเกินความจำเป็นทันที', correct:true},
      {id:'b', label:'เก็บสิทธิ์ไว้เผื่อได้ใช้ในอนาคต', correct:false},
      {id:'c', label:'มอบสิทธิ์เพิ่มให้ทุกคนเผื่อสะดวกในการทำงาน', correct:false},
      {id:'d', label:'รอให้ผู้ใช้แจ้งเองว่าต้องการยกเลิกสิทธิ์', correct:false}
    ], setupReason:'ถูกต้อง — สิทธิ์ที่ไม่ได้ใช้งานคือความเสี่ยงที่ไม่จำเป็น ต้องยกเลิกทันทีเพื่อลดพื้นที่การโจมตี'},
  { id:'temp', label:'Temporary Access', icon:'◷', detail:'กำหนดเวลาสิ้นสุดของสิทธิ์การเข้าถึงโดยอัตโนมัติ เพื่อไม่ให้สิทธิ์ที่ให้ไว้ชั่วคราวหลงเหลืออยู่นานเกินจำเป็น',
    question:'เหตุใดสิทธิ์ชั่วคราวควรมีวันหมดอายุ?', options:[
      {id:'a', label:'เพื่อไม่ให้สิทธิ์ที่ไม่จำเป็นหลงเหลืออยู่จนถูกใช้ในทางที่ผิด', correct:true},
      {id:'b', label:'เพื่อประหยัดพื้นที่ในระบบ', correct:false},
      {id:'c', label:'เพื่อให้ผู้ใช้ Login ได้เร็วขึ้น', correct:false},
      {id:'d', label:'เพื่อลดจำนวนรหัสผ่านที่ต้องจำ', correct:false}
    ],
    reason:'ถูกต้อง — สิทธิ์ที่ไม่มีวันหมดอายุมีแนวโน้มถูกหลงเหลือและนำไปใช้ในทางที่ผิดในระยะยาว',
    setupQuestion:'วิธีตั้งค่า Temporary Access ที่ถูกต้องคือ?', setupOptions:[
      {id:'a', label:'เปิด Just-In-Time Access และกำหนดวันหมดอายุอัตโนมัติทุกครั้งที่อนุมัติสิทธิ์', correct:true},
      {id:'b', label:'อนุมัติสิทธิ์ชั่วคราวแบบไม่มีวันหมดอายุเพื่อความสะดวก', correct:false},
      {id:'c', label:'ให้ผู้ใช้ต่ออายุสิทธิ์ของตัวเองได้ไม่จำกัดครั้ง', correct:false},
      {id:'d', label:'อนุมัติสิทธิ์ทั้งหมดแบบถาวรตั้งแต่ครั้งแรก', correct:false}
    ], setupReason:'ถูกต้อง — Just-In-Time Access พร้อมวันหมดอายุอัตโนมัติทำให้สิทธิ์ชั่วคราวไม่หลงเหลืออยู่นานเกินจำเป็น'},
  { id:'session', label:'Session Control', icon:'⌁', detail:'ตรวจสอบและควบคุม Session ที่กำลังใช้งาน สามารถระงับ Session ที่ต้องสงสัยได้ทันทีโดยไม่ต้องรอให้ผู้ใช้ Logout',
    question:'ประโยชน์หลักของ Session Control คืออะไร?', options:[
      {id:'a', label:'ระงับ Session ที่ต้องสงสัยได้ทันทีโดยไม่ต้องรอผู้ใช้ Logout', correct:true},
      {id:'b', label:'ทำให้ Login เร็วขึ้น', correct:false},
      {id:'c', label:'ลดจำนวนรหัสผ่านที่ต้องใส่', correct:false},
      {id:'d', label:'เพิ่มความจำของอุปกรณ์', correct:false}
    ],
    reason:'ถูกต้อง — การควบคุม Session ทำให้ตัดการเข้าถึงได้ทันทีเมื่อพบความเสี่ยง โดยไม่ต้องรอผู้ใช้ Logout เอง',
    setupQuestion:'ควรกำหนดเงื่อนไข Session ผิดปกติอย่างไร?', setupOptions:[
      {id:'a', label:'ตรวจจับเมื่อตำแหน่งหรืออุปกรณ์เปลี่ยนกลางทาง แล้วให้ระงับ Session ได้จากศูนย์กลางทันที', correct:true},
      {id:'b', label:'ปล่อยให้ Session ทำงานต่อไปจนกว่าผู้ใช้จะ Logout เอง', correct:false},
      {id:'c', label:'ตรวจสอบ Session เพียงวันละครั้งตอนเช้า', correct:false},
      {id:'d', label:'ให้ผู้ใช้แจ้งเองหาก Session ผิดปกติ', correct:false}
    ], setupReason:'ถูกต้อง — ตำแหน่ง/อุปกรณ์ที่เปลี่ยนกลางทางคือสัญญาณเสี่ยงชัดเจน ต้องระงับได้จากศูนย์กลางทันทีเพื่อลดความเสียหาย'},
  { id:'monitor', label:'Continuous Monitoring', icon:'◉', detail:'เฝ้าระวังพฤติกรรมการใช้งานอย่างต่อเนื่องแบบ Real-time เพื่อจับสัญญาณความผิดปกติให้เร็วที่สุด',
    question:'Continuous Monitoring ช่วยอะไร?', options:[
      {id:'a', label:'ตรวจจับพฤติกรรมผิดปกติได้เร็วแบบ Real-time', correct:true},
      {id:'b', label:'ลดจำนวนผู้ใช้ในระบบ', correct:false},
      {id:'c', label:'เพิ่มความเร็วอินเทอร์เน็ตขององค์กร', correct:false},
      {id:'d', label:'ลดจำนวนอุปกรณ์ที่ต้องดูแล', correct:false}
    ],
    reason:'ถูกต้อง — การเฝ้าระวังแบบ Real-time ทำให้ตรวจจับและตอบสนองต่อพฤติกรรมผิดปกติได้เร็วกว่าการตรวจสอบเป็นรอบ',
    setupQuestion:'ก่อนตั้งกฎแจ้งเตือนความผิดปกติ ควรทำอะไรก่อน?', setupOptions:[
      {id:'a', label:'กำหนด Baseline พฤติกรรมปกติของผู้ใช้แต่ละกลุ่มก่อน', correct:true},
      {id:'b', label:'ตั้งกฎแจ้งเตือนทันทีโดยไม่ต้องดูพฤติกรรมปกติก่อน', correct:false},
      {id:'c', label:'รอให้เกิดเหตุการณ์ก่อนแล้วค่อยตั้งกฎย้อนหลัง', correct:false},
      {id:'d', label:'ปิดการแจ้งเตือนทั้งหมดเพื่อลดความยุ่งยาก', correct:false}
    ], setupReason:'ถูกต้อง — ต้องรู้ว่าพฤติกรรม "ปกติ" เป็นอย่างไรก่อน จึงจะตั้งกฎจับความผิดปกติได้อย่างแม่นยำ'},
  { id:'reauth', label:'Re-Authentication', icon:'⟲', detail:'บังคับให้ผู้ใช้ยืนยันตัวตนซ้ำก่อนทำรายการที่มีความเสี่ยงสูงหรือเข้าถึงข้อมูลสำคัญ แม้จะ Login ไว้แล้วก็ตาม',
    question:'เหตุใดต้อง Re-Authenticate แม้ Login ไว้แล้ว?', options:[
      {id:'a', label:'เพราะ Session ที่ Login ไว้อาจถูกขโมยไปใช้งานต่อได้', correct:true},
      {id:'b', label:'เพราะระบบบังคับทุกคนโดยไม่มีเหตุผล', correct:false},
      {id:'c', label:'เพราะช่วยให้จำรหัสผ่านได้ดีขึ้น', correct:false},
      {id:'d', label:'เพราะทำให้ระบบทำงานเร็วขึ้น', correct:false}
    ],
    reason:'ถูกต้อง — Session ที่ Login ไว้แล้วอาจถูกขโมย (Session Hijacking) ไปใช้งานต่อได้ การยืนยันซ้ำจึงช่วยยืนยันว่าเป็นเจ้าของจริง',
    setupQuestion:'ควรกำหนด Action ใดให้ต้อง Re-Authenticate?', setupOptions:[
      {id:'a', label:'Action ที่มีความเสี่ยงสูง เช่น เปลี่ยนรหัสผ่าน หรือโอนเงิน', correct:true},
      {id:'b', label:'Action ทั่วไปทุกประเภทโดยไม่แยกระดับความเสี่ยง', correct:false},
      {id:'c', label:'เฉพาะตอน Login ครั้งแรกของวันเท่านั้น', correct:false},
      {id:'d', label:'ไม่ต้องกำหนด ปล่อยให้ผู้ใช้ตัดสินใจเอง', correct:false}
    ], setupReason:'ถูกต้อง — ต้องเจาะจงเฉพาะ Action ที่มีความเสี่ยงสูง เพื่อไม่ให้ผู้ใช้ถูกรบกวนด้วยการยืนยันซ้ำเกินความจำเป็น'}
];

const ATTACK_STEPS = [
  {step:1, text:'Credential ถูกขโมยผ่าน Phishing', needs:'mfa'},
  {step:2, text:'พยายาม Login จากอุปกรณ์ที่ไม่รู้จัก', needs:'device'},
  {step:3, text:'ระบบเรียก MFA Challenge', needs:'mfa'},
  {step:4, text:'พยายามเข้าถึงข้อมูลสำคัญ', needs:'least'},
  {step:5, text:'พยายามดาวน์โหลดข้อมูลจำนวนมาก', needs:'session'},
  {step:6, text:'Monitoring ตรวจพบพฤติกรรมผิดปกติ', needs:'monitor'},
  {step:7, text:'ระบบบังคับ Re-Authentication', needs:'reauth'},
  {step:8, text:'Zero Trust Shield สรุปผลการป้องกัน', needs:null}
];

const FINAL_ATTACK_MISSION = {
  id: 'final-attack',
  name: 'Final Zero Trust Attack',
  category: 'Final',
  principle: 'Defense in Depth',
  interaction: 'defense',
  scenario: 'สร้างเกราะป้องกัน Zero Trust ให้ครบทุกชั้น — ตอบคำถามในแต่ละมาตรการให้ถูกต้องเพื่อปลดล็อกและวางมาตรการนั้นก่อนที่การโจมตีจะมาถึง',
  riskLabel: 'CRITICAL',
  evidenceItems: [],
  layers: DEFENSE_LAYERS,
  attackSteps: ATTACK_STEPS,
  explanation: 'การป้องกันแบบ Zero Trust ที่แข็งแกร่งต้องวางมาตรการหลายชั้นร่วมกัน (Defense in Depth) ยิ่งปลดล็อกมาตรการได้ครบเท่าไหร่ ก็ยิ่งสกัดการโจมตีได้มากขึ้นเท่านั้น'
};

const MISSIONS = [
  {
    id: 1,
    name: 'Unknown Device',
    category: 'Device',
    principle: 'Verify Explicitly',
    interaction: 'single',
    scenario:
      'ระบบตรวจพบว่าพนักงานคนหนึ่งเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่ถูกต้องทุกประการ แต่การ Login ครั้งนี้มาจากอุปกรณ์ที่ไม่เคยลงทะเบียนหรือใช้งานมาก่อนในระบบขององค์กร ทำให้ไม่สามารถยืนยันได้ว่าอุปกรณ์นี้ปลอดภัยหรือถูกดักจับ Session ไปใช้งานโดยผู้ไม่หวังดี',
    riskLabel: 'MEDIUM RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'employee07' },
      { k: 'T', label: 'Time', value: '09:42 น.' },
      { k: 'D', label: 'Device', value: 'Windows PC — Unregistered' },
      { k: 'IP', label: 'IP Address', value: '198.51.100.22 (จำลอง)' }
    ],
    options: [
      { id: 'allow', title: 'อนุญาตให้เข้าใช้งาน', desc: 'ให้เข้าสู่ระบบเพราะ Password ถูกต้อง', effect: 'อุปกรณ์ที่ไม่รู้จักอาจมีมัลแวร์หรือถูกสวมรอย', tag: 'dangerous' },
      { id: 'verify', title: 'ยืนยันตัวตนซ้ำและลงทะเบียนอุปกรณ์', desc: 'บังคับ Re-Authenticate ก่อนให้ลงทะเบียนอุปกรณ์ใหม่เข้าระบบ', effect: 'มั่นใจได้ว่าเป็นผู้ใช้จริงก่อนเพิ่มอุปกรณ์เข้าระบบ', tag: 'recommended' },
      { id: 'block', title: 'Block อุปกรณ์นี้ถาวร', desc: 'ปฏิเสธการเข้าถึงจากอุปกรณ์นี้ทั้งหมด', effect: 'ผู้ใช้จริงอาจใช้งานอุปกรณ์เครื่องใหม่ไม่ได้', tag: 'acceptable' },
      { id: 'notify', title: 'แจ้งทีม Security เท่านั้น', desc: 'บันทึกเหตุการณ์ไว้แต่ยังไม่ดำเนินการใด ๆ', effect: 'ล่าช้าเกินไปหากอุปกรณ์นี้ถูกสวมรอยจริง', tag: 'risky' }
    ],
    explanation: 'แม้รหัสผ่านจะถูกต้อง แต่ Context เช่นอุปกรณ์ที่ไม่คุ้นเคยต้องถูกตรวจสอบเพิ่มเติมทุกครั้งตามหลัก Verify Explicitly ก่อนอนุญาตให้เข้าถึงระบบ'
  },
  {
    id: 2,
    name: 'Suspicious Login',
    category: 'Identity',
    principle: 'Assume Breach',
    interaction: 'single',
    scenario:
      'เวลา 02:14 น. ระบบตรวจพบความพยายาม Login เข้าสู่บัญชี admin_finance จากตำแหน่งที่ไม่คุ้นเคยถึง 7 ครั้งภายในเวลาไม่ถึง 5 นาที โดยใช้อุปกรณ์ Mobile ที่ไม่เคยลงทะเบียนกับระบบมาก่อน แม้รหัสผ่านที่ใช้จะถูกต้องทุกครั้ง แต่รูปแบบการเข้าถึงที่ผิดปกตินี้ทำให้ทีม Security ยกระดับความเสี่ยงเป็น "สูง" ทันที',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'admin_finance' },
      { k: 'T', label: 'Time', value: '02:14 น.' },
      { k: 'L', label: 'Location', value: 'ต่างประเทศ (ไม่คุ้นเคย)' },
      { k: 'D', label: 'Device', value: 'Mobile — Unregistered' },
      { k: 'IP', label: 'IP Address', value: '203.0.113.44 (จำลอง)' },
      { k: 'M', label: 'MFA Status', value: 'Not Completed' }
    ],
    options: [
      { id: 'allow', title: 'อนุญาตให้เข้าใช้งาน', desc: 'ให้เข้าสู่ระบบเพราะ Password ถูกต้อง', effect: 'ผู้โจมตีอาจเข้าถึงระบบการเงินได้ทันที', tag: 'dangerous' },
      { id: 'suspend', title: 'ระงับ Session และขอ Re-Authentication', desc: 'หยุดการเข้าถึงชั่วคราวและให้ผู้ใช้ยืนยันตัวตนใหม่', effect: 'ลดความเสี่ยงจาก Credential ที่ถูกขโมยโดยไม่กระทบผู้ใช้งานจริง', tag: 'recommended' },
      { id: 'block', title: 'Block การเข้าถึงถาวร', desc: 'ยกเลิกสิทธิ์บัญชีทั้งหมดทันที', effect: 'ผู้ใช้งานจริงอาจไม่สามารถทำงานได้', tag: 'acceptable' },
      { id: 'notify', title: 'แจ้งทีม Security เท่านั้น', desc: 'ส่งรายงานแต่ไม่ดำเนินการใด ๆ กับ Session', effect: 'ล่าช้าเกินไปสำหรับ Session ที่กำลังใช้งาน', tag: 'risky' }
    ],
    explanation: 'ต้องสมมติว่าระบบถูกเจาะไว้แล้วเสมอ (Assume Breach) จึงต้องจำกัดผลกระทบให้เร็วที่สุดโดยระงับ Session ก่อนตรวจสอบเพิ่มเติม'
  },
  {
    id: 3,
    name: 'Vendor Access',
    category: 'Access',
    principle: 'Least Privilege',
    interaction: 'multi',
    scenario:
      'บริษัท Vendor ภายนอกติดต่อขอสิทธิ์เข้าถึงระบบภายในองค์กรเพื่อดำเนินการซ่อมบำรุงระบบชั่วคราวตามสัญญา แต่คำขอที่ส่งมาระบุสิทธิ์การเข้าถึงในระดับที่กว้างกว่าที่งานซ่อมบำรุงจำเป็นต้องใช้จริง',
    riskLabel: 'MEDIUM RISK',
    evidenceItems: [
      { k: 'V', label: 'Vendor', value: 'ThirdParty Maintenance Co.' },
      { k: 'S', label: 'Scope Requested', value: 'Full System Access' },
      { k: 'D', label: 'Duration', value: 'ไม่ระบุวันสิ้นสุด' }
    ],
    requiredCount: 3,
    options: [
      { id: 'm1', title: 'จำกัดสิทธิ์เข้าถึงเฉพาะระบบที่จำเป็น' },
      { id: 'm2', title: 'กำหนดวันหมดอายุการเข้าถึง' },
      { id: 'm3', title: 'เปิด Continuous Monitoring ระหว่างใช้งาน' },
      { id: 'm4', title: 'อนุญาตเข้าถึงแบบเต็มสิทธิ์ถาวร' },
      { id: 'm5', title: 'ขอ MFA ทุกครั้งที่เข้าใช้งาน' }
    ],
    correctIds: ['m1', 'm2', 'm3'],
    explanation: 'สิทธิ์ของ Vendor ควรถูกจำกัดเฉพาะที่จำเป็น มีวันหมดอายุชัดเจน และถูกเฝ้าระวังระหว่างใช้งาน ตามหลัก Least Privilege — การให้สิทธิ์เต็มแบบถาวรเพิ่มความเสี่ยงโดยไม่จำเป็น'
  },
  {
    id: 11,
    name: 'Incident Reporting',
    category: 'Incident Response',
    principle: 'Continuous Monitoring',
    interaction: 'sequence',
    scenario:
      'หลังตรวจพบเหตุการณ์ผิดปกติในระบบ ทีม Security ต้องดำเนินการตามขั้นตอนการรายงานและจัดการ Incident ให้ถูกลำดับ ตั้งแต่การตรวจสอบ แจ้งเตือน จนถึงการบันทึกเหตุการณ์ เพื่อให้สามารถติดตามและป้องกันเหตุซ้ำได้อย่างมีระบบ',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'E', label: 'Event', value: 'Suspicious Session Detected' },
      { k: 'T', label: 'Time', value: '14:02 น.' }
    ],
    items: [
      { id: 'suspend', label: 'ระงับ Session ที่ต้องสงสัย' },
      { id: 'verify', label: 'ตรวจสอบตัวตนผู้ใช้งานจริง' },
      { id: 'reset', label: 'Reset การตั้งค่า MFA' },
      { id: 'notify', label: 'แจ้งทีม Security' },
      { id: 'log', label: 'บันทึก Incident' }
    ],
    idealOrder: ['suspend', 'verify', 'reset', 'notify', 'log'],
    explanation: 'ลำดับที่ถูกต้องคือ ระงับ Session ที่ต้องสงสัย → ตรวจสอบตัวตนผู้ใช้งานจริง → Reset การตั้งค่า MFA → แจ้งทีม Security → บันทึก Incident เพื่อจำกัดความเสียหายให้เร็วที่สุดก่อนดำเนินการขั้นถัดไป'
  },
  {
    id: 5,
    name: 'Impossible Travel',
    category: 'Monitoring',
    principle: 'Verify Explicitly',
    interaction: 'risk',
    scenario:
      'บัญชีผู้ใช้เดียวกันมีการ Login เข้าใช้งานจากสองประเทศที่อยู่ห่างกันมากในช่วงเวลาห่างกันเพียงไม่กี่นาที ซึ่งเป็นไปไม่ได้ในทางกายภาพที่บุคคลเดียวจะเดินทางไปถึงได้ทันเวลา จึงบ่งชี้ว่าอาจมีผู้อื่นถือ Credential นี้อยู่ด้วย',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'L1', label: 'Login 1', value: 'กรุงเทพฯ · 10:00 น.' },
      { k: 'L2', label: 'Login 2', value: 'ลอนดอน · 10:07 น.' }
    ],
    riskLevels: [
      { id: 'low', label: 'ความเสี่ยงต่ำ' },
      { id: 'medium', label: 'ความเสี่ยงปานกลาง' },
      { id: 'high', label: 'ความเสี่ยงสูง' },
      { id: 'critical', label: 'เหตุการณ์วิกฤต' }
    ],
    correctRiskId: 'high',
    riskActions: [
      { id: 'r1', title: 'ระงับ Session ทันทีและแจ้งผู้ใช้งาน' },
      { id: 'r2', title: 'ขอ Re-Authentication ก่อนดำเนินการต่อ' },
      { id: 'r3', title: 'อนุญาตต่อไปโดยไม่ตรวจสอบเพิ่มเติม' }
    ],
    correctActionId: 'r2',
    explanation: 'เมื่อพบ Impossible Travel ให้ประเมินเป็น "ความเสี่ยงสูง" แล้วเลือก "ขอ Re-Authentication ก่อนดำเนินการต่อ" เพื่อยืนยันว่าเป็นเจ้าของบัญชีจริงก่อนอนุญาตให้ทำงานต่อ'
  },
  {
    id: 6,
    name: 'Lost MFA Device',
    category: 'Identity',
    principle: 'Assume Breach',
    interaction: 'single',
    scenario:
      'พนักงานแจ้งว่าโทรศัพท์มือถือที่ใช้เป็นอุปกรณ์ยืนยันตัวตนสองชั้น (MFA) สูญหาย ทำให้อุปกรณ์ดังกล่าวอาจตกไปอยู่ในมือของผู้ไม่หวังดีที่สามารถใช้ยืนยันตัวตนแทนพนักงานคนนั้นและเข้าถึงระบบต่าง ๆ ที่ผูกไว้กับอุปกรณ์นี้ได้',
    riskLabel: 'MEDIUM RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'sales_tan' },
      { k: 'D', label: 'Device', value: 'iPhone (Authenticator App)' },
      { k: 'T', label: 'Reported', value: '13 นาทีที่แล้ว' }
    ],
    options: [
      { id: 'ignore', title: 'รอให้พนักงานหาเจอก่อน', desc: 'ยังไม่ดำเนินการใด ๆ จนกว่าจะแน่ใจว่าหาย', effect: 'อุปกรณ์อาจถูกใช้ยืนยันตัวตนแทนได้ระหว่างนี้', tag: 'dangerous' },
      { id: 'revoke', title: 'เพิกถอนอุปกรณ์ MFA เดิมและออกอุปกรณ์ใหม่หลังยืนยันตัวตน', desc: 'ตัดการเชื่อมต่อของอุปกรณ์ที่หาย แล้วลงทะเบียน MFA ใหม่ให้พนักงาน', effect: 'ปิดช่องทางที่ผู้ไม่หวังดีอาจใช้อุปกรณ์เดิมยืนยันตัวตนแทน', tag: 'recommended' },
      { id: 'lockall', title: 'ล็อกบัญชีพนักงานทั้งหมดถาวร', desc: 'ปิดการใช้งานบัญชีจนกว่าจะติดต่อ IT ด้วยตนเอง', effect: 'กระทบการทำงานของพนักงานเกินความจำเป็น', tag: 'acceptable' },
      { id: 'notify', title: 'แจ้งทีม Security เฉย ๆ', desc: 'บันทึกเรื่องไว้แต่ไม่เพิกถอนอุปกรณ์', effect: 'อุปกรณ์ที่หายยังใช้ยืนยันตัวตนต่อไปได้', tag: 'risky' }
    ],
    explanation: 'ต้องสมมติว่าอุปกรณ์ที่สูญหายอาจถูกใช้ในทางที่ผิดแล้ว (Assume Breach) จึงต้องเพิกถอนสิทธิ์ MFA เดิมทันทีและออกอุปกรณ์ใหม่หลังยืนยันตัวตนผู้ใช้จริง'
  },
  {
    id: 7,
    name: 'Credential Stolen',
    category: 'Identity',
    principle: 'Assume Breach',
    interaction: 'single',
    scenario:
      'ทีม Security ตรวจพบว่า Username และ Password ของพนักงานคนหนึ่งถูกนำไปเผยแพร่และขายในตลาดมืดบนอินเทอร์เน็ต (Dark Web) ซึ่งหมายความว่า Credential นี้ไม่ปลอดภัยอีกต่อไปแม้เจ้าของบัญชีจะยังไม่รู้ตัวว่าถูกขโมย',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'it_narak' },
      { k: 'S', label: 'Source', value: 'Dark Web Monitoring Feed' }
    ],
    options: [
      { id: 'wait', title: 'รอให้พนักงานเปลี่ยนรหัสผ่านเอง', desc: 'ไม่แจ้งเตือนหรือบังคับใดๆ ทันที', effect: 'ผู้โจมตีมีเวลาใช้ Credential ก่อนถูกเปลี่ยน', tag: 'dangerous' },
      { id: 'forcereset', title: 'บังคับ Reset รหัสผ่านและ Sign-out ทุก Session ทันที', desc: 'ตัดการเข้าถึงปัจจุบันทั้งหมดและให้ตั้งรหัสผ่านใหม่ก่อนใช้งานต่อ', effect: 'Credential ที่ถูกขโมยใช้งานต่อไม่ได้ทันที', tag: 'recommended' },
      { id: 'monitor', title: 'เฝ้าระวังบัญชีนี้เป็นพิเศษเฉย ๆ', desc: 'ไม่เปลี่ยนรหัสผ่าน เพียงจับตาดูพฤติกรรม', effect: 'ยังมีความเสี่ยงถูกใช้งานก่อนตรวจพบความผิดปกติ', tag: 'risky' },
      { id: 'block', title: 'ปิดบัญชีถาวรทันที', desc: 'ระงับบัญชีทั้งหมดโดยไม่แจ้งล่วงหน้า', effect: 'พนักงานทำงานไม่ได้จนกว่าจะติดต่อ IT ด้วยตนเอง', tag: 'acceptable' }
    ],
    explanation: 'เมื่อ Credential รั่วไหลต้องสมมติว่าถูกเจาะแล้ว (Assume Breach) จึงต้องบังคับ Reset รหัสผ่านและตัด Session เดิมทั้งหมดทันทีเพื่อปิดช่องทางที่ผู้โจมตีจะใช้งานต่อ'
  },
  {
    id: 16,
    name: 'Phishing Email Click',
    category: 'Social Engineering',
    principle: 'Assume Breach',
    interaction: 'single',
    scenario:
      'พนักงานได้รับอีเมลที่แอบอ้างเป็นหน่วยงานที่น่าเชื่อถือ และหลงคลิกลิงก์ปลอมพร้อมกรอกชื่อผู้ใช้และรหัสผ่านของตนเองลงในหน้าเว็บที่ผู้โจมตีสร้างขึ้นเพื่อดักจับข้อมูล Credential ไปใช้งานต่อ',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'hr_suda' },
      { k: 'E', label: 'Email', value: 'urgent-payroll-verify@fake-domain.co' }
    ],
    options: [
      { id: 'ignore', title: 'ไม่ต้องดำเนินการ รอดูว่ามีปัญหาจริงหรือไม่', desc: 'ปล่อยผ่านเพราะพนักงานแจ้งเองว่าอาจไม่มีอะไรเกิดขึ้น', effect: 'Credential ที่ถูกดักไปแล้วยังใช้งานได้ต่อ', tag: 'dangerous' },
      { id: 'resetnotify', title: 'บังคับ Reset รหัสผ่าน + แจ้งเตือนพนักงานทั้งองค์กร', desc: 'ตัด Session เดิม เปลี่ยนรหัสผ่าน และแจ้งเตือนให้ระวังอีเมลลักษณะเดียวกัน', effect: 'ปิดช่องทางที่ผู้โจมตีจะใช้ Credential และลดผู้เสียหายเพิ่ม', tag: 'recommended' },
      { id: 'resetonly', title: 'Reset รหัสผ่านของพนักงานคนนี้อย่างเดียว', desc: 'แก้ที่ต้นเหตุแต่ไม่แจ้งเตือนคนอื่นในองค์กร', effect: 'พนักงานคนอื่นที่ได้อีเมลเดียวกันอาจตกเป็นเหยื่อต่อ', tag: 'acceptable' },
      { id: 'notify', title: 'แจ้งทีม Security เก็บไว้เป็นข้อมูลเฉย ๆ', desc: 'บันทึกเหตุการณ์แต่ไม่ Reset รหัสผ่านทันที', effect: 'Credential ที่รั่วไหลยังใช้งานได้อยู่', tag: 'risky' }
    ],
    explanation: 'เมื่อ Credential ถูกกรอกลงหน้าเว็บปลอมแล้วต้องสมมติว่าถูกขโมยไปแล้วจริง (Assume Breach) — ต้อง Reset รหัสผ่านทันทีและแจ้งเตือนวงกว้างเพื่อลดผู้เสียหายเพิ่มเติมจากแคมเปญ Phishing เดียวกัน'
  },
  {
    id: 4,
    name: 'MFA Bombing',
    category: 'Incident Response',
    principle: 'Continuous Monitoring',
    interaction: 'sequence',
    scenario:
      'พนักงานรายหนึ่งได้รับการแจ้งเตือนขอยืนยันตัวตนผ่าน MFA จำนวนมากผิดปกติในช่วงเวลาไล่เลี่ยกัน ทั้งที่ตนเองไม่ได้พยายาม Login ซึ่งเป็นเทคนิคที่ผู้โจมตีใช้เพื่อรบกวนจนผู้ใช้กดยืนยันโดยไม่ตั้งใจ (MFA Fatigue Attack)',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'ops_krit' },
      { k: 'C', label: 'MFA Prompts', value: '23 ครั้งใน 6 นาที' }
    ],
    items: [
      { id: 'deny', label: 'ปฏิเสธคำขอ MFA ที่น่าสงสัยทั้งหมด' },
      { id: 'reset', label: 'บังคับ Reset รหัสผ่านทันที' },
      { id: 'revoke', label: 'เพิกถอน Session ที่ Active อยู่ทั้งหมด' },
      { id: 'notify', label: 'แจ้งทีม Security' },
      { id: 'log', label: 'บันทึก Incident' }
    ],
    idealOrder: ['deny', 'reset', 'revoke', 'notify', 'log'],
    explanation: 'ต้องปฏิเสธคำขอ MFA ที่น่าสงสัยก่อนเป็นอันดับแรกเพื่อไม่ให้ผู้โจมตีผ่านเข้ามาได้ จากนั้น Reset รหัสผ่านและตัด Session เดิมทั้งหมด ก่อนแจ้งทีมและบันทึกเหตุการณ์ตามลำดับ (Continuous Monitoring)'
  },
  {
    id: 8,
    name: 'Remote Working',
    category: 'Access',
    principle: 'Least Privilege',
    interaction: 'multi',
    scenario:
      'พนักงานขอเข้าถึงระบบและข้อมูลของบริษัทจากที่บ้านผ่านเครือข่าย Wi-Fi ส่วนตัวที่ไม่มีการเข้ารหัสหรือมาตรการป้องกันความปลอดภัยใด ๆ ทำให้ข้อมูลที่รับส่งระหว่างอุปกรณ์กับระบบบริษัทมีความเสี่ยงถูกดักฟังหรือโจมตีระหว่างทาง',
    riskLabel: 'MEDIUM RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'employee01' },
      { k: 'N', label: 'Network', value: 'Home Wi-Fi (Unsecured)' }
    ],
    requiredCount: 3,
    options: [
      { id: 'm1', title: 'บังคับใช้ VPN ก่อนเข้าถึงระบบทุกครั้ง' },
      { id: 'm2', title: 'จำกัดการเข้าถึงเฉพาะระบบที่จำเป็นต่องาน' },
      { id: 'm3', title: 'ตรวจสอบ Compliance ของอุปกรณ์ (อัปเดต/มี Antivirus) ก่อนเชื่อมต่อ' },
      { id: 'm4', title: 'อนุญาตเข้าถึงทุกระบบภายในแบบไม่จำกัดจากที่บ้าน' },
      { id: 'm5', title: 'ขอ MFA เพิ่มเติมสำหรับการเข้าถึงระยะไกล' }
    ],
    correctIds: ['m1', 'm2', 'm3'],
    explanation: 'การทำงานระยะไกลควรผ่าน VPN ที่เข้ารหัส จำกัดสิทธิ์เฉพาะระบบที่จำเป็น และตรวจสอบว่าอุปกรณ์ปลอดภัยก่อนเชื่อมต่อ ตามหลัก Least Privilege — การเปิดให้เข้าถึงทุกระบบแบบไม่จำกัดเพิ่มความเสี่ยงโดยไม่จำเป็น'
  },
  {
    id: 9,
    name: 'Sensitive Data Access',
    category: 'Access',
    principle: 'Least Privilege',
    interaction: 'risk',
    scenario:
      'บัญชีผู้ใช้งานระดับปฏิบัติการทั่วไป ซึ่งปกติไม่มีความจำเป็นต้องเข้าถึงข้อมูลลูกค้าระดับ Confidential พยายามเรียกดูข้อมูลชุดนี้อย่างผิดปกติ อาจเกิดจากสิทธิ์ที่ตั้งค่าไว้กว้างเกินไป หรือบัญชีถูกควบคุมโดยผู้ไม่หวังดี',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'ops_general01' },
      { k: 'D', label: 'Data', value: 'Customer PII — Confidential' }
    ],
    riskLevels: [
      { id: 'low', label: 'ความเสี่ยงต่ำ' },
      { id: 'medium', label: 'ความเสี่ยงปานกลาง' },
      { id: 'high', label: 'ความเสี่ยงสูง' },
      { id: 'critical', label: 'เหตุการณ์วิกฤต' }
    ],
    correctRiskId: 'high',
    riskActions: [
      { id: 'r1', title: 'ระงับสิทธิ์การเข้าถึงทันทีและตรวจสอบสาเหตุ' },
      { id: 'r2', title: 'ส่งอีเมลเตือนผู้ใช้แล้วปล่อยผ่าน' },
      { id: 'r3', title: 'อนุญาตต่อไปเพราะบัญชีนี้ผ่านการยืนยันตัวตนแล้ว' }
    ],
    correctActionId: 'r1',
    explanation: 'การเข้าถึงข้อมูลที่เกินสิทธิ์ปกติของบัญชีต้องถูกประเมินเป็นความเสี่ยงสูงและระงับทันทีเพื่อตรวจสอบ ตามหลัก Least Privilege — สิทธิ์ที่กว้างเกินจำเป็นคือช่องโหว่ที่ต้องปิดก่อนเกิดความเสียหายจริง'
  },
  {
    id: 10,
    name: 'Unmanaged Device',
    category: 'Device',
    principle: 'Verify Explicitly',
    interaction: 'single',
    scenario:
      'มีอุปกรณ์ส่วนตัวที่ไม่ได้ลงทะเบียนหรือติดตั้งซอฟต์แวร์ป้องกันขององค์กรพยายามเชื่อมต่อเข้าสู่ VPN ของบริษัท ทำให้ไม่สามารถยืนยันได้ว่าอุปกรณ์นี้ปราศจากมัลแวร์หรือมีการตั้งค่าความปลอดภัยที่เหมาะสมก่อนอนุญาตให้เข้าถึงเครือข่ายภายใน',
    riskLabel: 'MEDIUM RISK',
    evidenceItems: [
      { k: 'D', label: 'Device', value: 'Personal Laptop — Unregistered' },
      { k: 'T', label: 'Target', value: 'Corporate VPN' }
    ],
    options: [
      { id: 'allow', title: 'อนุญาตให้เชื่อมต่อ VPN ได้ตามปกติ', desc: 'ไม่ตรวจสอบอุปกรณ์เพิ่มเติม', effect: 'อุปกรณ์ที่มีมัลแวร์อาจเข้าถึงเครือข่ายภายในได้ทันที', tag: 'dangerous' },
      { id: 'block-until-compliant', title: 'บล็อกไว้ก่อนจนกว่าจะลงทะเบียนและผ่านการตรวจสอบ Compliance', desc: 'ให้ลงทะเบียนอุปกรณ์และติดตั้งซอฟต์แวร์ป้องกันก่อนเข้าถึง', effect: 'มั่นใจได้ว่าอุปกรณ์ปลอดภัยก่อนเข้าเครือข่าย', tag: 'recommended' },
      { id: 'block-permanent', title: 'บล็อกอุปกรณ์ส่วนตัวทุกเครื่องถาวร', desc: 'ไม่อนุญาตอุปกรณ์ส่วนตัวเข้าระบบเลย', effect: 'กระทบพนักงานที่จำเป็นต้องใช้อุปกรณ์ส่วนตัวทำงาน', tag: 'acceptable' },
      { id: 'notify', title: 'แจ้งทีม Security เฉย ๆ', desc: 'บันทึกไว้แต่ยังอนุญาตให้เชื่อมต่อ', effect: 'อุปกรณ์ที่ไม่ปลอดภัยยังเข้าถึงเครือข่ายได้อยู่', tag: 'risky' }
    ],
    explanation: 'อุปกรณ์ที่ไม่เคยลงทะเบียนต้องถูกตรวจสอบและบล็อกไว้ก่อนเป็นค่าเริ่มต้น (Verify Explicitly) จนกว่าจะยืนยันได้ว่าปลอดภัยและลงทะเบียนถูกต้อง จึงจะอนุญาตให้เข้าถึงเครือข่ายภายใน'
  },
  {
    id: 12,
    name: 'Account Recovery',
    category: 'Identity',
    principle: 'Verify Explicitly',
    interaction: 'sequence',
    scenario:
      'ผู้ใช้งานติดต่อขอกู้คืนบัญชีของตนเองหลังจากทำอุปกรณ์ที่ใช้ยืนยันตัวตนสูญหาย ทีมสนับสนุนต้องตรวจสอบตัวตนที่แท้จริงของผู้ขอกู้คืนอย่างรอบคอบตามลำดับขั้นตอนที่ถูกต้อง เพื่อป้องกันไม่ให้ผู้แอบอ้างสวมรอยเข้ายึดบัญชี',
    riskLabel: 'MEDIUM RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'finance_lee' },
      { k: 'R', label: 'Request', value: 'Account Recovery — MFA Device Lost' }
    ],
    items: [
      { id: 'verify', label: 'ยืนยันตัวตนด้วยข้อมูลที่เฉพาะเจ้าของบัญชีเท่านั้นที่รู้' },
      { id: 'contact', label: 'ติดต่อยืนยันผ่านช่องทางสำรองที่ลงทะเบียนไว้ล่วงหน้า' },
      { id: 'reset', label: 'รีเซ็ต MFA และออกอุปกรณ์ยืนยันตัวตนใหม่' },
      { id: 'monitor', label: 'เฝ้าระวังบัญชีเป็นพิเศษหลังกู้คืน' },
      { id: 'log', label: 'บันทึกกระบวนการกู้คืนบัญชี' }
    ],
    idealOrder: ['verify', 'contact', 'reset', 'monitor', 'log'],
    explanation: 'ต้องยืนยันตัวตนด้วยข้อมูลเฉพาะตัวก่อน แล้วยืนยันซ้ำผ่านช่องทางสำรองที่ลงทะเบียนไว้ล่วงหน้า จึงค่อยรีเซ็ต MFA ให้ พร้อมเฝ้าระวังและบันทึกไว้ เพื่อป้องกันผู้แอบอ้างสวมรอยตาม Verify Explicitly'
  },
  {
    id: 13,
    name: 'Data Breach Response',
    category: 'Incident Response',
    principle: 'Continuous Monitoring',
    interaction: 'sequence',
    scenario:
      'มีการตรวจพบว่าข้อมูลส่วนบุคคลของลูกค้าจำนวนมากรั่วไหลออกจากระบบภายในองค์กร ทีม Security ต้องรับมือกับสถานการณ์วิกฤตนี้ตามลำดับขั้นตอนที่ถูกต้อง เพื่อจำกัดความเสียหาย แจ้งผู้เกี่ยวข้อง และป้องกันการรั่วไหลเพิ่มเติม',
    riskLabel: 'CRITICAL',
    evidenceItems: [
      { k: 'E', label: 'Event', value: 'Customer Data Leak Detected' },
      { k: 'V', label: 'Volume', value: '~40,000 records' }
    ],
    items: [
      { id: 'contain', label: 'ควบคุมและปิดกั้นช่องทางที่ข้อมูลรั่วไหลทันที' },
      { id: 'assess', label: 'ประเมินขอบเขตและประเภทข้อมูลที่รั่วไหล' },
      { id: 'notify', label: 'แจ้งผู้บริหารและหน่วยงานที่เกี่ยวข้องตามกฎหมาย' },
      { id: 'remediate', label: 'แก้ไขช่องโหว่ต้นเหตุของการรั่วไหล' },
      { id: 'report', label: 'จัดทำรายงานและสรุปบทเรียนหลังเหตุการณ์' }
    ],
    idealOrder: ['contain', 'assess', 'notify', 'remediate', 'report'],
    explanation: 'ต้องควบคุมความเสียหายให้เร็วที่สุดก่อน แล้วประเมินขอบเขตเพื่อแจ้งผู้เกี่ยวข้องตามกฎหมายให้ทันเวลา จากนั้นจึงแก้ไขต้นเหตุและสรุปบทเรียน เพื่อจำกัดผลกระทบและป้องกันเหตุซ้ำ (Continuous Monitoring)'
  },
  {
    id: 14,
    name: 'Risky Application Consent',
    category: 'Access',
    principle: 'Least Privilege',
    interaction: 'risk',
    scenario:
      'พนักงานกดยินยอม (Allow) ให้แอปพลิเคชันภายนอกที่ไม่รู้จักเข้าถึงข้อมูลอีเมลและไฟล์ขององค์กรโดยไม่ได้ตรวจสอบสิทธิ์ที่ขอก่อน ทำให้แอปดังกล่าวอาจดึงข้อมูลสำคัญออกจากระบบได้โดยไม่มีใครสังเกตเห็น',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'A', label: 'App', value: 'Unknown Third-Party App' },
      { k: 'S', label: 'Scope', value: 'Mail.Read, Files.ReadWrite.All' }
    ],
    riskLevels: [
      { id: 'low', label: 'ความเสี่ยงต่ำ' },
      { id: 'medium', label: 'ความเสี่ยงปานกลาง' },
      { id: 'high', label: 'ความเสี่ยงสูง' },
      { id: 'critical', label: 'เหตุการณ์วิกฤต' }
    ],
    correctRiskId: 'high',
    riskActions: [
      { id: 'r1', title: 'เพิกถอนสิทธิ์การเข้าถึงของแอปทันที' },
      { id: 'r2', title: 'ให้ผู้ใช้ยืนยันการยินยอมอีกครั้ง' },
      { id: 'r3', title: 'อนุญาตต่อไปแต่เฝ้าดูเฉย ๆ' }
    ],
    correctActionId: 'r1',
    explanation: 'แอปภายนอกที่ไม่รู้จักและได้รับสิทธิ์กว้างเกินจำเป็นต้องถูกเพิกถอนสิทธิ์ทันทีเมื่อพบ ตามหลัก Least Privilege — การปล่อยให้เข้าถึงต่อแม้จะเฝ้าดูก็ยังเปิดช่องให้ดึงข้อมูลออกไปได้อยู่ดี'
  },
  {
    id: 15,
    name: 'Abnormal Mass Download',
    category: 'Monitoring',
    principle: 'Continuous Monitoring',
    interaction: 'risk',
    scenario:
      'ระบบตรวจพบว่าบัญชีผู้ใช้รายหนึ่งดาวน์โหลดไฟล์จากระบบจัดเก็บข้อมูลขององค์กรเป็นจำนวนมากผิดปกติภายในเวลาอันสั้น ซึ่งไม่สอดคล้องกับพฤติกรรมการทำงานปกติ และอาจเป็นสัญญาณของการขโมยข้อมูลออกจากองค์กร',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'dev_min' },
      { k: 'V', label: 'Volume', value: '3,200 files ใน 4 นาที' }
    ],
    riskLevels: [
      { id: 'low', label: 'ความเสี่ยงต่ำ' },
      { id: 'medium', label: 'ความเสี่ยงปานกลาง' },
      { id: 'high', label: 'ความเสี่ยงสูง' },
      { id: 'critical', label: 'เหตุการณ์วิกฤต' }
    ],
    correctRiskId: 'high',
    riskActions: [
      { id: 'r1', title: 'ระงับบัญชีชั่วคราวและตรวจสอบการดาวน์โหลดทันที' },
      { id: 'r2', title: 'ส่งอีเมลแจ้งเตือนผู้ใช้เฉย ๆ' },
      { id: 'r3', title: 'ปล่อยผ่านเพราะ Credential ถูกต้อง' }
    ],
    correctActionId: 'r1',
    explanation: 'พฤติกรรมดาวน์โหลดจำนวนมากผิดปกติต้องถูกประเมินเป็นความเสี่ยงสูงและระงับบัญชีทันทีเพื่อตรวจสอบ ตามหลัก Continuous Monitoring — การเฝ้าระวังต้องนำไปสู่การตอบสนองที่รวดเร็วเมื่อพบสัญญาณผิดปกติ'
  },
  {
    id: 17,
    name: 'Fake IT Support Call',
    category: 'Social Engineering',
    principle: 'Verify Explicitly',
    interaction: 'single',
    scenario:
      'มีผู้โทรเข้ามาแอบอ้างว่าเป็นเจ้าหน้าที่ทีม IT ขององค์กร และขอให้พนักงานแจ้งรหัสผ่านหรือรหัส OTP เพื่อ "แก้ไขปัญหาระบบ" ซึ่งเป็นเทคนิค Social Engineering ที่ใช้หลอกให้เหยื่อเปิดเผยข้อมูลสำคัญด้วยตนเอง',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'sales_tan' },
      { k: 'C', label: 'Caller', value: 'อ้างว่าเป็น "IT Helpdesk"' }
    ],
    options: [
      { id: 'comply', title: 'บอกรหัสผ่าน/OTP ตามที่ขอ', desc: 'ให้ความร่วมมือเพราะผู้โทรอ้างว่าเป็นทีม IT', effect: 'ผู้โจมตีได้ Credential ไปใช้เข้าระบบทันที', tag: 'dangerous' },
      { id: 'verify-official', title: 'วางสายแล้วติดต่อกลับผ่านช่องทาง IT อย่างเป็นทางการเพื่อตรวจสอบ และแจ้งทีม Security', desc: 'ยืนยันตัวตนผู้โทรผ่านช่องทางที่เชื่อถือได้ก่อนเสมอ', effect: 'ป้องกันการหลอกลวงและช่วยให้ทีม Security รู้ทันแคมเปญนี้', tag: 'recommended' },
      { id: 'hangup', title: 'วางสายเฉย ๆ โดยไม่แจ้งใครต่อ', desc: 'ปฏิเสธไม่ให้ข้อมูลแต่ไม่รายงานเหตุการณ์', effect: 'ทีม Security ไม่รู้ว่ามีแคมเปญโจมตีลักษณะนี้เกิดขึ้น', tag: 'acceptable' },
      { id: 'partial', title: 'ให้ข้อมูลบางส่วนที่ดูไม่สำคัญไปก่อน', desc: 'คิดว่าให้ข้อมูลเล็กน้อยไม่น่าเป็นปัญหา', effect: 'ผู้โจมตีอาจใช้ข้อมูลบางส่วนประกอบการโจมตีต่อได้', tag: 'risky' }
    ],
    explanation: 'ต้องยืนยันตัวตนของผู้ติดต่อผ่านช่องทางที่เป็นทางการเสมอก่อนให้ข้อมูลใด ๆ (Verify Explicitly) และแจ้งทีม Security ทันทีเพื่อเฝ้าระวังแคมเปญ Social Engineering ที่อาจกำลังโจมตีคนอื่นในองค์กรด้วย'
  },
  {
    id: 18,
    name: 'Privileged Account Misuse',
    category: 'Access',
    principle: 'Least Privilege',
    interaction: 'multi',
    scenario:
      'บัญชี Admin ที่มีสิทธิ์สูงถูกใช้งานเข้าถึงระบบในช่วงเวลานอกเวลาทำการ และเข้าถึงระบบที่ไม่เกี่ยวข้องกับหน้าที่ความรับผิดชอบตามปกติของผู้ใช้บัญชีนี้ ซึ่งอาจบ่งชี้ว่าบัญชีถูกนำไปใช้ในทางที่ผิดหรือถูกยึดควบคุมโดยผู้ไม่หวังดี',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'U', label: 'User', value: 'admin_it02' },
      { k: 'T', label: 'Time', value: '03:20 น. (นอกเวลาทำการ)' }
    ],
    requiredCount: 3,
    options: [
      { id: 'm1', title: 'ยกเลิกสิทธิ์ Admin ที่ไม่ได้ใช้งานจริงออกทันที' },
      { id: 'm2', title: 'เปลี่ยนเป็น Just-In-Time Access ที่ต้องขออนุมัติก่อนใช้สิทธิ์สูง' },
      { id: 'm3', title: 'เปิดการบันทึก Session (Session Recording) สำหรับบัญชีสิทธิ์สูงทุกครั้ง' },
      { id: 'm4', title: 'คงสิทธิ์ Admin แบบถาวรไว้เพื่อความสะดวกในการทำงาน' },
      { id: 'm5', title: 'เพิ่มขั้นตอนอนุมัติก่อนทำ Action สำคัญของบัญชีสิทธิ์สูง' }
    ],
    correctIds: ['m1', 'm2', 'm3'],
    explanation: 'บัญชีสิทธิ์สูงต้องถูกจำกัดให้เหลือเท่าที่จำเป็น เปลี่ยนเป็นการขอสิทธิ์ชั่วคราวแบบ Just-In-Time และมีการบันทึก Session ไว้ตรวจสอบได้เสมอ ตามหลัก Least Privilege — การคงสิทธิ์ถาวรไว้เพื่อความสะดวกคือความเสี่ยงที่ไม่จำเป็น'
  },
  {
    id: 19,
    name: 'Third-Party API Breach',
    category: 'Monitoring',
    principle: 'Continuous Monitoring',
    interaction: 'risk',
    scenario:
      'ระบบของ Partner ภายนอกที่เชื่อมต่อกับองค์กรผ่าน API ถูกโจมตีและอาจถูกใช้เป็นช่องทางเข้าถึงข้อมูลหรือระบบขององค์กรทางอ้อม แม้ว่าระบบภายในขององค์กรเองจะยังไม่ถูกเจาะโดยตรงก็ตาม',
    riskLabel: 'HIGH RISK',
    evidenceItems: [
      { k: 'P', label: 'Partner', value: 'Third-Party Logistics API' },
      { k: 'S', label: 'Status', value: 'Partner confirmed breach' }
    ],
    riskLevels: [
      { id: 'low', label: 'ความเสี่ยงต่ำ' },
      { id: 'medium', label: 'ความเสี่ยงปานกลาง' },
      { id: 'high', label: 'ความเสี่ยงสูง' },
      { id: 'critical', label: 'เหตุการณ์วิกฤต' }
    ],
    correctRiskId: 'high',
    riskActions: [
      { id: 'r1', title: 'หมุนเวียน/เพิกถอน API Key ที่ใช้กับ Partner รายนี้ทันที' },
      { id: 'r2', title: 'รอให้ Partner ยืนยันความเสียหายก่อนดำเนินการใด ๆ' },
      { id: 'r3', title: 'ใช้งานตามปกติเพราะระบบภายในยังไม่ถูกเจาะ' }
    ],
    correctActionId: 'r1',
    explanation: 'เมื่อ Partner ที่เชื่อมต่อผ่าน API ถูกเจาะ ต้องหมุนเวียนหรือเพิกถอน API Key ที่ใช้ร่วมกันทันทีโดยไม่ต้องรอ เพื่อตัดช่องทางที่ผู้โจมตีอาจใช้เจาะเข้ามาทางอ้อม ตามหลัก Continuous Monitoring'
  },
  {
    id: 20,
    name: 'Shadow IT Discovery',
    category: 'Device',
    principle: 'Least Privilege',
    interaction: 'multi',
    scenario:
      'ทีม Security ตรวจพบว่าทีมงานบางส่วนในองค์กรใช้แอปพลิเคชัน Cloud ของบุคคลที่สามที่ไม่ได้รับการอนุมัติจากฝ่าย IT ในการจัดเก็บและแบ่งปันข้อมูลของบริษัท ทำให้ข้อมูลอยู่นอกการควบคุมและมาตรการป้องกันขององค์กร',
    riskLabel: 'MEDIUM RISK',
    evidenceItems: [
      { k: 'A', label: 'App', value: 'Unapproved Cloud Storage App' },
      { k: 'T', label: 'Team', value: 'Marketing (12 users)' }
    ],
    requiredCount: 3,
    options: [
      { id: 'm1', title: 'บล็อกการใช้งานแอปที่ไม่ได้รับอนุมัติ' },
      { id: 'm2', title: 'จัดหาทางเลือกที่ได้รับอนุมัติให้ทีมงานใช้แทน' },
      { id: 'm3', title: 'ตรวจสอบข้อมูลที่ถูกอัปโหลดไปแล้วบนแอปนั้น' },
      { id: 'm4', title: 'ปล่อยผ่านเพราะช่วยให้ทีมงานทำงานได้เร็วขึ้น' },
      { id: 'm5', title: 'กำหนดขั้นตอนขออนุมัติ IT ก่อนใช้เครื่องมือ Cloud ใหม่ในอนาคต' }
    ],
    correctIds: ['m1', 'm2', 'm3'],
    explanation: 'ต้องบล็อกแอปที่ไม่ได้รับอนุมัติ จัดหาทางเลือกที่ปลอดภัยให้ใช้แทน และตรวจสอบข้อมูลที่หลุดออกไปแล้วบนแอปนั้น ตามหลัก Least Privilege — การปล่อยผ่านเพียงเพราะสะดวกทำให้ข้อมูลองค์กรอยู่นอกการควบคุมต่อไป'
  }
];

function buildRoundPool(missionIds) {
  const byId = new Map(MISSIONS.map((m) => [m.id, m]));
  const rounds = missionIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((m) => ({ ...m, recTime: RECOMMENDED_TIME[m.interaction] }));
  rounds.push({ ...FINAL_ATTACK_MISSION, recTime: RECOMMENDED_TIME.defense });
  return rounds;
}

// Strip fields that would leak the correct answer to players.
function publicMission(mission) {
  const { correctIds, correctRiskId, correctActionId, idealOrder, explanation, ...rest } = mission;
  if (rest.options) {
    rest.options = rest.options.map(({ tag, ...o }) => o);
  }
  if (rest.items) {
    rest.items = rest.items.map((i) => ({ ...i }));
  }
  return rest;
}

function scoreAnswer(mission, answer) {
  switch (mission.interaction) {
    case 'single': {
      const opt = (mission.options || []).find((o) => o.id === answer?.optionId);
      const POINTS = { recommended: 100, acceptable: 60, risky: 30, dangerous: 10 };
      const points = opt ? POINTS[opt.tag] ?? 0 : 0;
      return { points, choiceText: opt ? opt.title : '—', correct: opt ? opt.tag === 'recommended' : false };
    }
    case 'multi': {
      const selected = Array.isArray(answer?.selectedIds) ? answer.selectedIds : [];
      const correctSet = new Set(mission.correctIds);
      const matched = selected.filter((id) => correctSet.has(id)).length;
      const points = Math.round((matched / mission.correctIds.length) * 100);
      const titles = (mission.options || []).filter((o) => selected.includes(o.id)).map((o) => o.title);
      return { points, choiceText: titles.join(', ') || '—', correct: matched === mission.correctIds.length && selected.length === mission.correctIds.length };
    }
    case 'sequence': {
      const order = Array.isArray(answer?.order) ? answer.order : [];
      const ideal = mission.idealOrder;
      const matches = order.filter((id, idx) => id === ideal[idx]).length;
      const points = Math.round((matches / ideal.length) * 100);
      return { points, choiceText: `เรียงถูก ${matches} / ${ideal.length} ขั้นตอน`, correct: matches === ideal.length };
    }
    case 'risk': {
      const riskOk = answer?.riskId === mission.correctRiskId;
      const actionOk = answer?.actionId === mission.correctActionId;
      const points = (riskOk ? 50 : 0) + (actionOk ? 50 : 0);
      const riskLabel = (mission.riskLevels.find((r) => r.id === answer?.riskId) || {}).label || '—';
      const actionLabel = (mission.riskActions.find((r) => r.id === answer?.actionId) || {}).title || '—';
      return { points, choiceText: `${riskLabel} → ${actionLabel}`, correct: riskOk && actionOk };
    }
    case 'defense': {
      const answers = (answer && answer.layers) || {};
      const layers = mission.layers || [];
      const deployedIds = [];
      for (const layer of layers) {
        const a = answers[layer.id] || {};
        const qOk = (layer.options || []).some((o) => o.id === a.qId && o.correct);
        const setupOk = (layer.setupOptions || []).some((o) => o.id === a.setupQId && o.correct);
        if (qOk && setupOk) deployedIds.push(layer.id);
      }
      const points = layers.length ? Math.round((deployedIds.length / layers.length) * 100) : 0;
      return {
        points,
        choiceText: `ปลดล็อกได้ ${deployedIds.length} / ${layers.length} มาตรการ`,
        correct: deployedIds.length === layers.length,
        deployedIds
      };
    }
    default:
      return { points: 0, choiceText: '—', correct: false };
  }
}

function recommendedSummary(mission) {
  switch (mission.interaction) {
    case 'single':
      return (mission.options.find((o) => o.tag === 'recommended') || {}).title || '—';
    case 'multi':
      return mission.options.filter((o) => mission.correctIds.includes(o.id)).map((o) => o.title).join(', ');
    case 'sequence':
      return mission.idealOrder.map((id) => (mission.items.find((i) => i.id === id) || {}).label).join(' → ');
    case 'risk': {
      const riskLabel = (mission.riskLevels.find((r) => r.id === mission.correctRiskId) || {}).label;
      const actionLabel = (mission.riskActions.find((r) => r.id === mission.correctActionId) || {}).title;
      return `${riskLabel} → ${actionLabel}`;
    }
    case 'defense':
      return `ปลดล็อกครบทั้ง ${(mission.layers || []).length} มาตรการ`;
    default:
      return '—';
  }
}

module.exports = { MISSIONS, RECOMMENDED_TIME, buildRoundPool, publicMission, scoreAnswer, recommendedSummary };
