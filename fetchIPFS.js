const axios = require('axios');
const fs = require("fs");

function getPercentage(number, total) {
    return Math.round((number / total) * 10000) / 100
}

(async () => {
    let ipfsData = {}
    let start = Date.now()
    let before = Date.now()
    for (let i = 0; i < 3333; i++) {
        let data;
        while (true) {
            try {
                data = (await axios.get(`https://ipfs.io/ipfs/QmcCJfBdzuWE11yAJck3f7c7psbev9qGB6dR1C3n8FvEPk/${i}`)).data
                break
            } catch (e) {
                console.log(`Wolf #${i} metadata failed, retrying: https://ipfs.io/ipfs/QmcCJfBdzuWE11yAJck3f7c7psbev9qGB6dR1C3n8FvEPk/${i}`)
            }
        }
        ipfsData[(i + 1).toString()] = {animation_url: data.animation_url, image: data.image}
        if (i % 10 === 0 && i > 0) {
            console.log(`Progress: ${i}/3333 (${getPercentage(i, 3333)}% - ${Math.round(Math.round((Date.now() - start) / (i + 1)))}ms avg time, ${Math.round(((Date.now() - start) / (i + 1)) * 3.333) - Math.round((Date.now() - start) / 1000)}s left)`)
            before = Date.now()
        }
    }
    fs.writeFileSync('ipfs.json', JSON.stringify(ipfsData, null, 4))
})()
