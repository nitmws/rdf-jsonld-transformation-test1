"use strict"
let fs = require("fs")
let jsonfile = require('jsonfile')
let jsonld = require('jsonld')
let N3 = require("n3")

function transformTurtleToJsonld(samplename) {
    if (samplename === undefined) {
        return
    }

    let turtledata
    try {
        turtledata = fs.readFileSync('./testdata/' + samplename + '.ttl', 'utf8');
    } catch(e) {
        console.log('Error:', e.stack);
    }
    console.log(turtledata);
    let n3parser = N3.Parser()
    let nquads = n3parser.parse(turtledata)
    let n3writer = N3.Writer({ format: 'N-Triples' })
    n3writer.addTriples(nquads)
    n3writer.end (function (error, nquadsstr) {
        fs.writeFileSync('./testdata/' + samplename + '=nquads.txt', nquadsstr)
        jsonld.fromRDF(nquadsstr, {}, function(err, doc) {
            if (err) {
                console.log(err.message)
            }
            if (doc) {
                jsonfile.writeFileSync('./testdata/' + samplename + '.json', doc, {spaces: 2})
                // let context = "http://www.w3.org/ns/odrl.jsonld"
                let context = jsonfile.readFileSync('./ODRL22.jsonld') //
                jsonld.compact(doc, context, {skipExpansion : true},  function(err, compacted) {
                    // console.log(JSON.stringify(compacted, null, 2));
                    jsonfile.writeFileSync('./testdata/' + samplename + '=compact.json', compacted, {spaces: 2})
                });
            }
            else {
                console.log('Sample ' + samplename + ' not transformed, no jsonld output' )
            }
        })

    })

}

transformTurtleToJsonld('sample069x')
