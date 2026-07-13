const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

// const url = `mongodb+srv://LucasAndersen:${password}@cluster0.joc1dvu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const url = `mongodb://LucasAndersen:${password}@ac-ctag1iw-shard-00-00.joc1dvu.mongodb.net:27017,ac-ctag1iw-shard-00-01.joc1dvu.mongodb.net:27017,ac-ctag1iw-shard-00-02.joc1dvu.mongodb.net:27017/?ssl=true&replicaSet=atlas-9y93f7-shard-0&authSource=admin&appName=Cluster0`
mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv[3] && process.argv[4]) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
} else {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}