import { Asset, ParsedTransaction, BlockforstWebhookPayload } from "./types.js";

const toAscii = (hex: string) => {
  return Buffer.from(hex, "hex").toString("ascii");
};

const aggregateAssets = (assets: Asset[]): Asset[] => {
  const assetMap: { [key: string]: Asset } = {};

  for (const asset of assets) {
    const key = `${asset.policy_id}:${asset.asset_name}`;
    if (assetMap[key]) {
      // If the asset already exists in the map, add the quantity
      assetMap[key].quantity += asset.quantity;
    } else {
      // If the asset does not exist, add it to the map
      assetMap[key] = { ...asset };
    }
  }

  // Return the aggregated assets as an array
  return Object.values(assetMap);
};

// Processes a parsed transaction to aggregate assets for each stake address
const processParsedTransaction = (
  parsedTransaction: ParsedTransaction
): ParsedTransaction => {
  const result: ParsedTransaction = {};

  for (const stakeAddress in parsedTransaction) {
    const transaction = parsedTransaction[stakeAddress];
    // Aggregate lost, earned, and minted assets for the stake address
    result[stakeAddress] = {
      lost_assets: aggregateAssets(transaction.lost_assets),
      earned_assets: aggregateAssets(transaction.earned_assets),
      minted_assets: aggregateAssets(transaction.minted_assets),
      ada_summary: transaction.ada_summary,
    };
  }

  return result;
};

// Initializes the stake address in the addresses map if it does not exist
const initializeStakeAddress = (
  addresses: ParsedTransaction,
  stakeAddress: string
) => {
  if (!addresses[stakeAddress]) {
    addresses[stakeAddress] = {
      lost_assets: [],
      earned_assets: [],
      minted_assets: [],
      ada_summary: 0,
    };
  }
};

// Parses transactions and processes inputs and outputs to aggregate assets and ADA summaries
export const parseTransaction = async (
  transaction: BlockforstWebhookPayload["payload"]
) => {
  const { inputs, outputs } = transaction;
  const addresses = {} as ParsedTransaction;
  const dynamicImport = async (module: string) => await import(module);
  const { Address, StakeAddress } = await dynamicImport("@hyperionbt/helios");

  // Process each input of the transaction
  for (const input of inputs) {
    if (input.collateral) continue;
    let stakeAddress = input.address;
    try {
      const address = Address.fromBech32(stakeAddress);
      const stake = StakeAddress.fromAddress(address).toBech32();
      stakeAddress = stake;
    } catch (error) {
      // If resolving reward address fails, use the original address
    }

    for (const amount of input.amount) {
      initializeStakeAddress(addresses, stakeAddress);

      if (amount.unit === "lovelace") {
        // Update ADA summary by subtracting the input amount
        addresses[stakeAddress].ada_summary +=
          -Number(amount.quantity) * 10 ** -6;
        continue;
      }

      const assetPolicy = amount.unit.substring(0, 56);
      const assetName = amount.unit.substring(56);
      const asset_name_ascii = toAscii(assetName);
      const quantity = Number(amount.quantity);

      const inputSummary: Asset = {
        asset_name: asset_name_ascii,
        policy_id: assetPolicy,
        quantity,
      };

      // Add the input asset to the lost assets list
      addresses[stakeAddress].lost_assets.push(inputSummary);
    }
  }

  // Process each output of the transaction
  for (const output of outputs) {
    if (output?.collateral) continue;
    let stakeAddress = output.address;
    try {
      const address = Address.fromBech32(stakeAddress);
      const stake = StakeAddress.fromAddress(address).toBech32();
      stakeAddress = stake;
    } catch (error) {
      // If resolving reward address fails, use the original address
    }

    for (const amount of output.amount) {
      initializeStakeAddress(addresses, stakeAddress);

      if (amount.unit === "lovelace") {
        // Update ADA summary by adding the output amount
        addresses[stakeAddress].ada_summary +=
          Number(amount.quantity) * 10 ** -6;
        continue;
      }

      const assetPolicy = amount.unit.substring(0, 56);
      const assetName = amount.unit.substring(56);
      const asset_name_ascii = toAscii(assetName);
      const quantity = Number(amount.quantity);

      const outputSummary: Asset = {
        asset_name: asset_name_ascii,
        policy_id: assetPolicy,
        quantity,
      };

      const inputByAnyone = inputs.find((input) =>
        input.amount.some((inputAmount) => inputAmount.unit === amount.unit)
      );

      if (!inputByAnyone) {
        // If the asset was not an input, it is considered minted
        addresses[stakeAddress].minted_assets.push(outputSummary);
        continue;
      }

      // Find matching lost assets to calculate the net difference
      const lostAsset = addresses[stakeAddress].lost_assets.filter(
        (asset) =>
          asset.asset_name === outputSummary.asset_name &&
          asset.policy_id === outputSummary.policy_id
      );

      if (lostAsset.length === 0) {
        // If there are no matching lost assets, it is considered earned
        addresses[stakeAddress].earned_assets.push(outputSummary);
        continue;
      }

      const difference =
        outputSummary.quantity -
        lostAsset.reduce((total, current) => total + current.quantity, 0);

      // Remove the matching lost assets from the list
      addresses[stakeAddress].lost_assets = addresses[
        stakeAddress
      ].lost_assets.filter(
        (asset) =>
          asset.policy_id + asset.asset_name !==
          outputSummary.policy_id + outputSummary.asset_name
      );

      if (difference > 0) {
        // If the output quantity is greater, it is considered earned
        outputSummary.quantity = difference;
        addresses[stakeAddress].earned_assets.push(outputSummary);
        continue;
      }

      if (difference < 0) {
        // If the output quantity is less, update the lost assets list
        outputSummary.quantity = Math.abs(difference);
        addresses[stakeAddress].lost_assets.push(outputSummary);
      }
    }
  }

  // Process and notify parsed transactions
  const processedParsedTransactions = processParsedTransaction(addresses);

  return processedParsedTransactions;
};
