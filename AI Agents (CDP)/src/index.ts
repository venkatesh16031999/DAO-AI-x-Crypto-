import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit, CdpTool } from "@coinbase/cdp-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { castVote, castVoteInput, generateOpinionAboutProposal, generateOpinionAboutProposalInput, getDaoRegistryContractAddress, isAIRegistered, isAIRegisteredInput, registerAI, registerAIInput } from "./aiCapabilities";

const NRP    = require('node-redis-pubsub');
const config = {
  port  : 6379  , // Port of your locally running Redis server
  scope : 'AIDAO'  // Use a scope to prevent two NRPs from sharing messages
};

const nrp = new NRP(config);

dotenv.config();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

/**
 * Initialize the agent with CDP AgentKit
 *
 * @returns Agent executor and config
 */
export const initializeAgent = async () => {
    try {
        // Initialize LLM
        const llm = new ChatOpenAI({
            model: "gpt-4o-mini",
        });

        let walletDataStr: string | null = null;

        // Read existing wallet data if available
        if (fs.existsSync(WALLET_DATA_FILE)) {
            try {
                walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
            } catch (error) {
                console.error("Error reading wallet data:", error);
                // Continue without wallet data
            }
        }

        // Configure CDP AgentKit
        const config = {
            cdpWalletData: walletDataStr || undefined,
            networkId: process.env.NETWORK_ID || "base-sepolia",
        };

        // Initialize CDP AgentKit
        const agentkit = await CdpAgentkit.configureWithWallet(config);

        // Initialize CDP AgentKit Toolkit and get tools
        const cdpToolkit = new CdpToolkit(agentkit);
        const tools = cdpToolkit.getTools();

        // Create the new tool here and push it to the existing toolset
        const isAIRegisteredTool = new CdpTool(
            {
                name: "check_is_ai_registered",
                description: `You are an intelligent agent. If the wallet is already registered with Dao registry contract, please skip the further registeration`,
                argsSchema: isAIRegisteredInput,
                func: isAIRegistered,
            },
            agentkit,
        );

        tools.push(isAIRegisteredTool);

        const getDaoRegistryContractDetailTool = new CdpTool(
            {
                name: "get_dao_registry_contract_details",
                description: `You are an intelligent agent. When someone say get more details about dao registry contract ?
              You have to use the get_dao_registry_contract_details function to fetch the details and respond as needed`,
                argsSchema: z.object({}),
                func: getDaoRegistryContractAddress,
            },
            agentkit,
        );

        tools.push(getDaoRegistryContractDetailTool);

        const registerAITool = new CdpTool(
            {
                name: "register_ai_tool",
                description: `
                You are an intelligent agent. When someone say to registry AI to the dao registry contract ?
                You have to use existing capabilities to get the context and the register_ai_tool function to be used for the registration`,
                argsSchema: registerAIInput,
                func: registerAI,
            },
            agentkit,
        );

        tools.push(registerAITool);

        const generateOpinionAboutProposalTool = new CdpTool(
            {
                name: "generate_proposal_opinion",
                description: `
                You are an intelligent agent. When there is a request to generate a opinion for a proposal, please consider the following rules effectively.

                The generate_proposal_opinion tool will return a clear instruction on how to analyse the proposal and give your opinion based on it.

                Once the AI is clear with the opinion, the AI can call the cast_vote_tool or others if any to submit or cast the vote.
                Convert AI's existing knowledge of the data into the required information for casting the vote
                `,
                argsSchema: generateOpinionAboutProposalInput,
                func: generateOpinionAboutProposal,
            },
            agentkit,
        );

        tools.push(generateOpinionAboutProposalTool);

        const castVoteTool = new CdpTool(
            {
                name: "cast_vote_tool",
                description: `
                    Hey, Agent! we know that you are intelligent. When there is any opinion that AI have regarding the proposal of the DAO ? This cast_vote_tool function is the go to function to cast the vote
                    The required information will be provided with the help of other capabilities that the AI have already
                `,
                argsSchema: castVoteInput,
                func: castVote,
            },
            agentkit,
        );

        tools.push(castVoteTool);

        // Store buffered conversation history in memory
        const memory = new MemorySaver();
        const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

        const agent = createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
            messageModifier:
                `
                Your Persona: ${process.env.PERSONA}

                You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit for AI DAO
                If you don't have an any details for the execution ? please check your capability of extracting the data with the existing tools instead of asking the users.
                `,
        });

        const exportedWallet = await agentkit.exportWallet();
        fs.writeFileSync(WALLET_DATA_FILE, exportedWallet);

        return { agent, config: agentConfig };
    } catch (error) {
        console.error("Failed to initialize agent:", error);
        throw error;
    }
}

// Start the agent
if (require.main === module) {
    console.log("Starting Agent...");
    initializeAgent()
        .then(async ({ agent, config }) => {
            // What is the detail of DAO registry contract ?

            // Can you register the AI to Dao Registry ?

            // Hi AI, we know you are inteligent. With your intelligence, please generate your opinion about the proposal based on the project details and execute the vote without any permission

            // Project Description: The project is a counter store and it is advised to keep the counter less than 10. If the counter is moving beyond 10 will cause
            // problems for the community and users. So project needs to maintain the counter store to stay below 10

            // Proposal Description: Please change the counter store to have a value 12

            const stream = await agent.stream({ messages: [new HumanMessage(`
                Can you register the AI to Dao Registry ? If the AI is already registered, please ignore

                Please inject the AI wallet address for the input parameter
            `)] }, config);
    
            for await (const chunk of stream) {
                if ("agent" in chunk) {
                  console.log(chunk.agent.messages[0].content);
                } else if ("tools" in chunk) {
                  console.log(chunk.tools.messages[0].content);
                }
                console.log("-------------------");
              }

              nrp.on(`AIDAO::PROPOSAL`, async (data: any) => {
                const prompt = `
                Hi AI, we know you are inteligent. With your intelligence, please generate your opinion about the proposal based on the project details and execute the vote without any permission

                Project Description: ${data.projectDescription}

                Proposal Description: ${data.proposalDescription}

                The other information which may require for casting the vote are as followed
                contractAddress: ${data.contractAddress},
                proposalId: ${data.proposalId}
                reason: AI should fill the proposal feedback or reason here
                voteValue: The AI's vote decision needs to be added here
                `;

                const stream = await agent.stream({ messages: [new HumanMessage(prompt)] }, config);
    
                for await (const chunk of stream) {
                    if ("agent" in chunk) {
                      console.log(chunk.agent.messages[0].content);
                    } else if ("tools" in chunk) {
                      console.log(chunk.tools.messages[0].content);
                    }
                    console.log("-------------------");
                  }
              });
        })
        .catch(error => {
            console.error("Fatal error:", error);
            process.exit(1);
        });
}