import React, { useState } from 'react'

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'

import AnalyzeDocs from './AnalyzeDocs'
import Summary from './Summary'
import LivenessTest from './LivenessTest'

export default () => {

  const [currentTabKey, setCurrentTabKey] = useState("welcome");

  const [liveTestDetails, setLiveTestDetails] = useState({});
  const [documentDetails, setDocumentDetails] = useState({});

  const startKyc = () => {
    setCurrentTabKey("Liveliness");

  }

  const onSelectTab = (eventkey) => {
    console.log("printing event key ",eventkey);
    setCurrentTabKey(eventkey);
  }

  const setTabStatus = (value) => {
    console.log("current tab value ", value);
    setCurrentTabKey(value);
  }
  
  
  return (
   <div>
  <Container>
  <Row>
    <Col>
    <Navbar id = "nav" bg="dark" variant="dark">
    <Navbar.Brand href="#"><h2 className="app-title">Meyzer360 KYC</h2></Navbar.Brand>
    </Navbar>
    </Col>
  </Row>
  <Row><Col><br></br></Col></Row>
  <Row>
    <Col>
    <Tabs defaultActiveKey={currentTabKey} activeKey = {currentTabKey} id="uncontrolled-tab-example" onSelect={onSelectTab}>
        <Tab eventKey="welcome" title="Welcome">
                <h2 className="tab-element-align">Welcome to Video KYC</h2>
                <div className="tab-element-align">
                    <p>Introduction to KYC Steps and Instructions </p>
                    <ul>
                        <li>Liveliness Detection - The user will run through AWS Rekognition powered liveness detection</li>
                        <li>Upload Documents - upload valid ID documents to use for verification.</li>
                        <li>Validation and summary</li>
                    </ul>
                </div>
                <p className="tab-button-align">
                    <Button variant="primary" onClick = {startKyc}>Start</Button>
                </p>
        </Tab>
        <Tab eventKey="Liveliness" title="Liveliness Test" disabled>
            <div>
                <LivenessTest setTabStatus={setTabStatus} setLiveTestDetails={setLiveTestDetails} />
            </div>
        </Tab>
        <Tab eventKey="UploadDocs" title="Upload Documents" disabled>
            <div>
              <AnalyzeDocs setTabStatus={setTabStatus} setDocumentDetails={setDocumentDetails} />
            </div>
        </Tab>
        {/* <Tab eventKey="AnalysisDetails" title="Details of Analysis" disabled>
        <Summary setTabStatus={setTabStatus} documentDetails={documentDetails} liveTestDetails={liveTestDetails} />
        </Tab> */}
        </Tabs>
    </Col>
  </Row>
  </Container>
  </div>
  )
}