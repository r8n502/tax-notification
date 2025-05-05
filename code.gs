const SHEET_URL = "ENTER GOOGLE SPREAD SHEET URL";
const SHEET_NAME = "ENTER SHEET NAME";
const WEBHOOK_URL = "ENTER WEBHOOK URL";


function checkTaxDeadlinesAndNotify() {
  const sheet = SpreadsheetApp
    .openByUrl(SHEET_URL)
    .getSheetByName(SHEET_NAME);

  const data = sheet.getRange(2, 1, sheet.getLastRow() -1, sheet.getLastColumn()).getValues();

  const today = new Date();

  const webhookUrl = WEBHOOK_URL;

  for (let i = 0; i < data.length; i++) {
    if(data[i][0]) {
      const id = data[i][0];
      const taxItem = data[i][1];
      const deadlineDate = new Date(data[i][2]);
      const amount = data[i][3];
      const paymentDate = data[i][4];
      const notificationDate = data[i][5];

      if(!paymentDate){
        const twoweeksBefore = new Date(deadlineDate);
        twoweeksBefore.setDate(twoweeksBefore.getDate() - 14);
        
        if(today >= twoweeksBefore && today) {
          const message = `Tax payment deadlines are approaching. \n` +
            `Tax Item : ${taxItem}\n` +
            `Deadline : ${formatDate(deadlineDate)}\n` +
            `Tax Amount: ${formatCurrency(amount)}\n` +
            `Only ${daysBetween(today, deadlineDate)} days left until the deadline.`
          sendDiscordNotification(webhookUrl, message);

          sheet.getRange(i + 2, 6).setValue(today);
          Logger.log(`Sent notification of ID ${id}'s tax item ${taxItem}`);
        }
      }
    }
  }
}

// 日付をフォーマット (YYYY/MM/DD)
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd");
}

// 金額をカンマ区切りでフォーマット
function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 2つの日付の間の日数を計算
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // ミリ秒単位での1日
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

// Discordに通知を送信
function sendDiscordNotification(webhookUrl, message) {
  const payload = {
    "content": message
  };
  
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(webhookUrl, options);
}
