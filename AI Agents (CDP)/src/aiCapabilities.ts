import { Wallet } from "@coinbase/coinbase-sdk";
import { ethers } from "ethers";
import { DaoRegiostryAbi } from "./abi/DaoRegistryAbi";
import { DaoAbi } from "./abi/DaoAbi";
import { z } from "zod";

const getProviderByChainId = (): ethers.providers.JsonRpcProvider => {
    const rpcUrl = process.env.RPC_URL;
    return new ethers.providers.JsonRpcProvider(rpcUrl);
}

const getDaoRegistryContract = () => {
    const provider = getProviderByChainId();
    return new ethers.Contract(process.env.DAO_REGISTRY_CONTRACT as string, DaoRegiostryAbi, provider);
}

// const getDaoContract = (daoContractAddress: string) => {
//     const provider = getProviderByChainId();
//     return new ethers.Contract(daoContractAddress, DaoAbi, provider);
// }

export const getDaoRegistryContractAddress = async (
    wallet: Wallet,
    args: any
) => {
    const daoRegistryContract = getDaoRegistryContract();
    return await daoRegistryContract.address;
}

export const isAIRegisteredInput = z
    .object({
        walletAddress: z.string().describe("The wallet address of AI itself for the AI registration"),
    })
    .strip()
    .describe("Instructions for registeration of AI in DaoRegistry contract");

export const isAIRegistered = async (
    wallet: Wallet,
    args: z.infer<typeof isAIRegisteredInput>
) => {
    const contract = await getDaoRegistryContract();

    const isRegistered = await contract.isAIRegistered(args.walletAddress);

    return `
        If the wallet address is already registered skip the registeration request

        Is Registered: ${isRegistered}
    `
}

export const registerAIInput = z
    .object({
        walletAddress: z.string().describe("The wallet address of AI itself for the AI registration"),
    })
    .strip()
    .describe("Instructions for registeration of AI in DaoRegistry contract");

export const registerAI = async (
    wallet: Wallet,
    args: z.infer<typeof registerAIInput>
) => {
    const contract = await getDaoRegistryContract();

    await wallet.invokeContract({
        contractAddress: contract.address,
        abi: DaoRegiostryAbi,
        method: "registerAIAgent",
        args: { "agentAddress": args.walletAddress }
    });

    return 'Agent wallet is registered with the DaoRegistry';
}

export const castVoteInput = z
    .object({
        contractAddress: z.string().describe("This is the contract address of Governance or DAO contract (Not dao registry) for casting the vote"),
        proposalId: z.string().describe("The unique ID of the proposal from DAO or governance"),
        reason: z.string().describe("The opinion and feedback of the proposal"),
        voteValue: z.number().describe('The vote opinion whether the AI vote is against or other way')
    })
    .strip()
    .describe("Instructions for casting a vote for the DAO or Governance contract.");

export const castVote = async (
    wallet: Wallet,
    args: z.infer<typeof castVoteInput>
) => {
    await wallet.invokeContract({
        contractAddress: args.contractAddress,
        abi: DaoAbi,
        method: "castVoteWithReason",
        args: {
            "proposalId": args.proposalId,
            "support": args.voteValue,
            "reason": args.reason
        }
    });
    
    return 'The vote was casted by the AI agent successfully';
}

export const generateOpinionAboutProposalInput = z
    .object({
        projectDescription: z.string()
            .describe("This is the project description of a DAO project where the proposal is being proposed for a protocol change"),
        proposalDescription: z.string()
            .describe("This is the proposal description of a DAO proposal which can be used to compare against the project description to prevent bad things from happening wiht the AI's intellectual properties"),
    })
    .strip()
    .describe("Instructions for analysing the AI's opinion about the proposal based on the project details. The AI should always prevent the bad proposals to fail so that the DAO will be safe");

export const generateOpinionAboutProposal = async (
    wallet: Wallet,
    args: z.infer<typeof generateOpinionAboutProposalInput>
) => {
    return `
    Hey I know you are a intelligent AI. Here is the project description which tells AI everything about the project and it's community, etc...
    Project Description: ${args.projectDescription} 

    A proposal is a opinion raised from the community to change the nature of the project with DAO.
    Analyse whether the given proposal brings good things for the project and community. With AI's inteliggent analysis, please provide your opinion
    If AI feels the proposal is good, the AI can call the cast_vote_tool and provide a positive support (i.e 0)
    If the proposal is bad, the AI can call the cast_vote_tool and provide a negative support (i.e 1)

    Proposal Description: ${args.proposalDescription}
    `;
}