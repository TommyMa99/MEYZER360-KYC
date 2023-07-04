const cors = require('cors');
const express = require('express')
const faceLivenessRouter = require('./routers/faceLiveness')
const faceExtractionRouter = require('./routers/faceExtraction')
const textExtractionRouter = require('./routers/textExtraction');
const bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json({ limit: '50mb'}))

app.use(faceLivenessRouter)
app.use(faceExtractionRouter)
app.use(textExtractionRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})