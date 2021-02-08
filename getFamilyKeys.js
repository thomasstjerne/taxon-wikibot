
const request = require("request-promise")
const fs = require("fs").promises;


const getFamilies = async () => {
    let data = [];
    let offset = 0;
    let endOfRecords = false;
    while(!endOfRecords){
        const response = await request({
            url: `https://api.gbif.org/v1/species/search?dataset_key=4cec8fef-f129-4966-89b7-4f8439aba058&limit=1000&offset=${offset}&origin=SOURCE&rank=FAMILY`,     
           // url: `https://api.gbif.org/v1/species?datasetKey=${DATASET_KEY}&limit=${pageSize}&offset=${page * pageSize}`,
            json: true
        })

        data = [...data, ...response.results.map(o => o.key)];
        endOfRecords = response.endOfRecords;
        offset += 1000;
    }
    console.log(`Found ${data.length} familyKeys`)
    return fs
      .writeFile(
        `${__dirname}/familyKeys.json`,
        JSON.stringify(data, null, 2)
      )
      .then(() => console.log("Done."));

}

getFamilies()