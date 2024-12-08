import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployAgentToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments

  const { deployer } = await getNamedAccounts()

  log("----------------------------------------------------")
  log("Deploying AgentToken and waiting for confirmations...")

  const agentToken = await deploy("AgentToken", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })
  log(`AgentToken at ${agentToken.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(agentToken.address, [])
  }
  log(`Delegating to ${deployer}`)

  await delegate(agentToken.address, deployer)

  log("Delegated!")
}

const delegate = async (agentTokenAddress: string, delegatedAccount: string) => {
  const agentToken = await ethers.getContractAt("AgentToken", agentTokenAddress)
  const transactionResponse = await agentToken.delegate(delegatedAccount)
  await transactionResponse.wait(1)
  console.log(`Checkpoints: ${await agentToken.numCheckpoints(delegatedAccount)}`)
}

export default deployAgentToken;
deployAgentToken.tags = ["all", "governor"];
