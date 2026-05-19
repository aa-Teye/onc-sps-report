function sendScheduledReminders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('SPS Settings');
  if (!sheet) return;
  
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) settings[data[i][0]] = data[i][1];
  }
  
  var enabled = settings['REMINDER_ENABLED'] === 'true';
  if (!enabled) return;
  
  var days = (settings['REMINDER_DAYS'] || 'Monday,Wednesday,Friday').split(',');
  var today = new Date().toLocaleDateString('en-GB', {weekday: 'long'});
  if (days.indexOf(today) === -1) return;
  
  var message = settings['REMINDER_MESSAGE'] || 
    'Hi {name}! Please submit your SPS report today. Link: https://aa-teye.github.io/onc-sps-report/';
  
  // Get contacts from settings
  var contactsStr = settings['SHEPHERD_CONTACTS'] || '{}';
  var contacts = JSON.parse(contactsStr);
  
  var shepherds = [
    {name: "Frank Armah", contact: "55687544"},
    {name: "Bright Mamene", contact: "546024584"},
    {name: "Christiana Konzondong", contact: ""},
    {name: "Gloria Owusu Ansah", contact: "598427368"},
    {name: "Linda Neequaye", contact: "204752124"},
    {name: "Abena Achia", contact: ""},
    {name: "Gloria Lartey", contact: ""},
    {name: "Priscilla Sedi Anatsui", contact: ""},
    {name: "Abigail Akakpo", contact: "246807808"},
    {name: "LP. Sophia Korkor", contact: "236929939"},
    {name: "Wisdom Akakpo", contact: "246461508"},
    {name: "Cyril Amevor", contact: "246038534"},
    {name: "Mr. Ebenezer Okronipa", contact: ""},
    {name: "Solomon Aziakah", contact: ""},
    {name: "Deborah Otumfuor", contact: "203219321"},
    {name: "Christable Arhin", contact: "530415531"},
    {name: "Patience Addo", contact: ""},
    {name: "Benjamin Armah Agyeman", contact: "204027587"},
    {name: "Martha Asiamah", contact: ""},
    {name: "Shine Asinyo", contact: ""},
    {name: "Patience Mensah", contact: "208003701"},
    {name: "Ruth Yeboah", contact: ""}
  ];
  
  shepherds.forEach(function(s) {
    var contact = contacts[s.name] || {};
    var number = contact.number || s.contact;
    if (typeof contact === 'string') number = contact; // backward compat
    var apiKey = contact.apiKey || '';
    if (!number || !apiKey) return;
    
    var personalMessage = message.replace('{name}', s.name.split(' ')[0]);
    var url = 'https://api.callmebot.com/whatsapp.php?phone=' + 
              number + '&text=' + encodeURIComponent(personalMessage) + 
              '&apikey=' + apiKey;
    try {
      UrlFetchApp.fetch(url);
      Logger.log('Reminder sent to ' + s.name);
    } catch(e) {
      Logger.log('Failed to send to ' + s.name + ': ' + e);
    }
  });
}

function setupTrigger() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers().forEach(function(t) {
    ScriptApp.deleteTrigger(t);
  });
  
  // Create new daily trigger at 6pm
  ScriptApp.newTrigger('sendScheduledReminders')
    .timeBased()
    .everyDays(1)
    .atHour(18)
    .create();
    
  Logger.log('Trigger set up successfully');
}
