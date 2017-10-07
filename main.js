"use strict"
let fs = require("fs")
let jsonfile = require('jsonfile')
let jsonld = require('jsonld')
let N3 = require("n3")

function transformTurtleToJsonld(samplename) {
    if (samplename === undefined) {
        return
    }

    let turtleFilename = './testdata/' + samplename + '.ttl'
    if (!fs.existsSync(turtleFilename)){
        console.log("Turtle file not found: " + turtleFilename)
        return;
    }
    console.log('Turtle file will be transformed: ' + turtleFilename)

    let turtledata
    try {
        turtledata = fs.readFileSync(turtleFilename, 'utf8');
    } catch(e) {
        console.log('Error:', e.stack);
        return
    }
    // console.log(turtledata);
    let n3parser = N3.Parser()
    let nquads = n3parser.parse(turtledata)
    let n3writer = N3.Writer({ format: 'N-Triples' })
    n3writer.addTriples(nquads)
    n3writer.end (function (error, nquadsstr) {
        fs.writeFileSync('./testdata/' + samplename + '=nquads.txt', nquadsstr)
        jsonld.fromRDF(nquadsstr, {}, function(err, doc) {
            if (err) {
                console.log('Error raised by jsonld.fromRDF: ' + err.message)
            }
            if (doc) {
                jsonfile.writeFileSync('./testdata/' + samplename + '.json', doc, {spaces: 2})
                let context = jsonfile.readFileSync('./ODRL22.jsonld') //
                jsonld.compact(doc, context, {skipExpansion : true},  function(err, compacted) {
                    // console.log(JSON.stringify(compacted, null, 2));
                    compacted['@context'] = "http://www.w3.org/ns/odrl.jsonld" // use the link of the ODRL @context resource
                    jsonfile.writeFileSync('./testdata/' + samplename + '=compact.json', compacted, {spaces: 2})
                });
            }
            else {
                console.log('Sample ' + samplename + ' not transformed, no jsonld output' )
            }
        })
    })

}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function transformAllOdrlSamples() {
    for(let i = 1; i < 78; i++){
        switch(i){
            case 32:
            case 70:
            case 71:
            case 75:
            case 76:
            case 77:
                continue
                break
        }
        let sampleno = pad(i, 3)
        let samplename = 'sample' + sampleno
        transformTurtleToJsonld(samplename)
    }
}

transformTurtleToJsonld('sample015')

// transformAllOdrlSamples()


