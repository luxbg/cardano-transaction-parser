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
  };
};

export type BlockforstWebhookPayload = {
  id: string;
  webhook_id: string;
  created: number;
  api_version: number;
  type: string;
  payload: {
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
  };
};
