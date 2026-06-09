// ============================================================
// ONC SPS — Google Apps Script Backend v4.0
// Merged: Core v3.6 + Sprint 1 (Discipleship Journey, Flags, Schools)
// ============================================================

const SHEET_NAME                    = 'SPS Reports';
const SETTINGS_SHEET                = 'SPS Settings';
const LOG_SHEET                     = 'SPS Audit Log';
const MC_SHEET_NAME                 = 'Microchurch Reports';
const FIRST_TIMERS_SHEET            = 'First Timers';
const PINS_SHEET                    = 'Shepherd PINs';
const ANNOUNCEMENTS_SHEET           = 'Announcements';
const PASTORAL_NOTES_SHEET          = 'PastoralNotes';
const DISCIPLESHIP_ASSIGNMENTS_SHEET = 'DiscipleshipAssignments';
const SHEPHERD_PIPELINE_SHEET       = 'ShepherdPipeline';
const SHEPHERD_COHORTS_SHEET        = 'ShepherdCohorts';
const SUNDAY_ATTENDANCE_SHEET       = 'SundayAttendance';
const VISITATIONS_SHEET             = 'Visitations';

// ============================================================
// HTTP HANDLERS
// ============================================================

function doPost(e) {
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = data.action || 'submitReport';

    if (action === 'submitReport')            return submitReport(data);
    if (action === 'saveTopic')               return saveBibleTopic(data);
    if (action === 'saveReminder')            return saveReminderSettings(data);
    if (action === 'submitMicrochurchReport') return submitMicrochurchReport(data);
    if (action === 'submitGuestForm')         return submitGuestForm(data);
    if (action === 'updateGuestForm')         return updateGuestForm(data);
    if (action === 'savePinChange')           return savePinChange(data);
    if (action === 'logActivity')             return logActivity(data);
    if (action === 'postAnnouncement')        return postAnnouncement(data);
    if (action === 'deleteAnnouncement')      return deleteAnnouncement(data);
    // ── Members & Pipeline POST actions ──────────────────────────
    if (action === 'addPastoralNote')         return addPastoralNote(data);
    if (action === 'createAssignment')        return createAssignment(data);
    if (action === 'addCandidate')            return addCandidate(data);
    if (action === 'updateSTCModule')         return updateSTCModule(data);
    if (action === 'createCohort')            return createCohort(data);
    // ── Sunday Attendance & Visitation POST actions ──────────────
    if (action === 'submitSundayAttendance')  return submitSundayAttendance(data);
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
    else if (action === 'getPins')                response = getPins();
    else if (action === 'getActivityLog')         response = getActivityLog();
    else if (action === 'getAnnouncements')       response = getAnnouncements();
    // ── Sprint 1 GET actions ──────────────────────────────────────
    else if (action === 'getDiscipleshipJourney') response = getDiscipleshipJourney();
    else if (action === 'updateMemberStage')      response = updateMemberStage(e.parameter.memberId, e.parameter.newStage, e.parameter.updatedBy);
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
    else if (action === 'getVisitations')         response = getVisitations();
    // ── Resource Library & Mandatory Reads GET actions ───────────
    else if (action === 'getResources')           response = getResources();
    else if (action === 'getMandatoryReads')       response = getMandatoryReads();
    // ── GO Dashboard GET action ──────────────────────────────────
    else if (action === 'getGODashboardData')     response = getGODashboardData();
    // ── Baptism Tracking GET action ──────────────────────────────
    else if (action === 'getBaptismRecords')      response = getBaptismRecords();
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
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === data.name) {
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
    (data.role || 'Shepherd') + ' changed PIN to: ' + pinValue +
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
    sheet.appendRow(['ID', 'Title', 'Message', 'Audience', 'Posted By', 'Posted Date', 'Posted Time', 'Expiry', 'Active']);
    styleHeaders(sheet, 9);
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
    'YES'
  ]);

  sheet.autoResizeColumns(1, 9);
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
        expiry:     row[7] || ''
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
      'Concerns', 'Notes', 'Week Number'
    ];
    sheet.appendRow(headers);
    styleHeaders(sheet, headers.length);
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

  sheet.appendRow([
    reportId, submissionDate, submissionDay, submissionTime,
    sessionDate, sessionDay, sessionTime, data.shepherd || '',
    membersPresent, membersAbsent, attendanceCount, totalMembers,
    attendanceRate, data.bibleTopic || '', data.topicCovered || '',
    data.prayerDone || '', concerns, data.notes || '', weekNumber
  ]);

  sheet.autoResizeColumns(1, 19);
  logAudit(ss, 'REPORT_SUBMITTED', data.shepherd, reportId);
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
    weekNumber:      row[18]
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
      'Prayer Done', 'New Souls', 'New Soul Names', 'Concerns', 'Notes', 'Week Number'
    ];
    sheet.appendRow(headers);
    styleHeaders(sheet, headers.length);
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

  sheet.appendRow([
    reportId, submissionDate, submissionDay, submissionTime,
    sessionDate, sessionDay, sessionTime, data.shepherd || '',
    data.meetingType || '', membersPresent, membersAbsent,
    attendanceCount, totalMembers, attendanceRate,
    data.bibleTopic || '', data.topicCovered || '', data.actualTopic || '',
    data.prayerDone || '', newSoulsValue, newSoulNamesValue,
    concerns, data.notes || '', weekNumber
  ]);

  sheet.autoResizeColumns(1, 23);
  logAudit(ss, 'MC_REPORT_SUBMITTED', data.shepherd, reportId);
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
    weekNumber:      row[22]
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
      'Contact Preference', 'Follow Up Status', 'Feedback'
    ]);
    styleHeaders(sheet, 25);
  }

  const g   = data.guest || {};
  const now = new Date();

  sheet.appendRow([
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
    g.followUpStatus || 'Needs Follow Up', g.feedback || ''
  ]);

  sheet.autoResizeColumns(1, 25);
  logAudit(ss, 'GUEST_REGISTERED', 'First Timers Unit', g.fullName || '');
  return jsonResponse({ status: 'success' });
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
  sheet.getRange(row, 4, 1, 22).setValues([[
    g.firstName || '', g.middleName || '', g.lastName || '', g.fullName || '',
    g.phone || '', g.email || '',
    (g.dobDay && g.dobMonth && g.dobYear)
      ? g.dobDay + '/' + g.dobMonth + '/' + g.dobYear : '',
    g.gender || '', g.maritalStatus || '', g.occupation || '',
    g.company || '', g.residence || '', g.heardFrom || '', g.invitedBy || '',
    g.podcast || '', g.whatsapp || '', g.bornAgain || '',
    g.belongsToChurch || '', g.churchName || '', g.contactPreference || '',
    g.followUpStatus || 'Needs Follow Up', g.feedback || ''
  ]]);

  logAudit(ss, 'GUEST_UPDATED', 'First Timers Unit', g.fullName || '');
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
      feedback:         row[24] || ''
    };
  });

  return { status: 'success', guests };
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

function updateMemberStage(memberId, newStage, updatedBy) {
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
    sheet.appendRow([memberId.toString(), '', '', '', parseInt(newStage, 10), now, now, 'Created by ' + (updatedBy || 'System')]);
  }

  return { status: 'success', updated: updated };
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
  return jsonResponse({ status: 'success', resourceId: resourceId });
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

// Run once manually to set up the WhatsApp reminder trigger.
// WARNING: deletes all existing triggers first — run setupNightlyTrigger() afterwards.
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('sendScheduledReminders')
    .timeBased().everyDays(1).atHour(18).create();
  Logger.log('WhatsApp reminder trigger set up successfully');
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

function sendScheduledReminders() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('SPS Settings');
  if (!sheet) return;

  var data     = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) settings[data[i][0]] = data[i][1];
  }

  if (settings['REMINDER_ENABLED'] !== 'true') return;

  var days  = (settings['REMINDER_DAYS'] || 'Monday,Wednesday,Friday').split(',');
  var today = new Date().toLocaleDateString('en-GB', { weekday: 'long' });
  if (days.indexOf(today) === -1) return;

  var message  = settings['REMINDER_MESSAGE'] ||
    'Hi {name}! Please submit your SPS report today. Link: https://aa-teye.github.io/onc-sps-report/';
  var contacts = JSON.parse(settings['SHEPHERD_CONTACTS'] || '{}');

  var shepherds = [
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
    {name:"Mr. Ebenezer Okronipa",          contact:"243310124"},
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

  shepherds.forEach(function (s) {
    var contact = contacts[s.name] || {};
    var number  = (typeof contact === 'string') ? contact : (contact.number || s.contact);
    var apiKey  = (typeof contact === 'object') ? (contact.apiKey || '') : '';
    if (!number || !apiKey) return;

    var msg = message.replace('{name}', s.name.split(' ')[0]);
    var url = 'https://api.callmebot.com/whatsapp.php?phone=' + number +
              '&text=' + encodeURIComponent(msg) + '&apikey=' + apiKey;
    try {
      UrlFetchApp.fetch(url);
      Logger.log('Sent to ' + s.name);
    } catch (err) {
      Logger.log('Failed: ' + s.name);
    }
  });
}
