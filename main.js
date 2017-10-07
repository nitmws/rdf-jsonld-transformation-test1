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
                    if (compacted['@graph'] !== undefined) {
                        let nested = nest(compacted)
                        jsonfile.writeFileSync('./testdata/' + samplename + '=compactnested.json', nested, {spaces: 2})
                    }
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

function nest(compactjson){
    let rootjson = {}
    // add root node
    for (let i = 0; i < compactjson['@graph'].length; i++){
        if (!compactjson['@graph'][i].uid.startsWith('_:')){
            rootjson = compactjson['@graph'][i]
            break
        }
    }
    rootjson['@context'] = compactjson['@context']
    let nestedjson = addBlanknode(rootjson, compactjson)
    return nestedjson
}

function addBlanknode(testnode, cjson){
    for (let prop in testnode) {
        let value = testnode[prop]
        if (typeof value === 'string') {
            if (value.startsWith('_:')) {
                if (prop !== 'uid') {
                    let bnode = getBlanknode(value, cjson)
                    let bnode1 = addBlanknode(bnode, cjson)
                    testnode[prop] = bnode1
                }
            }
        }
    }
    return testnode
}

function getBlanknode(blanknodeid, cjson){
    let bnode = undefined
    for (let i = 0; i < cjson['@graph'].length; i++){
        if (cjson['@graph'][i].uid === blanknodeid){
            bnode = cjson['@graph'][i]
            break
        }
    }
    return bnode
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

// transformTurtleToJsonld('sample022')

transformAllOdrlSamples()


