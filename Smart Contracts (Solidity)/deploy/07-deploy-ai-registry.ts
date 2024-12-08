import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { ethers } from "hardhat"
import { developmentChains, networkConfig } from "../helper-hardhat-config";

const deployDaoRegistry: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("----------------------------------------------------");
  log("Deploying DaoRegistry and waiting for confirmations...");
  const daoRegistry = await deploy("DaoRegistry", {
    from: deployer,
    args: [],
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
  });
  log(`DaoRegister at ${daoRegistry.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(daoRegistry.address, []);
  }

  const daoRegistryContract = await ethers.getContractAt("DaoRegistry", daoRegistry.address)

  const dao = await ethers.getContract("Dao", deployer)

  const daoRegisterTx = await daoRegistryContract.registerDao(
    "Name",
    "Logo",
    deployer,
    dao.address,
    "Defi Project"
  );

  await daoRegisterTx.wait(1);

  const aiRegisterTx = await daoRegistryContract.registerAIAgent(
    deployer,
  );

  await aiRegisterTx.wait(1);
};

export default deployDaoRegistry;
deployDaoRegistry.tags = ["all", "Daoregistry"];
