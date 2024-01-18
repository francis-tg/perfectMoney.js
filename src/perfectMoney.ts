import fetch from "node-fetch";
import crypto from "crypto"
const BASE_URL = 'https://perfectmoney.com/acct/%s.asp?AccountID=%s&PassPhrase=%s&%s';

interface Dictionary {
    [key: string]: string;
}

class PerfectMoney {
    private account: string;
    private passwd: string;
    private error: string | null = null;
    private errorRe: RegExp = /<input name='ERROR' type='hidden' value='(.*)'>/;
    private valueRe: RegExp = /<input name='(.*)' type='hidden' value='(.*)'>/g;

    constructor(account: string, passwd: string) {
        this.account = account;
        this.passwd = encodeURIComponent(passwd);
    }

    private encodeParams(params: Dictionary): string {
        return Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }

    private async _fetch(url: string, params: Dictionary | null): Promise<string | null> {
        let res: string | null = null;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params ? this.encodeParams(params) : undefined,
            });

            res = await response.text();
        } catch (error) {
            this.error = 'API request failed';
            return null;
        }

        return res;
    }

    private _getDict(string: string): Dictionary {
        const rdict: Dictionary = {};

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

    private _getList(string: string): string[] {
        if (!string) {
            return [];
        }

        const headers = [
            'Created,e-Voucher number,Activation code,Currency,Batch,Payer Account,Payee Account,Activated,Amount',
            'Time,Type,Batch,Currency,Amount,Fee,Payer Account,Payee Account,Payment ID,Memo',
        ];

        return string.split('\n').filter(x => x !== '' && !headers.includes(x));
    }

    async balance(): Promise<Dictionary> {
        const url = BASE_URL.replace('%s', 'balance').replace('%s', this.account)
            .replace('%s', this.passwd).replace('%s', '');

        const res = await this._fetch(url, null)??"";
        return this._getDict(res);
    }

    async history(startmonth: string, startday: string, startyear: string,
        endmonth: string, endday: string, endyear: string): Promise<string[]> {
        const params: Dictionary = {
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

        const res = await this._fetch(url, null)??"";
        return this._getList(res);
    }

    async transfer(payer: string, payee: string, amount: string,
        memo: string, payment_id: string): Promise<Dictionary> {
        const params: Dictionary = {
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

        const res = await this._fetch(url, null)??"";
        return this._getDict(res);
    }

    async evCreate(payer: string, amount: string): Promise<Dictionary> {
        const params: Dictionary = {
            'Payer_Account': payer,
            'Amount': amount,
        };

        const queryString = this.encodeParams(params);

        const url = BASE_URL.replace('%s', 'ev_create').replace('%s', this.account)
            .replace('%s', this.passwd).replace('%s', queryString);

        const res = await this._fetch(url, null)??"";
        return this._getDict(res);
    }

    async evcsv(): Promise<string[]> {
        const url = BASE_URL.replace('%s', 'evcsv').replace('%s', this.account)
            .replace('%s', this.passwd).replace('%s', '');

        const res = await this._fetch(url, null)??"";
        return this._getList(res);
    }

    check(payee: string, payer: string, amount: string, units: string,
        batch_number: string, secret: string, timestamp: string,
        payment_id: string, v2_hash: string): boolean {
        const check = `${payment_id}:${payee}:${amount}:${units}:${batch_number}:${payer}:${secret}:${timestamp}`;
        const res = crypto.createHash('md5').update(check).digest('hex').toUpperCase();

        return res === v2_hash;
    }
}

export default PerfectMoney;
