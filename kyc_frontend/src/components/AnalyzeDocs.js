import React,{ useState, useEffect } from "react";
import Webcam from "react-webcam";
import Button from 'react-bootstrap/Button'
import Card from "react-bootstrap/Card"
import ProgressBar from "react-bootstrap/ProgressBar"
import _ from 'lodash'
import Jimp from 'jimp'
import { Auth, Logger } from 'aws-amplify'
import AWS from 'aws-sdk'
import axios from "axios";

const logger = new Logger('kyc-analyze','INFO');
const faceExtractURL = "http://localhost:3001/faceExtract/extractFace/";
const textExtractURL = "http://localhost:3001/textExtract/extractText/"
const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};

const side_data = [
    {"name":"front", "description":"Show the photo page of your photo id to the camera"},
    {"name":"back", "description":"Show the back of the Photo ID to the camera"}
]  

export default ({setTabStatus, documentDetails, setDocumentDetails }) => {
    const [side, setSide] = useState(null);
    const [showSpinner,setShowSpinner] = useState(false);
    const [alertMessage, setAlertMessage] = useState("You will be asked to display the front and back of photo IDs.  ");
    const [showProgress, setShowProgress] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const [progressValue, setProgressValue] = useState(0);

    // identification state from document
    const [gender, setGender] = useState("");
    const [dob, setDob] = useState("");
    const [userName, setUserName] = useState("");
    const [allLines, setAllLines] = useState("");
    const [documentImage, setDocumentImage] = useState("");
    const [documentType, setDocumentType] = useState("");

    useEffect(() => {
      if(side !== null)  {
        const description = getSideDescription(side)  
        setAlertMessage(description + ". Click button to continue =>  ")
      }
  
    },[side])

    const getSideDescription = (side) => {
        return _.find(side_data, function(gest){
            return gest.name === side;
        }).description
    }
    
    const proceedToNext = () => {
        setDocumentDetails({
            allLines: allLines,
            documentType:documentType,
            name:userName,
            dateOfBirth:dob,
            gender:gender,
            userImage:documentImage
        })
        console.log(documentDetails);
      setTabStatus("AnalysisDetails");
    }

    const updateDocumentType = (detectedText) => {
        let docType = "Unknown"
        if(_.includes(_.lowerCase(detectedText),'republic')){
            docType = "Passport"
        } else if(_.includes(_.lowerCase(detectedText),'election')) {
            docType = "Voter Id"
        } else if (_.includes(_.lowerCase(detectedText),'driver license')) {
            docType = "Driver License"
        } else {
            docType = "Government ID"
        }

        setDocumentType(docType);
    }

    const updateNames = (detectedText) => {
        let name = "Unknown"
        const regexPattern = /DOB\s+(\d{2}\/\d{2}\/\d{4})/;
        const match = detectedText.match(regexPattern);
        if (match) {
        const dob = match[1];
        console.log('DOB:', dob);
        } else {
        console.log('No match found.');
        }
    }

    const captureFaceDetails = async (imageBuffer) => {
        logger.info("Calling rekognition face Detect")
        const requestData = {
            img: imageBuffer,
        };
        let faceDetectResponse = await axios.post(faceExtractURL, requestData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(false) {
            setShowSpinner(false);
            setAlertMessage(faceDetectResponse.$response.error.message)
            return new Promise((resolve, reject) => {
                throw new Error(faceDetectResponse.$response.error.message);
            }) 
        }
        else {
            logger.info('rekgn ', faceDetectResponse)
            
            if(faceDetectResponse.data.FaceDetails.length === 0){
                // more than one face
                return new Promise((resolve, reject) => {
                    throw new Error("Could not recognize a face. Try again ");
                }) 
            }

            setGender(faceDetectResponse.data.FaceDetails[0].Gender.Value)
            setAlertMessage("Captured image details")

            // get the bounding box
            let imageBounds = faceDetectResponse.data.FaceDetails[0].BoundingBox
            logger.info("The bounding box is: "+ imageBounds)
            // crop the face and store the image
            const base64Image2 = imageBuffer.split(';base64,').pop();  
            const binaryImg = new Buffer(base64Image2, 'base64'); 
            Jimp.read(binaryImg, (err, image) => {
                if (err) throw err;
                else {
                  
                  image.crop(image.bitmap.width*imageBounds.Left - 15, image.bitmap.height*imageBounds.Top - 15, image.bitmap.width*imageBounds.Width + 30, image.bitmap.height*imageBounds.Height + 30)
                    .quality(100)
                    .getBase64(Jimp.MIME_JPEG, function (err, base64Image) {
                        setDocumentImage(base64Image)
                    })
                }
              })
        }
        return faceDetectResponse.data
    } 

    const filterTextBYDocumentType = (textMap, docType) => {
        let filteredMap = _.filter(textMap, function(word){
            logger.info("WORD", word)
            return true
        })
        return _.join(filteredMap, ' ')
    }

    const captureTextDetails = async (image) => {
        const requestData = {
            img: image,
        };
        let textDetectResponse = await axios.post(textExtractURL, requestData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(textDetectResponse)
        var allText 
        if(false) {
            setShowSpinner(false);
            setAlertMessage(textDetectResponse.$response.error.message)
            return new Promise((resolve, reject) => {
                throw new Error(textDetectResponse.$response.error.message);
            }) 
        }
        else {
            logger.info("Detected text",textDetectResponse.TextDetections)
            let detectedWords = _.filter(textDetectResponse.TextDetections, function(item){
                return item.Type === 'WORD' && item.Confidence > 80
            })
            let detectedLines = _.filter(textDetectResponse.TextDetections, function(item){
                return item.Type === 'LINE' && item.Confidence > 80
            })    
            logger.info("Words ", detectedWords)
            let detectedTextMap = _.map(detectedWords,(item) => item.DetectedText)
            logger.info("Calling filter documentType is ", documentType)
            allText = filterTextBYDocumentType(detectedTextMap, documentType)
            logger.info('All text', allText)
            updateDocumentType(allText);
            updateNames(allText);
            setAllLines(allText)
        }


        // let comprehend = new AWS.Comprehend();    
        // let comprehendParams = {
        //     Text: allText,
        //     LanguageCode: 'en' 
        // };
        
        // let detectEntitiesResponse = await comprehend.detectEntities(comprehendParams).promise();
        // if(detectEntitiesResponse.$response.error) {
        //     setShowSpinner(false);
        //     setAlertMessage(detectEntitiesResponse.$response.error.message)
        // }
        // else {
        //     logger.info('comprehend out', detectEntitiesResponse)
        //     let sortedEntities = _.reverse(_.sortBy(detectEntitiesResponse.Entities,(entity) => {return entity.Score}))
        //     logger.info('sorted entities', sortedEntities)
        //     let filteredEntities = _.filter(sortedEntities,(entity) => entity.Score > 0.6)
            
        //     let personEntity = _.find(filteredEntities,(entity) => entity.Type === 'PERSON')
        //     if(!personEntity){
        //         setAlertMessage("Unable to recognize name")
        //         setUserName("N/A")
        //     } else {
                
        //         setUserName(personEntity.Text)
        //     }
            
        //     let dobEntity = _.find(filteredEntities,(entity) => entity.Type === 'DATE')
        //     if(!dobEntity){
        //         setAlertMessage("Unable to recognize date of birth")
        //         setDob("N/A")
        //     } else {
        //         setDob(dobEntity.Text)
        //     }
            
        //     setAlertMessage("Captured Document details")
        // }

        // return detectEntitiesResponse
    }


    const requestSide = async () => {
      
        setShowSpinner(true);
        const imageBase64String = webcamRef.current.getScreenshot({width: 800, height: 450}); 
        const base64Image = imageBase64String.split(';base64,').pop();  
        const binaryImg = new Buffer(base64Image, 'base64');    

        try {

            await captureTextDetails(imageBase64String)
            setProgressValue(80)
            await captureFaceDetails(imageBase64String)

            setProgressValue(100)    
            setShowSpinner(false)
            setShowWebcam(false);
            setAlertMessage("Document processed successfully.  ")
            
            
        } catch(error){
            logger.error(error.message)
            setAlertMessage("Error processing document. Try Again.. ")
            setProgressValue(5)
            setShowSpinner(false)
        }
    }

    function start_test(evt){
      setProgressValue(5)  
      setShowProgress(true);
      setShowWebcam(true);
      setSide("front")
    }

    const webcamRef = React.useRef(null);
   
   
    return (
      <>
        <Card>
            <Card.Header>
                {alertMessage} 
                {!showProgress && <Button variant="primary" onClick={start_test}>Start</Button>}
                {progressValue === 5 && <Button variant="primary" onClick={requestSide}>Validate</Button>}
                {progressValue === 100 && <Button variant="primary" onClick={proceedToNext}>Continue</Button>}
            </Card.Header>
            
            <Card.Body>
                {showSpinner && <div className="spinner" ></div>}
                {showWebcam && <div className="video-padding">
                        <Webcam
                            audio={false}
                            height={450}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            width={800}
                            videoConst
                            raints={videoConstraints}
                        />
                        
                    </div>
                }
                
                {progressValue !== 0 && showProgress &&  <div className="live-progressbar"><ProgressBar key={progressValue} now={progressValue} label={`${progressValue}%`} /></div> }

            </Card.Body>
        </Card>
      </>
    );
  };