# Testing Turtle RDF to JSON-LD transformation

This project is made to convert an RDF graph serialized as Turtle into its semantic equivalent as compact JSON-LD.

The data used for the transformation are in the /testdata folder:
* each test case has a name: "sample" followed by a number/code, e.g. sample069x
* .ttl files: the Turtle serialization
* ...=nquads.txt: the Nquads serialization
* .json: the expanded JSON-LD serialization
* ...=compact.json: the compact JSON-LD serialization, including a @context

