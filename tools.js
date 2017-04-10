var _validate = function(sourceObj, sourceIterator) {
    var isValidInput = true;
    var errorObject = {};
    if (!_.isPlainObject(sourceObj)) {
        errorObject.invalidParam = text;
        errorObject.invalidParamName = 'text';
        errorObject.invalidParamExpectedType = 'object';
        isValidInput = false;
    } else if (!_.isFunction(sourceIterator)) {
        errorObject.invalidParam = sourceIterator;
        errorObject.invalidParamName = 'sourceIterator';
        errorObject.invalidParamExpectedType = 'function';
        isValidInput = false;
    }
    if (!isValidInput) {
        _handleInvalidInputError(errorObject);
    }
    return isValidInput;
};
var _handleInvalidInputError = function(errorObject) {
    console.error('Invalid input for param "' + errorObject.invalidParamName + '". ' +
        typeof errorObject.invalidParam + ' is not a ' + errorObject.invalidParamExpectedType);
};
var _beforeEachDeep = function(objectToMap, parentName, includeArraysAndCollections, callback, options) {
    if (_validate(objectToMap, callback)) {
        options = _.omit(options || {}, ['_matchRegex']);
        if (_.isUndefined(options._matchRegex) && _.isArray(options.ignoredFields) && !_.isEmpty(options.ignoredFields)) {
            var ignoredFieldsRegex = [];
            var replaceRegexStar = new RegExp('\\*', 'g');
            var replaceRegexOpenBr = new RegExp('\\[', 'g');
            var replaceRegexCloseBr = new RegExp('\\]', 'g');
            var replaceRegexDots = new RegExp('\\.', 'g');
            _.each(options.ignoredFields, function(field) {
                ignoredFieldsRegex.push(field.replace(replaceRegexDots, '\\.').replace(replaceRegexOpenBr, '\\[').replace(replaceRegexCloseBr, '\\]').replace(replaceRegexStar, '(.*?)'));
            });
            options._matchRegex = new RegExp('(' + ignoredFieldsRegex.join('|') + ')', "g");
            return _eachDeep(objectToMap, parentName, includeArraysAndCollections, callback, options);
        }
        return _eachDeep(objectToMap, parentName, includeArraysAndCollections, callback, options);
    }
};
var _eachDeep = function(objectToMap, parentName, includeArraysAndCollections, callback, options) {
    parentName = parentName || '';
    _.each(objectToMap, function(value, index) {
        var currentName = index;
        if (_.isArray(objectToMap)) {
            currentName = parentName + '[' + index + ']';
        } else if (parentName !== '') {
            currentName = parentName + '.' + currentName;
        }
        if (_.isArray(value) || _.isPlainObject(value)) {
            if (includeArraysAndCollections) {
                _checkOptionsBeforeCallback(value, currentName, callback, options);
            }
            _eachDeep(value, currentName, includeArraysAndCollections, callback, options);
        } else {
            _checkOptionsBeforeCallback(value, currentName, callback, options);
        }
    });
};
var _checkOptionsBeforeCallback = function(value, currentName, callback, options) {
    options = options || {};
    if (!_.isUndefined(options._matchRegex)) {
        var isMatch = currentName.match(options._matchRegex) !== null;
        if (!isMatch) {
            return callback(value, currentName);
        }
    } else {
        return callback(value, currentName);
    }
};
var eachDeep = function(targetObj, iterator, options) {
    _beforeEachDeep(targetObj, '', true, iterator, options);
};
var eachDeepEnds = function(targetObj, iterator, options) {
    _beforeEachDeep(targetObj, '', false, iterator, options);
};
var keysDeep = function(getKeysObj) {
    var keysArray = [];
    eachDeep(getKeysObj, function(value, key) {
        keysArray.push(key);
    });
    return keysArray;
};
var keysDeepEnds = function(getKeysObj) {
    var keysArray = [];
    eachDeepEnds(getKeysObj, function(value, key) {
        keysArray.push(key);
    });
    return keysArray;
};

var compress = function(getKeysObj) {
    var compressedObj = {};
    eachDeepEnds(getKeysObj, function(value, key) {
        compressedObj[key] = value;
    });
    return compressedObj;
};
var expand = function(compressedObj) {
    var expandedObj = {};
    _.each(compressedObj, function(value, key) {
        _.set(expandedObj, key, value);
    });
    return expandedObj;
};
_returnsTruthy = function(filterFunction) {
    var returnsTruthy = true;
    var testVars = ['test', 0, true, NaN, undefined, null, function() {}, /test/g];
    _.each(testVars, function(testVar) {
        var result = filterFunction(testVar, 'test.array[0].object1.string1');
        if (!(_.isNil(result) || _.isBoolean(result))) {
            returnsTruthy = false;
        }
    });
    return returnsTruthy;
};
var where = function(getKeysObj, filterFunction) {
    var filteredObj = {};
    if (_returnsTruthy(filterFunction)) {
        eachDeepEnds(getKeysObj, function(value, key) {
            if (filterFunction(value, key)) {
                filteredObj[key] = value;
            }
        });
        
    }
    return filteredObj;
};
var whereExpanded = function(getKeysObj, filterFunction) {
    return expand(where(getKeysObj, filterFunction));
};
