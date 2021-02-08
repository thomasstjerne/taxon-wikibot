const config = require('./config.json');
const wbEdit = require('wikibase-edit')(config.prod)
const testData = require('./testdata.json');
const dataHigherTaxa = require('./dataHigherTaxa.json');
const dataForGeneraAndSpecies = require('./data.json');
const BOLD_Systems_taxon_ID =  "P3606";

createBoldID = async (wikiTaxonID, boldTaxonID) => {
      return wbEdit.claim.create({
            id: wikiTaxonID , // e.g. 'Q943629',
            property: BOLD_Systems_taxon_ID,
            value: boldTaxonID // e.g. 31797
          }) 
}


createIds = (data) => {
// Run them sequential for now. 

data.reduce( async (previousPromise, nextTaxon) => {
    try {
        await previousPromise;
        return createBoldID(nextTaxon.wikidataId, nextTaxon.taxonID);
    } catch(err){
        console.log("ERROR:")
        console.log(err)
        return createBoldID(nextTaxon.wikidataId, nextTaxon.taxonID);

    }
}, Promise.resolve());
}

createIds(testData);
