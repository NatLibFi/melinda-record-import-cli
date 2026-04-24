import fs from 'node:fs'
import httpStatus from 'http-status';
import {Error as ApiError} from '@natlibfi/melinda-commons';
import {DateTime} from 'luxon';
import {BLOB_STATE} from '@natlibfi/melinda-record-import-commons';

// MARK: Handle Error
export function handleError(err) {
  if (err instanceof ApiError) {
    return console.log(`API call failed: ${httpStatus[`${err.status}_MESSAGE`]} (${err.status})`);
  }

  throw new Error(`Unexpected handle error: ${'stack' in err ? err.stack : 'message' in err ? err.message : err}`);
}

interface getQuery {
  profile?: string
  state?: string,
  createdBefore?: string,
  createdAfter?: string,
  modifiedBefore?: string,
  modifiedAfter?: string,
  createdDay?: string,
  modifiedDay?: string,
  skip?: string,
  limit?: string,
  getAll?: string
}

export function getQuery({profile, state, createdBefore, createdAfter, modifiedBefore, modifiedAfter, createdDay, modifiedDay, skip, limit, getAll}: getQuery) {
  const queriesArray = [
    {
      name: 'profile',
      value: profile === undefined ? false : profile
    },
    {
      name: 'state',
      value: testBlobState(state) ? state : false
    },
    {
      name: 'creationTime',
      value: createTimeStampValue(testTimestamp(createdAfter, true), testTimestamp(createdBefore, true), testTimestamp(createdDay))
    },
    {
      name: 'modificationTime',
      value: createTimeStampValue(testTimestamp(modifiedAfter, true), testTimestamp(modifiedBefore, true), testTimestamp(modifiedDay))
    },
    {
      name: 'offset',
      value: skip === undefined ? false : skip
    },
    {
      name: 'limit',
      value: limit === undefined ? false : limit
    },
    {
      name: 'getAll',
      value: handleGetAll(getAll, limit)
    }
  ]
    .filter(param => param.value)
    .map(param => [param.name, param.value]);
  return Object.fromEntries(queriesArray);

  function handleGetAll(getAll: string | undefined, limit: string | undefined) {
    if (limit && getAll === undefined) {
      return '0';
    }

    if (getAll === '0') {
      return '0';
    }

    if (getAll === undefined) {
      return false;
    }

    return '1';
  }

  function createTimeStampValue(after: string | false | DateTime, before: string | false | DateTime, day: string | false | DateTime) {
    if (after === undefined && before === undefined && day === undefined) {
      return false;
    }

    if (after === false && before === false && day === false) {
      return false;
    }

    if (day) {
      return `${day}T00:00:00+01:00,${day}T23:59:59+01:00`;
    }

    if (after === undefined && before) {
      return `1990-01-01,${before}`;
    }

    if (after && before === undefined) {
      return `${after},3000-01-01`;
    }

    return `${after},${before}`;
  }

  function testTimestamp(timestamp: string | undefined, acceptHours: boolean = false) {
    if (timestamp === undefined) {
      return false;
    }

    //if (acceptHours && (/^\d{4}-[01]{1}\d{1}-[0-3]{1}\d{1}T[0-2]{1}\d{1}:[0-6]{1}\d{1}:[0-6]{1}\d{1}[+-][0-2]{1}\d{1}/u).test(timestamp)) {
    if (acceptHours && (/^\d{4}-[01]{1}\d{1}-[0-3]{1}\d{1}T[0-2]{1}\d{1}:[0-6]{1}\d{1}:[0-6]{1}\d{1}/u).test(timestamp)) {
      const sliced = timestamp.slice(0, 19);
      console.log(sliced); // eslint-disable-line
      return DateTime.fromISO(sliced);
    }

    if ((/^\d{4}-[01]{1}\d{1}-[0-3]{1}\d{1}$/u).test(timestamp)) {
      return timestamp;
    }

    return false;
  }

  function testBlobState(state: string | undefined) {
    if (state === undefined) {
      return false;
    }

    interface BlobStates {
      [key: string]: string | undefined
    }

    const states: BlobStates = BLOB_STATE;
    const stateUpper: string = state.toUpperCase();

    const blobState = states[stateUpper];

    return blobState !== undefined;
  }
}

export function format(metadata) {
  metadata.modificationTime = DateTime.fromISO(metadata.modificationTime);
  metadata.creationTime = DateTime.fromISO(metadata.creationTime);
  return metadata;
}

export function readDataString(file: string) {
  if (file === undefined) {
    throw new Error('File parameter missing');
  }

  if (file && !fs.existsSync(file)) {
    throw new Error('File not found for creating/modifying');
  }

  return fs.readFileSync(file, 'utf8');
}

export function readDataStream(file: string) {
  if (file === undefined) {
    throw new Error('File parametter missing');
  }

  if (file && !fs.existsSync(file)) {
    throw new Error('File not found for creating/modifying');
  }

  return fs.createReadStream(file, {encoding: 'utf-8'});
}
