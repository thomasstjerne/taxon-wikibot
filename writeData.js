const request = require("request-promise")
const fs = require("fs").promises;
const fs_ = require("fs");
const pageSize = 25;
const DATASET_KEY = "4cec8fef-f129-4966-89b7-4f8439aba058"; // BOLD BINS 
const familyKeys = require('./familyKeys.json') // GBIF APIs has a max offset of 100000 so we have to fetch by higherTaxonKey in smaller batches

// let data = [];

let taxonCount = 0;
const getPage = async (page, stream, familyKey) => {

     try{
         const response = await request({
        url: familyKey ? `https://api.gbif.org/v1/species/search?dataset_key=${DATASET_KEY}&limit=${pageSize}&offset=${page * pageSize}&higherTaxonKey=${familyKey}` : `https://api.gbif.org/v1/species/search?dataset_key=${DATASET_KEY}&limit=${pageSize}&offset=${page * pageSize}&origin=SOURCE&rank=FAMILY&rank=ORDER&rank=CLASS&rank=PHYLUM&status=ACCEPTED`,
        json: true
    })


    const responses = await Promise.allSettled(
    response.results.filter(tx => tx.nubKey && tx.taxonID && tx.taxonID.indexOf("http://bins.boldsystems.org/index.php/Taxbrowser_Taxonpage?taxid=") > -1)
    .map((tx) => request({
        url: `https://www.gbif.org/api/wikidata/species/${tx.nubKey}?locale=en`,
        json: true,
        headers: {
            'User-Agent': 'Taxonbot/0.1'
        }
    }).then(wk => ({nubKey: tx.nubKey, taxonID: tx.taxonID.split('?taxid=')[1], wikidataId: wk. wikidataId }))
    ))
   // data = [...data, ...responses.filter(r => r.status === "fulfilled").map(r => r.value)];
    const fulfilled = responses.filter(r => r.status === "fulfilled")
    taxonCount += fulfilled.length;
    console.log("Taxa fetched: " + taxonCount + " taxon count from API " + response.count)
    fulfilled.forEach(r => stream.write(JSON.stringify(r.value)+ ",\n"))
   // console.log(`got ${(page * pageSize) + pageSize} of ${response.count} records`)
    return response.endOfRecords;
} catch(err){
    console.log(err)
}
/* 
    const responses = await Promise.all(urls.map((url) => request({
        url: url,
        json: true,
        headers: {
            'User-Agent': req.header('User-Agent')
        }
    }))); */
}


getData = async () => {

    const stream = fs_.createWriteStream('data.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
      })
      stream.write("[\n")
    const errorLimit = 10;

   await  familyKeys.reduce( async (previousPromise, familyKey) => {
        try {
            await previousPromise;
            let endOfRecords = false;
            let page = 0;
            let errors = 0;
            while(!endOfRecords){
                console.log(`Fetching page ${page} for family ${familyKey}`)
                try {
                    endOfRecords = await getPage(page, stream, familyKey);
                    page ++;
        
                } catch (error){
                    console.log("Error:")
                    errors ++;
                    if(errors > errorLimit){
                        endOfRecords = true; 
                    }
        
                }
            }
            return
        } catch(err){
            console.log("ERROR:")
            console.log(err)
            return;
    
        }
    }, Promise.resolve());

   
    stream.write("]");
    stream.end()
}

getDataForHigherTaxa = async () => {
    const stream = fs_.createWriteStream('dataHigherTaxa.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
      })
      stream.write("[\n")
    const errorLimit = 10;

    let endOfRecords = false;
    let page = 0;
    let errors = 0;
    while(!endOfRecords){
        console.log(`Fetching page ${page} for highertaxa`)
        try {
            endOfRecords = await getPage(page, stream);
            page ++;

        } catch (error){
            console.log("Error:")
            errors ++;
            if(errors > errorLimit){
                endOfRecords = true; 
            }

        }
    }

   
    stream.write("]");
    stream.end()
}

getData()
getDataForHigherTaxa()
