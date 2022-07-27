const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (developmentChains.includes(network.name)) {
        const { deploy, log } = deployments;
        const { deployer } = await getNamedAccounts();

        log("----------------------------------------------------");
        log("Deploying FunWithStorage and waiting for confirmations...");
        const funWithStorage = await deploy("FunWithStorage", {
            from: deployer,
            args: [],
            log: true,
            // we need to wait if on a live network so we can verify properly
            waitConfirmations: network.config.blockConfirmations || 1,
        });

        log("Logging storage...");
        for (let i = 0; i < 10; i++) {
            log(
                `Location ${i}: ${await ethers.provider.getStorageAt(
                    funWithStorage.address,
                    i
                )}`
            );
        }

        // You can use this to trace!
        const trace = await network.provider.send("debug_traceTransaction", [
            funWithStorage.transactionHash,
        ]);
        for (structLog in trace.structLogs) {
            if (trace.structLogs[structLog].op == "SSTORE") {
                console.log(trace.structLogs[structLog]);
            }
        }

        // Получение элемента из dynamic array
        const arrElemLocation01 = ethers.utils.keccak256(
            "0x0000000000000000000000000000000000000000000000000000000000000002"
        );
        const arrElemLocation02 =
            ethers.BigNumber.from(arrElemLocation01).add(1);
        const arrElemLocation03 =
            ethers.BigNumber.from(arrElemLocation01).add(2);

        const arrElem01 = await ethers.provider.getStorageAt(
            funWithStorage.address,
            arrElemLocation01
        );
        const arrElem02 = await ethers.provider.getStorageAt(
            funWithStorage.address,
            arrElemLocation02
        );
        const arrElem03 = await ethers.provider.getStorageAt(
            funWithStorage.address,
            arrElemLocation03
        );

        log(`Location ${arrElemLocation01}: ${arrElem01}`);
        log(`Location ${arrElemLocation02.toHexString()}: ${arrElem02}`);
        log(`Location ${arrElemLocation03.toHexString()}: ${arrElem03}`);

        // Получение элемента из mapping
        const mappingElemLocation = ethers.utils.keccak256(
            ethers.utils.hexConcat([
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000003",
            ])
        );
        const mappingElem = await ethers.provider.getStorageAt(
            funWithStorage.address,
            mappingElemLocation
        );

        // log(`Location ${mappingElemLocation}: ${mappingElem}`);

        // Can you write a function that finds the storage slot of the arrays and mappings?
        // And then find the data in those slots?
    }
};

module.exports.tags = ["storage"];
