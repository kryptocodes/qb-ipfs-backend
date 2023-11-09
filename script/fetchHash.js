require("dotenv").config({ path: "../.env" });
const { providers, utils, } = require('ethers')
const fs = require('fs/promises')

const TEMP_HASH_LIST_JSON_NAME = 'hash.json'



const NETWORK_CONFIG = {
	'optimism-mainnet': {
		apiKey: process.env.OPTIMISM_API_KEY,
		name: 'optimism'
	}
}
console.log(NETWORK_CONFIG)

const ABI_MAP = {
	workspace: 'QBWorkspaceRegistryContract',
	applications: 'QBApplicationsContract',
	grantFactory: 'QBGrantFactoryContract',
	reviews: 'QBReviewsContract',
	communication: 'QBCommunicationContract',
	grant: 'QBGrantsContract',
}

const IPFS_HASH_KEYS = [
	'metadataHash',
	'_metadataHash',
	'_reasonMetadataHash',
	'feedbackHashes',
	'commentMetadataHash',
	'_commentMetadataHash',
	'emailHash',
	'_emailHash',
	'_commentMetadataHashes',
	'_rubricsMetadataHash',
	'rubricsMetadataHash',
	'_reviewMetadataHash',
	'sectionLogoIpfsHash',
]

// ref: https://github.com/questbook/subgraph/blob/main/scripts/reupload-ipfs-files.js
async function getIpfsHashes(contractName, network, contractAddress) {
	
	const config = require(`./${network}.json`)
	contractAddress = contractAddress || config[contractName].address

	const abiJsonName = ABI_MAP[contractName]
	const abiJson = require(`./abis/${abiJsonName}.json`)
	const abi = new utils.Interface(abiJson)

	const provider = new providers.AlchemyProvider(NETWORK_CONFIG[network].name,
		NETWORK_CONFIG[network].apiKey)

	const history = await fetchAllLogs()
	

	const hashes = new Set()
	const newGrantAddresses = new Set()
	for(const item of history) {
		try {
			// decode the tx logs,
			// check the name of the function
			const log = abi.parseLog(item)
			// we'll extract hashes from the created
			// grant as well
			if(log.name === 'createGrant') {
				newGrantAddresses.add(
					logs.args.grantAddress
				)
			}

			for(const key in log.args) {
				if(IPFS_HASH_KEYS.includes(key)) {
					// could be hash or array of hashes
					let value = log.args[key]
					value = Array.isArray(value) ? value : [value]
					for(const hash of value) {
						hashes.add(hash)
					}
				}
			}
		} catch(err) {
			console.warn(
				{ hash: item.hash, err: err.message },
				'failed to decode tx'
			)
			continue
		}
	}

	return { hashes, newGrantAddresses }

	async function fetchAllLogs() {
		let fromBlock 
		let logs = []
		const history = await provider.getLogs({
			address: contractAddress,
			fromBlock: 'earliest'
		})
		console.log(`got ${history.length} ${contractName} logs`)
		logs.push(...history)
		// first block 
		fromBlock = history[0].blockNumber + 1
		
		console.log(`fetching ${contractName} logs from block ${fromBlock}`)

		console.log(`got ${logs.length} ${contractName} logs`)
		
		return logs
	}
}


async function main() {
	const hashes = await extractHashes()
	const hashesSize = hashes.size || hashes.length
	console.log(`got ${hashesSize} hashes`)

	


	async function extractHashes() {
		const hashes = new Set()
		for(const network in NETWORK_CONFIG) {
			for(const key in ABI_MAP) {
				// grant doesn't have an explicit contract
				if(key === 'grant') {
					continue
				}
	
				console.log(`extracting from "${key} contract" on ${network}`)
				const result = await getIpfsHashes(key, network)
				for(const hash of result.hashes) {
					hashes.add(hash)
				}
				await saveHashes()
	
				console.log(`extracted ${result.hashes.size} hashes`)

				for(const grantAddress of Array.from(result.newGrantAddresses)) {
					console.log(`extracting from "grants contract (${grantAddress})" on ${network}`)
					const result = await getIpfsHashes('grant', network, grantAddress)
					hashes.push(...result.hashes)
					await saveHashes()
		
					console.log(`extracted ${result.hashes.length} hashes`)
				}
			}
		}

		return hashes

		async function saveHashes() {
			const hashesList = Array.from(hashes)
			await fs.writeFile(
				`./${TEMP_HASH_LIST_JSON_NAME}`,
				JSON.stringify({ hashes: hashesList })
			)
		}
	}
}

main()