import React, { Component } from "react";
import Dropzone from "../dropzone/Dropzone";
import "./Upload.css";
import Progress from "../progress/Progress";
import { saveAs } from 'file-saver';

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false,
      savvyPath: '',
      startingFuel: '',
      jpiOffset: ''
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.updateSavvyPath = this.updateSavvyPath.bind(this);
    this.updateStartingFuel = this.updateStartingFuel.bind(this);
    this.updateJpiOffset = this.updateJpiOffset.bind(this);
  }

  onFilesAdded(files) {
    this.setState(prevState => ({
      files: prevState.files.concat(files)
    }));
  }
  
  updateSavvyPath(event){
	  this.setState({savvyPath : event.target.value})
  }  
  updateStartingFuel(event){
	  this.setState({startingFuel : event.target.value})
  }  
  updateJpiOffset(event){
	  this.setState({jpiOffset : event.target.value})
  }  
  async uploadFiles() {
    this.setState({ uploadProgress: {}, uploading: true });
    const promises = [];
    this.state.files.forEach(file => {
      promises.push(this.sendRequest(file));
    });
    try {
      await Promise.all(promises);

      this.setState({ successfullUploaded: true, uploading: false });
    } catch (e) {
      // Not Production ready! Do some error handling here instead...
      this.setState({ successfullUploaded: true, uploading: false });
    }
  }

  sendRequest(file) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.upload.addEventListener("progress", event => {
        if (event.lengthComputable) {
          const copy = { ...this.state.uploadProgress };
          copy[file.name] = {
            state: "pending",
            percentage: (event.loaded / event.total) * 100
          };
          this.setState({ uploadProgress: copy });
        }
      });

      req.upload.addEventListener("load", event => {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = { state: "done", percentage: 100 };
        this.setState({ uploadProgress: copy });
        resolve(req.response);
      });

      req.upload.addEventListener("error", event => {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = { state: "error", percentage: 0 };
        this.setState({ uploadProgress: copy });
        reject(req.response);
      });

      req.onreadystatechange = function() {
  		if(req.readyState === 4) { // done
  			if(req.status === 200) { // complete	
  				var FileSaver = require('file-saver');
  				var blob = new Blob([req.response], {type: "text/csv;charset=utf-8"});
  				var ds = (new Date()).toISOString().slice(0,10).replace(/[^0-9]/g, "");
  				var dt = (new Date()).toISOString().slice(11,17).replace(/[^0-9]/g, "");
  				FileSaver.saveAs(blob, "txi-"+ds+"-"+dt+".csv");
  			}
  		}
  		};
      
      const formData = new FormData();
      formData.append("file", file, file.name);
      
      console.log('Your input value is: ' + this.state.savvyPath)

      var savvyKey = this.state.savvyPath.replace("https://apps.savvyaviation.com/flights/", "");
	    
      savvyKey = this.state.savvyPath.replace("https://apps.savvyaviation.com/beta/shared/flight/", "");
      req.open("POST", "https://garmin-conversion-service-5fjvdhip2a-uc.a.run.app/combine?startingFuel="+this.state.startingFuel+"&savvyFlight="+savvyKey+"&jpiSecondsOffset="+this.state.jpiOffset);
      req.setRequestHeader('Content-Disposition', 'attachment; filename="filename.csv" filename*="filename.csv"')
      req.send(formData);
    });
  }

  renderProgress(file) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
          <img
            className="CheckIcon"
            alt="done"
            src="baseline-check_circle_outline-24px.svg"
            style={{
              opacity:
                uploadProgress && uploadProgress.state === "done" ? 0.5 : 0
            }}
          />
        </div>
      );
    }
  }

  renderActions() {
    if (this.state.successfullUploaded) {
      return (
        <button
          onClick={() =>
            this.setState({ files: [], successfullUploaded: false })
          }
        >
          Clear
        </button>
      );
    } else {
      return (
        <button
          disabled={this.state.files.length < 0 || this.state.uploading}
          onClick={this.uploadFiles}
        >
          Upload
        </button>
      );
    }
  }

  render() {
    return (
	<div className="App">
     <div className="Card">
      <div className="Upload">
        <span className="Title">Upload Files</span>
        
        
        <div className="Content">  
        	<form>
        	<p><label>
        		Savvy Flight Link:
        		<input type="text" name="savvy"  width="500" onChange={this.updateSavvyPath} />
        	</label></p>
        	
        	<p><label>
        		Starting Fuel:
  			    <input type="number" min="0" max="200"  name="fuel" onChange={this.updateStartingFuel} />
  			</label></p>
        	<p><label>
    		JPI Time Correction (seconds):
			    <input type="number" min="-600" max="600" name="jpiOffset" onChange={this.updateJpiOffset} />
			</label></p>
        	</form>
        </div>
        
        
        <div className="Content">
          <div>
            <Dropzone
              onFilesAdded={this.onFilesAdded}
              disabled={this.state.uploading || this.state.successfullUploaded}
            /> 
            
          </div>
          <div className="Files">
            {this.state.files.map(file => {
              return (
                <div key={file.name} className="Row">
                  <span className="Filename">{file.name}</span>
                  {this.renderProgress(file)}
                </div>
              );
            })}
          </div>
        </div>
        <div className="Actions">{this.renderActions()}</div>
      </div>
      </div>
      </div>
    );
  }
}

export default Upload;
