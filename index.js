const express = require('express')
const ejs = require('ejs')
const { port } = require('./config.json')

const {attributes, attributeList, wolves, rarityRanking} = require('./rarity.json')

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

app.get('/', async (req, res) => {
    res.send(await renderFile('index'))
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