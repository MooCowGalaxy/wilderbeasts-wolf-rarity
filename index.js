const express = require('express')
const ejs = require('ejs')
const { port } = require('./config.json')

const {attributes, attributeList, wolves, rarityRanking} = require('./rarity.json')
const rarity = require('./rarity.json')
const ipfsData = require('./ipfs.json')

const app = express()

app.use(express.json())

function renderFile(filename, data = {}) {
    return new Promise((resolve, reject) => {
        filename = `templates/${filename}.ejs`
        ejs.renderFile(filename, data, {}, function (err, str) {
            if (err) { reject(err); return }
            resolve(str)
        })
    })
}
function getPercentage(number, total) {
    return Math.round((number / total) * 10000) / 100
}

app.get('/', async (req, res) => {
    res.send(await renderFile('index', {wolf: null}))
})
app.get('/:id', async (req, res) => {
    let id = req.params.id
    if (!wolves[id]) return res.send(await renderFile('index', {wolf: null}))
    let wolf = wolves[id]
    let attributesList = []
    for (let i = 0; i < attributeList.length; i++) {
        let attributeName = attributeList[i]
        let attribute = wolf[i]
        if (attribute !== 'None') attributesList.push(`${attributeName}: ${attribute} (${getPercentage(attributes.total[attributeName][attribute], 3333)}%)`)
    }
    let attributeText = attributesList.join('\n')
    res.send(await renderFile('index', {
        wolf: {
            id,
            description: `Wolf #${id}
Rarity: #${rarityRanking.total[id]} overall, #${rarityRanking[wolf[0].toLowerCase()].indexOf(id) + 1} for ${wolf[0].toLowerCase()}s

Traits:
${attributeText}`,
            image: `https://res.cloudinary.com/fact0ry/image/upload/c_fit,h_100,q_60,w_100/v1/zns/${ipfsData[id].image.split('//')[1]}`
        }
    }))
})
app.get('/api/wolves', async (req, res) => {
    res.json(rarity)
})
app.get('/api/ipfs', async (req, res) => {
    res.json(ipfsData)
})
app.get('/api/wolf/:id', async (req, res) => {
    const id = req.params.id
    if (!wolves[id]) return res.json({success: false, error: 'Wolf not found.'})
    let wolf = wolves[id]
    let data = {}
    data.rarityRanking = parseInt(rarityRanking.total[id])
    data.typeRarityRanking = rarityRanking[wolf[0].toLowerCase()].indexOf(id) + 1
    let attributesTotal = {}
    let attributesType = {}
    for (let i = 0; i < attributeList.length; i++) {
        let attributeName = attributeList[i]
        let property = wolf[i]
        attributesTotal[attributeName] = attributes.total[attributeName][property]
        attributesType[attributeName] = attributes[wolf[0].toLowerCase()][attributeName][property]
    }
    res.json({success: true, ranking: data, rarity: {
        overall: attributesTotal,
        type: attributesType
    }, attributes: wolf, attributeList})
})

app.listen(port, () => {
    console.log(`Wilder Beasts Wolf Rarity tool listening at port ${port}.`)
})