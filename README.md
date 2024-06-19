# Cardano Transaction Parser

A utility package for parsing cardano transactions. This package returns a summary of what each wallet did in a transaction.

## Installation

You can install the package using npm:

```bash
npm i @luxbug/cardano-transaction-parser
```

## Usage

### Importing the package

```javascript
import { parseTransaction } from '@luxbug/cardano-transaction-parser';
```

### Parsing a transaction

```javascript
const transactionData = {
  inputs: [
    {
      address: '...',
      amount: [
        { unit: 'lovelace', quantity: '1000000' },
        { unit: 'asset1234567890', quantity: '1' }
      ]
    }
  ],
  outputs: [
    {
      address: '...',
      amount: [
        { unit: 'lovelace', quantity: '500000' },
        { unit: 'asset1234567890', quantity: '1' }
      ]
    }
  ]
};

const parsedTransaction = await parseTransaction(transactionData);
console.log(parsedTransaction);
```

## Functions

### `parseTransaction(transactionData): Promise<ParsedTransaction>`

Parses a transaction object and returns asset and ADA summary for each wallet involved in the transaction.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to customize and expand on this README to fit your package's specific needs!