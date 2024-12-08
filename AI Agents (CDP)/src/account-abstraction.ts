// import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules';
// import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
// import { Bundler, IBundler } from '@biconomy/bundler';
// import { Transaction } from '@biconomy/core-types';
// import {
//     BiconomyPaymaster,
//     IHybridPaymaster,
//     IPaymaster,
//     PaymasterMode,
//     SponsorUserOperationDto
// } from '@biconomy/paymaster';
// import { ethers } from "ethers";

// export const getProviderByChainId = (chainId: number): ethers.providers.JsonRpcProvider => {
//     let rpcUrl: string;

//     switch (chainId) {
//         case 11155111:
//           rpcUrl = process.env.SEPOLIA_RPC_URL;
//           break;
//         case 84532:
//           rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
//           break;
//         case 8453:
//           rpcUrl = process.env.BASE_RPC_URL;
//           break;
//         default:
//           throw new Error('Unsuported chain');
//       }

//       if (!rpcUrl || rpcUrl === '') {
//         throw new Error("RPC url not configured properly");
//       }
      
//       return new ethers.providers.JsonRpcProvider(rpcUrl);
// }

// export const getBundlerUrlByChainId = (chainId: number): string => {
//     let bundlerUrl = "";

//     switch (chainId) {
//         case 11155111:
//             bundlerUrl = process.env.SEPOLIA_BUNDLER_API_URL;
//             break;
//         case 84532:
//             bundlerUrl = process.env.BASE_SEPOLIA_BUNDLER_API_URL;
//             break;
//         case 8453:
//             bundlerUrl = process.env.BASE_BUNDLER_API_URL;
//             break;
//         default:
//           throw new Error('Unsuported chain');
//       }

//       if (!bundlerUrl || bundlerUrl === "") {
//         throw new Error("Bundler not configured properly");
//       }

//       return bundlerUrl;
// }

// export const getPaymasterUrlByChainId = (chainId: number): string => {
//     let paymasterUrl = "";

//     switch (chainId) {
//         case 11155111:
//             paymasterUrl = process.env.SEPOLIA_PAYMASTER_API_URL;
//             break;
//         case 84532:
//             paymasterUrl = process.env.BASE_SEPOLIA_PAYMASTER_API_URL;
//             break;
//         case 8453:
//             paymasterUrl = process.env.BASE_PAYMASTER_API_URL;
//             break;
//         default:
//           throw new Error('Unsuported chain');
//       }

//       if (!paymasterUrl || paymasterUrl === "") {
//         throw new Error("Paymaster not configured properly");
//       }

//       return paymasterUrl;
// }
// export const getBundler = (chainId: number) => {
//     const bundlerUrl = getBundlerUrlByChainId(chainId);

//     const bundler: IBundler = new Bundler({
//         bundlerUrl: bundlerUrl,
//         chainId: chainId,
//         entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
//         userOpReceiptMaxDurationIntervals: {
//             11155111: 180000, // 3 mins
//             // 84532: 180000, // 3 mins
//             // 80002: 180000, // 3 mins
//             8453: 180000, // 3 mins
//         },
//         userOpWaitForTxHashMaxDurationIntervals: {
//             11155111: 180000, // 3 mins
//             // 84532: 180000, // 3 mins
//             // 80002: 180000, // 3 mins
//             8453: 180000, // 3 mins
//         }
//     });

//     return bundler;
// }

// export const getPaymaster = (chainId: number) => {
//     const paymasterUrl = getPaymasterUrlByChainId(chainId);

//     const paymaster: IPaymaster = new BiconomyPaymaster({
//         paymasterUrl: paymasterUrl
//     });

//     return paymaster;
// }

// export const initializeAndGetSmartAccount = async (
//     chainId: number
// ): Promise<[string, BiconomySmartAccountV2]> => {
//     const bundler = getBundler(chainId);
//     const paymaster = getPaymaster(chainId);

//     const module = await ECDSAOwnershipValidationModule.create({
//         signer: null,
//         moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
//     });

//     let smartAccount = await BiconomySmartAccountV2.create({
//         chainId: chainId,
//         bundler: bundler,
//         paymaster: paymaster,
//         entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
//         defaultValidationModule: module,
//         activeValidationModule: module
//     });

//     const smartAccountAddress = await smartAccount.getAccountAddress();

//     return [smartAccountAddress, smartAccount];
// }

// export const executeUserOperations = async (transactions: Transaction[], chainId: number) => {
//     try {
//         const [, smartAccount] = await initializeAndGetSmartAccount(chainId);

//         // Arbitary nonce key to support parallel transactions with smart wallet. But the order of execution is not determined between multiple
//         // user ops but it is considered in the same batched user op.
//         const nonceKey = Math.floor(Math.random() * (10000 - 1) + 1);

//         let partialUserOp = await smartAccount.buildUserOp(transactions, { nonceOptions: { nonceKey } });

//         let paymasterServiceData: SponsorUserOperationDto = {
//             mode: PaymasterMode.SPONSORED,
//             smartAccountInfo: {
//                 name: 'BICONOMY',
//                 version: '2.0.0'
//             }
//         };

//         const biconomyPaymaster =
//             smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

//         const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
//             partialUserOp,
//             paymasterServiceData
//         );

//         partialUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
//         partialUserOp.verificationGasLimit = paymasterAndDataResponse.verificationGasLimit;
//         partialUserOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas;
//         partialUserOp.callGasLimit = paymasterAndDataResponse.callGasLimit;

//         const userOpTx = await smartAccount.sendUserOp(partialUserOp);
//         await userOpTx.wait();
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }
