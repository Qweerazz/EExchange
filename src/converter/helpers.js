"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrowser = exports.isValidUrl = exports.isEmpty = exports.formatNumber = exports.getAverage = exports.symbolMap = void 0;
function symbolMap(symbol, map, recurisve = false) {
    const mapKeys = Object.keys(map);
    for (var c = 0; c < mapKeys.length; c++) {
        if (symbol.length >= mapKeys[c].length + 3 && (symbol.endsWith(mapKeys[c]) ||
            symbol.startsWith(mapKeys[c]))) {
            const cleaned = symbol.replace(mapKeys[c], map[mapKeys[c]]);
            if (recurisve) {
                return symbolMap(cleaned, map, false);
            }
            return cleaned;
        }
    }
    return symbol;
}
exports.symbolMap = symbolMap;
function getAverage(pairs) {
    if (!pairs.length) {
        return {};
    }
    ;
    const allPairs = pairs.flatMap((pair) => Object.keys(pair)).filter((pair, i, arr) => arr.indexOf(pair) == i);
    return allPairs.reduce((o, pair) => {
        let values = pairs.map((e) => e[pair]).filter(v => v), averageValue = formatNumber(values.reduce((sum, v) => sum + v, 0) / values.length, 8);
        o[pair] = averageValue;
        return o;
    }, {});
}
exports.getAverage = getAverage;
function formatNumber(n, decimals) {
    if (typeof n != "number") {
        n = Number(n);
        if (isNaN(n)) {
            return NaN;
        }
    }
    let s = typeof decimals == "number" ? (n.toFixed(decimals)) : n + '';
    let clean = s.match(/\./) && !s.match(/[eE]/) ? s.replace(/0+$/g, '').replace(/\.+$/g, '') : s;
    return parseFloat(clean);
}
exports.formatNumber = formatNumber;
function isEmpty(obj) {
    if (!obj) {
        return true;
    }
    for (var _ in obj) {
        return false;
    }
    return true;
}
exports.isEmpty = isEmpty;
function isValidUrl(string) {
    try {
        return /^https?\:\/\//.test((new URL(string)).protocol);
    }
    catch (err) {
        return false;
    }
}
exports.isValidUrl = isValidUrl;
exports.isBrowser = (typeof window !== "undefined" && window.document);
