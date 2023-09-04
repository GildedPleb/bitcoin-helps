declare module "@holepunch/light-bolt11-decoder" {
  export interface FeatureBits {
    word_length: number;
    option_data_loss_protect: { required: boolean; supported: boolean };
    initial_routing_sync: { required: boolean; supported: boolean };
    option_upfront_shutdown_script: { required: boolean; supported: boolean };
    gossip_queries: { required: boolean; supported: boolean };
    var_onion_optin: { required: boolean; supported: boolean };
    gossip_queries_ex: { required: boolean; supported: boolean };
    option_static_remotekey: { required: boolean; supported: boolean };
    payment_secret: { required: boolean; supported: boolean };
    basic_mpp: { required: boolean; supported: boolean };
    option_support_large_channel: { required: boolean; supported: boolean };
    extra_bits: { start_bit: number; bits: any[]; has_required: boolean };
  }

  export interface RouteHintValue {
    pubkey: string;
    short_channel_id: string;
    fee_base_msat: number;
    fee_proportional_millionths: number;
    cltv_expiry_delta: number;
  }

  export interface Section {
    name: string;
    letters: string;
    value?:
      | string
      | number
      | {
          bech32?: string;
          pubKeyHash?: number;
          scriptHash?: number;
          validWitnessVersions?: number[];
        }
      | FeatureBits
      | RouteHintValue[];
    tag?: string;
  }

  export interface DecodeResult {
    paymentRequest: string;
    sections: Section[];
    expiry: number;
    route_hints: RouteHintValue[][];
  }

  export function decode(paymentRequest: string): DecodeResult;
}
