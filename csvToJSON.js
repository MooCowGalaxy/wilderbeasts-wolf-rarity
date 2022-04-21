const csv = require('csv')
const fs = require('fs')

const attributesTotal = {}
const attributesOrganic = {}
const attributesHybrid = {}
const attributesMech = {}
let attributeList = []
const wolves = {}
const rarityRankingTotal = {}
const rarityListOrganic = []
const rarityListHybrid = []
const rarityListMech = []

const parser = csv.parse(function (err, data) {
    for (let i = 0; i < data.length; i++) {
        const row = data[i]
        if (i === 0) {
            for (let i = 2; i < row.length; i++) {
                const value = row[i]
                attributesTotal[value] = {}
                attributesOrganic[value] = {}
                attributesHybrid[value] = {}
                attributesMech[value] = {}
            }
            attributeList = row.slice(2)
        } else {
            for (let i = 0; i < row.length - 2; i++) {
                const value = row[i + 2]
                if (!attributesTotal[attributeList[i]]) attributesTotal[attributeList[i]] = {}
                if (!attributesTotal[attributeList[i]][value]) attributesTotal[attributeList[i]][value] = 0
                attributesTotal[attributeList[i]][value]++
                switch (row[2]) {
                    case "Organic":
                        if (!attributesOrganic[attributeList[i]]) attributesOrganic[attributeList[i]] = {}
                        if (!attributesOrganic[attributeList[i]][value]) attributesOrganic[attributeList[i]][value] = 0
                        attributesOrganic[attributeList[i]][value]++
                        break
                    case "Hybrid":
                        if (!attributesHybrid[attributeList[i]]) attributesHybrid[attributeList[i]] = {}
                        if (!attributesHybrid[attributeList[i]][value]) attributesHybrid[attributeList[i]][value] = 0
                        attributesHybrid[attributeList[i]][value]++
                        break
                    case "Mech":
                        if (!attributesMech[attributeList[i]]) attributesMech[attributeList[i]] = {}
                        if (!attributesMech[attributeList[i]][value]) attributesMech[attributeList[i]][value] = 0
                        attributesMech[attributeList[i]][value]++
                        break
                }
            }
            let wolfNumber = row[1].slice(6)
            wolves[wolfNumber] = row.slice(2)
            rarityRankingTotal[wolfNumber] = row[0]
        }
    }
    const wolfRarities = Object.entries(rarityRankingTotal).sort(function (a, b) {
        return parseInt(a[1]) - parseInt(b[1])
    })
    for (let wolfRarity of wolfRarities) {
        let wolfNumber = wolfRarity[0]
        let rarityRank = wolfRarity[1]
        let wolf = wolves[wolfNumber]
        switch (wolf[0]) {
            case "Organic":
                rarityListOrganic.push(wolfNumber)
                break
            case "Hybrid":
                rarityListHybrid.push(wolfNumber)
                break
            case "Mech":
                rarityListMech.push(wolfNumber)
                break
        }
    }
    fs.writeFileSync('rarity.json', JSON.stringify({
        wolves,
        attributes: {
            total: attributesTotal,
            organic: attributesOrganic,
            hybrid: attributesHybrid,
            mech: attributesMech
        },
        attributeList,
        rarityRanking: {
            total: rarityRankingTotal,
            organic: rarityListOrganic,
            hybrid: rarityListHybrid,
            mech: rarityListMech
        }
    }, null, 2))
})
fs.createReadStream('./rarity.csv').pipe(parser)
