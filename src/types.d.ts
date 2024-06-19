export type Asset = {
  policy_id: string;
  asset_name: string;
  quantity: number;
};

export type ParsedTransaction = {
  [stake_address: string]: {
    lost_assets: Asset[];
    earned_assets: Asset[];
    minted_assets: Asset[];
    ada_summary: number;
    transaction_hash: string;
  };
};

export type BlockforstWebhookPayload = {
  id: string;
  webhook_id: string;
  created: number;
  api_version: number;
  type: string;
  payload: Array<{
    tx: {
      hash: string;
      block: string;
      block_height: number;
      block_time: number;
      slot: number;
      index: number;
      output_amount: Array<{
        unit: string;
        quantity: string;
      }>;
      fees: string;
      deposit: string;
      size: number;
      invalid_before: any;
      invalid_hereafter: unknown;
      utxo_count: number;
      withdrawal_count: number;
      mir_cert_count: number;
      delegation_count: number;
      stake_cert_count: number;
      pool_update_count: number;
      pool_retire_count: number;
      asset_mint_or_burn_count: number;
      redeemer_count: number;
      valid_contract: boolean;
    };
    inputs: Array<{
      address: string;
      amount: Array<{
        unit: string;
        quantity: string;
      }>;
      tx_hash: string;
      output_index: number;
      collateral: boolean;
      data_hash: any;
    }>;
    outputs: Array<{
      address: string;
      amount: Array<{
        unit: string;
        quantity: string;
      }>;
      output_index: number;
      collateral: boolean;
      data_hash: any;
    }>;
  }>;
};
