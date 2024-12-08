// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DaoRegistry is Context, AccessControl {
    bytes32 public constant AI_MANAGER_ROLE = keccak256("AI_MANAGER_ROLE");

    uint32 public daoIds;
    uint32 public agentIds;

    struct DaoMetadata {
        string daoName;
        string daoLogoUrl;
        string projectDescription;
    }

    struct DaoConfiguration {
        uint32 daoId;
        address contractAddress;
        DaoMetadata daoMetadata;
        address ownerAddress;
    }

    struct AIAgentConfiguration {
        uint32 agentId;
        address agentAddress;
        uint32 reputation;
        uint256 numberOfDecisions;
    }

    mapping(uint32 => DaoConfiguration) public daoConfigurations;
    mapping(uint32 => AIAgentConfiguration) public agentConfigurations;

    mapping(address => bool) public isAIRegistered;
    mapping(address => bool) public isDaoRegistered;

    error InvalidName();
    error ZeroAddress();
    error NotOwner();
    error AccessDenied();
    error InvalidLogo();
    error AgentNotFound();
    error DaoNotFound();
    error InvalidMetadata();
    error AlreadyRegistered();

    event DaoRegistered(uint32 indexed daoId, address indexed contractAddress, string daoName, string logo, string projectDescription);
    event DaoUpdated(uint32 indexed daoId, string projectDescription);

    event AIAgentRegistered(uint32 indexed agentId, address indexed agentAddress);
    event AIAction(uint32 indexed daoId, uint32 indexed agentId);

    modifier AIManagerOnly {
        if (!hasRole(AI_MANAGER_ROLE, _msgSender())) {
            revert AccessDenied();
        }
        _;
    }

    function registerDao(string memory _name, string memory _logo, address _owner, address _contractAddress, string memory _projectDescryption) external {
        if (bytes(_name).length <= 0) {
            revert InvalidName();
        }

        if (bytes(_logo).length <= 0) {
            revert InvalidLogo();
        }

        if (bytes(_projectDescryption).length <= 0) {
            revert InvalidMetadata();
        }

        if (_contractAddress == address(0) || _owner == address(0)) {
            revert ZeroAddress();
        }

        if (isDaoRegistered[_contractAddress]) {
            revert AlreadyRegistered();
        }

        daoIds++;

        DaoMetadata memory metadata = DaoMetadata({
            daoName: _name,
            projectDescription: _projectDescryption,
            daoLogoUrl: _logo
        });

        DaoConfiguration memory configuration = DaoConfiguration({
            daoId: daoIds,
            contractAddress: _contractAddress,
            daoMetadata: metadata,
            ownerAddress: _msgSender()
        });

        daoConfigurations[daoIds] = configuration;
        isDaoRegistered[_contractAddress] = true;

        emit DaoRegistered(daoIds, _contractAddress, _name, _logo, _projectDescryption);
    } 

    function updateDaoConfiguration(uint32 _daoId, string memory _projectDescryption) external {
        if (_msgSender() == address(0)) {
            revert ZeroAddress();
        }

        if (bytes(_projectDescryption).length <= 0) {
            revert InvalidMetadata();
        }

        DaoConfiguration storage configuration = daoConfigurations[_daoId];

        if (_msgSender() != configuration.ownerAddress) {
            revert ZeroAddress();
        }

        configuration.daoMetadata.projectDescription = _projectDescryption;

        emit DaoUpdated(_daoId, _projectDescryption);
    }

    function registerAIAgent(address _agentAddress) external {
        if (_agentAddress == address(0)) {
            revert ZeroAddress();
        }

        if (isAIRegistered[_agentAddress]) {
            revert AlreadyRegistered();
        }

        agentIds++;

        AIAgentConfiguration memory configuration = AIAgentConfiguration({
            agentId: agentIds,
            agentAddress: _agentAddress,
            reputation: 10,
            numberOfDecisions: 0
        });

        agentConfigurations[agentIds] = configuration;
        isAIRegistered[_agentAddress] = true;

        emit AIAgentRegistered(agentIds, _agentAddress);
    }

    function aiAction(uint32 _agentId, uint32 _daoId) external {
        if (agentConfigurations[_agentId].agentId <= 0) {
            revert AgentNotFound();
        }

        if (daoConfigurations[_daoId].daoId <= 0) {
            revert DaoNotFound();
        }

        AIAgentConfiguration storage aiConfiguration = agentConfigurations[_agentId];
        DaoConfiguration storage daoConfigurations = daoConfigurations[_daoId];

        aiConfiguration.numberOfDecisions++;
    }
}