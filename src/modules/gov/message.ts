/* eslint-disable @typescript-eslint/naming-convention */
import { Any } from "cosmjs-types/google/protobuf/any";
import { Duration } from "cosmjs-types/google/protobuf/duration";
import Long from "long";

import { MsgCancelUpgrade, MsgSoftwareUpgrade } from "../../cosmos/upgrade/v1beta1/tx";
import { MsgUpdateChainOracles, MsgUpdateParams } from "../../fx/crosschain/v1/tx";
import {
  MsgRegisterCoin,
  MsgRegisterERC20,
  MsgToggleTokenConversion,
  MsgUpdateDenomAlias,
  MsgUpdateParams as MsgUpdateParamsErc20,
} from "../../fx/erc20/v1/tx";
import { toDecString, toProtoString } from "../index";

interface AminoDenomUnit {
  readonly denom: string;
  exponent?: number;
  aliases?: string[];
}

export function proposalMessageToAminoConverter(message: Any): any {
  if (!message.value || !message.typeUrl) {
    throw new Error(`Invalid proposal message type: '${message}'`);
  }
  if (message.typeUrl == "/fx.gravity.crosschain.v1.MsgUpdateChainOracles") {
    const msg = MsgUpdateChainOracles.decode(message.value);
    return {
      type: "crosschain/MsgUpdateChainOracles",
      value: {
        chain_name: msg.chainName,
        authority: msg.authority,
        oracles: msg.oracles,
      },
    };
  }
  if (message.typeUrl == "/fx.gravity.crosschain.v1.MsgUpdateParams") {
    const msg = MsgUpdateParams.decode(message.value);
    return {
      type: "crosschain/MsgUpdateParams",
      value: {
        chain_name: msg.chainName,
        authority: msg.authority,
        params: {
          average_block_time: msg.params?.averageBlockTime.toString(),
          average_external_block_time: msg.params?.averageExternalBlockTime.toString(),
          delegate_multiple: msg.params?.delegateMultiple.toString(),
          delegate_threshold: msg.params?.delegateThreshold,
          external_batch_timeout: msg.params?.externalBatchTimeout.toString(),
          gravity_id: msg.params?.gravityId,
          ibc_transfer_timeout_height: msg.params?.ibcTransferTimeoutHeight.toString(),
          oracle_set_update_power_change_percent: toDecString(
            new TextDecoder().decode(msg.params?.oracleSetUpdatePowerChangePercent),
            18,
          ),
          signed_window: msg.params?.signedWindow.toString(),
          slash_fraction: toDecString(new TextDecoder().decode(msg.params?.slashFraction), 18),
        },
      },
    };
  }
  if (message.typeUrl == "/fx.erc20.v1.MsgUpdateParams") {
    const msg = MsgUpdateParamsErc20.decode(message.value);
    return {
      type: "erc20/MsgUpdateParams",
      value: {
        authority: msg.authority,
        params: {
          enable_erc20: msg.params?.enableErc20,
          enable_evm_hook: msg.params?.enableEvmHook,
          ibc_timeout: msg.params?.ibcTimeout?.seconds.mul(1e9).add(msg.params?.ibcTimeout?.nanos).toString(),
        },
      },
    };
  }
  if (message.typeUrl == "/fx.erc20.v1.MsgRegisterCoin") {
    const msg = MsgRegisterCoin.decode(message.value);
    return {
      type: "erc20/MsgRegisterCoin",
      value: {
        authority: msg.authority,
        metadata: {
          description: msg.metadata?.description,
          denom_units: msg.metadata?.denomUnits.map((v) => {
            const denomUnit: AminoDenomUnit = {
              denom: v.denom,
              exponent: v.exponent,
              aliases: v.aliases,
            };
            if (denomUnit.aliases?.length === 0) {
              delete denomUnit.aliases;
            }
            if (denomUnit.exponent === 0) {
              delete denomUnit.exponent;
            }
            return denomUnit;
          }),
          base: msg.metadata?.base,
          display: msg.metadata?.display,
          name: msg.metadata?.name,
          symbol: msg.metadata?.symbol,
          uri: msg.metadata?.uri,
          uri_hash: msg.metadata?.uriHash,
        },
      },
    };
  }
  if (message.typeUrl == "/fx.erc20.v1.MsgRegisterERC20") {
    const msg = MsgRegisterERC20.decode(message.value);
    return {
      type: "erc20/MsgRegisterERC20",
      value: {
        authority: msg.authority,
        erc20address: msg.erc20address,
        aliases: msg.aliases,
      },
    };
  }
  if (message.typeUrl == "/fx.erc20.v1.MsgToggleTokenConversion") {
    const msg = MsgToggleTokenConversion.decode(message.value);
    return {
      type: "erc20/MsgToggleTokenConversion",
      value: {
        authority: msg.authority,
        token: msg.token,
      },
    };
  }
  if (message.typeUrl == "/fx.erc20.v1.MsgUpdateDenomAlias") {
    const msg = MsgUpdateDenomAlias.decode(message.value);
    return {
      type: "erc20/MsgUpdateDenomAlias",
      value: {
        authority: msg.authority,
        denom: msg.denom,
        alias: msg.alias,
      },
    };
  }
  if (message.typeUrl == "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade") {
    const msg = MsgSoftwareUpgrade.decode(message.value);
    return {
      type: "cosmos-sdk/MsgSoftwareUpgrade",
      value: {
        authority: msg.authority,
        plan: {
          name: msg.plan?.name,
          time: "0001-01-01T00:00:00Z",
          height: msg.plan?.height ? msg.plan.height.toString() : "0",
          info: msg.plan?.info,
        },
      },
    };
  }
  if (message.typeUrl == "/cosmos.upgrade.v1beta1.MsgCancelUpgrade") {
    const msg = MsgCancelUpgrade.decode(message.value);
    return {
      type: "cosmos-sdk/MsgCancelUpgrade",
      value: {
        authority: msg.authority,
      },
    };
  }
  throw new Error("not support type");
}

export function proposalMessageFromAminoConverter(message: any): Any {
  if (message.type === "crosschain/MsgUpdateChainOracles") {
    const msg = message.value;
    return {
      typeUrl: "/fx.gravity.crosschain.v1.MsgUpdateChainOracles",
      value: MsgUpdateChainOracles.encode({
        authority: msg.authority,
        chainName: msg.chain_name,
        oracles: msg.oracles,
      }).finish(),
    };
  }
  if (message.type === "crosschain/MsgUpdateParams") {
    const msg = message.value;
    return {
      typeUrl: "/fx.gravity.crosschain.v1.MsgUpdateParams",
      value: MsgUpdateParams.encode({
        authority: msg.authority,
        chainName: msg.chain_name,
        params: {
          gravityId: msg.params.gravity_id,
          averageBlockTime: Long.fromString(msg.params.average_block_time),
          externalBatchTimeout: Long.fromString(msg.params.external_batch_timeout),
          averageExternalBlockTime: Long.fromString(msg.params.average_external_block_time),
          signedWindow: Long.fromString(msg.params.signed_window),
          slashFraction: new TextEncoder().encode(toProtoString(msg.params.slash_fraction, 18)),
          oracleSetUpdatePowerChangePercent: new TextEncoder().encode(
            toProtoString(msg.params.oracle_set_update_power_change_percent, 18),
          ),
          ibcTransferTimeoutHeight: Long.fromString(msg.params.ibc_transfer_timeout_height),
          oracles: [],
          delegateThreshold: msg.params.delegate_threshold,
          delegateMultiple: Long.fromString(msg.params.delegate_multiple),
        },
      }).finish(),
    };
  }
  if (message.type === "erc20/MsgUpdateParams") {
    const msg = message.value;
    return {
      typeUrl: "/fx.erc20.v1.MsgUpdateParams",
      value: MsgUpdateParamsErc20.encode({
        authority: msg.authority,
        params: {
          enableErc20: msg.params.enable_erc20,
          enableEvmHook: msg.params.enable_evm_hook,
          ibcTimeout: Duration.fromPartial({
            seconds: Long.fromString(msg.params.ibc_timeout).div(1e9),
            nanos: parseInt(
              msg.params.ibc_timeout.length > 9
                ? msg.params.ibc_timeout.substring(msg.params.ibc_timeout.length - 9)
                : msg.params.ibc_timeout,
              10,
            ),
          }),
        },
      }).finish(),
    };
  }
  if (message.type === "erc20/MsgRegisterCoin") {
    const msg = message.value;
    return {
      typeUrl: "/fx.erc20.v1.MsgRegisterCoin",
      value: MsgRegisterCoin.encode({
        authority: msg.authority,
        metadata: {
          description: msg.metadata.description,
          denomUnits: [...msg.metadata.denom_units].map((v) => {
            return {
              denom: v.denom,
              exponent: v.exponent ? v.exponent : 0,
              aliases: v.aliases ? v.aliases : [],
            };
          }),
          base: msg.metadata.base,
          display: msg.metadata.display,
          name: msg.metadata.name,
          symbol: msg.metadata.symbol,
          uri: msg.metadata.uri,
          uriHash: msg.metadata.uri_hash,
        },
      }).finish(),
    };
  }
  if (message.type === "erc20/MsgRegisterERC20") {
    const msg = message.value;
    return {
      typeUrl: "/fx.erc20.v1.MsgRegisterERC20",
      value: MsgRegisterERC20.encode({
        aliases: msg.aliases,
        authority: msg.authority,
        erc20address: msg.erc20address,
      }).finish(),
    };
  }
  if (message.type === "erc20/MsgToggleTokenConversion") {
    const msg = message.value;
    return {
      typeUrl: "/fx.erc20.v1.MsgToggleTokenConversion",
      value: MsgToggleTokenConversion.encode({
        authority: msg.authority,
        token: msg.token,
      }).finish(),
    };
  }
  if (message.type === "erc20/MsgUpdateDenomAlias") {
    const msg = message.value;
    return {
      typeUrl: "/fx.erc20.v1.MsgUpdateDenomAlias",
      value: MsgUpdateDenomAlias.encode({
        alias: msg.alias,
        authority: msg.authority,
        denom: msg.denom,
      }).finish(),
    };
  }
  if (message.type === "cosmos-sdk/MsgSoftwareUpgrade") {
    const msg = message.value;
    return {
      typeUrl: "/cosmos.upgrade.v1beta1.MsgSoftwareUpgrade",
      value: MsgSoftwareUpgrade.encode({
        authority: msg.authority,
        plan: {
          name: msg.plan.name,
          time: undefined,
          height: Long.fromString(msg.plan.height || "0", true),
          info: msg.plan.info,
          upgradedClientState: undefined,
        },
      }).finish(),
    };
  }
  if (message.type === "cosmos-sdk/MsgCancelUpgrade") {
    const msg = message.value;
    return {
      typeUrl: "cosmos.upgrade.v1beta1.MsgCancelUpgrade",
      value: MsgCancelUpgrade.encode({
        authority: msg.authority,
      }).finish(),
    };
  }
  throw new Error("not support type");
}
