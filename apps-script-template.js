// Google Apps Script 코드 - 구글 시트 자동 저장 + Google Chat 알림
// 이 코드를 https://script.google.com 에서 새 프로젝트를 만들어 붙여넣고 배포하세요.

function doPost(e) {
  try {
    // 🔒 보안: 실제 배포 시 아래 값들을 입력하세요
    const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';
    const GOOGLE_CHAT_WEBHOOK = 'YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE';
    
    // JSON 데이터 파싱
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      data = e.parameter;
    }
    
    // 구글 시트에 데이터 저장
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName('시트1');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('시트1');
    }
    
    // 헤더가 없으면 생성
    if (sheet.getLastRow() === 0) {
      const headers = [
        '제출일시', '이름', '휴대폰 번호', '이메일', '성별', '나이', '신체 정보', '임신 계획',
        '1. 소화 상태', '2-1. 배변 상태', '2-2. 배변 횟수', '2-3. 대변 성상', '2-4. 배뇨 상태',
        '3. 수면 상태', '3-1. 수면 시간대', '3-2. 취침/기상 시간',
        '4. 부종 부위', '4-1. 부종 시간대', '4-2. 부종 원인',
        '5. 생리 주기', '5-1. 마지막 생리일', '5-2. 생리 증상',
        '6. 통증', '7. 피로/무기력', '8. 병력', '8-1. 수술 경험',
        '9. 복용 약물/보조제', '10. 운동 습관', '10-1. 운동 패턴',
        '11. 최근 10년 평균 체중', '11-1. 최근 1년 평균 체중', '11-2. 과거 체중 변화', '11-3. 최근 체중 변화',
        '12. 성공한 다이어트 경험', '12-1. 최근 다이어트 경험', '12-2. 다이어트 어려움/부작용',
        '13. 다이어트 목표', '13-1. 사이즈 감소 희망 부위', '13-2. 다이어트 목적',
        '14. 식이습관', '14-1. 문제 식이 패턴',
        '15. 평균 식사 정보', '15-1. 아침식사', '15-2. 점심식사', '15-3. 저녁식사',
        '16. 간식 습관', '16-1. 간식 섭취 횟수', '16-2. 즐겨먹는 간식/야식',
        '17. 음주 습관', '17-1. 음주 횟수', '17-2. 음주량',
        '18. 물 섭취량', '19. 커피 섭취량', '19-1. 커피 영향', '개인정보 동의'
      ];
      sheet.appendRow(headers);
      
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#d4af8c');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setWrap(true);
    }
    
    // 데이터 추가
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = [];
    headers.forEach(header => {
      const value = data[header] || '';
      newRow.push(value);
    });
    
    sheet.appendRow(newRow);
    const rowNumber = sheet.getLastRow();
    
    // 열 너비 자동 조정
    sheet.autoResizeColumns(1, headers.length);
    
    // Google Chat 알림 전송
    sendGoogleChatNotification(data, rowNumber);
    
    // Gmail 알림 전송
    sendGmailNotification(data, rowNumber);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '데이터가 성공적으로 저장되었습니다.',
      timestamp: new Date().toISOString(),
      rowNumber: rowNumber
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '데이터 저장 중 오류가 발생했습니다: ' + error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Google Chat 알림 전송 함수
function sendGoogleChatNotification(data, rowNumber) {
  try {
    // 🔒 보안: 실제 배포 시 여기에 웹훅 URL을 입력하세요
    const GOOGLE_CHAT_WEBHOOK = 'YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE';
    
    if (GOOGLE_CHAT_WEBHOOK === 'YOUR_GOOGLE_CHAT_WEBHOOK_URL_HERE') {
      console.log('Google Chat Webhook URL이 설정되지 않았습니다.');
      return;
    }
    
    // 알림 메시지 생성
    const currentTime = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
    const customerName = data['이름'] || '이름 없음';
    const customerGender = data['성별'] || '미입력';
    const customerAge = data['나이'] || '미입력';
    const customerPhone = data['휴대폰 번호'] || '미입력';
    const customerEmail = data['이메일'] || '미입력';
    
    const message = {
      text: `🏥 *형인재 감량비책 새로운 설문 응답*\n\n` +
            `📅 *제출시간:* ${currentTime}\n` +
            `👤 *이름:* ${customerName}\n` +
            `⚧️ *성별:* ${customerGender}\n` +
            `🎂 *나이:* ${customerAge}세\n` +
            `📞 *전화번호:* ${customerPhone}\n` +
            `📧 *이메일:* ${customerEmail}\n\n` +
            `📊 구글 시트 ${rowNumber}번째 행에 저장되었습니다.\n\n` +
            `🔗 *구글 시트 보기:* https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`
    };
    
    const response = UrlFetchApp.fetch(GOOGLE_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      payload: JSON.stringify(message)
    });
    
    console.log('Google Chat 알림 전송 완료:', response.getContentText());
  } catch (error) {
    console.error('Google Chat 알림 전송 실패:', error);
  }
}

// Gmail 알림 전송 함수
function sendGmailNotification(data, rowNumber) {
  try {
    const currentTime = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
    const customerName = data['이름'] || '이름 없음';
    const customerGender = data['성별'] || '미입력';
    const customerAge = data['나이'] || '미입력';
    const customerPhone = data['휴대폰 번호'] || '미입력';
    const customerEmail = data['이메일'] || '미입력';
    
    const subject = `🏥 형인재 감량비책 새로운 설문 응답 - ${customerName}`;
    
    const htmlBody = `
      <h2>🏥 형인재 감량비책 새로운 설문 응답</h2>
      <table border="1" style="border-collapse: collapse; width: 100%; max-width: 500px;">
        <tr><td><b>📅 제출시간</b></td><td>${currentTime}</td></tr>
        <tr><td><b>👤 이름</b></td><td>${customerName}</td></tr>
        <tr><td><b>⚧️ 성별</b></td><td>${customerGender}</td></tr>
        <tr><td><b>🎂 나이</b></td><td>${customerAge}세</td></tr>
        <tr><td><b>📞 전화번호</b></td><td>${customerPhone}</td></tr>
        <tr><td><b>📧 이메일</b></td><td>${customerEmail}</td></tr>
        <tr><td><b>📊 저장 위치</b></td><td>구글 시트 ${rowNumber}번째 행</td></tr>
      </table>
      <br>
      <p><a href="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit" target="_blank">📊 구글 시트에서 전체 데이터 보기</a></p>
    `;
    
    // 🔒 보안: 실제 배포 시 이메일 주소를 변경하세요
    GmailApp.sendEmail(
      'YOUR_EMAIL@gmail.com', // 받을 이메일 주소
      subject,
      '',
      {
        htmlBody: htmlBody,
        name: '형인재 감량비책 알림 시스템'
      }
    );
    
    console.log('Gmail 알림 전송 완료');
  } catch (error) {
    console.error('Gmail 알림 전송 실패:', error);
  }
}
