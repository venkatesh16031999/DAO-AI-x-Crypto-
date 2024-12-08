const redis = require("redis");

const NRP = require('node-redis-pubsub');
const config = {
  port  : 6379  , // Port of your locally running Redis server
  scope : 'AIDAO'  // Use a scope to prevent two NRPs from sharing messages
};

const nrp = new NRP(config);

const main = async () => {
    setInterval(() => {
        nrp.emit('AIDAO::PROPOSAL', {
            projectDescription: `The project is a counter store and it is advised to keep the counter less than 10. If the counter is moving beyond 10 will cause
            problems for the community and users. So project needs to maintain the counter store to stay below 10`,
            proposalDescription: "Please change the counter store to have a value 12",
            contractAddress: "0x1A2b3C4d5E6F7G8H9I0JkLmN1O2pQrStU3vWxYz",
            proposalId: ""
        }); 
    }, 10000);
}

main();