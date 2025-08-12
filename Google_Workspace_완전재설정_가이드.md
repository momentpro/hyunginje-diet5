# 🚀 Google Workspace 계정으로 완전 재설정 가이드

## 📊 **1단계: 새 구글 시트 생성**

### **Google Workspace 계정으로 로그인 후:**
1. **https://sheets.google.com** 접속
2. **"새 스프레드시트"** 클릭
3. 제목: **"형인재 감량비책 설문 응답"**
4. **공유** → **"링크가 있는 모든 사용자"** (보기 권한)

### **시트 ID 복사:**
- URL: `https://docs.google.com/spreadsheets/d/[시트ID]/edit`
- **[시트ID]** 부분을 복사해두세요

---

## 🔧 **2단계: Apps Script 프로젝트 생성 (새 계정)**

1. **https://script.google.com** 접속 (새 Google Workspace 계정으로)
2. **"새 프로젝트"** 클릭
3. 프로젝트 이름: **"형인재 설문지 연동"**
4. **Code.gs** 파일에 `apps-script.js` 내용 붙여넣기

### **중요! 코드에서 3곳 수정:**

#### **1) 시트 ID 변경 (7번째 줄):**
```javascript
const SHEET_ID = 'NEW_GOOGLE_WORKSPACE_SHEET_ID_HERE';
```
👆 여기에 복사한 시트 ID 입력

#### **2) 이메일 주소 변경 (227번째 줄):**
```javascript
'momentpro7@gmail.com', // 여기를 새 계정 이메일로 변경
```

#### **3) Google Chat Webhook URL (추후 설정):**
```javascript
const GOOGLE_CHAT_WEBHOOK = 'YOUR_GOOGLE_CHAT_WEBHOOK_URL';
```

---

## 📱 **3단계: Google Chat 설정**

### **Google Chat에서:**
1. **"+ 스페이스 만들기"** 클릭
2. 스페이스 이름: **"형인재 설문 알림"**
3. **스페이스 생성** 클릭

### **웹훅 추가:**
1. 스페이스 이름 옆 **화살표** 클릭
2. **"앱 및 통합 관리"** 선택
3. **"웹훅 추가"** 클릭 ✅ (이제 활성화됨!)
4. 웹훅 이름: **"설문 알림"**
5. **Webhook URL 복사**

### **Apps Script에 URL 적용:**
```javascript
const GOOGLE_CHAT_WEBHOOK = '복사한_webhook_URL';
```

---

## 🚀 **4단계: 배포**

1. **Apps Script에서 "배포" → "새 배포"**
2. 유형: **"웹앱"**
3. 실행 계정: **"나"**
4. 액세스 권한: **"모든 사용자"**
5. **배포** 클릭
6. **웹앱 URL 복사**

---

## 📝 **5단계: 설문지 URL 업데이트**

**index.html 파일 2181번째 줄:**
```javascript
const scriptURL = '새로_배포된_Apps_Script_URL';
```

---

## ✅ **최종 체크리스트**

- [ ] 새 Google Workspace 계정 로그인
- [ ] 새 구글 시트 생성 및 ID 복사
- [ ] Apps Script 프로젝트 생성
- [ ] 시트 ID 코드에 적용
- [ ] 이메일 주소 변경
- [ ] Google Chat 스페이스 생성
- [ ] 웹훅 URL 생성 및 적용
- [ ] Apps Script 배포
- [ ] 설문지에 새 URL 적용

---

## 🎯 **완료 후 테스트**

1. **설문지 테스트 제출**
2. **구글 시트에 데이터 저장 확인**
3. **Google Chat 알림 확인**
4. **Gmail 알림 확인**

---

## 📧 **받게 될 알림 예시**

### **Google Chat:**
```
🏥 형인재 감량비책 새로운 설문 응답

📅 제출시간: 2024-01-15 14:30:25
👤 이름: 홍길동
⚧️ 성별: 남성
🎂 나이: 30세
📞 전화번호: 010-1234-5678
📧 이메일: hong@email.com

📊 구글 시트 15번째 행에 저장되었습니다.
```

### **Gmail:**
- 예쁜 HTML 표 형태
- 구글 시트 직접 링크 포함
- 모바일에서도 깔끔하게 표시

이제 Google Workspace의 모든 기능을 활용할 수 있습니다! 🚀✨
