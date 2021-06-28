// write data to json.
const fs = require('fs');
const path = require('path');
// import express.
const express = require('express');
// import json file.
const { animals } = require('./data/animals.json');
const PORT = process.env.PORT || 3001;
const app = express();

// parse incoming string/array data
app.use(express.urlencoded({ extended: true }));

// parse incoming JSON data
app.use(express.json());

//takes in req.query as an argument and filters through animals, returning new filtered array.
function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        if (typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        }
        else {
            personalityTraitsArray = query.personalityTraits;
        }
        personalityTraitsArray.foreach(trait => {
           filteredResults = filteredResults.filter(animal => animal.personalityTraits.indexOf(trait) !== -1);
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

// take in id & array of animals & returns single animal object.
function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
}

// accepts POST route's req.body value & array to add data to.
// adds new animal to catalog/json file.
function createNewAnimal(body, animalsArray) {
    const animal = body;
    animalsArray.push(animal);
    fs.writeFileSync(
        path.join(__dirname, './data/animals.json'),
        // converts javascript array data to json.
        // null = don't edit any existing data, 2 = create white space between values.
        JSON.stringify({ animals: animalsArray }, null, 2)
    );
    // return finished code to POST route for res.
    return animal;
}

// validate data
function validateAnimal(animal) {
    if (!animal.name || typeof animal.name !== 'string') {
        return false;
    }
    if (!animal.species || typeof animal.species !== 'string') {
        return false;
    }
    if (!animal.diet || typeof animal.diet !== 'string') {
        return false;
    }
    if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
        return false;
    }
    return true;
}

// get() requires 2 arguments: string that describes the route the client will fetch from
// and a callback function that executes every time the route is accessed with GET request.
app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});
// param route must come after other GET route.
// send 404 error if req resource can't be found.
app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
    res.json(result);
    } else {
        res.send(404);
    }
});
// route that listens for POST requests.
app.post('/api/animals', (req, res) => {
    // set id based on next index of array.
    req.body.id = animals.length.toString();

    // if any data in req.body is incorrect, send back 400 error.
    if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
    } else {
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
    }
});

app.listen(PORT, () => {
    console.log(`api server on port ${PORT}`);
});