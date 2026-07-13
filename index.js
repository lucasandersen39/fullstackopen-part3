const express = require('express')
const morgan = require('morgan')

const app = express()

morgan.token('body', function getBody(req) {
    if (req.body)
        return JSON.stringify(req.body)
    else
        return ""
})

app.use(express.json())
app.use(morgan(':method :url :status :pid :response-time ms :body'))

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

app.get('/api/persons/:id', (request, response) => {
    const id = parseInt(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person)
        response.json(person)
    else
        response.status(404).end()
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = parseInt(request.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        const indice = persons.findIndex(p => p.id === id)
        persons.splice(indice, 1)
        response.status(200).end()
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const person = request.body
    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'name and number are required'
        })
    }
    const existNumber = persons.find(p => p.number === person.number)
    if (existNumber) {
        return response.status(400).json({
            error: "The number already exist"
        })
    }
    const newPerson = {
        id: generateID(),
        name: person.name,
        number: person.number
    }
    persons.push(newPerson)
    response.status(200).json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})