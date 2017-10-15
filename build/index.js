"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var objectPath = require("object-path");
function loadConfig(configFilePath, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, loadSsmParamsIntoConfig(require(configFilePath), options)];
        });
    });
}
exports.loadConfig = loadConfig;
function loadSsmParamsIntoConfig(config, options) {
    return __awaiter(this, void 0, void 0, function () {
        var mapper;
        return __generator(this, function (_a) {
            mapper = parseObjectForSsmFields(config);
            return [2 /*return*/, loadMappedSsmParamsIntoConfig(config, mapper, options)];
        });
    });
}
exports.loadSsmParamsIntoConfig = loadSsmParamsIntoConfig;
function loadMappedSsmParamsIntoConfig(config, paramMap, options) {
    return __awaiter(this, void 0, void 0, function () {
        var ssm, names, data, values;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ssm = options.ssm;
                    names = paramMap.map(function (m) { return m.key; });
                    return [4 /*yield*/, ssm.getParameters({
                            Names: names,
                            WithDecryption: true
                        }).promise()];
                case 1:
                    data = _a.sent();
                    if (!data || !Array.isArray(data.Parameters)) {
                        throw new Error('cant_load_ssm_params');
                    }
                    values = {};
                    data.Parameters.forEach(function (p) {
                        if (!p.Name) {
                            return;
                        }
                        values[p.Name] = p.Value;
                    });
                    paramMap.forEach(function (m) {
                        if (values[m.key] === undefined) {
                            if (options.strict) {
                                var e = new Error('missing_ssm_param');
                                e.param = m.key;
                                throw e;
                            }
                            return;
                        }
                        objectPath.set(config, m.to, values[m.key]);
                    });
                    return [2 /*return*/, config];
            }
        });
    });
}
exports.loadMappedSsmParamsIntoConfig = loadMappedSsmParamsIntoConfig;
function parseObjectForSsmFields(obj, path) {
    if (path === void 0) { path = ''; }
    var parsed = [];
    if (obj !== Object(obj)) {
        return parsed;
    }
    Object.keys(obj).forEach(function (key) {
        if (obj[key] === Object(obj[key])) {
            // recurse on object values
            parsed = parsed.concat(parseObjectForSsmFields(obj[key], path ? path + "." + key : key));
        }
        else if (typeof obj[key] === 'string') {
            // only string values can have ssm field
            if (obj[key].indexOf('ssm:') === 0) {
                parsed.push({
                    key: obj[key].substr(4),
                    to: path + "." + key
                });
            }
        }
    });
    return parsed;
}
