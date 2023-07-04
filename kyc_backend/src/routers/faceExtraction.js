const express = require('express')
const router = new express.Router()
const AWS = require('aws-sdk');
const Rekognition = require('aws-sdk/clients/rekognition');
const { SharedIniFileCredentials } = require('aws-sdk');

router.post('/faceExtract/extractFace/', async (req, res) => {
    const credentials = new SharedIniFileCredentials({ profile: 'amplify' });
    AWS.config.credentials = credentials;
    const rekognitionClient = new Rekognition({
        region: 'us-west-2',
        endpoint: 'https://rekognition.us-west-2.amazonaws.com',
    });
    try {
        const base64Image = req.body.img.split(';base64,').pop();  
        const binaryImg = new Buffer(base64Image, 'base64');
        const faceDetectParams = {
            Attributes: ["ALL"],
            Image: {
                Bytes: binaryImg
            }
        }
        const response = await rekognitionClient.detectFaces(faceDetectParams).promise();
        res.status(200).send(response);
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router