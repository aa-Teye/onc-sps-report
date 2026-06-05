function doGet(e) {
  var action = (e.parameter.action || '').toString();
  var callback = (e.parameter.callback || '').toString();
  var response = { status: 'error', message: 'Unknown action' };

  try {
    switch (action) {
      case 'getDiscipleshipJourney':
        response = getDiscipleshipJourney();
        break;
      case 'updateMemberStage':
        response = updateMemberStage(e.parameter.memberId, e.parameter.newStage, e.parameter.updatedBy);
        break;
      case 'getFlags':
        response = getFlags();
        break;
      case 'resolveFlag':
        response = resolveFlag(e.parameter.flagId, e.parameter.resolvedBy, e.parameter.notes);
        break;
      case 'runNightlyFlagCheck':
        response = runNightlyFlagCheck();
        break;
      case 'getSchoolData':
        response = getSchoolData();
        break;
      case 'updateSchoolAttendance':
        response = updateSchoolAttendance(e.parameter.sheet, e.parameter.memberId, e.parameter.week, e.parameter.value, e.parameter.updatedBy);
        break;
      case 'enrolInSchool':
        response = enrolInSchool(e.parameter.sheet, e.parameter.memberId, e.parameter.memberName, e.parameter.enrolledDate);
        break;
      default:
        response = { status: 'error', message: 'Action not supported: ' + action };
    }
  } catch (error) {
    response = { status: 'error', message: error.message || String(error) };
  }

  var output = callback ? callback + '(' + JSON.stringify(response) + ')' : JSON.stringify(response);
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function ensureSheet(name, headers) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0] || [];
    if (existingHeaders.length !== headers.length || headers.some(function (h, index) {
      return existingHeaders[index] !== h;
    })) {
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
    headers.forEach(function (header, columnIndex) {
      record[header] = row[columnIndex] === undefined ? '' : row[columnIndex];
    });
    return record;
  });
}

function formatDate(value) {
  if (!value) return '';
  var date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, Session.getScriptTimeZone() || 'GMT', 'yyyy-MM-dd');
}

function getDiscipleshipJourney() {
  var headers = ['MemberID', 'MemberName', 'Phone', 'ShepherdAssigned', 'CurrentStage', 'StageEntryDate', 'LastUpdated', 'Notes'];
  var sheet = ensureSheet('DiscipleshipJourney', headers);
  var records = getSheetRecords(sheet);
  return { status: 'success', records: records };
}

function updateMemberStage(memberId, newStage, updatedBy) {
  if (!memberId) return { status: 'error', message: 'Missing MemberID' };
  if (!newStage) return { status: 'error', message: 'Missing newStage' };
  var headers = ['MemberID', 'MemberName', 'Phone', 'ShepherdAssigned', 'CurrentStage', 'StageEntryDate', 'LastUpdated', 'Notes'];
  var sheet = ensureSheet('DiscipleshipJourney', headers);
  var records = getSheetRecords(sheet);
  var now = formatDate(new Date());
  var updated = false;
  for (var i = 0; i < records.length; i += 1) {
    var record = records[i];
    if (record.MemberID.toString() === memberId.toString()) {
      var current = record.CurrentStage.toString();
      if (current !== newStage.toString()) {
        sheet.getRange(record._row, 5).setValue(parseInt(newStage, 10));
        sheet.getRange(record._row, 6).setValue(now);
      }
      sheet.getRange(record._row, 7).setValue(now);
      sheet.getRange(record._row, 8).setValue('Updated by ' + (updatedBy || 'System') + ' on ' + now);
      updated = true;
      break;
    }
  }
  if (!updated) {
    sheet.appendRow([memberId.toString(), '', '', '', parseInt(newStage, 10), now, now, 'Created by ' + (updatedBy || 'System')]);
  }
  return { status: 'success', updated: updated };
}

function getFlags() {
  var headers = ['MemberID', 'MemberName', 'ShepherdName', 'FlagType', 'FlagDate', 'TriggerReason', 'EscalatedTo', 'ResolvedBy', 'ResolutionDate', 'ResolutionNotes'];
  var sheet = ensureSheet('FlagsSheet', headers);
  var records = getSheetRecords(sheet);
  records.forEach(function (record) {
    record.flagId = record._row;
  });
  return { status: 'success', records: records };
}

function resolveFlag(flagId, resolvedBy, notes) {
  if (!flagId) return { status: 'error', message: 'Missing flagId' };
  var headers = ['MemberID', 'MemberName', 'ShepherdName', 'FlagType', 'FlagDate', 'TriggerReason', 'EscalatedTo', 'ResolvedBy', 'ResolutionDate', 'ResolutionNotes'];
  var sheet = ensureSheet('FlagsSheet', headers);
  var row = parseInt(flagId, 10);
  if (isNaN(row) || row < 2 || row > sheet.getLastRow()) {
    return { status: 'error', message: 'Invalid flagId' };
  }
  var now = formatDate(new Date());
  sheet.getRange(row, 8).setValue(resolvedBy || '');
  sheet.getRange(row, 9).setValue(now);
  sheet.getRange(row, 10).setValue(notes || '');
  return { status: 'success', resolvedRow: row };
}

function runNightlyFlagCheck() {
  var journey = getDiscipleshipJourney().records;
  var flags = getFlags().records;
  var sheet = ensureSheet('FlagsSheet', ['MemberID', 'MemberName', 'ShepherdName', 'FlagType', 'FlagDate', 'TriggerReason', 'EscalatedTo', 'ResolvedBy', 'ResolutionDate', 'ResolutionNotes']);
  var created = 0;
  var today = new Date();

  function hasOpenFlag(memberId, flagType) {
    return flags.some(function (item) {
      return item.MemberID.toString() === memberId.toString() && item.FlagType === flagType && !item.ResolutionDate;
    });
  }

  journey.forEach(function (record) {
    if (!record.MemberID) return;
    var lastUpdated = record.LastUpdated ? new Date(record.LastUpdated) : record.StageEntryDate ? new Date(record.StageEntryDate) : null;
    var stageEntry = record.StageEntryDate ? new Date(record.StageEntryDate) : null;
    if (!lastUpdated) return;
    var daysSince = Math.floor((today - lastUpdated) / 86400000);
    var stallDays = stageEntry ? Math.floor((today - stageEntry) / 86400000) : 0;
    var flagType = '';
    var reason = '';

    if (stallDays >= 28) {
      flagType = 'StageStall';
      reason = 'Stage stalled for 4+ weeks';
    } else if (daysSince >= 21) {
      flagType = 'Purple';
      reason = '21+ days inactive';
    } else if (daysSince >= 14) {
      flagType = 'Red';
      reason = '2 missed Sundays / 14+ days no contact';
    } else if (daysSince >= 7) {
      flagType = 'Orange';
      reason = '7–14 days since last contact';
    } else if (daysSince >= 5) {
      flagType = 'Yellow';
      reason = '5–6 days since last contact';
    }

    if (flagType && !hasOpenFlag(record.MemberID, flagType)) {
      sheet.appendRow([record.MemberID, record.MemberName || '', record.ShepherdAssigned || '', flagType, formatDate(today), reason, '', '', '', '']);
      created += 1;
    }
  });

  return { status: 'success', created: created };
}

function getSchoolData() {
  var foundationsHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'CompletedDate'];
  var membershipHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Session1', 'Session2', 'Session3', 'Session4', 'CommitmentCardSigned', 'CompletedDate'];
  var foundationsSheet = ensureSheet('FoundationsSchool', foundationsHeaders);
  var membershipSheet = ensureSheet('MembershipSchool', membershipHeaders);
  return {
    status: 'success',
    foundations: getSheetRecords(foundationsSheet),
    membership: getSheetRecords(membershipSheet)
  };
}

function updateSchoolAttendance(sheetName, memberId, week, value, updatedBy) {
  if (!sheetName || !memberId || !week) return { status: 'error', message: 'Missing sheet or memberId or week' };
  var foundationsHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'CompletedDate'];
  var membershipHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Session1', 'Session2', 'Session3', 'Session4', 'CommitmentCardSigned', 'CompletedDate'];

  var sheet = null;
  var fieldMap = {};
  if (sheetName === 'FoundationsSchool') {
    sheet = ensureSheet(sheetName, foundationsHeaders);
    fieldMap = { Week1: 4, Week2: 5, Week3: 6, Week4: 7, Week5: 8, Week6: 9, CompletedDate: 10 };
  } else if (sheetName === 'MembershipSchool') {
    sheet = ensureSheet(sheetName, membershipHeaders);
    fieldMap = { Session1: 4, Session2: 5, Session3: 6, Session4: 7, CommitmentCardSigned: 8, CompletedDate: 9 };
  } else {
    return { status: 'error', message: 'Unsupported sheet name' };
  }

  var records = getSheetRecords(sheet);
  var target = records.find(function (record) {
    return record.MemberID.toString() === memberId.toString();
  });
  if (!target) {
    return { status: 'error', message: 'Member not found in school sheet' };
  }

  if (!fieldMap[week]) {
    return { status: 'error', message: 'Invalid week/session field' };
  }

  sheet.getRange(target._row, fieldMap[week]).setValue(value === 'Y' ? 'Y' : 'N');
  var completedDate = '';

  if (sheetName === 'FoundationsSchool') {
    var complete = foundationsHeaders.slice(3, 9).every(function (field) {
      var raw = sheet.getRange(target._row, fieldMap[field]).getValue();
      return String(raw).toUpperCase() === 'Y';
    });
    completedDate = complete ? formatDate(new Date()) : '';
    sheet.getRange(target._row, fieldMap.CompletedDate).setValue(completedDate);
    if (complete) {
      updateMemberStage(memberId, 4, updatedBy || 'Auto Progress');
    }
  } else {
    var complete = membershipHeaders.slice(3, 7).every(function (field) {
      var raw = sheet.getRange(target._row, fieldMap[field]).getValue();
      return String(raw).toUpperCase() === 'Y';
    }) && String(sheet.getRange(target._row, fieldMap.CommitmentCardSigned).getValue()).toUpperCase() === 'Y';
    completedDate = complete ? formatDate(new Date()) : '';
    sheet.getRange(target._row, fieldMap.CompletedDate).setValue(completedDate);
  }

  return { status: 'success', completedDate: completedDate };
}

function enrolInSchool(sheetName, memberId, memberName, enrolledDate) {
  if (!sheetName || !memberId || !memberName) return { status: 'error', message: 'Missing required enrolment data' };
  var foundationsHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Week1', 'Week2', 'Week3', 'Week4', 'Week5', 'Week6', 'CompletedDate'];
  var membershipHeaders = ['MemberID', 'MemberName', 'EnrolledDate', 'Session1', 'Session2', 'Session3', 'Session4', 'CommitmentCardSigned', 'CompletedDate'];

  var sheet = null;
  var initialRow = [];
  if (sheetName === 'FoundationsSchool') {
    sheet = ensureSheet(sheetName, foundationsHeaders);
    initialRow = [memberId.toString(), memberName.toString(), formatDate(enrolledDate || new Date()), 'N', 'N', 'N', 'N', 'N', 'N', ''];
  } else if (sheetName === 'MembershipSchool') {
    sheet = ensureSheet(sheetName, membershipHeaders);
    initialRow = [memberId.toString(), memberName.toString(), formatDate(enrolledDate || new Date()), 'N', 'N', 'N', 'N', 'N', ''];
  } else {
    return { status: 'error', message: 'Unsupported sheet name' };
  }

  var existing = getSheetRecords(sheet).find(function (record) {
    return record.MemberID.toString() === memberId.toString();
  });
  if (existing) {
    return { status: 'success', message: 'Member already enrolled' };
  }

  sheet.appendRow(initialRow);
  return { status: 'success', enrolledSheet: sheetName };
}
