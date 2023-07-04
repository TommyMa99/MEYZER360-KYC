import React from 'react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import { Loader, ThemeProvider } from '@aws-amplify/ui-react';
import { useState, useEffect } from "react";
import axios from "axios";

export default ({setTabStatus, setLiveTestDetails}) => {
  const [loading, setLoading] = useState(true);
  const [createLivenessApiData, setCreateLivenessApiData] = useState("");
  const geturl = 'http://localhost:3001/faceliveness/getResult';
  const createurl = 'http://localhost:3001/faceliveness/createSession'
  
  // Exported states from liveness test
  const [liveImage, setLiveImage] = useState(null);
  const [livenessScore, setLivenessScore] = useState(0);


  useEffect(() => {
    const fetchCreateLiveness = async () => {
          let reqInstance = axios.create({
          })
          try {
            const response = await reqInstance.get(createurl);
            setCreateLivenessApiData(response.data.SessionId);
          } catch (error) {
            console.error('Error:', error);
          }

        setLoading(false);
    };

    fetchCreateLiveness();
  }, []);

  const proceedToNext = () => {
    setLiveTestDetails({
       liveImage:liveImage,
       livenessScore:livenessScore
    })  
    setTabStatus("UploadDocs");
  }

  const handleAnalysisComplete = async () => {
    console.log('Here')
    console.log(createLivenessApiData)
    try {
      const response = await axios.get(geturl+'/'+createLivenessApiData);
      console.log(response); // Process the response data here
      setLivenessScore(response.data.Confidence);
      setLiveImage(response.data.ReferenceImage.Bytes);
      proceedToNext();
    } catch (error) {
        console.error('Error:', error);
    }
};

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <FaceLivenessDetector
          sessionId={createLivenessApiData}
          region="us-west-2"
          onAnalysisComplete={handleAnalysisComplete}
          onError={(error) => {
            console.error(error);
          }}
        />
      )}
    </ThemeProvider>
  );
}