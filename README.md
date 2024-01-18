# PerfectMoney Class Documentation

## Introduction
The `PerfectMoney` class provides a TypeScript implementation for interacting with the PerfectMoney API. It includes methods for various operations such as checking account balance, retrieving transaction history, transferring money, creating e-Vouchers, and validating payment confirmation data.

## Installation
To use this module in your Node.js project, you need to install the required dependencies. Run the following command:

```bash
npm install node-fetch --save
````

Certainly! Below is the provided documentation for the PerfectMoney class in Markdown format:

markdown
Copy code
# PerfectMoney Class Documentation

## Introduction
The `PerfectMoney` class provides a TypeScript implementation for interacting with the PerfectMoney API. It includes methods for various operations such as checking account balance, retrieving transaction history, transferring money, creating e-Vouchers, and validating payment confirmation data.

## Installation
To use this module in your Node.js project, you need to install the required dependencies. Run the following command:

```bash
npm install node-fetch --save
````
Usage
typescript

// Import the PerfectMoney class
```` js
import PerfectMoney from './perfectMoney';

// Create an instance of the PerfectMoney class
const perfectMoney = new PerfectMoney('your_account', 'your_password');

 Example: Get account balance
perfectMoney.balance().then((balance) => {
  console.log('Account Balance:', balance);
});

// Example: Get transaction history
perfectMoney.history('01', '01', '2022', '12', '31', '2022').then((transactions) => {
  console.log('Transaction History:', transactions);
});

// Example: Transfer money
perfectMoney.transfer('payer_account', 'payee_account', '100', 'Payment Memo', '123456')
  .then((result) => {
    console.log('Transfer Result:', result);
});

// Other methods can be used similarly...

Methods
balance(): Promise<Dictionary>
Get account balance.

history(startmonth: string, startday: string, startyear: string, endmonth: string, endday: string, endyear: string): Promise<string[]>
Retrieve transaction history within a specified date range.

transfer(payer: string, payee: string, amount: string, memo: string, payment_id: string): Promise<Dictionary>
Transfer money from one account to another.

evCreate(payer: string, amount: string): Promise<Dictionary>
Create an e-Voucher.

evcsv(): Promise<string[]>
Retrieve e-Vouchers in CSV format.

check(payee: string, payer: string, amount: string, units: string, batch_number: string, secret: string, timestamp: string, payment_id: string, v2_hash: string): boolean
Validate SCI payment confirmation data from PerfectMoney server.

Note
Ensure that you replace 'your_account' and 'your_password' with your actual PerfectMoney account details.
