import { Controller, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import Moralis from 'moralis';

// import { PrismaService } from './../prisma.service';
const REGISTRATION_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint32",
        "name": "daoId",
        "type": "uint32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contractAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "daoName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "logo",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "projectDescription",
        "type": "string"
      }
    ],
    "name": "DaoRegistered",
    "type": "event"
  }
]

const PROPOSAL_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address[]",
        "name": "targets",
        "type": "address[]"
      },
      {
        "indexed": false,
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      },
      {
        "indexed": false,
        "internalType": "string[]",
        "name": "signatures",
        "type": "string[]"
      },
      {
        "indexed": false,
        "internalType": "bytes[]",
        "name": "calldatas",
        "type": "bytes[]"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "startBlock",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "endBlock",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "ProposalCreated",
    "type": "event"
  }
];

const redis = require("redis");

const NRP = require('node-redis-pubsub');
const config = {
  port  : 6379  , // Port of your locally running Redis server
  scope : 'AIDAO'  // Use a scope to prevent two NRPs from sharing messages
};

@Controller('webhook')
export class WebhookController {

  private client: PrismaClient = new PrismaClient();
  // constructor(private prisma: PrismaService) {}
  @Post("/proposalevent")
  async handleProposalEvent(@Body() payload: any) {
    console.log('Webhook Proposal event received:', payload);
    // Filter event data from the webhook payload
    if (payload.tag === 'proposal_event') {
      const logs = payload.logs;
      logs.forEach((log) => {
        console.log(`DATA OF USER : ${log}`);
        // const findProposal = await this.prisma.proposal.cre
        const nrp = new NRP(config);

        const iface = new ethers.Interface(PROPOSAL_ABI);

        const decodedLog: ethers.LogDescription = iface.parseLog({
          topics: [log.topic0, log.topic1, log.topic2, log.topic3].filter(Boolean), // Exclude 
          data: log.data,
        });

        console.log({
          fullData: log,
          decodedLog,
        });

        nrp.emit('AIDAO::PROPOSAL', {
          projectDescription: `The project is a counter store and it is advised to keep the counter less than 10. If the counter is moving beyond 10 will cause
          problems for the community and users. So project needs to maintain the counter store to stay below 10`,
          proposalDescription: "Please change the counter store to have a value 12",
          contractAddress: "0x1A2b3C4d5E6F7G8H9I0JkLmN1O2pQrStU3vWxYz",
          value: 0,
          calldata: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          proposalDescriptionHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        }); 

      });
    }
    return { message: 'Webhook processed successfully' };
  }

  @Post("/registrationevent")
  async handleRegistrationEvent(@Body() payload: any) {
    console.log('Webhook Registration event received:', payload);
    // Filter event data from the webhook payload
    if (payload.tag === 'registration_event') {
      const logs = payload.logs;
      
      logs.forEach(async (log) => {
        console.log(`DATA OF USER : ${log}`);

        const iface = new ethers.Interface(REGISTRATION_ABI);

        const decodedLog: ethers.LogDescription = iface.parseLog({
          topics: [log.topic0, log.topic1, log.topic2, log.topic3].filter(Boolean), // Exclude 
          data: log.data,
      });

      console.log({
        fullData: log,
        decodedLog,
      });
      const createRegistery = {
        name: decodedLog.args[2] as string, // Add appropriate value
        description: decodedLog.args[4] as string, // Add appropriate value
        daocontract: decodedLog.args[1] as string,
        walletAddress: "0x1234567890", 
      }

      this.client.organization.create({
        data: {
          name: createRegistery.name,
          description: createRegistery.description,
          daocontract: createRegistery.daocontract,
          walletAddress:"0x1234567890",
        }
      })

      const streams = await Moralis.Streams.getAll({ limit: 20 });

      const { result } = streams.raw;

      const requiredStream = result.find((stream) => {
        return stream.tag === "proposal_event";
      });

      if (requiredStream) {
        Moralis.Streams.addAddress({ address: createRegistery.daocontract, id: requiredStream.id });
      } else {
        const options = {
          chains: ['84532'], // list of blockchains to monitor
          description: 'proposal event emitted', // your description
          tag: 'proposal_event', // give it a tag
          abi: PROPOSAL_ABI,
          includeContractLogs: true,
          allAddresses: false,
          topic0: [
            'ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)',
          ], // topic of the event
          webhookUrl: `${process.env.WEBHOOK_URL}/webhook/proposalevent`, // webhook url to receive events,
        };
    
        const newStream = await Moralis.Streams.add(options);
        const { id } = newStream.toJSON();

        await Moralis.Streams.addAddress({ address: createRegistery.daocontract, id });
      }

      });
    }
    return { message: 'Webhook processed successfully' };
  }
}
