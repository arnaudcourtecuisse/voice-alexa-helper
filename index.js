const AlexaSdk = require('ask-sdk-core');

/**
  Return a nested value in an object, or a default value if the path does not exist
  If the final property exists but is undefined, undefined is returned instead of the default value
  @param {Object} object - the object that contains the path and value
  @param {Array{string}} path - the path to inspect in the file, as an array of properties
  @param {any} defaultValue- the default value to return if a property is missing along the path
  @returns {*} the value of the nested property, or the default value
*/
const getOr = (object, path, defaultValue) => {
  if (path.length === 0) {
    return object;
  }
  const [nextKey, ...nextPath] = path;
  if (!Object.prototype.hasOwnProperty.call(object, nextKey)) {
    return defaultValue;
  }
  return getOr(object[nextKey], nextPath, defaultValue);
};

/**
  Find the first element of an array that satisfies a predicate, or a default value if none do
  @param {Array} array - the array to be inspected
  @param {Function} predicate - the predicate, called with the regular array function arguments
  @param {any} defaultValue - the default value to return if no element satisfies the predicate
  @returns {*} the first element in array that satisfies the predicate, or the default value
*/
const find = (array, predicate, defaultValue) => {
  for (let i = 0; i < array.length; i += 1) {
    if (predicate(array[i], i, array)) {
      return array[i];
    }
  }
  return defaultValue;
};

/**
  Extract the slot values from the first resolution authority that matched
  @param {Object} requestEnvelope - the request envelope of the Alexa event
  @param {String} slotName - the name of the desired slot
  @returns {Object} an object containing the id, name, and value of the match
*/
const getSlotValuesFromMatch = (requestEnvelope, slotName) => {
  const emptyValue = [];
  if (AlexaSdk.getRequestType(requestEnvelope) !== 'IntentRequest') {
    return emptyValue;
  }
  const slotResolutions = getOr(
    requestEnvelope,
    ['request', 'intent', 'slots', slotName, 'resolutions', 'resolutionsPerAuthority'],
  );
  if (!slotResolutions) {
    return emptyValue;
  }
  const firstResolution = find(
    slotResolutions,
    (resol) => getOr(resol, ['status', 'code']) === 'ER_SUCCESS_MATCH',
  );
  if (!firstResolution || !firstResolution.values) {
    return emptyValue;
  }
  return firstResolution.values;
};

/**
  Get the slot value id in an intent
  @param {Object} requestEnvelope - the request envelope of the Alexa event
  @param {String} slotName - the name of the desired slot
  @returns {String} the slot value ID
*/
const getSlotValueId = (requestEnvelope, slotName) => {
  const values = getSlotValuesFromMatch(requestEnvelope, slotName);
  return getOr(values, [0, 'id'], null);
};

module.exports = {
  getSlotValueId,
  getSlotValuesFromMatch,
};
