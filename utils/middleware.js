const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, req, res, next) => {
    console.error(error)

    switch (error.name) {
        case 'CastError':
            return res.status(400).send({error: 'malformatted id'})
        case 'ValidationError':
            return res.status(400).json({error: error.message})
    }
    next(error)
}

module.exports = {
    unknownEndpoint, errorHandler
}
