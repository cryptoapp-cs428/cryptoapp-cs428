import web3 from './web3';
// This blockchainClientUtils is actually a symlink to solidity/client/blockchainUtils.js
import blockchainUtils from './blockchainFacade';

export default blockchainUtils(web3);
