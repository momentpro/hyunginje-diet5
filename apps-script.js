// Google Apps Script 코드 - 구글 시트 자동 저장 + Google Chat 알림
// 이 코드를 https://script.google.com 에서 새 프로젝트를 만들어 붙여넣고 배포하세요.

function doPost(e) {
  try {
    // 시트 ID (실제 구글 시트 ID)
    const SHEET_ID = '1HHpMjj3I_7eCm8Ce3tVjj-68JwUUfcO7X5hed5dsXLA';
    
    // Google Chat Webhook URL (실제 webhook URL로 교체 필요)
    const GOOGLE_CHAT_WEBHOOK = 'https://chat.googleapis.com/v1/spaces/YOUR_SPACE_ID/messages?key=YOUR_KEY&token=YOUR_TOKEN';
    
    // JSON 데이터 파싱
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      // URL 인코딩된 데이터 처리
      data = e.parameter;
    }
    
    // 시트 열기
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName('시트1');
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet('시트1');
    }
    
    // 헤더 행이 없으면 생성
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
      
      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#d4af8c');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setWrap(true);
    }
    
    // 헤더 행 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 새 행 데이터 준비
    const newRow = [];
    
    // 각 헤더에 해당하는 데이터 찾기
    headers.forEach(header => {
      const value = data[header] || '';
      newRow.push(value);
    });
    
    // 새 행 추가
    sheet.appendRow(newRow);
    const rowNumber = sheet.getLastRow();
    
    // 자동 크기 조정
    sheet.autoResizeColumns(1, headers.length);
    
    // Google Chat 알림 전송
    sendGoogleChatNotification(data, rowNumber);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '데이터가 성공적으로 저장되었습니다.',
        timestamp: new Date().toISOString(),
        rowNumber: rowNumber
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '데이터 저장 중 오류가 발생했습니다: ' + error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Google Chat 알림 전송 함수
function sendGoogleChatNotification(data, rowNumber) {
  try {
    // Google Chat Webhook URL을 설정하세요
    const GOOGLE_CHAT_WEBHOOK = 'YOUR_GOOGLE_CHAT_WEBHOOK_URL';
    
    // 만약 webhook URL이 설정되지 않았으면 알림을 보내지 않음
    if (GOOGLE_CHAT_WEBHOOK === 'YOUR_GOOGLE_CHAT_WEBHOOK_URL') {
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
            `🔗 *구글 시트 보기:* https://docs.google.com/spreadsheets/d/1HHpMjj3I_7eCm8Ce3tVjj-68JwUUfcO7X5hed5dsXLA/edit`
    };
    
    // Google Chat으로 메시지 전송
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

// Slack 알림 전송 함수 (추가 옵션)
function sendSlackNotification(data, rowNumber) {
  try {
    // Slack Webhook URL을 설정하세요
    const SLACK_WEBHOOK = 'YOUR_SLACK_WEBHOOK_URL';
    
    if (SLACK_WEBHOOK === 'YOUR_SLACK_WEBHOOK_URL') {
      console.log('Slack Webhook URL이 설정되지 않았습니다.');
      return;
    }
    
    const currentTime = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
    const customerName = data['이름'] || '이름 없음';
    const customerGender = data['성별'] || '미입력';
    const customerAge = data['나이'] || '미입력';
    const customerPhone = data['휴대폰 번호'] || '미입력';
    
    const message = {
      text: `🏥 형인재 감량비책 새로운 설문 응답`,
      attachments: [{
        color: 'good',
        fields: [
          { title: '제출시간', value: currentTime, short: true },
          { title: '이름', value: customerName, short: true },
          { title: '성별', value: customerGender, short: true },
          { title: '나이', value: `${customerAge}세`, short: true },
          { title: '전화번호', value: customerPhone, short: false }
        ]
      }]
    };
    
    const response = UrlFetchApp.fetch(SLACK_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(message)
    });
    
    console.log('Slack 알림 전송 완료:', response.getContentText());
    
  } catch (error) {
    console.error('Slack 알림 전송 실패:', error);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: '형인재 감량비책 설문지 데이터 수집 API가 정상 작동 중입니다.',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 테스트 함수
function testFunction() {
  const testData = {
    '제출일시': new Date().toLocaleString('ko-KR'),
    '이름': '테스트 사용자',
    '휴대폰 번호': '010-1234-5678',
    '이메일': 'test@example.com',
    '성별': '여성',
    '나이': '30'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
