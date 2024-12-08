import { Dao, AgentToken, TimeLock, Box } from "../../typechain-types"
import { deployments, ethers } from "hardhat"
import { assert, expect } from "chai"
import {
  FUNC,
  PROPOSAL_DESCRIPTION,
  NEW_STORE_VALUE,
  VOTING_DELAY,
  VOTING_PERIOD,
  MIN_DELAY,
} from "../../helper-hardhat-config"
import { moveBlocks } from "../../utils/move-blocks"
import { moveTime } from "../../utils/move-time"

describe("Dao Flow", async () => {
  let dao: Dao
  let agentToken: AgentToken
  let timeLock: TimeLock
  let box: Box
  const voteWay = 1 // for
  const reason = "I lika do da cha cha";
  beforeEach(async () => {
    await deployments.fixture(["all"])
    dao = await ethers.getContract("Dao")
    timeLock = await ethers.getContract("TimeLock")
    agentToken = await ethers.getContract("AgentToken")
    box = await ethers.getContract("Box")
  })

  it("can only be changed through Dao", async () => {
    await expect(box.store(55)).to.be.revertedWith("Ownable: caller is not the owner")
  })

  it("proposes, votes, waits, queues, and then executes", async () => {
    // propose
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [NEW_STORE_VALUE])
    const proposeTx = await dao.propose(
      [box.address],
      [0],
      [encodedFunctionCall],
      PROPOSAL_DESCRIPTION
    )
    const boxStartingValue = await box.retrieve()
    console.log(`Box starting value is: ${boxStartingValue.toString()}`)
    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.events![0].args!.proposalId
    let proposalState = await dao.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    await moveBlocks(VOTING_DELAY + 1)
    // vote
    const voteTx = await dao.castVoteWithReason(proposalId, voteWay, reason)
    await voteTx.wait(1)
    proposalState = await dao.state(proposalId)
    assert.equal(proposalState.toString(), "1")
    console.log(`Current Proposal State: ${proposalState}`)
    await moveBlocks(VOTING_PERIOD + 1)

    // queue & execute
    // const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
    const queueTx = await dao.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1)
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)

    proposalState = await dao.state(proposalId)
    console.log(`Current Proposal State: ${proposalState}`)

    console.log("Executing...")
    console.log
    const exTx = await dao.execute([box.address], [0], [encodedFunctionCall], descriptionHash)
    await exTx.wait(1)
    const boxEndingValue = await box.retrieve()
    console.log(`Box ending value THROUGH GOVERNANCE IS: ${boxEndingValue.toString()}`)
  })
})
