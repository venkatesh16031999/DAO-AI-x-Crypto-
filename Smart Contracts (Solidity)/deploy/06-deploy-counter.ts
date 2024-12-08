import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployCounter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  log("----------------------------------------------------")
  log("Deploying Counter and waiting for confirmations...")
  const counter = await deploy("Counter", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  })
  log(`Counter at ${counter.address}`)
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(counter.address, [])
  }
  const counterContract = await ethers.getContractAt("Counter", counter.address)
  const timeLock = await ethers.getContract("TimeLock")
  const transferTx = await counterContract.transferOwnership(timeLock.address) //Now, the ownership of box is from the timeLock.
  await transferTx.wait(1)
}

export default deployCounter
deployCounter.tags = ["all", "counter"]
