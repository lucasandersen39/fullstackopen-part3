require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('body', function getBody(req) {
    if (req.body)
        return JSON.stringify(req.body)
    else
        return ""
})

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :pid :response-time ms :body'))
app.use(express.static('dist'))

const persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const generateID = () => {
    return Math.floor(Math.random() * 9999999) + 1;

}

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date().toString()}</p>`)
})

//Modified
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(response => {
            if (response)
                response.status(200).json(response)
            else
                response.status(404).end()
        })
        .catch(error => next(error))  //Pasamos el error hacia adelante

})

//Modified
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
        .catch(error => next(error))
})

// Modified
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            console.log("Result delete: ", result)
            response.status(204).end()
        })
        .catch(error => next(error))
})

// Modified
app.post('/api/persons', async (request, response, next) => {
    const personReq = request.body
    if (!personReq.name || !personReq.number) {
        return response.status(400).json({
            error: 'name and number are required'
        })
    }
    const existNumber = await Person.findOne({ "number": personReq.number })
    if (existNumber) {
        return response.status(400).json({
            error: "The number already exist"
        })
    }

    const newPerson = new Person({
        name: personReq.name,
        number: personReq.number
    })

    newPerson.save().then(result => {
        console.log(`added ${newPerson.name} number ${newPerson.number} to phonebook`)
        response.status(200).json(newPerson)
    }).catch(error => next(error))
})

// Modified
app.put('/api/persons/:id', (request, response, next) => {
    const personUpdate = {
        name: request.body.name,
        number: request.body.number
    }
    Person.findByIdAndUpdate(request.params.id, personUpdate, { new: true })
        .then(updatedPerson => {
            response.status(200).json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error("ERROR NAME:", error.name, " ERROR MESSAGE: ", error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
// Cargamos el middleware de manejador de errores al final
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})