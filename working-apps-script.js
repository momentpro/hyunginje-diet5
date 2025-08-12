// ✅ 작동하는 Google Apps Script 코드
// 이 코드를 https://script.google.com 에서 새 프로젝트를 만들어 붙여넣고 배포하세요.

function doPost(e) {
  try {
    // 🔐 실제 시트 ID로 교체하세요
    const SHEET_ID = '1Cz6LhDOLq412AmCzSHxcfGJinKTCqgRGVfLEyLp8re8';
    
    // JSON 데이터 파싱
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      data = e.parameter;
    }
    
    console.log('받은 데이터:', data);
    
    // 구글 시트에 데이터 저장
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName('설문응답');
    
    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet('설문응답');
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
      
      // 헤더 스타일링
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setWrap(true);
    }
    
    // 데이터를 행으로 변환
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = [];
    
    headers.forEach(header => {
      const value = data[header] || '';
      newRow.push(value);
    });
    
    // 새 행 추가
    sheet.appendRow(newRow);
    const rowNumber = sheet.getLastRow();
    
    console.log(`데이터가 ${rowNumber}번째 행에 저장되었습니다.`);
    
    // 열 너비 자동 조정
    sheet.autoResizeColumns(1, headers.length);
    
    // Google Chat 알림 전송 (선택사항)
    sendNotification(data, rowNumber);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '데이터가 성공적으로 저장되었습니다.',
      timestamp: new Date().toISOString(),
      rowNumber: rowNumber
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('오류 발생:', error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '데이터 저장 중 오류가 발생했습니다: ' + error.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 알림 전송 함수 (선택사항)
function sendNotification(data, rowNumber) {
  try {
    // 🔐 실제 Google Chat Webhook URL로 교체하세요
    const WEBHOOK_URL = 'https://chat.googleapis.com/v1/spaces/AAQA54l4mJw/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=yx9l89LGSXgZQnen1eZddb_WoKRvuim1bHUVbHyV15w';
    
    const currentTime = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
    const customerName = data['이름'] || '이름 없음';
    const customerPhone = data['휴대폰 번호'] || '미입력';
    
    const message = {
      text: `🏥 *형인재 감량비책 새로운 설문 응답*\n\n` +
            `📅 *제출시간:* ${currentTime}\n` +
            `👤 *이름:* ${customerName}\n` +
            `📞 *전화번호:* ${customerPhone}\n\n` +
            `📊 구글 시트 ${rowNumber}번째 행에 저장되었습니다.`
    };
    
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      payload: JSON.stringify(message)
    });
    
    console.log('알림 전송 완료:', response.getContentText());
  } catch (error) {
    console.error('알림 전송 실패:', error);
  }
}
