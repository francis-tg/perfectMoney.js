"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const crypto_1 = __importDefault(require("crypto"));
const BASE_URL = 'https://perfectmoney.com/acct/%s.asp?AccountID=%s&PassPhrase=%s&%s';
class PerfectMoney {
    constructor(account, passwd) {
        this.error = null;
        this.errorRe = /<input name='ERROR' type='hidden' value='(.*)'>/;
        this.valueRe = /<input name='(.*)' type='hidden' value='(.*)'>/g;
        this.account = account;
        this.passwd = encodeURIComponent(passwd);
    }
    encodeParams(params) {
        return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }
    _fetch(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = null;
            try {
                const response = yield (0, node_fetch_1.default)(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params ? this.encodeParams(params) : undefined,
                });
                res = yield response.text();
            }
            catch (error) {
                this.error = 'API request failed';
                return null;
            }
            return res;
        });
    }
    _getDict(string) {
        const rdict = {};
        if (!string) {
            return {};
        }
        const match = this.errorRe.exec(string);
        if (match) {
            this.error = match[1];
            return {};
        }
        for (const match of string.matchAll(this.valueRe)) {
            rdict[match[1]] = match[2];
        }
        return rdict;
    }
    _getList(string) {
        if (!string) {
            return [];
        }
        const headers = [
            'Created,e-Voucher number,Activation code,Currency,Batch,Payer Account,Payee Account,Activated,Amount',
            'Time,Type,Batch,Currency,Amount,Fee,Payer Account,Payee Account,Payment ID,Memo',
        ];
        return string.split('\n').filter(x => x !== '' && !headers.includes(x));
    }
    balance() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = BASE_URL.replace('%s', 'balance').replace('%s', this.account)
                .replace('%s', this.passwd).replace('%s', '');
            const res = (_a = yield this._fetch(url, null)) !== null && _a !== void 0 ? _a : "";
            return this._getDict(res);
        });
    }
    history(startmonth, startday, startyear, endmonth, endday, endyear) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                'startmonth': startmonth,
                'startday': startday,
                'startyear': startyear,
                'endmonth': endmonth,
                'endday': endday,
                'endyear': endyear,
            };
            const queryString = this.encodeParams(params);
            const url = BASE_URL.replace('%s', 'historycsv').replace('%s', this.account)
                .replace('%s', this.passwd).replace('%s', queryString);
            const res = (_a = yield this._fetch(url, null)) !== null && _a !== void 0 ? _a : "";
            return this._getList(res);
        });
    }
    transfer(payer, payee, amount, memo, payment_id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                'AccountID': this.account,
                'PassPhrase': this.passwd,
                'Payer_Account': payer,
                'Payee_Account': payee,
                'Amount': amount,
                'Memo': memo,
                'PAY_IN': '1',
                'PAYMENT_ID': payment_id,
            };
            const queryString = this.encodeParams(params);
            const url = BASE_URL.replace('%s', 'confirm').replace('%s', this.account)
                .replace('%s', this.passwd).replace('%s', queryString);
            const res = (_a = yield this._fetch(url, null)) !== null && _a !== void 0 ? _a : "";
            return this._getDict(res);
        });
    }
    evCreate(payer, amount) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                'Payer_Account': payer,
                'Amount': amount,
            };
            const queryString = this.encodeParams(params);
            const url = BASE_URL.replace('%s', 'ev_create').replace('%s', this.account)
                .replace('%s', this.passwd).replace('%s', queryString);
            const res = (_a = yield this._fetch(url, null)) !== null && _a !== void 0 ? _a : "";
            return this._getDict(res);
        });
    }
    evcsv() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = BASE_URL.replace('%s', 'evcsv').replace('%s', this.account)
                .replace('%s', this.passwd).replace('%s', '');
            const res = (_a = yield this._fetch(url, null)) !== null && _a !== void 0 ? _a : "";
            return this._getList(res);
        });
    }
    check(payee, payer, amount, units, batch_number, secret, timestamp, payment_id, v2_hash) {
        const check = `${payment_id}:${payee}:${amount}:${units}:${batch_number}:${payer}:${secret}:${timestamp}`;
        const res = crypto_1.default.createHash('md5').update(check).digest('hex').toUpperCase();
        return res === v2_hash;
    }
}
exports.default = PerfectMoney;
