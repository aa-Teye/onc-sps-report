// ============================================================
// ONC SPS — Google Apps Script Backend v4.0
// Merged: Core v3.6 + Sprint 1 (Discipleship Journey, Flags, Schools)
// ============================================================

const SHEET_NAME                    = 'SPS Reports';
const SETTINGS_SHEET                = 'SPS Settings';
const LOG_SHEET                     = 'SPS Audit Log';
const MC_SHEET_NAME                 = 'Microchurch Reports';
const FIRST_TIMERS_SHEET            = 'First Timers';
const SALVATION_SHEET_NAME          = 'Salvation Records';
const PINS_SHEET                    = 'Shepherd PINs';
const ANNOUNCEMENTS_SHEET           = 'Announcements';
const PASTORAL_NOTES_SHEET          = 'PastoralNotes';
const DISCIPLESHIP_ASSIGNMENTS_SHEET = 'DiscipleshipAssignments';
const SHEPHERD_PIPELINE_SHEET       = 'ShepherdPipeline';
const SHEPHERD_COHORTS_SHEET        = 'ShepherdCohorts';
const SUNDAY_ATTENDANCE_SHEET       = 'SundayAttendance';
const SUNDAY_SUMMARY_SHEET          = 'SundaySummary';
const VISITATIONS_SHEET             = 'Visitations';
const SHEPHERDS_SHEET               = 'Shepherds';

// ============================================================
// HTTP HANDLERS
// ============================================================

function doPost(e) {
  try {
    // Telegram webhook updates are posted with our action in the query
    // string (Telegram controls the POST body format, not us).
    if (e.parameter && e.parameter.action === 'telegramWebhook') {
      return handleTelegramWebhook(JSON.parse(e.postData.contents));
    }

    const data   = JSON.parse(e.postData.contents);
    const action = data.action || 'submitReport';

    if (action === 'submitReport')            return submitReport(data);
    if (action === 'saveTopic')               return saveBibleTopic(data);
    if (action === 'saveReminder')            return saveReminderSettings(data);
    if (action === 'submitMicrochurchReport') return submitMicrochurchReport(data);
    if (action === 'submitGuestForm')         return submitGuestForm(data);
    if (action === 'submitSalvationForm')     return submitSalvationForm(data);
    if (action === 'submitFellowshipMember')  return submitFellowshipMember(data);
    if (action === 'submitSeekerSelfSignup')  return submitSeekerSelfSignup(data);
    if (action === 'updateGuestForm')         return updateGuestForm(data);
    if (action === 'savePinChange')           return savePinChange(data);
    if (action === 'logActivity')             return logActivity(data);
    if (action === 'postAnnouncement')        return postAnnouncement(data);
    if (action === 'deleteAnnouncement')      return deleteAnnouncement(data);
    if (action === 'toggleAnnouncementStatus') return toggleAnnouncementStatus(data);
    // ── Members & Pipeline POST actions ──────────────────────────
    if (action === 'addPastoralNote')         return addPastoralNote(data);
    if (action === 'createAssignment')        return createAssignment(data);
    if (action === 'addCandidate')            return addCandidate(data);
    if (action === 'updateSTCModule')         return updateSTCModule(data);
    if (action === 'createCohort')            return createCohort(data);
    // ── Sunday Attendance & Visitation POST actions ──────────────
    if (action === 'submitSundayAttendance')  return submitSundayAttendance(data);
    if (action === 'submitSundayTotal')       return submitSundayTotal(data);
    if (action === 'assignVisitation')        return assignVisitation(data);
    if (action === 'updateVisitation')        return updateVisitation(data);
    if (action === 'escalateVisitation')      return escalateVisitation(data);
    // ── Resource Library & Mandatory Reads POST actions ──────────
    if (action === 'saveResource')            return saveResource(data);
    if (action === 'deleteResourceRecord')    return deleteResourceRecord(data);
    if (action === 'markResourceRead')        return markResourceRead(data);
    // ── Baptism Tracking POST actions ────────────────────────────
    if (action === 'updateBaptismStatus')     return updateBaptismStatus(data);
    if (action === 'createBaptismCohort')     return createBaptismCohort(data);
    // ── Soul Tracker POST actions ─────────────────────────────────
    if (action === 'addSoul')                 return addSoul(data);
    // ── Shepherd self-service Add/Edit (Know Your Members) ────────
    if (action === 'addMemberSelfService')    return addMemberSelfService(data);
    if (action === 'updateMemberDetails')     return updateMemberDetails(data);
    // ── Sprint 5 POST actions ─────────────────────────────────
    if (action === 'saveZoneConfig')          return saveZoneConfig(data);
    if (action === 'addShepherd')             return addShepherd(data);
    if (action === 'updateShepherdZone')      return updateShepherdZone(data);
    if (action === 'deleteMemberRecord')      return deleteMemberRecord(data);
    if (action === 'bulkImportMembers')       return bulkImportMembers(data);
    if (action === 'calculateShepherdScores') return calculateShepherdScores(data);
    // ── FCM Push Notifications ────────────────────────────────
    if (action === 'saveFCMToken')            return saveFCMToken(data);
    if (action === 'sendAnnouncementNotification') return sendAnnouncementNotification(data);
    if (action === 'forgotPin')               return forgotPin(data);
    // ── Telegram & SMS Notifications ──────────────────────────
    if (action === 'requestTelegramLink')     return requestTelegramLink(data);
    if (action === 'checkTelegramLink')       return checkTelegramLink(data);
    if (action === 'sendEmergencySMS')        return sendEmergencySMS(data);

    return jsonResponse({ status: 'error', message: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  var action   = (e.parameter.action   || '').toString();
  var callback = (e.parameter.callback || '').toString();
  var response;

  try {
    // ── v3.6 GET actions ──────────────────────────────────────────
    if      (action === 'getReports')             response = getReports();
    else if (action === 'getSettings')            response = getSettings();
    else if (action === 'getTopic')               response = getBibleTopic();
    else if (action === 'getStats')               response = getStats();
    else if (action === 'getMicrochurchReports')  response = getMicrochurchReports();
    else if (action === 'getGuests')              response = getGuests();
    else if (action === 'getSalvations')          response = getSalvations();
    else if (action === 'checkGuestSaved')        response = checkGuestSaved(e.parameter.guestId);
    else if (action === 'checkSalvationSaved')    response = checkSalvationSaved(e.parameter.salvationId);
    else if (action === 'fixFirstTimerDateSwap')  response = fixFirstTimerDateSwap();
    else if (action === 'getPins')                response = getPins();
    else if (action === 'getActivityLog')         response = getActivityLog();
    else if (action === 'getAnnouncements')       response = getAnnouncements();
    // ── Sprint 1 GET actions ──────────────────────────────────────
    else if (action === 'getDiscipleshipJourney') response = getDiscipleshipJourney();
    else if (action === 'updateMemberStage')      response = updateMemberStage(e.parameter.memberId, e.parameter.newStage, e.parameter.updatedBy);
    else if (action === 'getSoulTracker')         response = getSoulTracker();
    else if (action === 'updateSoulStage')        response = updateSoulStage(e.parameter.soulId, e.parameter.newStage, e.parameter.updatedBy);
    else if (action === 'getFlags')               response = getFlags();
    else if (action === 'resolveFlag')            response = resolveFlag(e.parameter.flagId, e.parameter.resolvedBy, e.parameter.notes);
    else if (action === 'runNightlyFlagCheck')    response = runNightlyFlagCheck();
    else if (action === 'getSchoolData')          response = getSchoolData();
    else if (action === 'updateSchoolAttendance') response = updateSchoolAttendance(e.parameter.sheet, e.parameter.memberId, e.parameter.week, e.parameter.value, e.parameter.updatedBy);
    else if (action === 'enrolInSchool')          response = enrolInSchool(e.parameter.sheet, e.parameter.memberId, e.parameter.memberName, e.parameter.enrolledDate);
    // ── Members & Pipeline GET actions ───────────────────────────
    else if (action === 'getPastoralNotes')       response = getPastoralNotes(e.parameter.memberId);
    else if (action === 'getAssignments')         response = getAssignments();
    else if (action === 'getRetentionData')       response = getRetentionData();
    else if (action === 'getPipeline')            response = getPipeline();
    else if (action === 'getCohorts')             response = getCohorts();
    // ── Sunday Attendance & Visitation GET actions ───────────────
    else if (action === 'getSundayAttendance')    response = getSundayAttendance(e.parameter.date, e.parameter.zone);
    else if (action === 'getSundayHistory')       response = getSundayHistory();
    else if (action === 'getSundayTotals')        response = getSundayTotals();
    else if (action === 'getVisitations')         response = getVisitations();
    // ── Resource Library & Mandatory Reads GET actions ───────────
    else if (action === 'getResources')           response = getResources();
    else if (action === 'getMandatoryReads')       response = getMandatoryReads();
    // ── GO Dashboard GET action ──────────────────────────────────
    else if (action === 'getGODashboardData')     response = getGODashboardData();
    // ── Baptism Tracking GET action ──────────────────────────────
    else if (action === 'getBaptismRecords')      response = getBaptismRecords();
    // ── Sprint 5 GET actions ─────────────────────────────────────
    else if (action === 'getZoneSnapshots')       response = getZoneSnapshots();
    else if (action === 'getShepherdScores')      response = getShepherdScores();
    else if (action === 'getFCMTokens')           response = getFCMTokens();
    else if (action === 'logNotificationClick')   response = logNotificationClick(e.parameter.notificationId, e.parameter.shepherdName);
    else if (action === 'getNotificationLog')     response = getNotificationLog(e.parameter.notificationId);
    else if (action === 'getMembersRoster')       response = getMembersRoster();
    else if (action === 'checkFellowshipMember')  response = checkFellowshipMember(e.parameter.memberId, e.parameter.name, e.parameter.shepherd);
    else if (action === 'getShepherdMembers')     response = getShepherdMembers(e.parameter.shepherd);
    else if (action === 'getDynamicShepherds')    response = getDynamicShepherds();
    else if (action === 'approveSeeker')          response = approveSeeker(e.parameter.memberId, e.parameter.approvedBy);
    else if (action === 'markSeekerAsMember')     response = markSeekerAsMember(e.parameter.memberId, e.parameter.graduatedBy);
    else if (action === 'reassignMember')         response = reassignMember(e.parameter.memberId, e.parameter.newShepherd, e.parameter.newZone, e.parameter.reassignedBy);
    else                                          response = { status: 'ok', message: 'ONC SPS Backend v4.0 Running' };
  } catch (err) {
    response = { status: 'error', message: err.toString() };
  }

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(response) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonResponse(response);
}

// ============================================================
// PIN MANAGEMENT
// ============================================================

function savePinChange(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PINS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(PINS_SHEET);
    sheet.appendRow(['Name', 'Role', 'PIN', 'Changed Date', 'Changed Time']);
    styleHeaders(sheet, 5);
  }

  const now      = new Date();
  const sheetData = sheet.getDataRange().getValues();
  const pinValue = String(data.pin || '0000').padStart(4, '0');

  let found = false;
  let previousPin = '0000'; // no prior row means they were still on the default
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === data.name) {
      previousPin = String(sheetData[i][2] || '0000').padStart(4, '0');
      sheet.getRange(i + 1, 3).setValue(pinValue);
      sheet.getRange(i + 1, 4).setValue(formatDate(now));
      sheet.getRange(i + 1, 5).setValue(formatTime(now));
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([data.name, data.role || 'Shepherd', pinValue, formatDate(now), formatTime(now)]);
  }

  logAudit(ss, 'PIN_CHANGED', data.name,
    (data.role || 'Shepherd') + ' changed PIN from ' + previousPin + ' to ' + pinValue +
    ' on ' + formatDate(now) + ' at ' + formatTime(now));

  return jsonResponse({ status: 'success' });
}

function getPins() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PINS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', pins: [] };

  const data = sheet.getDataRange().getValues();
  const pins = data.slice(1).map(function (row) {
    return {
      name:        row[0] || '',
      role:        row[1] || '',
      pin:         String(row[2] || '0000').padStart(4, '0'),
      changedDate: row[3] || '',
      changedTime: row[4] || ''
    };
  });

  return { status: 'success', pins };
}

// ============================================================
// ACTIVITY LOG
// ============================================================

function logActivity(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  logAudit(ss, data.action || 'ACTIVITY', data.user || 'Unknown', data.detail || '');
  return jsonResponse({ status: 'success' });
}

function getActivityLog() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(LOG_SHEET);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', logs: [] };

  const data = sheet.getDataRange().getValues();
  const logs = data.slice(1).reverse().map(function (row) {
    return {
      timestamp: row[0] || '',
      action:    row[1] || '',
      user:      row[2] || '',
      detail:    row[3] || ''
    };
  });

  return { status: 'success', logs };
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

function postAnnouncement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ANNOUNCEMENTS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(ANNOUNCEMENTS_SHEET);
    sheet.appendRow(['ID', 'Title', 'Message', 'Audience', 'Posted By', 'Posted Date', 'Posted Time', 'Expiry', 'Active', 'Status']);
    styleHeaders(sheet, 10);
  } else if (sheet.getLastColumn() < 10) {
    sheet.getRange(1, 10).setValue('Status');
  }

  const a   = data.announcement || {};
  const now = new Date();

  sheet.appendRow([
    a.id || 'ANN-' + now.getTime(),
    a.title    || '',
    a.message  || '',
    a.audience || 'all',
    a.postedBy || 'Admin',
    a.postedDate || formatDate(now),
    a.postedTime || formatTime(now),
    a.expiry   || '',
    'YES',
    'ACTIVE'
  ]);

  sheet.autoResizeColumns(1, 10);
  logAudit(ss, 'ANNOUNCEMENT_POSTED', a.postedBy || 'Admin', a.title || '');
  return jsonResponse({ status: 'success' });
}

function getAnnouncements() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ANNOUNCEMENTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', announcements: [] };

  const data          = sheet.getDataRange().getValues();
  const announcements = data.slice(1)
    .filter(function (row) { return row[8] === 'YES'; })
    .map(function (row) {
      return {
        id:         row[0] || '',
        title:      row[1] || '',
        message:    row[2] || '',
        audience:   row[3] || 'all',
        postedBy:   row[4] || '',
        postedDate: row[5] || '',
        postedTime: row[6] || '',
        expiry:     row[7] || '',
        paused:     row[9] === 'PAUSED'
      };
    });

  return { status: 'success', announcements };
}

function deleteAnnouncement(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ANNOUNCEMENTS_SHEET);

  if (!sheet) return jsonResponse({ status: 'success' });

  const sheetData = sheet.getDataRange().getValues();
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === data.id) {
      sheet.getRange(i + 1, 9).setValue('NO');
      break;
    }
  }

  logAudit(ss, 'ANNOUNCEMENT_DELETED', 'Admin', data.id || '');
  return jsonResponse({ status: 'success' });
}

// Toggles an announcement between ACTIVE and PAUSED without deleting it.
// Paused announcements stay in the admin list but are hidden from shepherds.
function toggleAnnouncementStatus(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ANNOUNCEMENTS_SHEET);

  if (!sheet) return jsonResponse({ status: 'error', message: 'No announcements' });

  const sheetData = sheet.getDataRange().getValues();
  let newStatus = 'ACTIVE';
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === data.id) {
      newStatus = sheetData[i][9] === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
      sheet.getRange(i + 1, 10).setValue(newStatus);
      break;
    }
  }

  logAudit(ss, 'ANNOUNCEMENT_' + newStatus, 'Admin', data.id || '');
  return jsonResponse({ status: 'success', newStatus: newStatus });
}

// ============================================================
// SPS REPORTS
// ============================================================

function submitReport(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Report ID', 'Submission Date', 'Submission Day', 'Submission Time',
      'Session Date', 'Session Day', 'Session Time', 'Shepherd',
      'Members Present', 'Members Absent', 'Attendance Count', 'Total Members',
      'Attendance Rate', 'Bible Study Topic', 'Topic Covered', 'Prayer Done',
      'Concerns', 'Notes', 'Week Number', 'Photo URL', 'Offering Given', 'Offering Amount'
    ];
    sheet.appendRow(headers);
    styleHeaders(sheet, headers.length);
  }
  if (sheet.getRange(1, 22).getValue() !== 'Offering Amount') {
    sheet.getRange(1, 22).setValue('Offering Amount');
  }

  const now            = new Date();
  const reportId       = 'RPT-' + now.getTime();
  const submissionDate = formatDate(now);
  const submissionDay  = getDayName(now);
  const submissionTime = formatTime(now);
  const weekNumber     = getWeekNumber(now);
  const sessionDate    = data.sessionDate || submissionDate;
  const sessionDay     = data.sessionDay  || submissionDay;
  const sessionTime    = data.sessionTime || submissionTime;
  const membersPresent = (data.membersPresent || []).join(', ');
  const membersAbsent  = (data.membersAbsent  || []).join(', ');
  const attendanceCount = (data.membersPresent || []).length;
  const totalMembers   = data.totalMembers || 4;
  const attendanceRate = Math.round((attendanceCount / totalMembers) * 100) + '%';
  const concerns       = formatConcerns(data.concerns || {});

  // Force date/time/percentage columns to plain text BEFORE writing so
  // Sheets doesn't auto-convert these strings into Date/Number values
  // (which silently swaps day/month and turns "50%" into 0.5).
  const nextRow = sheet.getLastRow() + 1;
  [2, 4, 5, 7, 13].forEach(col => sheet.getRange(nextRow, col).setNumberFormat('@'));

  sheet.appendRow([
    reportId, submissionDate, submissionDay, submissionTime,
    sessionDate, sessionDay, sessionTime, data.shepherd || '',
    membersPresent, membersAbsent, attendanceCount, totalMembers,
    attendanceRate, data.bibleTopic || '', data.topicCovered || '',
    data.prayerDone || '', concerns, data.notes || '', weekNumber, data.photoUrl || '', data.offeringGiven || '',
    data.offeringAmount || ''
  ]);

  sheet.autoResizeColumns(1, 22);
  logAudit(ss, 'REPORT_SUBMITTED', data.shepherd, reportId);

  if (Array.isArray(data.newMembers)) {
    data.newMembers.forEach(function (m) {
      if (m && m.name) addOrUpdateSeeker(m.name, m.phone, data.shepherd, 'sps', 'SPS New Member', {
        dob: m.dob, bornAgain: m.bornAgain, inChurch: m.inChurch, occupation: m.occupation
      });
    });
  }

  return jsonResponse({ status: 'success', reportId });
}

function getReports() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', reports: [] };

  const data    = sheet.getDataRange().getValues();
  const reports = data.slice(1).map(row => ({
    reportId:        row[0],
    submissionDate:  row[1] instanceof Date ? formatDate(row[1]) : String(row[1] || ''),
    submissionDay:   row[2],
    submissionTime:  row[3],
    sessionDate:     row[4] instanceof Date ? formatDate(row[4]) : String(row[4] || ''),
    sessionDay:      row[5],
    sessionTime:     row[6],
    shepherd:        row[7],
    membersPresent:  row[8],
    membersAbsent:   row[9],
    attendanceCount: row[10],
    totalMembers:    row[11],
    attendanceRate:  row[12],
    bibleTopic:      row[13],
    topicCovered:    row[14],
    prayerDone:      row[15],
    concerns:        row[16],
    notes:           row[17],
    weekNumber:      row[18],
    photoUrl:        row[19],
    offeringGiven:   row[20],
    offeringAmount:  row[21]
  }));

  return { status: 'success', reports };
}

// ============================================================
// MICROCHURCH REPORTS
// ============================================================

function submitMicrochurchReport(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(MC_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(MC_SHEET_NAME);
    const headers = [
      'Report ID', 'Submission Date', 'Submission Day', 'Submission Time',
      'Session Date', 'Session Day', 'Session Time', 'Shepherd', 'Meeting Type',
      'Members Present', 'Members Absent', 'Attendance Count', 'Total Members',
      'Attendance Rate', 'Bible Study Topic', 'Topic Covered', 'Actual Topic',
      'Prayer Done', 'New Souls', 'New Soul Names', 'Concerns', 'Notes', 'Week Number', 'Photo URL', 'Offering Given', 'Offering Amount'
    ];
    sheet.appendRow(headers);
    styleHeaders(sheet, headers.length);
  }
  if (sheet.getRange(1, 26).getValue() !== 'Offering Amount') {
    sheet.getRange(1, 26).setValue('Offering Amount');
  }

  const now             = new Date();
  const reportId        = 'MC-RPT-' + now.getTime();
  const submissionDate  = formatDate(now);
  const submissionDay   = getDayName(now);
  const submissionTime  = formatTime(now);
  const weekNumber      = getWeekNumber(now);
  const sessionDate     = data.sessionDate || submissionDate;
  const sessionDay      = data.sessionDay  || submissionDay;
  const sessionTime     = data.sessionTime || submissionTime;
  const membersPresent  = (data.membersPresent || []).join(', ');
  const membersAbsent   = (data.membersAbsent  || []).join(', ');
  const attendanceCount = (data.membersPresent || []).length;
  const totalMembers    = data.totalMembers || 25;
  const attendanceRate  = Math.round((attendanceCount / totalMembers) * 100) + '%';
  const concerns        = formatConcerns(data.concerns || {});
  const newSoulsValue   = Array.isArray(data.newSouls)
    ? data.newSouls.length
    : (parseInt(data.newSouls) || 0);
  const newSoulNamesValue = Array.isArray(data.newSouls)
    ? data.newSouls.map(s => s.name || s).filter(Boolean).join(', ')
    : (data.newSoulNames || '');

  // Force date/time/percentage columns to plain text BEFORE writing so
  // Sheets doesn't auto-convert these strings into Date/Number values
  // (which silently swaps day/month and turns "50%" into 0.5).
  const nextRow = sheet.getLastRow() + 1;
  [2, 4, 5, 7, 14].forEach(col => sheet.getRange(nextRow, col).setNumberFormat('@'));

  sheet.appendRow([
    reportId, submissionDate, submissionDay, submissionTime,
    sessionDate, sessionDay, sessionTime, data.shepherd || '',
    data.meetingType || '', membersPresent, membersAbsent,
    attendanceCount, totalMembers, attendanceRate,
    data.bibleTopic || '', data.topicCovered || '', data.actualTopic || '',
    data.prayerDone || '', newSoulsValue, newSoulNamesValue,
    concerns, data.notes || '', weekNumber, data.photoUrl || '', data.offeringGiven || '',
    data.offeringAmount || ''
  ]);

  sheet.autoResizeColumns(1, 26);
  logAudit(ss, 'MC_REPORT_SUBMITTED', data.shepherd, reportId);

  if (Array.isArray(data.newSouls)) {
    data.newSouls.forEach(function (s) {
      if (s && s.name) addOrUpdateSeeker(s.name, s.phone, data.shepherd, 'mc', 'MC New Soul', {
        dob: s.dob, bornAgain: s.bornAgain, inChurch: s.inChurch, occupation: s.occupation
      });
    });
  }

  return jsonResponse({ status: 'success', reportId });
}

function getMicrochurchReports() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MC_SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', reports: [] };

  const data    = sheet.getDataRange().getValues();
  const reports = data.slice(1).map(row => ({
    reportId:        row[0],
    submissionDate:  row[1] instanceof Date ? formatDate(row[1]) : String(row[1] || ''),
    submissionDay:   row[2],
    submissionTime:  row[3],
    sessionDate:     row[4] instanceof Date ? formatDate(row[4]) : String(row[4] || ''),
    sessionDay:      row[5],
    sessionTime:     row[6],
    shepherd:        row[7],
    meetingType:     row[8],
    membersPresent:  row[9],
    membersAbsent:   row[10],
    attendanceCount: row[11],
    totalMembers:    row[12],
    attendanceRate:  row[13],
    bibleTopic:      row[14],
    topicCovered:    row[15],
    actualTopic:     row[16],
    prayerDone:      row[17],
    newSouls:        row[18],
    newSoulNames:    row[19],
    concerns:        row[20],
    notes:           row[21],
    weekNumber:      row[22],
    photoUrl:        row[23],
    offeringGiven:   row[24],
    offeringAmount:  row[25]
  }));

  return { status: 'success', reports };
}

// ============================================================
// FIRST TIMERS
// ============================================================

function submitGuestForm(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(FIRST_TIMERS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(FIRST_TIMERS_SHEET);
    sheet.appendRow([
      'ID', 'Date', 'Time',
      'First Name', 'Middle Name', 'Last Name', 'Full Name',
      'Phone', 'Email', 'Date of Birth', 'Gender', 'Marital Status',
      'Occupation', 'Company/School', 'Residence',
      'How Heard About ONC', 'Invited By', 'Faith Academy Podcasts',
      'WhatsApp Number', 'Born Again', 'Belongs to Church', 'Church Name',
      'Contact Preference', 'Follow Up Status', 'Feedback',
      'Has Own Contact', 'Referral Name', 'Referral Relation', 'Referral Phone',
      'Filled By'
    ]);
    styleHeaders(sheet, 30);
  } else if (sheet.getRange(1, 30).getValue() !== 'Filled By') {
    sheet.getRange(1, 30).setValue('Filled By');
  }

  const g   = data.guest || {};
  const now = new Date();

  // Avoid creating a duplicate row if this guest was already
  // submitted (e.g. retried after a network/CORS error even
  // though the original submission succeeded).
  if (g.id && sheet.getLastRow() > 1) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(g.id)) {
        return jsonResponse({ status: 'success' });
      }
    }
  }

  // Write the Date (col B) and DOB (col J) as plain text so Sheets
  // doesn't auto-convert dd/mm/yyyy strings into locale-dependent
  // date serials (which can silently swap day/month and break the
  // "this month" follow-up filters on the frontend).
  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 2).setNumberFormat('@');
  sheet.getRange(newRow, 10).setNumberFormat('@');

  sheet.getRange(newRow, 1, 1, 30).setValues([[
    g.id || 'G' + now.getTime(),
    g.date || formatDate(now),
    formatTime(now),
    g.firstName || '', g.middleName || '', g.lastName || '', g.fullName || '',
    g.phone || '', g.email || '',
    (g.dobDay && g.dobMonth && g.dobYear)
      ? g.dobDay + '/' + g.dobMonth + '/' + g.dobYear : '',
    g.gender || '', g.maritalStatus || '', g.occupation || '',
    g.company || '', g.residence || '', g.heardFrom || '', g.invitedBy || '',
    g.podcast || '', g.whatsapp || '', g.bornAgain || '',
    g.belongsToChurch || '', g.churchName || '', g.contactPreference || '',
    g.followUpStatus || 'Needs Follow Up', g.feedback || '',
    g.hasOwnContact === false ? 'No' : 'Yes',
    g.referralName || '', g.referralRelation || '', g.referralPhone || '',
    g.filledBy || ''
  ]]);

  sheet.autoResizeColumns(1, 30);
  logAudit(ss, 'GUEST_REGISTERED', g.loggedInAs || 'First Timers Unit', g.fullName || '');
  return jsonResponse({ status: 'success' });
}

function submitSalvationForm(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SALVATION_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SALVATION_SHEET_NAME);
    sheet.appendRow([
      'ID', 'Date', 'Time', 'Filled By', 'Spiritual Commitment',
      'First Name', 'Middle Name', 'Last Name', 'Full Name',
      'Contact Number', 'WhatsApp Number', 'Date of Birth', 'Gender', 'Residence',
      'How Heard About Us', 'Name of Friend/Member',
      'Ever Attended Church', 'Church Name', 'Logged In As'
    ]);
    styleHeaders(sheet, 19);
  }

  const s   = data.salvation || {};
  const now = new Date();

  // Avoid creating a duplicate row if this was already submitted
  // (e.g. retried after a network error even though the original
  // submission succeeded).
  if (s.id && sheet.getLastRow() > 1) {
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(s.id)) {
        return jsonResponse({ status: 'success' });
      }
    }
  }

  // Write the Date (col B) and DOB (col L) as plain text so Sheets
  // doesn't auto-convert dd/mm/yyyy strings into locale-dependent
  // date serials (same fix applied to First Timers guest dates).
  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 2).setNumberFormat('@');
  sheet.getRange(newRow, 12).setNumberFormat('@');

  sheet.getRange(newRow, 1, 1, 19).setValues([[
    s.id || 'SV' + now.getTime(),
    s.date || formatDate(now),
    formatTime(now),
    s.filledBy || '', s.decisionType || '',
    s.firstName || '', s.middleName || '', s.lastName || '', s.fullName || '',
    s.phone || '', s.whatsapp || '',
    (s.dobDay && s.dobMonth && s.dobYear)
      ? s.dobDay + '/' + s.dobMonth + '/' + s.dobYear : '',
    s.gender || '', s.residence || '',
    s.heardFrom || '', s.invitedBy || '',
    s.attendedChurch || '', s.churchName || '',
    s.loggedInAs || 'First Timers Unit'
  ]]);

  sheet.autoResizeColumns(1, 19);
  logAudit(ss, 'SALVATION_REGISTERED', s.loggedInAs || 'First Timers Unit', s.fullName || '');
  return jsonResponse({ status: 'success' });
}

function getSalvations() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALVATION_SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', salvations: [] };

  const data       = sheet.getDataRange().getValues();
  const salvations = data.slice(1).map(function (row) {
    return {
      id:             row[0]  || '',
      date:           row[1] instanceof Date ? formatDate(row[1]) : (row[1] || ''),
      time:           row[2]  || '',
      filledBy:       row[3]  || '',
      decisionType:   row[4]  || '',
      firstName:      row[5]  || '',
      middleName:     row[6]  || '',
      lastName:       row[7]  || '',
      fullName:       row[8]  || '',
      phone:          row[9]  || '',
      whatsapp:       row[10] || '',
      dob:            row[11] || '',
      gender:         row[12] || '',
      residence:      row[13] || '',
      heardFrom:      row[14] || '',
      invitedBy:      row[15] || '',
      attendedChurch: row[16] || '',
      churchName:     row[17] || '',
      loggedInAs:     row[18] || ''
    };
  });

  return { status: 'success', salvations };
}

function updateGuestForm(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FIRST_TIMERS_SHEET);
  const guestId = data.guestId || (data.guest && data.guest.id) || '';

  if (!sheet || !guestId || sheet.getLastRow() <= 1)
    return jsonResponse({ status: 'error', message: 'Guest not found' });

  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  let row = -1;
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(guestId)) { row = i + 2; break; }
  }
  if (row === -1) return jsonResponse({ status: 'error', message: 'Guest not found' });

  const g = data.guest || {};
  sheet.getRange(row, 4, 1, 26).setValues([[
    g.firstName || '', g.middleName || '', g.lastName || '', g.fullName || '',
    g.phone || '', g.email || '',
    (g.dobDay && g.dobMonth && g.dobYear)
      ? g.dobDay + '/' + g.dobMonth + '/' + g.dobYear : '',
    g.gender || '', g.maritalStatus || '', g.occupation || '',
    g.company || '', g.residence || '', g.heardFrom || '', g.invitedBy || '',
    g.podcast || '', g.whatsapp || '', g.bornAgain || '',
    g.belongsToChurch || '', g.churchName || '', g.contactPreference || '',
    g.followUpStatus || 'Needs Follow Up', g.feedback || '',
    g.hasOwnContact === false ? 'No' : 'Yes',
    g.referralName || '', g.referralRelation || '', g.referralPhone || ''
  ]]);
  sheet.getRange(row, 30).setValue(g.filledBy || '');

  logAudit(ss, 'GUEST_UPDATED', g.loggedInAs || 'First Timers Unit', g.fullName || '');
  return jsonResponse({ status: 'success' });
}

function getGuests() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FIRST_TIMERS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', guests: [] };

  const data   = sheet.getDataRange().getValues();
  const guests = data.slice(1).map(function (row) {
    return {
      id:               row[0]  || '',
      date:             row[1] instanceof Date ? formatDate(row[1]) : (row[1] || ''),
      time:             row[2]  || '',
      firstName:        row[3]  || '',
      middleName:       row[4]  || '',
      lastName:         row[5]  || '',
      fullName:         row[6]  || '',
      phone:            row[7]  || '',
      email:            row[8]  || '',
      dob:              row[9]  || '',
      gender:           row[10] || '',
      maritalStatus:    row[11] || '',
      occupation:       row[12] || '',
      company:          row[13] || '',
      residence:        row[14] || '',
      heardFrom:        row[15] || '',
      invitedBy:        row[16] || '',
      podcast:          row[17] || '',
      whatsapp:         row[18] || '',
      bornAgain:        row[19] || '',
      belongsToChurch:  row[20] || '',
      churchName:       row[21] || '',
      contactPreference: row[22] || '',
      followUpStatus:   row[23] || 'Needs Follow Up',
      feedback:         row[24] || '',
      hasOwnContact:    row[25] !== 'No',
      referralName:     row[26] || '',
      referralRelation: row[27] || '',
      referralPhone:    row[28] || '',
      filledBy:         row[29] || ''
    };
  });

  return { status: 'success', guests };
}

// Lets the frontend confirm a guest registration actually reached the
// sheet after an ambiguous/failed-looking POST response, same pattern
// as checkFellowshipMember — a failed fetch doesn't mean the backend
// didn't write the row.
function checkGuestSaved(guestId) {
  if (!guestId) return { status: 'success', exists: false };
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FIRST_TIMERS_SHEET);
  if (!sheet || sheet.getLastRow() <= 1) return { status: 'success', exists: false };
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  const exists = ids.some(function (row) { return String(row[0]) === String(guestId); });
  return { status: 'success', exists: exists };
}

// Same as checkGuestSaved but for Salvation Form submissions.
function checkSalvationSaved(salvationId) {
  if (!salvationId) return { status: 'success', exists: false };
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SALVATION_SHEET_NAME);
  if (!sheet || sheet.getLastRow() <= 1) return { status: 'success', exists: false };
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  const exists = ids.some(function (row) { return String(row[0]) === String(salvationId); });
  return { status: 'success', exists: exists };
}

// ============================================================
// ONE-TIME FIX: repair guest dates corrupted by Sheets locale
// auto-conversion (day/month swapped) before the 11 Jun 2026
// plain-text fix. Swaps day/month back on any Date/DOB cell that
// is still stored as an actual Date object, then re-writes it as
// plain text so it can't be re-corrupted.
// ============================================================
function fixFirstTimerDateSwap() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FIRST_TIMERS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', fixed: 0, skipped: 0 };

  const lastRow = sheet.getLastRow();
  const dateCol = 2;  // column B
  const dobCol  = 10; // column J
  let fixed = 0, skipped = 0;

  [dateCol, dobCol].forEach(function (col) {
    const range  = sheet.getRange(2, col, lastRow - 1, 1);
    const values = range.getValues();

    for (let i = 0; i < values.length; i++) {
      const val = values[i][0];
      if (!(val instanceof Date)) continue;

      const day   = val.getDate();
      const month = val.getMonth() + 1;
      const year  = val.getFullYear();

      if (day > 12) { skipped++; continue; } // can't have been swapped this way

      // Swap back: the true day was stored as "month", true month as "day"
      const fixedStr = String(month).padStart(2, '0') + '/' +
                       String(day).padStart(2, '0')   + '/' + year;

      const cell = sheet.getRange(2 + i, col);
      cell.setNumberFormat('@');
      cell.setValue(fixedStr);
      fixed++;
    }
  });

  logAudit(ss, 'FIRST_TIMER_DATES_FIXED', 'System',
    fixed + ' date cell(s) corrected, ' + skipped + ' skipped (ambiguous)');

  return { status: 'success', fixed: fixed, skipped: skipped };
}

// ============================================================
// STATS
// ============================================================

function getStats() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', stats: getEmptyStats() };

  const data              = sheet.getDataRange().getValues();
  const rows              = data.slice(1);
  const currentWeek       = getWeekNumber(new Date());
  const thisWeekReports   = rows.filter(r => r[18] == currentWeek);
  const reportedShepherds = [...new Set(thisWeekReports.map(r => r[7]))];
  const totalSessions     = thisWeekReports.length;

  const avgAttendance = thisWeekReports.length > 0
    ? Math.round(thisWeekReports.reduce((sum, r) => sum + (parseInt(r[12]) || 0), 0) / thisWeekReports.length)
    : 0;

  const prayerSessions = thisWeekReports.filter(r =>
    String(r[15]).toLowerCase() === 'yes').length;
  const concernsCount = thisWeekReports.filter(r =>
    r[16] && String(r[16]).trim() !== '' && String(r[16]).trim() !== 'None').length;
  const topicCovered = thisWeekReports.filter(r =>
    String(r[14]).toLowerCase() === 'yes').length;

  return {
    status: 'success',
    stats: {
      totalSessions,
      reportedShepherds:   reportedShepherds.length,
      avgAttendanceRate:   avgAttendance + '%',
      prayerSessions,
      concernsCount,
      topicCoverage:       topicCovered + '/' + totalSessions,
      currentWeek,
      totalReportsAllTime: rows.length
    }
  };
}

// ============================================================
// BIBLE STUDY TOPIC
// ============================================================

function saveBibleTopic(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTINGS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET);
    sheet.appendRow(['Key', 'Value', 'Updated']);
    styleHeaders(sheet, 3);
  }

  const settingsData = sheet.getDataRange().getValues();
  let topicRow = -1;
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === 'BIBLE_TOPIC') { topicRow = i + 1; break; }
  }

  const now = new Date();
  if (topicRow > 0) {
    sheet.getRange(topicRow, 2).setValue(data.topic);
    sheet.getRange(topicRow, 3).setValue(formatDate(now) + ' ' + formatTime(now));
  } else {
    sheet.appendRow(['BIBLE_TOPIC', data.topic, formatDate(now) + ' ' + formatTime(now)]);
  }

  logAudit(ss, 'TOPIC_UPDATED', data.updatedBy || 'Admin', data.topic);
  return jsonResponse({ status: 'success', message: 'Bible study topic saved' });
}

function getBibleTopic() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET);

  if (!sheet) return { status: 'success', topic: '', updatedAt: '' };

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'BIBLE_TOPIC') {
      return { status: 'success', topic: data[i][1], updatedAt: data[i][2] };
    }
  }
  return { status: 'success', topic: '', updatedAt: '' };
}

// ============================================================
// REMINDER SETTINGS
// ============================================================

function saveReminderSettings(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SETTINGS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET);
    sheet.appendRow(['Key', 'Value', 'Updated']);
    styleHeaders(sheet, 3);
  }

  const now          = new Date();
  const settingsData = sheet.getDataRange().getValues();
  const settings = {
    'REMINDER_DAYS':    (data.days || ['Monday', 'Wednesday', 'Friday']).join(','),
    'REMINDER_TIME':    data.time    || '18:00',
    'REMINDER_MESSAGE': data.message || 'Hi {name}! Please submit your SPS report.',
    'REMINDER_ENABLED': data.enabled ? 'true' : 'false'
  };

  for (const [key, value] of Object.entries(settings)) {
    let found = false;
    for (let i = 1; i < settingsData.length; i++) {
      if (settingsData[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 3).setValue(formatDate(now));
        found = true;
        break;
      }
    }
    if (!found) sheet.appendRow([key, value, formatDate(now)]);
  }

  return jsonResponse({ status: 'success', message: 'Reminder settings saved' });
}

function getSettings() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET);

  if (!sheet) return { status: 'success', settings: {} };

  const data     = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) settings[data[i][0]] = data[i][1];
  }
  return { status: 'success', settings };
}

// ============================================================
// SPRINT 1: DISCIPLESHIP JOURNEY
// ============================================================

function getDiscipleshipJourney() {
  var headers = ['MemberID', 'MemberName', 'Phone', 'ShepherdAssigned', 'CurrentStage', 'StageEntryDate', 'LastUpdated', 'Notes'];
  var sheet   = ensureSheet('DiscipleshipJourney', headers);
  return { status: 'success', records: getSheetRecords(sheet) };
}

function updateMemberStage(memberId, newStage, updatedBy, memberName, phone) {
  if (!memberId) return { status: 'error', message: 'Missing MemberID' };
  if (!newStage) return { status: 'error', message: 'Missing newStage' };

  var headers = ['MemberID', 'MemberName', 'Phone', 'ShepherdAssigned', 'CurrentStage', 'StageEntryDate', 'LastUpdated', 'Notes'];
  var sheet   = ensureSheet('DiscipleshipJourney', headers);
  var records = getSheetRecords(sheet);
  var now     = formatISODate(new Date());
  var updated = false;

  for (var i = 0; i < records.length; i++) {
    var rec = records[i];
    if (rec.MemberID.toString() === memberId.toString()) {
      if (rec.CurrentStage.toString() !== newStage.toString()) {
        sheet.getRange(rec._row, 5).setValue(parseInt(newStage, 10));
        sheet.getRange(rec._row, 6).setValue(now);
      }
      sheet.getRange(rec._row, 7).setValue(now);
      sheet.getRange(rec._row, 8).setValue('Updated by ' + (updatedBy || 'System') + ' on ' + now);
      updated = true;
      break;
    }
  }

  if (!updated) {
    sheet.appendRow([memberId.toString(), memberName || '', phone || '', '', parseInt(newStage, 10), now, now, 'Created by ' + (updatedBy || 'System')]);
  }

  return { status: 'success', updated: updated };
}

// ============================================================
// SOUL TRACKER — Relational Evangelism Pipeline
// ============================================================
// Stages: 1 Name Identified, 2 Gospel Shared, 3 Invited, 4 Attended,
// 5 Decision for Christ, 6 Under Follow-up, 7 Established.
// Standalone from Seekers/DiscipleshipJourney. Once a soul has actually
// attended (stage >= 4), progress also syncs into DiscipleshipJourney so
// leaders see it in both places — a one-way surface, not a merge.

var SOUL_TO_JOURNEY_STAGE_MAP = { 4: 1, 5: 2, 6: 2, 7: 6 };

function getSoulTracker() {
  var headers = ['SoulID', 'Name', 'Phone', 'Notes', 'ShepherdType', 'ShepherdName', 'CurrentStage', 'StageEntryDate', 'DateAdded', 'LastUpdated', 'UpdatedBy'];
  var sheet   = ensureSheet('SoulTracker', headers);
  return { status: 'success', records: getSheetRecords(sheet) };
}

function addSoul(data) {
  if (!data.name) return jsonResponse({ status: 'error', message: 'Missing name' });

  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['SoulID', 'Name', 'Phone', 'Notes', 'ShepherdType', 'ShepherdName', 'CurrentStage', 'StageEntryDate', 'DateAdded', 'LastUpdated', 'UpdatedBy'];
  var sheet   = ensureSheet('SoulTracker', headers);
  var now     = new Date();
  var soulId  = 'SOUL-' + now.getTime();
  var nowIso  = formatISODate(now);

  sheet.appendRow([
    soulId,
    data.name,
    data.phone || '',
    data.notes || '',
    data.shepherdType || '',
    data.shepherdName || '',
    1,
    nowIso,
    nowIso,
    nowIso,
    data.shepherdName || 'Shepherd'
  ]);

  logAudit(ss, 'SOUL_LOGGED', data.shepherdName || '', data.name);
  return jsonResponse({ status: 'success', soulId: soulId });
}

function updateSoulStage(soulId, newStage, updatedBy) {
  if (!soulId) return { status: 'error', message: 'Missing soulId' };
  if (!newStage) return { status: 'error', message: 'Missing newStage' };

  var headers = ['SoulID', 'Name', 'Phone', 'Notes', 'ShepherdType', 'ShepherdName', 'CurrentStage', 'StageEntryDate', 'DateAdded', 'LastUpdated', 'UpdatedBy'];
  var sheet   = ensureSheet('SoulTracker', headers);
  var records = getSheetRecords(sheet);
  var now     = formatISODate(new Date());
  var stage   = parseInt(newStage, 10);
  var rec     = null;

  for (var i = 0; i < records.length; i++) {
    if (records[i].SoulID.toString() === soulId.toString()) { rec = records[i]; break; }
  }
  if (!rec) return { status: 'error', message: 'Soul not found' };

  if (rec.CurrentStage.toString() !== stage.toString()) {
    sheet.getRange(rec._row, 7).setValue(stage);
    sheet.getRange(rec._row, 8).setValue(now);
  }
  sheet.getRange(rec._row, 10).setValue(now);
  sheet.getRange(rec._row, 11).setValue(updatedBy || 'System');

  var journeySynced = false;
  if (SOUL_TO_JOURNEY_STAGE_MAP[stage]) {
    updateMemberStage(soulId, SOUL_TO_JOURNEY_STAGE_MAP[stage], updatedBy, rec.Name, rec.Phone);
    journeySynced = true;
  }

  return { status: 'success', journeySynced: journeySynced };
}

// ============================================================
// SPRINT 1: FLAGS & ALERTS
// ============================================================

function getFlags() {
  var headers = ['MemberID', 'MemberName', 'ShepherdName', 'FlagType', 'FlagDate', 'TriggerReason', 'EscalatedTo', 'ResolvedBy', 'ResolutionDate', 'ResolutionNotes'];
  var sheet   = ensureSheet('FlagsSheet', headers);
  var records = getSheetRecords(sheet);
  records.forEach(function (r) { r.flagId = r._row; });
  return { status: 'success', records: records };
}

function resolveFlag(flagId, resolvedBy, notes) {
  if (!flagId) return { status: 'error', message: 'Missing flagId' };

  var headers = ['MemberID', 'MemberName', 'ShepherdName', 'FlagType', 'FlagDate', 'TriggerReason', 'EscalatedTo', 'ResolvedBy', 'ResolutionDate', 'ResolutionNotes'];
  var sheet   = ensureSheet('FlagsSheet', headers);
  var row     = parseInt(flagId, 10);

  if (isNaN(row) || row < 2 || row > sheet.getLastRow())
    return { status: 'error', message: 'Invalid flagId' };

  var now = formatISODate(new Date());
  sheet.getRange(row, 8).setValue(resolvedBy || '');
  sheet.getRange(row, 9).setValue(now);
  sheet.getRange(row, 10).setValue(notes || '');
  return { status: 'success', resolvedRow: row };
}

function runNightlyFlagCheck() {
  var journey = getDiscipleshipJourney().records;
  var flags   = getFlags().records;
  var sheet   = ensureSheet('FlagsSheet', [
    'MemberID', 'MemberName', 'ShepherdName', 'FlagType', 'FlagDate',
    'TriggerReason', 'EscalatedTo', 'ResolvedBy', 'ResolutionDate', 'ResolutionNotes'
  ]);
  var created = 0;
  var today   = new Date();

  function hasOpenFlag(memberId, flagType) {
    return flags.some(function (f) {
      return f.MemberID.toString() === memberId.toString() &&
             f.FlagType === flagType &&
             !f.ResolutionDate;
    });
  }

  journey.forEach(function (rec) {
    if (!rec.MemberID) return;
    var lastUpdated = rec.LastUpdated    ? new Date(rec.LastUpdated)    :
                      rec.StageEntryDate ? new Date(rec.StageEntryDate) : null;
    var stageEntry  = rec.StageEntryDate ? new Date(rec.StageEntryDate) : null;
    if (!lastUpdated) return;

    var daysSince = Math.floor((today - lastUpdated)  / 86400000);
    var stallDays = stageEntry ? Math.floor((today - stageEntry) / 86400000) : 0;
    var flagType  = '';
    var reason    = '';

    if      (stallDays >= 28) { flagType = 'StageStall'; reason = 'Stage stalled for 4+ weeks'; }
    else if (daysSince >= 21) { flagType = 'Purple';     reason = '21+ days inactive'; }
    else if (daysSince >= 14) { flagType = 'Red';        reason = '2 missed Sundays / 14+ days no contact'; }
    else if (daysSince >= 7)  { flagType = 'Orange';     reason = '7-14 days since last contact'; }
    else if (daysSince >= 5)  { flagType = 'Yellow';     reason = '5-6 days since last contact'; }

    if (flagType && !hasOpenFlag(rec.MemberID, flagType)) {
      sheet.appendRow([
        rec.MemberID, rec.MemberName || '', rec.ShepherdAssigned || '',
        flagType, formatISODate(today), reason, '', '', '', ''
      ]);
      created += 1;
    }
  });

  return { status: 'success', created: created };
}

// ============================================================
// SPRINT 1: FOUNDATIONS & MEMBERSHIP SCHOOL
// ============================================================

function getSchoolData() {
  var foundationsHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'CompletedDate'];
  var membershipHeaders  = ['MemberID', 'MemberName', 'EnrolledDate', 'Session1', 'Session2', 'Session3', 'Session4', 'CommitmentCardSigned', 'CompletedDate'];
  return {
    status:      'success',
    foundations: getSheetRecords(ensureSheet('FoundationsSchool', foundationsHeaders)),
    membership:  getSheetRecords(ensureSheet('MembershipSchool',  membershipHeaders))
  };
}

function updateSchoolAttendance(sheetName, memberId, week, value, updatedBy) {
  if (!sheetName || !memberId || !week)
    return { status: 'error', message: 'Missing sheet or memberId or week' };

  var foundationsHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'CompletedDate'];
  var membershipHeaders  = ['MemberID', 'MemberName', 'EnrolledDate', 'Session1', 'Session2', 'Session3', 'Session4', 'CommitmentCardSigned', 'CompletedDate'];
  var sheet    = null;
  var fieldMap = {};

  if (sheetName === 'FoundationsSchool') {
    sheet    = ensureSheet(sheetName, foundationsHeaders);
    fieldMap = { Week1: 4, Week2: 5, Week3: 6, Week4: 7, Week5: 8, Week6: 9, CompletedDate: 10 };
  } else if (sheetName === 'MembershipSchool') {
    sheet    = ensureSheet(sheetName, membershipHeaders);
    fieldMap = { Session1: 4, Session2: 5, Session3: 6, Session4: 7, CommitmentCardSigned: 8, CompletedDate: 9 };
  } else {
    return { status: 'error', message: 'Unsupported sheet name' };
  }

  var records = getSheetRecords(sheet);
  var target  = records.find(function (r) { return r.MemberID.toString() === memberId.toString(); });
  if (!target)        return { status: 'error', message: 'Member not found in school sheet' };
  if (!fieldMap[week]) return { status: 'error', message: 'Invalid week/session field' };

  sheet.getRange(target._row, fieldMap[week]).setValue(value === 'Y' ? 'Y' : 'N');

  var completedDate = '';
  if (sheetName === 'FoundationsSchool') {
    var complete = foundationsHeaders.slice(3, 9).every(function (field) {
      return String(sheet.getRange(target._row, fieldMap[field]).getValue()).toUpperCase() === 'Y';
    });
    completedDate = complete ? formatISODate(new Date()) : '';
    sheet.getRange(target._row, fieldMap.CompletedDate).setValue(completedDate);
    if (complete) updateMemberStage(memberId, 4, updatedBy || 'Auto Progress');
  } else {
    var complete = membershipHeaders.slice(3, 7).every(function (field) {
      return String(sheet.getRange(target._row, fieldMap[field]).getValue()).toUpperCase() === 'Y';
    }) && String(sheet.getRange(target._row, fieldMap.CommitmentCardSigned).getValue()).toUpperCase() === 'Y';
    completedDate = complete ? formatISODate(new Date()) : '';
    sheet.getRange(target._row, fieldMap.CompletedDate).setValue(completedDate);
  }

  return { status: 'success', completedDate: completedDate };
}

function enrolInSchool(sheetName, memberId, memberName, enrolledDate) {
  if (!sheetName || !memberId || !memberName)
    return { status: 'error', message: 'Missing required enrolment data' };

  var foundationsHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'CompletedDate'];
  var membershipHeaders  = ['MemberID', 'MemberName', 'EnrolledDate', 'Session1', 'Session2', 'Session3', 'Session4', 'CommitmentCardSigned', 'CompletedDate'];
  var sheet      = null;
  var initialRow = [];

  if (sheetName === 'FoundationsSchool') {
    sheet      = ensureSheet(sheetName, foundationsHeaders);
    initialRow = [memberId.toString(), memberName.toString(), formatISODate(enrolledDate || new Date()), 'N', 'N', 'N', 'N', 'N', 'N', ''];
  } else if (sheetName === 'MembershipSchool') {
    sheet      = ensureSheet(sheetName, membershipHeaders);
    initialRow = [memberId.toString(), memberName.toString(), formatISODate(enrolledDate || new Date()), 'N', 'N', 'N', 'N', 'N', ''];
  } else {
    return { status: 'error', message: 'Unsupported sheet name' };
  }

  var existing = getSheetRecords(sheet).find(function (r) {
    return r.MemberID.toString() === memberId.toString();
  });
  if (existing) return { status: 'success', message: 'Member already enrolled' };

  sheet.appendRow(initialRow);
  return { status: 'success', enrolledSheet: sheetName };
}

// ============================================================
// SPRINT 1: SHEET HELPERS
// ============================================================

function ensureSheet(name, headers) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0] || [];
    if (existing.length !== headers.length || headers.some(function (h, i) { return existing[i] !== h; })) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

function getSheetRecords(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  return values.slice(1).map(function (row, index) {
    var record = { _row: index + 2 };
    headers.forEach(function (header, col) {
      record[header] = row[col] === undefined ? '' : row[col];
    });
    return record;
  });
}

// Stores dates as yyyy-MM-dd (ISO) — used by Sprint 1 functions only.
// Do not replace formatDate(), which stores as DD/MM/YYYY for existing features.
function formatISODate(value) {
  if (!value) return '';
  var date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'GMT', 'yyyy-MM-dd');
}

// ============================================================
// PASTORAL NOTES
// ============================================================

function getPastoralNotes(memberId) {
  var headers = ['NoteID', 'MemberID', 'MemberName', 'ShepherdName', 'Date', 'Time', 'NoteType', 'Note', 'FollowUpRequired', 'FollowUpDate'];
  var sheet   = ensureSheet(PASTORAL_NOTES_SHEET, headers);
  var records = getSheetRecords(sheet);
  if (memberId) {
    records = records.filter(function (r) { return String(r.MemberID) === String(memberId); });
  }
  return { status: 'success', notes: records };
}

function addPastoralNote(data) {
  var headers = ['NoteID', 'MemberID', 'MemberName', 'ShepherdName', 'Date', 'Time', 'NoteType', 'Note', 'FollowUpRequired', 'FollowUpDate'];
  var sheet   = ensureSheet(PASTORAL_NOTES_SHEET, headers);
  var now     = new Date();
  sheet.appendRow([
    'NOTE-' + now.getTime(),
    data.memberId    || '',
    data.memberName  || '',
    data.shepherdName || '',
    formatDate(now),
    formatTime(now),
    data.noteType    || '',
    data.note        || '',
    data.followUpRequired || 'No',
    data.followUpDate || ''
  ]);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'PASTORAL_NOTE_ADDED', data.shepherdName || 'Admin', data.memberName || '');
  return jsonResponse({ status: 'success' });
}

// ============================================================
// DISCIPLESHIP ASSIGNMENTS
// ============================================================

function getAssignments() {
  var headers = ['AssignmentID', 'MemberID', 'MemberName', 'MentorName', 'StartDate', 'TargetEndDate', 'Status'];
  var sheet   = ensureSheet(DISCIPLESHIP_ASSIGNMENTS_SHEET, headers);
  return { status: 'success', assignments: getSheetRecords(sheet) };
}

function createAssignment(data) {
  var headers = ['AssignmentID', 'MemberID', 'MemberName', 'MentorName', 'StartDate', 'TargetEndDate', 'Status'];
  var sheet   = ensureSheet(DISCIPLESHIP_ASSIGNMENTS_SHEET, headers);
  var now     = new Date();
  sheet.appendRow([
    'ASGN-' + now.getTime(),
    data.memberId    || '',
    data.memberName  || '',
    data.mentorName  || '',
    data.startDate   || formatDate(now),
    data.targetEndDate || '',
    data.status      || 'Active'
  ]);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'ASSIGNMENT_CREATED', data.mentorName || 'Admin', data.memberName || '');
  return jsonResponse({ status: 'success' });
}

// ============================================================
// RETENTION DATA
// ============================================================

function getRetentionData() {
  var ss            = SpreadsheetApp.getActiveSpreadsheet();
  var spsSheet      = ss.getSheetByName(SHEET_NAME);
  var mcSheet       = ss.getSheetByName(MC_SHEET_NAME);
  var memberMap     = {};
  var thirtyAgo     = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  function processSheet(sheet, stream, presentCol) {
    if (!sheet || sheet.getLastRow() <= 1) return;
    var rows = sheet.getDataRange().getValues().slice(1);
    rows.forEach(function (row) {
      var rawDate = row[4] || row[1];
      var date    = rawDate instanceof Date ? rawDate : (rawDate ? new Date(String(rawDate).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')) : null);
      var names   = String(row[presentCol] || '').split(',').map(function (n) { return n.trim(); }).filter(Boolean);
      names.forEach(function (name) {
        if (!memberMap[name]) memberMap[name] = { lastSeen: null, sessions30d: 0, stream: stream, weekNumbers: [] };
        if (date && !isNaN(date.getTime())) {
          if (!memberMap[name].lastSeen || date > memberMap[name].lastSeen) memberMap[name].lastSeen = date;
          if (date >= thirtyAgo) memberMap[name].sessions30d++;
        }
      });
    });
  }

  processSheet(spsSheet, 'SPS', 8);
  processSheet(mcSheet,  'MC',  9);

  var result = {};
  Object.keys(memberMap).forEach(function (name) {
    var m = memberMap[name];
    result[name] = { lastSeen: m.lastSeen ? formatDate(m.lastSeen) : null, sessions30d: m.sessions30d, stream: m.stream };
  });
  return { status: 'success', retention: result };
}

// ============================================================
// SHEPHERD PIPELINE
// ============================================================

function getPipeline() {
  var headers = ['CandidateID', 'CandidateName', 'NominatedBy', 'NominationDate', 'CohortNumber',
    'STC1', 'STC2', 'STC3', 'STC4', 'STC5', 'STC6', 'STC7', 'GraduationDate', 'DeployedDate', 'Status'];
  var sheet = ensureSheet(SHEPHERD_PIPELINE_SHEET, headers);
  return { status: 'success', pipeline: getSheetRecords(sheet) };
}

function addCandidate(data) {
  var headers = ['CandidateID', 'CandidateName', 'NominatedBy', 'NominationDate', 'CohortNumber',
    'STC1', 'STC2', 'STC3', 'STC4', 'STC5', 'STC6', 'STC7', 'GraduationDate', 'DeployedDate', 'Status'];
  var sheet = ensureSheet(SHEPHERD_PIPELINE_SHEET, headers);
  var now   = new Date();
  sheet.appendRow([
    'CAND-' + now.getTime(),
    data.candidateName || '',
    data.nominatedBy   || '',
    formatDate(now),
    data.cohortNumber  || '',
    'N','N','N','N','N','N','N',
    '', '', data.status || 'Nominated'
  ]);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'CANDIDATE_NOMINATED', data.nominatedBy || 'Admin', data.candidateName || '');
  return jsonResponse({ status: 'success' });
}

function updateSTCModule(data) {
  var headers = ['CandidateID', 'CandidateName', 'NominatedBy', 'NominationDate', 'CohortNumber',
    'STC1', 'STC2', 'STC3', 'STC4', 'STC5', 'STC6', 'STC7', 'GraduationDate', 'DeployedDate', 'Status'];
  var sheet      = ensureSheet(SHEPHERD_PIPELINE_SHEET, headers);
  var stcColMap  = { STC1:6, STC2:7, STC3:8, STC4:9, STC5:10, STC6:11, STC7:12 };
  var records    = getSheetRecords(sheet);
  var target     = records.find(function (r) { return r.CandidateID === data.candidateId; });
  if (!target) return jsonResponse({ status: 'error', message: 'Candidate not found' });

  var col = stcColMap[data.module];
  if (!col) return jsonResponse({ status: 'error', message: 'Invalid module' });

  sheet.getRange(target._row, col).setValue(data.value === 'Y' ? 'Y' : 'N');

  var allDone = Object.keys(stcColMap).every(function (mod) {
    return String(sheet.getRange(target._row, stcColMap[mod]).getValue()).toUpperCase() === 'Y';
  });
  if (allDone && !String(sheet.getRange(target._row, 13).getValue()).trim()) {
    sheet.getRange(target._row, 13).setValue(formatDate(new Date()));
    sheet.getRange(target._row, 15).setValue('Promotion Ready');
  }
  return jsonResponse({ status: 'success' });
}

// ============================================================
// SHEPHERD COHORTS
// ============================================================

function getCohorts() {
  var headers = ['CohortID', 'CohortNumber', 'StartDate', 'TargetEndDate', 'TotalCandidates', 'Graduated', 'Deployed'];
  var sheet   = ensureSheet(SHEPHERD_COHORTS_SHEET, headers);
  return { status: 'success', cohorts: getSheetRecords(sheet) };
}

function createCohort(data) {
  var headers = ['CohortID', 'CohortNumber', 'StartDate', 'TargetEndDate', 'TotalCandidates', 'Graduated', 'Deployed'];
  var sheet   = ensureSheet(SHEPHERD_COHORTS_SHEET, headers);
  var now     = new Date();
  sheet.appendRow([
    'COHORT-' + now.getTime(),
    data.cohortNumber  || '',
    data.startDate     || formatDate(now),
    data.targetEndDate || '',
    0, 0, 0
  ]);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'COHORT_CREATED', 'Admin', 'Cohort ' + (data.cohortNumber || ''));
  return jsonResponse({ status: 'success' });
}

// ============================================================
// SUNDAY SERVICE ATTENDANCE
// ============================================================

function getSundayAttendance(date, zone) {
  var headers = ['Date', 'Zone', 'MembersPresent', 'MembersAbsent', 'PresentCount', 'AbsentCount', 'MarkedBy', 'Timestamp'];
  var sheet   = ensureSheet(SUNDAY_ATTENDANCE_SHEET, headers);
  var records = getSheetRecords(sheet);
  if (date) records = records.filter(function (r) { return r.Date === date; });
  if (zone) records = records.filter(function (r) { return r.Zone === zone; });
  return { status: 'success', attendance: records };
}

function getSundayHistory() {
  var headers = ['Date', 'Zone', 'MembersPresent', 'MembersAbsent', 'PresentCount', 'AbsentCount', 'MarkedBy', 'Timestamp'];
  var sheet   = ensureSheet(SUNDAY_ATTENDANCE_SHEET, headers);
  var records = getSheetRecords(sheet);

  var byDate = {};
  records.forEach(function (r) {
    if (!r.Date) return;
    if (!byDate[r.Date]) byDate[r.Date] = { date: r.Date, present: 0, absent: 0, zonesReported: 0 };
    byDate[r.Date].present       += parseInt(r.PresentCount) || 0;
    byDate[r.Date].absent        += parseInt(r.AbsentCount)  || 0;
    byDate[r.Date].zonesReported += 1;
  });

  var history = Object.keys(byDate).map(function (d) { return byDate[d]; });
  history.sort(function (a, b) { return parseDMY(b.date) - parseDMY(a.date); });

  return { status: 'success', history: history };
}

function submitSundayAttendance(data) {
  var headers = ['Date', 'Zone', 'MembersPresent', 'MembersAbsent', 'PresentCount', 'AbsentCount', 'MarkedBy', 'Timestamp'];
  var sheet   = ensureSheet(SUNDAY_ATTENDANCE_SHEET, headers);
  var records = getSheetRecords(sheet);
  var now     = new Date();
  var present = data.present || [];
  var absent  = data.absent  || [];

  var rowValues = [
    data.date || formatDate(now),
    data.zone || '',
    present.join(', '),
    absent.join(', '),
    present.length,
    absent.length,
    data.markedBy || 'Shepherd',
    formatDate(now) + ' ' + formatTime(now)
  ];

  var existing = records.find(function (r) { return r.Date === data.date && r.Zone === data.zone; });
  if (existing) {
    sheet.getRange(existing._row, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SUNDAY_ATTENDANCE_SUBMITTED', data.markedBy || 'Shepherd',
    data.zone + ' — ' + present.length + ' present, ' + absent.length + ' absent (' + data.date + ')');
  return jsonResponse({ status: 'success' });
}

// Sheets auto-converts a DD/MM/YYYY-looking string into a real Date cell on
// write, so reading it back gives a JS Date, not the original string — normalize
// both sides before comparing/displaying or upserts silently stop matching.
function normalizeSheetDate(val) {
  return (val instanceof Date) ? formatDate(val) : val;
}

// Single-number whole-church Sunday headcount, kept in its own sheet rather
// than folded into SUNDAY_ATTENDANCE_SHEET — that sheet's history rollup sums
// PresentCount across every zone row for a date, so a combined total row
// there would double-count against zone submissions for the same Sunday.
function submitSundayTotal(data) {
  var headers = ['Date', 'TotalPresent', 'MarkedBy', 'Timestamp'];
  var sheet   = ensureSheet(SUNDAY_SUMMARY_SHEET, headers);
  var records = getSheetRecords(sheet);
  var now     = new Date();

  var rowValues = [
    data.date || formatDate(now),
    parseInt(data.totalPresent, 10) || 0,
    data.markedBy || 'First Timers Unit',
    formatDate(now) + ' ' + formatTime(now)
  ];

  var existing = records.find(function (r) { return normalizeSheetDate(r.Date) === rowValues[0]; });
  if (existing) {
    sheet.getRange(existing._row, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SUNDAY_TOTAL_SUBMITTED', rowValues[2],
    'Total Sunday attendance: ' + rowValues[1] + ' (' + rowValues[0] + ')');
  return jsonResponse({ status: 'success' });
}

function getSundayTotals() {
  var headers = ['Date', 'TotalPresent', 'MarkedBy', 'Timestamp'];
  var sheet   = ensureSheet(SUNDAY_SUMMARY_SHEET, headers);
  var records = getSheetRecords(sheet).map(function (r) {
    r.Date = normalizeSheetDate(r.Date);
    return r;
  });
  records.sort(function (a, b) { return parseDMY(b.Date) - parseDMY(a.Date); });
  return { status: 'success', totals: records };
}

// Parses DD/MM/YYYY strings (as stored by formatDate) for sorting purposes.
function parseDMY(val) {
  if (!val) return new Date(0);
  var parts = String(val).split('/');
  if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  return new Date(val);
}

// ============================================================
// FIRST-TIMER VISITATIONS
// ============================================================

function getVisitations() {
  var headers = ['VisitationID', 'GuestID', 'GuestName', 'GuestPhone', 'RegistrationDate', 'DueDate', 'AssignedTo', 'ScheduledDate', 'CompletedDate', 'Outcome', 'EscalationStep', 'Notes', 'Status'];
  var sheet   = ensureSheet(VISITATIONS_SHEET, headers);
  var records = getSheetRecords(sheet);

  // Auto-create a Pending visitation row for any guest that doesn't have one yet.
  var guestSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(FIRST_TIMERS_SHEET);
  if (guestSheet && guestSheet.getLastRow() > 1) {
    var guestData = guestSheet.getDataRange().getValues();
    var knownIds  = {};
    records.forEach(function (r) { if (r.GuestID) knownIds[String(r.GuestID)] = true; });

    for (var i = 1; i < guestData.length; i++) {
      var guestId = String(guestData[i][0] || '');
      if (!guestId || knownIds[guestId]) continue;

      var regDateRaw = guestData[i][1];
      var regDate    = regDateRaw instanceof Date ? formatDate(regDateRaw) : String(regDateRaw || '');
      var dueDate    = '';
      if (regDateRaw instanceof Date) {
        var d = new Date(regDateRaw);
        d.setDate(d.getDate() + 7);
        dueDate = formatDate(d);
      }

      sheet.appendRow([
        'VIS-' + guestId,
        guestId,
        guestData[i][6] || '',
        guestData[i][7] || '',
        regDate,
        dueDate,
        '', '', '', '', 1, '', 'Pending'
      ]);
      knownIds[guestId] = true;
    }
    records = getSheetRecords(sheet);
  }

  return { status: 'success', visitations: records };
}

function assignVisitation(data) {
  var headers = ['VisitationID', 'GuestID', 'GuestName', 'GuestPhone', 'RegistrationDate', 'DueDate', 'AssignedTo', 'ScheduledDate', 'CompletedDate', 'Outcome', 'EscalationStep', 'Notes', 'Status'];
  var sheet   = ensureSheet(VISITATIONS_SHEET, headers);
  var records = getSheetRecords(sheet);
  var target  = records.find(function (r) { return r.VisitationID === data.visitationId; });
  if (!target) return jsonResponse({ status: 'error', message: 'Visitation not found' });

  sheet.getRange(target._row, 7).setValue(data.assignedTo    || '');
  sheet.getRange(target._row, 8).setValue(data.scheduledDate || '');
  sheet.getRange(target._row, 13).setValue('Assigned');

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'VISITATION_ASSIGNED', data.assignedBy || 'Admin',
    (target.GuestName || '') + ' → ' + (data.assignedTo || ''));
  return jsonResponse({ status: 'success' });
}

function updateVisitation(data) {
  var headers = ['VisitationID', 'GuestID', 'GuestName', 'GuestPhone', 'RegistrationDate', 'DueDate', 'AssignedTo', 'ScheduledDate', 'CompletedDate', 'Outcome', 'EscalationStep', 'Notes', 'Status'];
  var sheet   = ensureSheet(VISITATIONS_SHEET, headers);
  var records = getSheetRecords(sheet);
  var target  = records.find(function (r) { return r.VisitationID === data.visitationId; });
  if (!target) return jsonResponse({ status: 'error', message: 'Visitation not found' });

  var now    = new Date();
  var status = data.outcome === 'Connected' ? 'Closed' : 'Visited';

  sheet.getRange(target._row, 9).setValue(formatDate(now));
  sheet.getRange(target._row, 10).setValue(data.outcome || '');
  sheet.getRange(target._row, 12).setValue(data.notes   || '');
  sheet.getRange(target._row, 13).setValue(status);

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'VISITATION_UPDATED', data.updatedBy || 'Admin',
    (target.GuestName || '') + ' — ' + (data.outcome || ''));
  return jsonResponse({ status: 'success' });
}

function escalateVisitation(data) {
  var headers = ['VisitationID', 'GuestID', 'GuestName', 'GuestPhone', 'RegistrationDate', 'DueDate', 'AssignedTo', 'ScheduledDate', 'CompletedDate', 'Outcome', 'EscalationStep', 'Notes', 'Status'];
  var sheet   = ensureSheet(VISITATIONS_SHEET, headers);
  var records = getSheetRecords(sheet);
  var target  = records.find(function (r) { return r.VisitationID === data.visitationId; });
  if (!target) return jsonResponse({ status: 'error', message: 'Visitation not found' });

  var step = Math.min(5, (parseInt(target.EscalationStep) || 1) + 1);
  sheet.getRange(target._row, 11).setValue(step);
  sheet.getRange(target._row, 13).setValue('Escalated — Step ' + step);

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'VISITATION_ESCALATED', data.escalatedBy || 'Admin',
    (target.GuestName || '') + ' → step ' + step);
  return jsonResponse({ status: 'success', newStep: step });
}

// ============================================================
// RESOURCE LIBRARY & MANDATORY READS
// ============================================================

function getResources() {
  var headers = ['ResourceID','Title','Category','Audience','URL','Description','Mandatory','DateAdded','AddedBy'];
  var sheet = ensureSheet('Resources', headers);
  return { status: 'success', resources: getSheetRecords(sheet) };
}

function saveResource(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var headers = ['ResourceID','Title','Category','Audience','URL','Description','Mandatory','DateAdded','AddedBy'];
  var sheet = ensureSheet('Resources', headers);
  var now = new Date();
  var resourceId = data.resourceId || ('RES-' + now.getTime());
  var mandatory = data.mandatory ? 'Y' : 'N';

  sheet.appendRow([
    resourceId,
    data.title || '',
    data.category || 'Other',
    data.audience || 'All Shepherds',
    data.url || '',
    data.desc || '',
    mandatory,
    formatDate(now) + ' ' + formatTime(now),
    data.addedBy || 'Admin'
  ]);

  if (mandatory === 'Y') {
    seedMandatoryReads(resourceId, data.title || '', data.shepherdNames || []);
  }

  logAudit(ss, 'RESOURCE_PUBLISHED', data.addedBy || 'Admin', data.title || resourceId);
  notifyNewResource(ss, data, mandatory === 'Y');
  return jsonResponse({ status: 'success', resourceId: resourceId });
}

// Sends a push notification to the relevant audience when a new resource is
// published. Wrapped in its own try/catch so a notification failure never
// blocks the resource itself from saving.
function notifyNewResource(ss, data, mandatory) {
  try {
    const roleFilter = {
      'SPS Shepherds':         'sps',
      'Microchurch Shepherds': 'mc'
    };
    const filterRole  = roleFilter[data.audience || 'All Shepherds'] || null;
    const props       = PropertiesService.getScriptProperties();
    const projectId   = props.getProperty('FIREBASE_PROJECT_ID');
    const appUrl      = (props.getProperty('APP_URL') || 'https://aa-teye.github.io/onc-sps-report/').replace(/\/?$/, '/');
    const accessToken = getFCMAccessToken();
    const title       = '📚 New Resource: ' + (data.title || '');
    const body        = (mandatory ? '📌 Mandatory read — ' : '') + (data.desc || 'Tap to view it in the Resource Library');

    const tokenSheet = ss.getSheetByName(FCM_TOKENS_SHEET);
    let targets = tokenSheet ? getSheetRecords(tokenSheet).filter(function (r) { return r.Token; }) : [];
    if (filterRole) targets = targets.filter(function (r) { return r.Role === filterRole; });

    let sent = 0, failed = 0;
    targets.forEach(function (r) {
      const resp = UrlFetchApp.fetch('https://fcm.googleapis.com/v1/projects/' + projectId + '/messages:send', {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + accessToken },
        payload: JSON.stringify({
          message: {
            token: r.Token,
            notification: { title: title, body: body },
            webpush: {
              headers: { Urgency: 'high' },
              notification: {
                icon:               appUrl + 'logo.png',
                badge:              appUrl + 'logo.png',
                vibrate:            [200, 100, 200],
                requireInteraction: true
              },
              fcm_options: { link: appUrl }
            }
          }
        }),
        muteHttpExceptions: true
      });
      if (resp.getResponseCode() === 200) sent++;
      else failed++;
    });

    logAudit(ss, 'RESOURCE_NOTIFICATION_SENT', data.audience || 'All Shepherds', (data.title || '') + ' — ' + sent + ' sent, ' + failed + ' failed');
  } catch (e) {
    logAudit(ss, 'RESOURCE_NOTIFICATION_FAILED', data.addedBy || 'Admin', e.toString());
  }
}

function deleteResourceRecord(data) {
  if (!data.resourceId) return jsonResponse({ status: 'error', message: 'Missing resourceId' });
  var headers = ['ResourceID','Title','Category','Audience','URL','Description','Mandatory','DateAdded','AddedBy'];
  var sheet = ensureSheet('Resources', headers);
  var records = getSheetRecords(sheet);
  var target = records.find(function (r) { return String(r.ResourceID) === String(data.resourceId); });
  if (target) sheet.deleteRow(target._row);
  return jsonResponse({ status: 'success' });
}

function seedMandatoryReads(resourceId, title, shepherdNames) {
  var headers = ['ResourceID','ResourceTitle','ShepherdName','Status','ReadDate','ReadTime'];
  var sheet = ensureSheet('MandatoryReads', headers);
  var existing = getSheetRecords(sheet);
  var known = {};
  existing.forEach(function (r) { known[r.ResourceID + '||' + r.ShepherdName] = true; });
  (shepherdNames || []).forEach(function (name) {
    if (!name) return;
    var key = resourceId + '||' + name;
    if (known[key]) return;
    sheet.appendRow([resourceId, title, name, 'Pending', '', '']);
  });
}

function getMandatoryReads() {
  var headers = ['ResourceID','ResourceTitle','ShepherdName','Status','ReadDate','ReadTime'];
  var sheet = ensureSheet('MandatoryReads', headers);
  return { status: 'success', records: getSheetRecords(sheet) };
}

function markResourceRead(data) {
  if (!data.resourceId || !data.shepherdName)
    return jsonResponse({ status: 'error', message: 'Missing resourceId or shepherdName' });
  var headers = ['ResourceID','ResourceTitle','ShepherdName','Status','ReadDate','ReadTime'];
  var sheet = ensureSheet('MandatoryReads', headers);
  var records = getSheetRecords(sheet);
  var now = new Date();
  var target = records.find(function (r) {
    return String(r.ResourceID) === String(data.resourceId) && r.ShepherdName === data.shepherdName;
  });
  if (target) {
    sheet.getRange(target._row, 4).setValue('Read');
    sheet.getRange(target._row, 5).setValue(formatDate(now));
    sheet.getRange(target._row, 6).setValue(formatTime(now));
  } else {
    sheet.appendRow([data.resourceId, data.resourceTitle || '', data.shepherdName, 'Read', formatDate(now), formatTime(now)]);
  }
  return jsonResponse({ status: 'success' });
}

// ============================================================
// BAPTISM TRACKING
// ============================================================

function getBaptismRecords() {
  var headers = ['MemberID','MemberName','ShepherdName','Status','BaptismDate','CohortName','Notes'];
  var sheet = ensureSheet('BaptismRecords', headers);
  return { status: 'success', records: getSheetRecords(sheet) };
}

function updateBaptismStatus(data) {
  if (!data.memberId || !data.status) return jsonResponse({ status: 'error', message: 'Missing memberId or status' });
  var headers = ['MemberID','MemberName','ShepherdName','Status','BaptismDate','CohortName','Notes'];
  var sheet = ensureSheet('BaptismRecords', headers);
  var records = getSheetRecords(sheet);
  var target = records.find(function (r) { return r.MemberID.toString() === data.memberId.toString(); });
  if (target) {
    sheet.getRange(target._row, 4).setValue(data.status);
    if (data.baptismDate) sheet.getRange(target._row, 5).setValue(data.baptismDate);
  } else {
    sheet.appendRow([data.memberId, data.memberName || '', data.shepherdName || '', data.status, data.baptismDate || '', '', '']);
  }
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'BAPTISM_STATUS_UPDATED', data.updatedBy || 'Admin',
    (data.memberName || data.memberId) + ' → ' + data.status);
  return jsonResponse({ status: 'success' });
}

function createBaptismCohort(data) {
  if (!data.cohortName || !Array.isArray(data.members) || !data.members.length)
    return jsonResponse({ status: 'error', message: 'Missing cohort name or members' });
  var headers = ['MemberID','MemberName','ShepherdName','Status','BaptismDate','CohortName','Notes'];
  var sheet = ensureSheet('BaptismRecords', headers);
  var records = getSheetRecords(sheet);
  var addedRows = [];
  data.members.forEach(function (m) {
    var target = records.find(function (r) { return r.MemberID.toString() === m.memberId.toString(); });
    if (target) {
      sheet.getRange(target._row, 5).setValue(data.baptismDate || '');
      sheet.getRange(target._row, 6).setValue(data.cohortName);
      if (!target.Status || target.Status === 'Not Started')
        sheet.getRange(target._row, 4).setValue('Preparing');
    } else {
      sheet.appendRow([m.memberId, m.memberName || '', m.shepherdName || '', 'Preparing', data.baptismDate || '', data.cohortName, '']);
      addedRows.push({ _row: sheet.getLastRow(), MemberID: m.memberId, Status: 'Preparing' });
    }
  });
  records = records.concat(addedRows);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'BAPTISM_COHORT_CREATED', data.createdBy || 'Admin',
    data.cohortName + ' (' + data.members.length + ' members)');
  return jsonResponse({ status: 'success', cohort: data.cohortName });
}

// ============================================================
// GO DASHBOARD DATA
// ============================================================

function getGODashboardData() {
  var ss          = SpreadsheetApp.getActiveSpreadsheet();
  var now         = new Date();
  var currentWeek = getWeekNumber(now);
  var currentMonth = now.getMonth();
  var currentYear  = now.getFullYear();

  var spsSheet = ss.getSheetByName(SHEET_NAME);
  var spsRows  = (spsSheet && spsSheet.getLastRow() > 1) ? spsSheet.getDataRange().getValues().slice(1) : [];
  var mcSheet  = ss.getSheetByName(MC_SHEET_NAME);
  var mcRows   = (mcSheet && mcSheet.getLastRow() > 1) ? mcSheet.getDataRange().getValues().slice(1) : [];

  var spsThisWeek = spsRows.filter(function (r) { return r[18] == currentWeek; });
  var mcThisWeek  = mcRows.filter(function (r) { return r[22] == currentWeek; });

  var reportedSet        = {};
  var shepherdAttendance = {};
  spsThisWeek.forEach(function (r) {
    var name = String(r[7] || ''); if (!name) return;
    reportedSet[name] = true;
    shepherdAttendance[name] = parseInt(String(r[12]).replace('%', '')) || 0;
  });
  mcThisWeek.forEach(function (r) {
    var name = String(r[7] || ''); if (!name) return;
    reportedSet[name] = true;
    shepherdAttendance[name] = parseInt(String(r[13]).replace('%', '')) || 0;
  });

  var newSouls = mcThisWeek.reduce(function (sum, r) { return sum + (parseInt(r[18]) || 0); }, 0);

  var flags = getFlags().records;
  var flagsRaised   = flags.filter(function (f) { return _inWeek(f.FlagDate,   currentWeek); }).length;
  var flagsResolved = flags.filter(function (f) { return f.ResolutionDate && _inWeek(f.ResolutionDate, currentWeek); }).length;

  var foundationsSheet = ensureSheet('FoundationsSchool', ['MemberID','MemberName','EnrolledDate','Week1','Week2','Week3','Week4','Week5','Week6','CompletedDate']);
  var foundations = getSheetRecords(foundationsSheet);
  var foundationsEnrolments = foundations.filter(function (r) {
    if (!r.EnrolledDate) return false;
    var d = new Date(r.EnrolledDate);
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  var visitations = getVisitations().visitations;
  var journey     = getDiscipleshipJourney().records;

  var trend = [];
  for (var i = 7; i >= 0; i--) {
    var wk = currentWeek - i;
    if (wk <= 0) continue;
    var swk = spsRows.filter(function (r) { return r[18] == wk; });
    var mwk = mcRows.filter(function  (r) { return r[22] == wk; });
    var mset = {}; var sset = {};
    swk.forEach(function (r) {
      if (r[7]) sset[r[7]] = true;
      String(r[8] || '').split(',').forEach(function (n) { n = n.trim(); if (n) mset[n] = true; });
    });
    mwk.forEach(function (r) {
      if (r[7]) sset[r[7]] = true;
      String(r[9] || '').split(',').forEach(function (n) { n = n.trim(); if (n) mset[n] = true; });
    });
    trend.push({
      week: wk, label: 'Wk ' + wk,
      activeMembers:   Object.keys(mset).length,
      activeShepherds: Object.keys(sset).length
    });
  }

  return {
    status: 'success',
    weekly: {
      currentWeek:            currentWeek,
      totalReports:           spsThisWeek.length + mcThisWeek.length,
      reportedShepherds:      Object.keys(reportedSet),
      newSouls:               newSouls,
      flagsRaised:            flagsRaised,
      flagsResolved:          flagsResolved,
      foundationsEnrolments:  foundationsEnrolments
    },
    shepherdAttendance: shepherdAttendance,
    flags:       flags,
    visitations: visitations,
    journey:     journey,
    trend:       trend
  };
}

function _inWeek(dateValue, weekNum) {
  if (!dateValue) return false;
  var d = new Date(dateValue);
  return !isNaN(d.getTime()) && getWeekNumber(d) === weekNum;
}

// ============================================================
// ZONE WEEKLY SNAPSHOTS
// ============================================================

function saveZoneConfig(data) {
  var headers = ['ZoneID', 'ZoneName', 'Supershepherd', 'Shepherds', 'UpdatedAt'];
  var sheet   = ensureSheet('ZoneConfig', headers);
  var now     = new Date();
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  (data.zones || []).forEach(function (zone, i) {
    sheet.appendRow([
      'ZONE-' + (i + 1),
      zone.name        || 'Zone ' + (i + 1),
      zone.supershepherd || '',
      (zone.shepherds  || []).join(','),
      formatDate(now)  + ' ' + formatTime(now)
    ]);
  });
  return jsonResponse({ status: 'success' });
}

function getZoneSnapshots() {
  var headers = ['ZoneID', 'ZoneName', 'WeekNumber', 'WeekStartDate', 'ReportingRate', 'AvgAttendance', 'FlagsRaised', 'NewSouls', 'Timestamp'];
  var sheet   = ensureSheet('ZoneWeeklySnapshot', headers);
  return { status: 'success', snapshots: getSheetRecords(sheet) };
}

function saveZoneSnapshot() {
  var ss          = SpreadsheetApp.getActiveSpreadsheet();
  var now         = new Date();
  var currentWeek = getWeekNumber(now);

  var configSheet = ss.getSheetByName('ZoneConfig');
  if (!configSheet || configSheet.getLastRow() <= 1) {
    Logger.log('saveZoneSnapshot: No ZoneConfig sheet found');
    return;
  }
  var zones   = getSheetRecords(configSheet);
  var spsRows = (function () {
    var s = ss.getSheetByName(SHEET_NAME);
    return (s && s.getLastRow() > 1) ? s.getDataRange().getValues().slice(1) : [];
  })();
  var mcRows  = (function () {
    var s = ss.getSheetByName(MC_SHEET_NAME);
    return (s && s.getLastRow() > 1) ? s.getDataRange().getValues().slice(1) : [];
  })();
  var flags        = getFlags().records;
  var flagsWeek    = flags.filter(function (f) { return _inWeek(f.FlagDate, currentWeek); });
  var spsWeek      = spsRows.filter(function (r) { return r[18] == currentWeek; });
  var mcWeek       = mcRows.filter(function (r)  { return r[22] == currentWeek; });

  var d = new Date(now);
  var day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  var weekStart = formatDate(d);

  var sheet = ensureSheet('ZoneWeeklySnapshot',
    ['ZoneID', 'ZoneName', 'WeekNumber', 'WeekStartDate', 'ReportingRate', 'AvgAttendance', 'FlagsRaised', 'NewSouls', 'Timestamp']);

  zones.forEach(function (zone) {
    var shepherds = String(zone.Shepherds || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!shepherds.length) return;

    var zSps     = spsWeek.filter(function (r) { return shepherds.indexOf(String(r[7] || '')) > -1; });
    var zMc      = mcWeek.filter(function  (r) { return shepherds.indexOf(String(r[7] || '')) > -1; });
    var allZone  = zSps.concat(zMc);
    var reported = new Set(allZone.map(function (r) { return r[7]; }));

    var reportingRate = Math.round(reported.size / shepherds.length * 100);
    var avgAttendance = allZone.length ? Math.round(
      allZone.reduce(function (sum, r) {
        return sum + (parseInt(String(r[12] || r[13] || '').replace('%', '')) || 0);
      }, 0) / allZone.length
    ) : 0;
    var flagsRaised = flagsWeek.filter(function (f) {
      return shepherds.indexOf(String(f.ShepherdName || '')) > -1;
    }).length;
    var newSouls = zMc.reduce(function (sum, r) { return sum + (parseInt(r[18]) || 0); }, 0);

    sheet.appendRow([
      zone.ZoneID || '',
      zone.ZoneName || '',
      currentWeek,
      weekStart,
      reportingRate,
      avgAttendance,
      flagsRaised,
      newSouls,
      formatDate(now) + ' ' + formatTime(now)
    ]);
  });

  Logger.log('Zone snapshots saved for week ' + currentWeek);
}

function setupZoneSnapshotTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'saveZoneSnapshot') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('saveZoneSnapshot')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(6).create();
  Logger.log('Zone snapshot trigger set for every Monday at 6am');
}

// ============================================================
// SHEPHERD PERFORMANCE SCORING
// ============================================================

function getShepherdScores() {
  var headers = ['ShepherdName', 'Stream', 'ReportingScore', 'AttendanceScore', 'SoulsScore', 'FlagScore', 'TotalScore', 'Grade', 'WeekNumber'];
  var sheet   = ensureSheet('ShepherdScores', headers);
  return { status: 'success', scores: getSheetRecords(sheet) };
}

function calculateShepherdScores() {
  var ss          = SpreadsheetApp.getActiveSpreadsheet();
  var now         = new Date();
  var currentWeek = getWeekNumber(now);
  var curMonth    = now.getMonth();
  var curYear     = now.getFullYear();

  var spsRows = (function () {
    var s = ss.getSheetByName(SHEET_NAME);
    return (s && s.getLastRow() > 1) ? s.getDataRange().getValues().slice(1) : [];
  })();
  var mcRows  = (function () {
    var s = ss.getSheetByName(MC_SHEET_NAME);
    return (s && s.getLastRow() > 1) ? s.getDataRange().getValues().slice(1) : [];
  })();

  var flags = getFlags().records;

  var shepherdMap = {};
  spsRows.forEach(function (r) {
    var name = String(r[7] || ''); if (!name) return;
    if (!shepherdMap[name]) shepherdMap[name] = { stream: 'SPS', spsRows: [], mcRows: [] };
    shepherdMap[name].spsRows.push(r);
  });
  mcRows.forEach(function (r) {
    var name = String(r[7] || ''); if (!name) return;
    if (!shepherdMap[name]) shepherdMap[name] = { stream: 'MC', spsRows: [], mcRows: [] };
    shepherdMap[name].stream = 'MC';
    shepherdMap[name].mcRows.push(r);
  });

  var weeks8 = [];
  for (var i = 0; i < 8; i++) { var wk = currentWeek - i; if (wk > 0) weeks8.push(wk); }

  var headers = ['ShepherdName', 'Stream', 'ReportingScore', 'AttendanceScore', 'SoulsScore', 'FlagScore', 'TotalScore', 'Grade', 'WeekNumber'];
  var sheet   = ensureSheet('ShepherdScores', headers);
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);

  Object.keys(shepherdMap).forEach(function (name) {
    var info    = shepherdMap[name];
    var allRows = info.spsRows.concat(info.mcRows);

    var weeksReported = weeks8.filter(function (wk) {
      return allRows.some(function (r) {
        return parseInt(r[18]) === wk || parseInt(r[22]) === wk;
      });
    }).length;
    var reportingScore = Math.round(weeksReported / 8 * 100);

    var recentRows = allRows.filter(function (r) {
      return weeks8.indexOf(parseInt(r[18]) || parseInt(r[22])) > -1;
    });
    var attendanceScore = recentRows.length ? Math.round(
      recentRows.reduce(function (sum, r) {
        return sum + (parseInt(String(r[12] || r[13] || '').replace('%', '')) || 0);
      }, 0) / recentRows.length
    ) : 0;

    var soulsThisMonth = info.mcRows.filter(function (r) {
      var raw = r[1];
      var d   = raw instanceof Date ? raw : (raw ? new Date(String(raw).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')) : null);
      return d && !isNaN(d.getTime()) && d.getMonth() === curMonth && d.getFullYear() === curYear;
    }).reduce(function (sum, r) { return sum + (parseInt(r[18]) || 0); }, 0);
    var soulsScore = Math.min(100, Math.round(soulsThisMonth / 5 * 100));

    var sFlags   = flags.filter(function (f) { return f.ShepherdName === name; });
    var raised   = sFlags.length;
    var resolved = sFlags.filter(function (f) { return f.ResolutionDate; }).length;
    var flagScore = raised > 0 ? Math.round(resolved / raised * 100) : 100;

    var total = Math.round(reportingScore * 0.4 + attendanceScore * 0.3 + soulsScore * 0.2 + flagScore * 0.1);
    var grade = total >= 80 ? 'A' : total >= 60 ? 'B' : total >= 40 ? 'C' : 'D';

    sheet.appendRow([name, info.stream, reportingScore, attendanceScore, soulsScore, flagScore, total, grade, currentWeek]);
  });

  logAudit(ss, 'SCORES_CALCULATED', 'System', 'Week ' + currentWeek + ' — ' + Object.keys(shepherdMap).length + ' shepherds');
  return jsonResponse({ status: 'success', count: Object.keys(shepherdMap).length });
}

// ============================================================
// MEMBERS / SEEKER PIPELINE
// ============================================================

const MEMBERS_SHEET  = 'Members';
const MEMBERS_HEADERS = ['MemberID', 'Name', 'Phone', 'Shepherd', 'Zone', 'Stream', 'ImportDate',
  'Status', 'Source', 'ApprovedBy', 'ApprovedDate', 'GraduatedBy', 'GraduatedDate',
  'DOB', 'BornAgain', 'InChurch', 'Occupation', 'AddressOrHostel',
  'Gender', 'Email', 'Location', 'MaritalStatus', 'WorkPlace',
  'BelongsToOvercomers', 'ChurchName', 'Testimony', 'PrayerRequest', 'Comments'];

// ============================================================
// FELLOWSHIP SELF-SERVICE SIGN-UP
// Public, no-login form (fellowship-signup.html) where a Fellowship
// (a.k.a. satellite location) member submits their own details directly,
// ahead of the Fellowship shepherd/reporting structure being set up.
// Lands in the Members sheet as a Pending entry (Zone holds the satellite
// location name) so admin can review/assign from the Seekers tab once
// Fellowship shepherds exist.
// ============================================================
function submitFellowshipMember(data) {
  const m = data.member || {};
  const name  = (m.name  || '').toString().trim();
  const phone = (m.phone || '').toString().trim();
  if (!name || !phone)
    return jsonResponse({ status: 'error', message: 'Name and phone are required' });

  const sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);

  // Avoid a duplicate row if this same submission is retried (e.g. after a
  // network/CORS hiccup even though the original submission succeeded).
  if (m.id) {
    const records = getSheetRecords(sheet);
    if (records.some(function (r) { return String(r.MemberID) === String(m.id); })) {
      return jsonResponse({ status: 'success' });
    }
  }

  const now = new Date();
  const occupation = m.occupation === 'Other' ? (m.occupationOther || 'Other') : (m.occupation || '');

  // Write Phone (col 3) and DOB (col 14) as plain text so Sheets doesn't
  // auto-convert them — numeric-looking phone strings lose leading zeros
  // (breaking most Ghanaian numbers), and dd/mm/yyyy-style dates can get
  // silently swapped by locale-dependent parsing, same issue already
  // guarded against in submitGuestForm.
  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 3).setNumberFormat('@');
  sheet.getRange(newRow, 14).setNumberFormat('@');

  sheet.getRange(newRow, 1, 1, 18).setValues([[
    m.id || 'FEL-' + now.getTime(),
    name, phone,
    '',                                  // Shepherd — unassigned until Fellowship structure exists
    m.satelliteLocation || '',           // Zone — the satellite location name
    'fellowship',
    formatDate(now),
    'Pending', 'Fellowship Self-Service',
    '', '', '', '',
    m.dob || '', m.bornAgain || '', m.inChurch || '', occupation, m.address || ''
  ]]);

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'FELLOWSHIP_SIGNUP', 'Fellowship Self-Service', name);
  return jsonResponse({ status: 'success' });
}

// ============================================================
// SEEKER SELF-SIGN-UP
// Public, no-login form (seeker-signup.html) where a new seeker submits
// their own details AND picks their own shepherd from the real shepherd
// list (or says they don't have one yet). Lands live immediately under
// that shepherd with Status='Seeker' — no admin/shepherd confirmation
// step, by explicit choice: the shepherd is pre-filled by the person
// themselves so nobody has to manually go assign them afterward. Unlike
// submitFellowshipMember above (always Pending, always unassigned), this
// trusts the submitter's own shepherd claim outright.
// ============================================================
function submitSeekerSelfSignup(data) {
  const m = data.member || {};
  const name  = (m.name  || '').toString().trim();
  const phone = (m.phone || '').toString().trim();
  if (!name || !phone)
    return jsonResponse({ status: 'error', message: 'Name and phone are required' });

  const sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  const records = getSheetRecords(sheet);

  // Avoid a duplicate row if this same submission is retried (e.g. after a
  // network/CORS hiccup even though the original submission succeeded).
  if (m.id && records.some(function (r) { return String(r.MemberID) === String(m.id); })) {
    return jsonResponse({ status: 'success' });
  }

  const occupation = m.occupation === 'Other' ? (m.occupationOther || 'Other') : (m.occupation || '');
  const seekerDetails = [
    m.gender || '',
    m.email || '',
    m.location || '',
    m.maritalStatus || '',
    m.workPlace || '',
    m.belongsToOvercomers || '',
    m.churchName || '',
    m.testimony || '',
    m.prayerRequest || '',
    m.comments || ''
  ];
  const shepherd   = (m.shepherd || '').toString().trim();
  const stream     = shepherd ? (m.shepherdType === 'mc' ? 'mc' : 'sps') : '';

  // Same person submitting again under the same shepherd (retyped the form,
  // or a shepherd already added them separately via Know Your Members)
  // updates that existing record with any new details instead of creating
  // a duplicate row - same name+shepherd matching key used everywhere else
  // on this sheet, just resolved as a merge rather than a hard reject,
  // since this is a public form and a rejection would leave the person
  // with no way to know what to do next. Only applies when a shepherd was
  // actually picked - matching on name alone across many different
  // "no shepherd yet" submitters would risk merging two different people
  // who happen to share a name.
  if (shepherd) {
    const dup = records.find(function (r) {
      return r.Name && r.Name.toString().trim().toLowerCase() === name.toLowerCase() &&
        (r.Shepherd || '').toString().trim().toLowerCase() === shepherd.toLowerCase();
    });
    if (dup) {
      sheet.getRange(dup._row, 3).setNumberFormat('@');
      sheet.getRange(dup._row, 14).setNumberFormat('@');
      sheet.getRange(dup._row, 20).setNumberFormat('@');
      if (phone)       sheet.getRange(dup._row, 3).setValue(phone);
      if (m.dob)        sheet.getRange(dup._row, 14).setValue(m.dob);
      if (m.bornAgain)  sheet.getRange(dup._row, 15).setValue(m.bornAgain);
      if (occupation)   sheet.getRange(dup._row, 17).setValue(occupation);
      sheet.getRange(dup._row, 19, 1, seekerDetails.length).setValues([seekerDetails]);
      logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SEEKER_SELF_SIGNUP_MERGED', shepherd, name);
      return jsonResponse({ status: 'success', memberId: dup.MemberID, merged: true });
    }
  }

  const now = new Date();
  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 3).setNumberFormat('@');
  sheet.getRange(newRow, 14).setNumberFormat('@');
  sheet.getRange(newRow, 20).setNumberFormat('@');

  sheet.getRange(newRow, 1, 1, 28).setValues([[
    m.id || 'SEEK-' + now.getTime(),
    name, phone,
    shepherd,                            // Shepherd — the person's own pick, or '' if "no shepherd yet"
    '', stream,
    formatDate(now),
    'Seeker', 'Seeker Self-Signup',
    '', '', '', '',
    m.dob || '', m.bornAgain || '', '', occupation, '',
    seekerDetails[0], seekerDetails[1], seekerDetails[2], seekerDetails[3], seekerDetails[4],
    seekerDetails[5], seekerDetails[6], seekerDetails[7], seekerDetails[8], seekerDetails[9]
  ]]);

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SEEKER_SELF_SIGNUP', shepherd || '(no shepherd chosen)', name);
  return jsonResponse({ status: 'success' });
}

function bulkImportMembers(data) {
  if (!Array.isArray(data.members) || !data.members.length)
    return jsonResponse({ status: 'error', message: 'No members provided' });

  var membersSheet  = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var importHeaders = ['ImportID', 'Date', 'ImportedBy', 'RowCount', 'Status'];
  var importSheet   = ensureSheet('BulkImports', importHeaders);

  // Dedup guard, matched by name+shepherd (same convention as addOrUpdateSeeker) -
  // without this, re-running an import (e.g. after a partial failure) creates
  // duplicate rows instead of being safely re-runnable.
  var existingKeys = {};
  getSheetRecords(membersSheet).forEach(function (r) {
    if (!r.Name) return;
    existingKeys[r.Name.toString().trim().toLowerCase() + '|' + (r.Shepherd || '').toString().trim().toLowerCase()] = true;
  });

  var now      = new Date();
  var importId = 'IMP-' + now.getTime();
  var count    = 0;
  var skipped  = 0;
  var nextRow  = membersSheet.getLastRow() + 1;

  data.members.forEach(function (m, i) {
    if (!m.name) return;
    var key = m.name.toString().trim().toLowerCase() + '|' + (m.shepherd || '').toString().trim().toLowerCase();
    if (existingKeys[key]) { skipped++; return; }
    existingKeys[key] = true; // also guards against duplicates within this same batch

    // Bulk-imported rows are presumed already-established members, not seekers.
    // Phone written as text so Sheets doesn't strip a leading zero, same guard
    // used in submitFellowshipMember/addOrUpdateSeeker.
    membersSheet.getRange(nextRow, 3).setNumberFormat('@');
    membersSheet.getRange(nextRow, 1, 1, 13).setValues([[
      importId + '-' + (i + 1),
      m.name     || '',
      m.phone    || '',
      m.shepherd || '',
      m.zone     || '',
      m.stream   || 'SPS',
      formatDate(now),
      'Member', 'BulkImport', '', '', '', ''
    ]]);
    nextRow++;
    count++;
  });

  importSheet.appendRow([importId, formatDate(now), data.importedBy || 'Admin', count, 'Completed']);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'BULK_IMPORT', data.importedBy || 'Admin',
    count + ' members imported, ' + skipped + ' skipped as duplicates (' + importId + ')');
  return jsonResponse({ status: 'success', importId: importId, count: count, skipped: skipped });
}

// Adds a person reported as a "new soul"/"new member" to the Members sheet
// as a Pending seeker (or silently returns the existing record if they're
// already tracked, matched by name+shepherd) — so the same person doesn't
// get reported as new every week, and admin/heads can review from the
// Seekers tab. shepherdName/stream tag who they belong to; source records
// which report flow created the entry (for audit only).
function addOrUpdateSeeker(name, phone, shepherdName, stream, source, details) {
  name = (name || '').toString().trim();
  if (!name) return null;
  details = details || {};

  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var records = getSheetRecords(sheet);
  var existing = records.find(function (r) {
    return r.Name && r.Name.toString().trim().toLowerCase() === name.toLowerCase() && r.Shepherd === shepherdName;
  });
  if (existing) return existing;

  var now = new Date();
  var memberId = 'MEM-' + now.getTime() + '-' + Math.floor(Math.random() * 1000);

  // Write Phone (col 3) and DOB (col 14) as plain text so Sheets doesn't
  // auto-convert them, same guard used in submitFellowshipMember.
  var newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 3).setNumberFormat('@');
  sheet.getRange(newRow, 14).setNumberFormat('@');

  sheet.getRange(newRow, 1, 1, 18).setValues([[
    memberId, name, phone || '', shepherdName || '', '', stream || '',
    formatDate(now), 'Pending', source || '', '', '', '', '',
    details.dob || '', details.bornAgain || '', details.inChurch || '', details.occupation || '', details.address || ''
  ]]);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SEEKER_ADDED', shepherdName || '', name + ' (' + (source || '') + ')');
  return { MemberID: memberId, Name: name, Phone: phone || '', Shepherd: shepherdName || '', Zone: '', Stream: stream || '', Status: 'Pending' };
}

// Shepherd self-service: add a new Member or Seeker directly under themselves
// from the "Know Your Members" screen, going live immediately (no admin
// approval gate) — the shepherd explicitly chooses which type this is at
// creation time, unlike addOrUpdateSeeker above which always lands Pending.
// Modeled on submitFellowshipMember's full-column write + idempotent-retry
// guard (client-generated id), since this hits the same live-network-on-a-
// mobile-PWA reliability problem that motivated that pattern originally.
function addMemberSelfService(data) {
  var m        = data.member || {};
  var name     = (m.name || '').toString().trim();
  var shepherd = (data.shepherd || '').toString().trim();
  var status   = data.status === 'Seeker' ? 'Seeker' : 'Member';
  var stream   = (data.shepherdType === 'mc' || data.shepherdType === 'microchurch') ? 'mc' : 'sps';

  if (!name)     return jsonResponse({ status: 'error', message: 'Name is required' });
  if (!shepherd) return jsonResponse({ status: 'error', message: 'Shepherd is required' });

  var sheet   = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var records = getSheetRecords(sheet);

  // Idempotent retry: if this exact submission already landed (matched by the
  // client-generated id), don't create a second row on a retried request.
  if (m.id && records.some(function (r) { return String(r.MemberID) === String(m.id); })) {
    return jsonResponse({ status: 'success' });
  }

  var dup = records.find(function (r) {
    return r.Name && r.Name.toString().trim().toLowerCase() === name.toLowerCase() &&
      (r.Shepherd || '').toString().trim().toLowerCase() === shepherd.toLowerCase();
  });
  if (dup) {
    return jsonResponse({ status: 'duplicate', message: name + ' is already on your list — edit them instead.', memberId: dup.MemberID });
  }

  var now       = new Date();
  var memberId  = m.id || 'MEM-' + now.getTime() + '-' + Math.floor(Math.random() * 1000);
  var occupation = m.occupation === 'Other' ? (m.occupationOther || 'Other') : (m.occupation || '');

  var newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 3).setNumberFormat('@');
  sheet.getRange(newRow, 14).setNumberFormat('@');

  sheet.getRange(newRow, 1, 1, 18).setValues([[
    memberId, name, m.phone || '', shepherd, data.zone || '', stream,
    formatDate(now), status, 'Shepherd Self-Service', '', '', '', '',
    m.dob || '', m.bornAgain || '', m.inChurch || '', occupation, m.address || ''
  ]]);

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'MEMBER_SELF_ADDED', shepherd, name + ' (' + status + ')');
  return jsonResponse({ status: 'success', memberId: memberId });
}

// Shepherd self-service: edit details of a member/seeker already on their
// own list, including their name (e.g. fixing a typo) — every screen that
// reads the roster (attendance cards, Know Your Members, badges) rebuilds
// its lists fresh from this sheet each time it's opened, so a rename here
// just shows up correctly next time; already-submitted reports keep
// whichever name was current at submission time, same as any other
// snapshot-in-time record. Guards against renaming into a name collision
// with another person already on this shepherd's list. Authorization
// matches the app's existing trust model (every other write in this file
// trusts a client-supplied name the same way) — not new security
// infrastructure, just consistent with how the rest of the app works.
function updateMemberDetails(data) {
  var memberId = data.memberId;
  var requestingShepherd = (data.requestingShepherd || '').toString().trim();
  if (!memberId) return jsonResponse({ status: 'error', message: 'Missing memberId' });

  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var records = getSheetRecords(sheet);
  var rec = records.find(function (r) { return String(r.MemberID) === String(memberId); });
  if (!rec) return jsonResponse({ status: 'error', message: 'Member not found' });
  if ((rec.Shepherd || '').toString().trim().toLowerCase() !== requestingShepherd.toLowerCase()) {
    return jsonResponse({ status: 'error', message: 'This person is not on your list' });
  }

  var fields = data.fields || {};
  var newName = (fields.name || '').toString().trim();

  if (newName && newName.toLowerCase() !== (rec.Name || '').toString().trim().toLowerCase()) {
    var collision = records.find(function (r) {
      return String(r.MemberID) !== String(memberId) &&
        (r.Shepherd || '').toString().trim().toLowerCase() === requestingShepherd.toLowerCase() &&
        r.Name && r.Name.toString().trim().toLowerCase() === newName.toLowerCase();
    });
    if (collision) {
      return jsonResponse({ status: 'error', message: newName + ' is already on your list under a different entry.' });
    }
  }

  sheet.getRange(rec._row, 3).setNumberFormat('@');
  sheet.getRange(rec._row, 14).setNumberFormat('@');

  if (newName)               sheet.getRange(rec._row, 2).setValue(newName);
  if (fields.phone      !== undefined) sheet.getRange(rec._row, 3).setValue(fields.phone);
  if (fields.zone       !== undefined) sheet.getRange(rec._row, 5).setValue(fields.zone);
  if (fields.dob        !== undefined) sheet.getRange(rec._row, 14).setValue(fields.dob);
  if (fields.bornAgain  !== undefined) sheet.getRange(rec._row, 15).setValue(fields.bornAgain);
  if (fields.inChurch   !== undefined) sheet.getRange(rec._row, 16).setValue(fields.inChurch);
  if (fields.occupation !== undefined) sheet.getRange(rec._row, 17).setValue(fields.occupation);
  if (fields.address    !== undefined) sheet.getRange(rec._row, 18).setValue(fields.address);

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'MEMBER_DETAILS_UPDATED', requestingShepherd, (newName || rec.Name));
  return jsonResponse({ status: 'success' });
}

// Full Members roster (Pending/Seeker/Member) — used by the admin Seekers tab.
function getMembersRoster() {
  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  return { status: 'success', members: getSheetRecords(sheet) };
}

// Lets the Fellowship/seeker sign-up forms confirm a submission actually
// reached the sheet before telling the person it succeeded, instead of
// trusting the no-cors POST blindly (that silent-failure gap is what
// caused real submissions to be lost before this existed — see 2026-07-24
// incident). name/shepherd are an optional fallback match for
// submitSeekerSelfSignup's merge-on-duplicate path, where a repeat
// submission updates an *existing* row (a different MemberID than the one
// the client generated) instead of creating a new one — without this
// fallback the client's original id would never be found and a real
// success would look like a failure.
function checkFellowshipMember(memberId, name, shepherd) {
  if (!memberId) return { status: 'success', exists: false };
  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var records = getSheetRecords(sheet);
  var exists = records.some(function (r) { return String(r.MemberID) === String(memberId); });
  if (!exists && name && shepherd) {
    exists = records.some(function (r) {
      return r.Name && r.Name.toString().trim().toLowerCase() === name.toString().trim().toLowerCase() &&
        (r.Shepherd || '').toString().trim().toLowerCase() === shepherd.toString().trim().toLowerCase();
    });
  }
  return { status: 'success', exists: exists };
}

// One shepherd's slice of the roster — merged into their attendance
// checklist in index.html right after they report a new soul, instead of
// waiting on admin approval before the person shows up next time.
function getShepherdMembers(shepherdName) {
  if (!shepherdName) return { status: 'success', members: [] };
  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var records = getSheetRecords(sheet).filter(function (r) { return r.Shepherd === shepherdName; });
  return { status: 'success', members: records };
}

// Admin or the relevant SPS/MC Head confirms a Pending seeker is legitimate.
function approveSeeker(memberId, approvedBy) {
  if (!memberId) return { status: 'error', message: 'Missing memberId' };
  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var rec = getSheetRecords(sheet).find(function (r) { return r.MemberID === memberId; });
  if (!rec) return { status: 'error', message: 'Member not found' };

  var now = new Date();
  sheet.getRange(rec._row, 8).setValue('Seeker');
  sheet.getRange(rec._row, 10).setValue(approvedBy || 'Admin');
  sheet.getRange(rec._row, 11).setValue(formatDate(now));
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SEEKER_APPROVED', approvedBy || 'Admin', rec.Name);
  return { status: 'success' };
}

// Manual admin action: graduates a Seeker to full Member.
function markSeekerAsMember(memberId, graduatedBy) {
  if (!memberId) return { status: 'error', message: 'Missing memberId' };
  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var rec = getSheetRecords(sheet).find(function (r) { return r.MemberID === memberId; });
  if (!rec) return { status: 'error', message: 'Member not found' };

  var now = new Date();
  sheet.getRange(rec._row, 8).setValue('Member');
  sheet.getRange(rec._row, 12).setValue(graduatedBy || 'Admin');
  sheet.getRange(rec._row, 13).setValue(formatDate(now));
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SEEKER_GRADUATED', graduatedBy || 'Admin', rec.Name);
  return { status: 'success' };
}

// Admin self-service: move a member (from the Members sheet -- seekers,
// graduated members, and bulk-imports) to a different shepherd, without
// a code deploy. Does not touch the static churchData.js roster, so it
// only covers members already tracked in this sheet -- see the roadmap
// plan for the full roster migration this is a first step toward.
function reassignMember(memberId, newShepherd, newZone, reassignedBy) {
  if (!memberId) return { status: 'error', message: 'Missing memberId' };
  if (!newShepherd) return { status: 'error', message: 'Missing newShepherd' };
  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var rec = getSheetRecords(sheet).find(function (r) { return r.MemberID === memberId; });
  if (!rec) return { status: 'error', message: 'Member not found' };

  var oldShepherd = rec.Shepherd || '(none)';
  sheet.getRange(rec._row, 4).setValue(newShepherd);
  if (newZone) sheet.getRange(rec._row, 5).setValue(newZone);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'MEMBER_REASSIGNED', reassignedBy || 'Admin',
    rec.Name + ': ' + oldShepherd + ' -> ' + newShepherd);
  return { status: 'success' };
}

// Admin self-service: permanently removes a row from the Members sheet
// (seeker, self-signup, bulk-import, or migrated static-roster member).
// Mirrors deleteResourceRecord's pattern.
function deleteMemberRecord(data) {
  if (!data.memberId) return jsonResponse({ status: 'error', message: 'Missing memberId' });
  var sheet = ensureSheet(MEMBERS_SHEET, MEMBERS_HEADERS);
  var rec = getSheetRecords(sheet).find(function (r) { return r.MemberID === data.memberId; });
  if (!rec) return jsonResponse({ status: 'error', message: 'Member not found' });
  sheet.deleteRow(rec._row);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'MEMBER_DELETED', data.deletedBy || 'Admin', rec.Name);
  return jsonResponse({ status: 'success' });
}

// ============================================================
// SHEPHERDS — created by General Overseer / Admin / SPS Head / MC Head
// from the admin dashboard. Stored here (rather than the hardcoded
// churchData.js / index.html rosters) so a newly added shepherd is
// picked up automatically the next time they open the shepherd app.
// ============================================================

const SHEPHERDS_HEADERS = ['ShepherdID', 'Name', 'Contact', 'Type', 'ZoneOrGroup', 'PIN', 'AddedBy', 'DateAdded'];

function addShepherd(data) {
  var name = (data.name || '').toString().trim();
  var type = (data.type || '').toString().toUpperCase(); // 'SPS' or 'MC'
  if (!name) return jsonResponse({ status: 'error', message: 'Shepherd name is required' });
  if (type !== 'SPS' && type !== 'MC') return jsonResponse({ status: 'error', message: 'Type must be SPS or MC' });

  var sheet = ensureSheet(SHEPHERDS_SHEET, SHEPHERDS_HEADERS);
  var records = getSheetRecords(sheet);
  var dup = records.find(function (r) {
    return r.Type === type && r.Name && r.Name.toString().trim().toLowerCase() === name.toLowerCase();
  });
  if (dup) return jsonResponse({ status: 'error', message: name + ' is already a ' + type + ' shepherd' });

  var now = new Date();
  var shepherdId = 'SHP-' + now.getTime();
  var pin = '0000';

  // Contact and PIN are numeric-looking strings - write as plain text first
  // or Sheets strips the leading zero (breaks Ghanaian numbers and turns
  // "0000" into 0), same guard used throughout Code.gs for phone columns.
  var newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 3).setNumberFormat('@');
  sheet.getRange(newRow, 6).setNumberFormat('@');
  sheet.getRange(newRow, 1, 1, 8).setValues([[
    shepherdId, name, data.contact || '', type, data.zoneOrGroup || '', pin,
    data.addedBy || 'Admin', formatDate(now)
  ]]);
  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SHEPHERD_ADDED', data.addedBy || 'Admin', name + ' (' + type + ')');

  return jsonResponse({
    status: 'success',
    shepherd: { ShepherdID: shepherdId, Name: name, Contact: data.contact || '', Type: type, ZoneOrGroup: data.zoneOrGroup || '', PIN: pin }
  });
}

// Shepherds added via the admin dashboard (not part of the static roster
// baked into churchData.js). index.html and admin.html merge these in
// on load so newly added shepherds show up without a code deploy.
function getDynamicShepherds() {
  var sheet = ensureSheet(SHEPHERDS_SHEET, SHEPHERDS_HEADERS);
  return { status: 'success', shepherds: getSheetRecords(sheet) };
}

// Moves a shepherd (SPS zone or microchurch group) to a different
// zone/group. Works for shepherds already in this sheet (added via
// addShepherd) by updating their row directly. For one of the original
// static-roster shepherds (churchData.js, no row here yet) this creates
// their first row here - admin.html then treats a matching Shepherds-sheet
// row as the authoritative zone/group, overriding the static value, while
// PIN/contact/members for that shepherd keep coming from the static files
// as before (only the zone/group label moves here).
function updateShepherdZone(data) {
  var name = (data.name || '').toString().trim();
  var type = (data.type || '').toString().toUpperCase();
  var newGroup = (data.zoneOrGroup || '').toString().trim();
  if (!name) return jsonResponse({ status: 'error', message: 'Shepherd name is required' });
  if (type !== 'SPS' && type !== 'MC') return jsonResponse({ status: 'error', message: 'Type must be SPS or MC' });
  if (!newGroup) return jsonResponse({ status: 'error', message: (type === 'MC' ? 'Microchurch name' : 'Zone') + ' is required' });

  var sheet = ensureSheet(SHEPHERDS_SHEET, SHEPHERDS_HEADERS);
  var records = getSheetRecords(sheet);
  var existing = records.find(function (r) {
    return r.Type === type && r.Name && r.Name.toString().trim().toLowerCase() === name.toLowerCase();
  });

  if (existing) {
    sheet.getRange(existing._row, 5).setValue(newGroup); // col 5 = ZoneOrGroup
  } else {
    var now = new Date();
    var newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 3).setNumberFormat('@');
    sheet.getRange(newRow, 6).setNumberFormat('@');
    sheet.getRange(newRow, 1, 1, 8).setValues([[
      'SHP-' + now.getTime(), name, data.contact || '', type, newGroup, '0000',
      data.updatedBy || 'Admin', formatDate(now)
    ]]);
  }

  logAudit(SpreadsheetApp.getActiveSpreadsheet(), 'SHEPHERD_ZONE_CHANGED', data.updatedBy || 'Admin', name + ' -> ' + newGroup);
  return jsonResponse({ status: 'success', name: name, zoneOrGroup: newGroup });
}

// ============================================================
// SHARED HELPERS
// ============================================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns DD/MM/YYYY — used by all v3.6 features for display & sheet storage.
function formatDate(date) {
  const d = new Date(date);
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  return day + '/' + month + '/' + year;
}

function formatTime(date) {
  var hours = String(date.getHours()).padStart(2, '0');
  var mins  = String(date.getMinutes()).padStart(2, '0');
  var secs  = String(date.getSeconds()).padStart(2, '0');
  return hours + ':' + mins + ':' + secs;
}

function getDayName(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

function getWeekNumber(date) {
  const d      = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatConcerns(concernsObj) {
  if (!concernsObj || Object.keys(concernsObj).length === 0) return 'None';
  return Object.entries(concernsObj)
    .filter(([member, concern]) => concern && concern.trim() !== '')
    .map(([member, concern]) => member + ': ' + concern)
    .join(' | ') || 'None';
}

function styleHeaders(sheet, colCount) {
  const header = sheet.getRange(1, 1, 1, colCount);
  header.setBackground('#0f2044');
  header.setFontColor('#ffffff');
  header.setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function getEmptyStats() {
  return {
    totalSessions:       0,
    reportedShepherds:   0,
    avgAttendanceRate:   '0%',
    prayerSessions:      0,
    concernsCount:       0,
    topicCoverage:       '0/0',
    currentWeek:         getWeekNumber(new Date()),
    totalReportsAllTime: 0
  };
}

function logAudit(ss, action, user, detail) {
  try {
    let sheet = ss.getSheetByName(LOG_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(LOG_SHEET);
      sheet.appendRow(['Timestamp', 'Action', 'User', 'Detail']);
      styleHeaders(sheet, 4);
    }
    const now = new Date();
    sheet.appendRow([formatDate(now) + ' ' + formatTime(now), action, user, detail]);
  } catch (e) {}
}

// ============================================================
// TRIGGERS
// ============================================================

// Run once manually to set up the push-reminder trigger. Runs hourly; the
// function itself checks REMINDER_DAYS/REMINDER_TIME from Settings so the
// schedule can be changed from admin.html without re-running this.
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendShepherdReportReminders') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendShepherdReportReminders')
    .timeBased().everyHours(1).create();
  Logger.log('Push reminder trigger set up successfully');
}

// Run once manually to set up the nightly flag-check trigger (1 am daily).
function setupNightlyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runNightlyFlagCheck') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runNightlyFlagCheck')
    .timeBased().everyDays(1).atHour(1).create();
  Logger.log('Nightly flag check trigger set up successfully');
}

// Hourly trigger (see setupTrigger). Only acts when REMINDER_ENABLED is true,
// today matches REMINDER_DAYS, and the current hour matches REMINDER_TIME —
// then pushes a reminder to every SPS/MC shepherd who hasn't yet submitted a
// report for the current ISO week, and a digest to the three head roles.
function sendShepherdReportReminders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!settingsSheet) return;

  var settings = {};
  settingsSheet.getDataRange().getValues().slice(1).forEach(function (row) {
    if (row[0]) settings[row[0]] = row[1];
  });
  if (settings['REMINDER_ENABLED'] !== 'true') return;

  var tz   = Session.getScriptTimeZone() || 'GMT';
  var days = (settings['REMINDER_DAYS'] || 'Mon,Wed,Fri').split(',').map(function (d) { return d.trim(); });
  if (days.indexOf(Utilities.formatDate(new Date(), tz, 'EEE')) === -1) return;

  var configuredHour = parseInt((settings['REMINDER_TIME'] || '08:00').split(':')[0], 10);
  if (Number(Utilities.formatDate(new Date(), tz, 'H')) !== configuredHour) return;

  var message = settings['REMINDER_MESSAGE'] || 'Hi {name}! Please submit your report for this week.';
  var missing = getShepherdsMissingReportThisWeek();
  var allMissing = missing.missingSPS.concat(missing.missingMC);
  var ctx = getFCMSendContext();

  if (allMissing.length > 0) {
    var notificationId = 'REM-' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
    var logSheet = ensureSheet(NOTIFICATION_LOG_SHEET,
      ['AnnouncementID', 'Title', 'ShepherdName', 'Role', 'Status', 'SentDate', 'ClickedDate']);
    var logRows = [];

    allMissing.forEach(function (r) {
      var body = message.replace('{name}', (r.ShepherdName || '').split(' ')[0]);
      var result = sendFCMPushToToken(ctx, r.Token, 'Report Reminder', body, notificationId, r.ShepherdName);
      var nowStr = formatDate(new Date()) + ' ' + formatTime(new Date());
      logRows.push([notificationId, 'Report Reminder', r.ShepherdName || '', r.Role || '', result.success ? 'sent' : 'failed', nowStr, '']);
    });

    if (logRows.length > 0) {
      logSheet.getRange(logSheet.getLastRow() + 1, 1, logRows.length, logRows[0].length).setValues(logRows);
    }
  }

  sendHeadDigests(missing.missingSPS, missing.missingMC, ctx);
}

// Returns FCM-registered SPS/MC shepherds who have no report logged against
// the current ISO week number yet.
function getShepherdsMissingReportThisWeek() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var currentWeek = getWeekNumber(new Date());

  function reportedNames(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    var names = {};
    if (!sheet || sheet.getLastRow() <= 1) return names;
    getSheetRecords(sheet).forEach(function (r) {
      if (Number(r['Week Number']) === currentWeek && r.Shepherd) names[r.Shepherd] = true;
    });
    return names;
  }

  var reportedSPS = reportedNames(SHEET_NAME);
  var reportedMC  = reportedNames(MC_SHEET_NAME);

  var tokenSheet = ss.getSheetByName(FCM_TOKENS_SHEET);
  var tokens = tokenSheet ? getSheetRecords(tokenSheet).filter(function (r) { return r.Token; }) : [];

  return {
    missingSPS: tokens.filter(function (r) { return r.Role === 'sps' && !reportedSPS[r.ShepherdName]; }),
    missingMC:  tokens.filter(function (r) { return r.Role === 'mc'  && !reportedMC[r.ShepherdName]; })
  };
}

// Counts open (non-closed, non-visited) visitations past their due date —
// the "missing report" equivalent for the First Timers Head.
function getOverdueVisitationCount() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(VISITATIONS_SHEET);
  if (!sheet || sheet.getLastRow() <= 1) return 0;

  var now = new Date();
  return getSheetRecords(sheet).filter(function (r) {
    if (r.Status === 'Closed' || r.Status === 'Visited') return false;
    if (!r.DueDate) return false;
    var due = r.DueDate instanceof Date ? r.DueDate : new Date(r.DueDate);
    return !isNaN(due.getTime()) && due < now;
  }).length;
}

// Pushes one summary notification each to SPS Head, MC Head, and First
// Timers Head — only if they have something to act on and a registered device.
function sendHeadDigests(missingSPS, missingMC, ctx) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tokenSheet = ss.getSheetByName(FCM_TOKENS_SHEET);
  if (!tokenSheet) return;
  var tokens = getSheetRecords(tokenSheet).filter(function (r) { return r.Token; });

  var overdueVisitations = getOverdueVisitationCount();
  var jobs = [
    { role: 'spshead', count: missingSPS.length, title: 'SPS Report Reminder',
      body: missingSPS.length + ' SPS shepherd(s) haven’t submitted this week’s report.' },
    { role: 'mchead', count: missingMC.length, title: 'MC Report Reminder',
      body: missingMC.length + ' MC shepherd(s) haven’t submitted this week’s report.' },
    { role: 'ftshead', count: overdueVisitations, title: 'Visitation Follow-up Reminder',
      body: overdueVisitations + ' first-timer visitation(s) are overdue follow-up.' }
  ];

  var notificationId = 'HEADDIGEST-' + formatDate(new Date()).replace(/\//g, '-');
  var logSheet = ensureSheet(NOTIFICATION_LOG_SHEET,
    ['AnnouncementID', 'Title', 'ShepherdName', 'Role', 'Status', 'SentDate', 'ClickedDate']);
  var logRows = [];

  jobs.forEach(function (job) {
    if (job.count === 0) return;
    var headToken = tokens.find(function (r) { return r.Role === job.role; });
    if (!headToken) return;
    var result = sendFCMPushToToken(ctx, headToken.Token, job.title, job.body, notificationId, headToken.ShepherdName);
    var nowStr = formatDate(new Date()) + ' ' + formatTime(new Date());
    logRows.push([notificationId, job.title, headToken.ShepherdName || '', job.role, result.success ? 'sent' : 'failed', nowStr, '']);
  });

  if (logRows.length > 0) {
    logSheet.getRange(logSheet.getLastRow() + 1, 1, logRows.length, logRows[0].length).setValues(logRows);
  }
}

// ============================================================
// FCM PUSH NOTIFICATIONS
// ============================================================

const FCM_TOKENS_SHEET = 'FCMTokens';
const NOTIFICATION_LOG_SHEET = 'NotificationLog';

// Returns an OAuth2 access token for the Firebase service account using
// the JWT bearer flow. Credentials come from Script Properties — never
// hardcode them.
function getFCMAccessToken() {
  const props      = PropertiesService.getScriptProperties();
  const clientEmail = props.getProperty('FIREBASE_CLIENT_EMAIL');
  const privateKey  = props.getProperty('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  const header = { alg: 'RS256', typ: 'JWT' };
  const now    = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss:   clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now
  };

  const base64url = function (obj) {
    return Utilities.base64EncodeWebSafe(JSON.stringify(obj)).replace(/=+$/, '');
  };

  const toSign = base64url(header) + '.' + base64url(claimSet);
  const signatureBytes = Utilities.computeRsaSha256Signature(toSign, privateKey);
  const signature = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, '');
  const jwt = toSign + '.' + signature;

  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    contentType: 'application/x-www-form-urlencoded',
    payload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    },
    muteHttpExceptions: true
  });

  const result = JSON.parse(response.getContentText());
  if (!result.access_token) throw new Error('Failed to get FCM access token: ' + response.getContentText());
  return result.access_token;
}

// Bundles the access token + project config needed for one batch of FCM
// sends, so callers fetch the OAuth token once instead of per-recipient.
function getFCMSendContext() {
  const props = PropertiesService.getScriptProperties();
  return {
    accessToken: getFCMAccessToken(),
    projectId:   props.getProperty('FIREBASE_PROJECT_ID'),
    appUrl:      (props.getProperty('APP_URL') || 'https://aa-teye.github.io/onc-sps-report/').replace(/\/?$/, '/')
  };
}

// Sends one push to one device token, tagging it with notificationId +
// shepherdName (via the FCM "data" payload) so sw.js's notificationclick
// handler can report opens back via logNotificationClick.
function sendFCMPushToToken(ctx, token, title, body, notificationId, shepherdName) {
  const resp = UrlFetchApp.fetch('https://fcm.googleapis.com/v1/projects/' + ctx.projectId + '/messages:send', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ctx.accessToken },
    payload: JSON.stringify({
      message: {
        token: token,
        notification: { title: title, body: body },
        data: { notificationId: notificationId, shepherdName: shepherdName || '' },
        webpush: {
          headers: { Urgency: 'high' },
          notification: {
            icon:               ctx.appUrl + 'logo.png',
            badge:              ctx.appUrl + 'logo.png',
            vibrate:            [200, 100, 200],
            requireInteraction: true
          },
          fcm_options: { link: ctx.appUrl }
        }
      }
    }),
    muteHttpExceptions: true
  });

  const success = resp.getResponseCode() === 200;
  let errCode = '';
  if (!success) {
    try {
      const errBody = JSON.parse(resp.getContentText());
      const details = errBody.error && errBody.error.details;
      if (details && details.length) errCode = details[0].errorCode || '';
    } catch (e) {}
  }
  return { success: success, responseCode: resp.getResponseCode(), errCode: errCode, rawBody: success ? '' : resp.getContentText() };
}

// Returns all FCM token registrations — used by admin to see who has
// push notifications enabled on their device.
function getFCMTokens() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FCM_TOKENS_SHEET);
  if (!sheet || sheet.getLastRow() <= 1)
    return { status: 'success', tokens: [] };

  const records = getSheetRecords(sheet).map(function (r) {
    return {
      name:        r.ShepherdName || '',
      role:        r.Role || '',
      hasToken:    !!(r.Token && r.Token.trim()),
      lastUpdated: r.LastUpdated || r.SavedDate || ''
    };
  });
  return { status: 'success', tokens: records };
}

// Saves (or refreshes) a shepherd's FCM device token.
// We send notifications directly to individual tokens (no topic subscription
// needed), so we just record the token and role in the sheet.
function saveFCMToken(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureSheet(FCM_TOKENS_SHEET, ['ShepherdName', 'Role', 'Token', 'Platform', 'SavedDate', 'LastUpdated']);

  const shepherdName = data.shepherdName || '';
  const role         = data.role || '';
  const token        = data.token || '';
  const platform     = data.platform || '';
  const now          = new Date();
  const nowStr       = formatDate(now) + ' ' + formatTime(now);

  if (!token) return jsonResponse({ status: 'error', message: 'Missing token' });

  const records  = getSheetRecords(sheet);
  const existing = records.find(function (r) { return r.ShepherdName === shepherdName; });

  if (existing) {
    sheet.getRange(existing._row, 3, 1, 4).setValues([[token, platform, existing.SavedDate || nowStr, nowStr]]);
  } else {
    sheet.appendRow([shepherdName, role, token, platform, nowStr, nowStr]);
  }

  logAudit(ss, 'FCM_TOKEN_SAVED', shepherdName, role + ' — token updated');
  return jsonResponse({ status: 'success' });
}

// Sends a push notification directly to individual device tokens (no topic
// subscription required) and optionally relays the announcement to Telegram.
function sendAnnouncementNotification(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const title    = data.title || 'New Announcement';
    const audience = data.audience || 'all-shepherds';
    const body     = (data.message || '').substring(0, 100);

    if (data.sendPush !== false) {
      const ctx = getFCMSendContext();
      const notificationId = data.notificationId || ('ANN-' + Date.now());

      const tokenSheet = ss.getSheetByName(FCM_TOKENS_SHEET);
      let targets = tokenSheet ? getSheetRecords(tokenSheet).filter(function (r) { return r.Token; }) : [];

      // Filter by audience / role
      if (audience === 'sps-shepherds') {
        targets = targets.filter(function (r) { return r.Role === 'sps'; });
      } else if (audience === 'mc-shepherds') {
        targets = targets.filter(function (r) { return r.Role === 'mc'; });
      }
      // 'all-shepherds' and 'first-timers-unit' → send to everyone

      let sent = 0, failed = 0;
      const staleNames = [];
      const logSheet = ensureSheet(NOTIFICATION_LOG_SHEET,
        ['AnnouncementID', 'Title', 'ShepherdName', 'Role', 'Status', 'SentDate', 'ClickedDate']);
      const logRows = [];

      targets.forEach(function (r) {
        const result = sendFCMPushToToken(ctx, r.Token, title, body, notificationId, r.ShepherdName);
        const now = new Date();
        const nowStr = formatDate(now) + ' ' + formatTime(now);

        if (result.success) {
          sent++;
          logRows.push([notificationId, title, r.ShepherdName || '', r.Role || '', 'sent', nowStr, '']);
        } else {
          failed++;
          // UNREGISTERED = token expired or app uninstalled — remove it so it
          // doesn't keep appearing in failed counts on every future send.
          if (result.errCode === 'UNREGISTERED' || result.responseCode === 404) {
            staleNames.push(r.ShepherdName);
          }
          logAudit(ss, 'FCM_TOKEN_FAILED', r.ShepherdName || '', (result.errCode || result.responseCode) + ' — ' + result.rawBody.substring(0, 80));
          logRows.push([notificationId, title, r.ShepherdName || '', r.Role || '', 'failed', nowStr, '']);
        }
      });

      if (logRows.length > 0) {
        logSheet.getRange(logSheet.getLastRow() + 1, 1, logRows.length, logRows[0].length).setValues(logRows);
      }

      // Remove stale tokens from the sheet
      if (staleNames.length > 0 && tokenSheet) {
        const allRecords = getSheetRecords(tokenSheet);
        staleNames.forEach(function (name) {
          const rec = allRecords.find(function (r) { return r.ShepherdName === name; });
          if (rec) tokenSheet.getRange(rec._row, 3).setValue('');
          logAudit(ss, 'FCM_TOKEN_REMOVED', name, 'Token unregistered — cleared from sheet');
        });
      }

      logAudit(ss, 'FCM_NOTIFICATION_SENT', audience, title + ' — ' + sent + ' sent, ' + failed + ' failed of ' + targets.length);
    }

    if (data.sendTelegram) {
      sendTelegramAnnouncement({
        title:    data.title || 'New Announcement',
        message:  data.message || '',
        audience: data.rawAudience || 'all'
      });
    }

    return jsonResponse({ status: 'success' });
  } catch (e) {
    logAudit(ss, 'FCM_NOTIFICATION_FAILED', data.audience || '', e.toString());
    return jsonResponse({ status: 'error', message: e.toString() });
  }
}

// Sends a push notification directly to a single device token via the FCM HTTP v1 API.
function sendPushToToken(token, title, body) {
  const projectId   = PropertiesService.getScriptProperties().getProperty('FIREBASE_PROJECT_ID');
  const accessToken = getFCMAccessToken();

  const response = UrlFetchApp.fetch('https://fcm.googleapis.com/v1/projects/' + projectId + '/messages:send', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + accessToken },
    payload: JSON.stringify({
      message: {
        token: token,
        notification: { title: title, body: body }
      }
    }),
    muteHttpExceptions: true
  });

  return response.getResponseCode();
}

// Called by sw.js's notificationclick handler (fire-and-forget GET) to mark
// a shepherd's row in NotificationLog as opened.
function logNotificationClick(notificationId, shepherdName) {
  if (!notificationId || !shepherdName) return { status: 'error', message: 'Missing notificationId or shepherdName' };

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(NOTIFICATION_LOG_SHEET);
  if (!sheet) return { status: 'error', message: 'No log sheet' };

  const records = getSheetRecords(sheet);
  const match = records.find(function (r) {
    return r.AnnouncementID === notificationId && r.ShepherdName === shepherdName && !r.ClickedDate;
  });
  if (!match) return { status: 'success' };

  const now = new Date();
  sheet.getRange(match._row, 7).setValue(formatDate(now) + ' ' + formatTime(now));
  return { status: 'success' };
}

// Returns per-shepherd sent/clicked status for one announcement, used by the
// admin dashboard to show delivery + open tracking for a posted notification.
function getNotificationLog(notificationId) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(NOTIFICATION_LOG_SHEET);
  if (!sheet || sheet.getLastRow() <= 1) return { status: 'success', entries: [] };

  let records = getSheetRecords(sheet);
  if (notificationId) {
    records = records.filter(function (r) { return r.AnnouncementID === notificationId; });
  }
  const entries = records.map(function (r) {
    return {
      announcementId: r.AnnouncementID || '',
      title:          r.Title || '',
      shepherdName:   r.ShepherdName || '',
      role:           r.Role || '',
      status:         r.Status || '',
      sentDate:       r.SentDate || '',
      clickedDate:    r.ClickedDate || ''
    };
  });
  return { status: 'success', entries: entries };
}

// ============================================================
// TELEGRAM NOTIFICATIONS
// ============================================================

const TELEGRAM_LINK_CODES_SHEET = 'TelegramLinkCodes';
const TELEGRAM_CHAT_IDS_SHEET   = 'TelegramChatIDs';

// Generates a one-time link code for a shepherd to connect their Telegram
// account. The shepherd opens a deep link to the bot with this code as the
// /start parameter; handleTelegramWebhook() resolves it once they tap Start.
function requestTelegramLink(data) {
  const sheet = ensureSheet(TELEGRAM_LINK_CODES_SHEET, ['Code', 'ShepherdName', 'Role', 'ChatID', 'Status', 'CreatedDate']);

  const shepherdName = data.shepherdName || '';
  const role         = data.role || '';
  if (!shepherdName) return jsonResponse({ status: 'error', message: 'Missing shepherd name' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const now  = new Date();
  sheet.appendRow([code, shepherdName, role, '', 'pending', formatDate(now) + ' ' + formatTime(now)]);

  const botUsername = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_USERNAME') || '';
  return jsonResponse({ status: 'success', code: code, botUsername: botUsername });
}

// Checks whether a link code has been confirmed via the Telegram webhook.
// If so, upserts the chat ID into TelegramChatIDs (overwriting any previous
// link for this shepherd so re-linking just works).
function checkTelegramLink(data) {
  const codesSheet = ensureSheet(TELEGRAM_LINK_CODES_SHEET, ['Code', 'ShepherdName', 'Role', 'ChatID', 'Status', 'CreatedDate']);
  const code        = data.code || '';

  const records = getSheetRecords(codesSheet);
  const record  = records.find(function (r) { return String(r.Code) === String(code); });

  if (!record || record.Status !== 'linked' || !record.ChatID) {
    return jsonResponse({ status: 'success', linked: false });
  }

  const chatSheet   = ensureSheet(TELEGRAM_CHAT_IDS_SHEET, ['ShepherdName', 'Role', 'ChatID', 'LinkedDate']);
  const chatRecords = getSheetRecords(chatSheet);
  const existing    = chatRecords.find(function (r) { return r.ShepherdName === record.ShepherdName; });
  const now         = formatDate(new Date()) + ' ' + formatTime(new Date());

  if (existing) {
    chatSheet.getRange(existing._row, 1, 1, 4).setValues([[record.ShepherdName, record.Role, record.ChatID, now]]);
  } else {
    chatSheet.appendRow([record.ShepherdName, record.Role, record.ChatID, now]);
  }

  return jsonResponse({ status: 'success', linked: true });
}

// Handles incoming Telegram webhook updates. Expects "/start <code>" sent
// when a shepherd taps the bot's deep link, resolves the pending code, and
// sends a confirmation message back to the chat.
function handleTelegramWebhook(update) {
  try {
    const message = update.message;
    if (!message || !message.text) return jsonResponse({ status: 'ignored' });

    const match = message.text.match(/\/start\s+(\d+)/);
    if (!match) return jsonResponse({ status: 'ignored' });

    const code   = match[1];
    const chatId = message.chat.id;

    const codesSheet = ensureSheet(TELEGRAM_LINK_CODES_SHEET, ['Code', 'ShepherdName', 'Role', 'ChatID', 'Status', 'CreatedDate']);
    const records    = getSheetRecords(codesSheet);
    const record     = records.find(function (r) { return String(r.Code) === String(code); });

    if (record) {
      codesSheet.getRange(record._row, 4, 1, 2).setValues([[chatId, 'linked']]);
      sendTelegramMessage(chatId, '✅ Connected! You\'ll now receive ONC SPS announcements here.');
    } else {
      sendTelegramMessage(chatId, '⚠️ That link code is invalid or expired. Please go back to the SPS app and try connecting again.');
    }

    return jsonResponse({ status: 'success' });
  } catch (e) {
    return jsonResponse({ status: 'error', message: e.toString() });
  }
}

// Sends a single Telegram message via the Bot API.
function sendTelegramMessage(chatId, text) {
  const token = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
  if (!token) return;

  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: text }),
    muteHttpExceptions: true
  });
}

// Sends an announcement to all linked Telegram chats matching the audience.
function sendTelegramAnnouncement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const chatSheet = ensureSheet(TELEGRAM_CHAT_IDS_SHEET, ['ShepherdName', 'Role', 'ChatID', 'LinkedDate']);
    const records   = getSheetRecords(chatSheet);
    const audience  = data.audience || 'all';

    const recipients = records.filter(function (r) {
      if (audience === 'all') return true;
      return r.Role === audience;
    });

    const text = (data.title ? data.title + '\n\n' : '') + (data.message || '');
    recipients.forEach(function (r) {
      sendTelegramMessage(r.ChatID, text);
    });

    logAudit(ss, 'TELEGRAM_ANNOUNCEMENT_SENT', audience, recipients.length + ' recipient(s)');
  } catch (e) {
    logAudit(ss, 'TELEGRAM_ANNOUNCEMENT_FAILED', data.audience || '', e.toString());
  }
}

// One-off setup: run manually from the Apps Script editor after setting
// TELEGRAM_BOT_TOKEN, to point Telegram's webhook at this web app.
function setTelegramWebhook() {
  const token     = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN');
  const webAppUrl = ScriptApp.getService().getUrl();
  const hookUrl   = webAppUrl + '?action=telegramWebhook';

  const response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/setWebhook?url=' + encodeURIComponent(hookUrl), {
    muteHttpExceptions: true
  });
  Logger.log(response.getContentText());
}

// ============================================================
// EMERGENCY SMS (via textbee.dev)
// ============================================================

// Shared directory of shepherd phone numbers (Ghana local format, no
// leading 0/country code) used for WhatsApp reminders and emergency SMS.
const SHEPHERD_DIRECTORY = [
  {name:"Frank Armah",                    contact:"558150432"},
  {name:"Bright Mamene",                  contact:"546024584"},
  {name:"Christiana Konzondong",          contact:"549722727"},
  {name:"Gloria Owusu Ansah",             contact:"598427368"},
  {name:"Linda Neequaye",                 contact:"204752124"},
  {name:"Getrude Abena Owusu Achiaa",     contact:"242384662"},
  {name:"Gloria Lartey",                  contact:"532458862"},
  {name:"Priscilla Sedi Anatsui",         contact:"552365696"},
  {name:"Abigail Akakpo",                 contact:"246807808"},
  {name:"LP. Sophia Korkor",              contact:"236929939"},
  {name:"Wisdom Akakpo",                  contact:"246461508"},
  {name:"Cyril Amevor",                   contact:"246038534"},
  {name:"Solomon Aziakah",                contact:"245775546"},
  {name:"Deborah Otumfuor",               contact:"203219321"},
  {name:"Patience Addo",                  contact:"247816836"},
  {name:"Benjamin Armah Agyeman",         contact:"204027587"},
  {name:"Martha Asinyo",                  contact:"542365036"},
  {name:"Shine Asinyo",                   contact:"594742093"},
  {name:"Patience Mensah",                contact:"208003701"},
  {name:"Ruth Yeboah",                    contact:"242972177"},
  {name:"Sharon Tricia Amanu",            contact:"246505610"},
  {name:"Mrs Petrina Gyane",              contact:"261199972"},
  {name:"Samuel Tortor",                  contact:"248665544"},
  {name:"Loretta Owusu",                  contact:"548216348"},
  {name:"Melchizedek Ofori",              contact:"549051818"},
  {name:"Bernice Can-Tamakloe",           contact:"547912591"},
  {name:"Ruth Dadzie",                    contact:"249872507"},
  {name:"Anita Asamoah",                  contact:"545201849"},
  {name:"Christabel Arhin",               contact:"530415531"}
];

// Normalizes a Ghana phone number to E.164 format (+233XXXXXXXXX).
function toE164Ghana(number) {
  var digits = String(number).replace(/\D/g, '');
  if (digits.charAt(0) === '0') digits = digits.substring(1);
  return '+233' + digits;
}

// Sends an emergency SMS to every shepherd in SHEPHERD_DIRECTORY via the
// textbee.dev SMS gateway. Reserved for urgent, infrequent use only.
function sendEmergencySMS(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    const apiKey   = PropertiesService.getScriptProperties().getProperty('TEXTBEE_API_KEY');
    const deviceId = PropertiesService.getScriptProperties().getProperty('TEXTBEE_DEVICE_ID');
    if (!apiKey || !deviceId) {
      return jsonResponse({ status: 'error', message: 'SMS gateway is not configured yet.' });
    }

    const message    = (data.title ? data.title + '\n\n' : '') + (data.message || '');
    const recipients = SHEPHERD_DIRECTORY.map(function (s) { return toE164Ghana(s.contact); });

    const response = UrlFetchApp.fetch('https://api.textbee.dev/api/v1/gateway/devices/' + deviceId + '/send-sms', {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-api-key': apiKey },
      payload: JSON.stringify({ recipients: recipients, message: message }),
      muteHttpExceptions: true
    });

    logAudit(ss, 'EMERGENCY_SMS_SENT', '', recipients.length + ' recipient(s) — ' + response.getResponseCode());
    return jsonResponse({ status: 'success', recipients: recipients.length });
  } catch (e) {
    logAudit(ss, 'EMERGENCY_SMS_FAILED', '', e.toString());
    return jsonResponse({ status: 'error', message: e.toString() });
  }
}

// ============================================================
// FORGOT PIN
// ============================================================

// Resets a shepherd's PIN to a new random 4-digit code and pushes it
// directly to their registered device. Falls back to an error if no
// FCM token is on file, so the UI can tell the user to contact an admin.
function forgotPin(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const shepherdName = data.shepherdName || '';

  if (!shepherdName) {
    return jsonResponse({ status: 'error', message: 'Missing shepherd name' });
  }

  const tokenSheet = ss.getSheetByName(FCM_TOKENS_SHEET);
  const tokenRecords = tokenSheet ? getSheetRecords(tokenSheet) : [];
  const tokenRecord  = tokenRecords.find(function (r) { return r.ShepherdName === shepherdName; });

  if (!tokenRecord || !tokenRecord.Token) {
    return jsonResponse({ status: 'error', message: 'No device registered for notifications. Please ask an admin to reset your PIN.' });
  }

  const newPin = String(Math.floor(1000 + Math.random() * 9000));
  const now    = new Date();

  let sheet = ss.getSheetByName(PINS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PINS_SHEET);
    sheet.appendRow(['Name', 'Role', 'PIN', 'Changed Date', 'Changed Time']);
    styleHeaders(sheet, 5);
  }

  const sheetData = sheet.getDataRange().getValues();
  let found = false;
  let previousPin = '0000'; // no prior row means they were still on the default
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === shepherdName) {
      previousPin = String(sheetData[i][2] || '0000').padStart(4, '0');
      sheet.getRange(i + 1, 3).setValue(newPin);
      sheet.getRange(i + 1, 4).setValue(formatDate(now));
      sheet.getRange(i + 1, 5).setValue(formatTime(now));
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow([shepherdName, tokenRecord.Role || 'Shepherd', newPin, formatDate(now), formatTime(now)]);
  }

  try {
    sendPushToToken(tokenRecord.Token, 'PIN Reset', 'Your new ONC SPS PIN is: ' + newPin);
  } catch (e) {
    logAudit(ss, 'PIN_RESET_PUSH_FAILED', shepherdName, e.toString());
    return jsonResponse({ status: 'error', message: 'Could not send notification. Please ask an admin to reset your PIN.' });
  }

  logAudit(ss, 'PIN_RESET', shepherdName, 'PIN reset from ' + previousPin + ' to ' + newPin + ' via push notification');
  return jsonResponse({ status: 'success', message: 'A new PIN has been sent to your device', pin: newPin });
}
