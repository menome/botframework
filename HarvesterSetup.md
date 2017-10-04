# Harvester Template Setup

Here's a document (possibly out of date) detailing the process of developing new harvesters under our bot framework. This was written before the botFramework, but a lot of it should still be applicable.

### Base Setup
* Install Node JS on the dev machine

* Install GIT on the local machine 
* Install GIT desktop on local machine 

* Add member to gitrepo

* Clone github repo from baseHarvester Template
* Install Visual Studio Code or equivalent editor
* Download POSTMAN - which is useful/needed for sending requests to test and trigger the harvester

# Harvesters
A harvester is a self-contained program designed to harvest data from a source. The source can be REST, JSON, SQL, text file or any structured data source. 

The program creates a sync job that waits for a post request and runs the sync job. 



# Harvester Programming

## /app
### app.js
Main entry point of the application. We are using a web server module called Express. Defines handlers for GET and POST operations supported by the harvester. 

Standard endpoints are: 
SYNC -> Post endpoint that triggers primary sync
SQLSYNC -> Endpoint for syncing to SQL databases 

### config.js
Config handles default config specified in a file and config in environment variables and merges them into an array.

This is required for parameters - eg. username, password, appID, URL etc. 

### harvester.js
The explicit actual mapping part of the application. This is where the main mapping occurs. 

### models.js
Models is the explicit mapping from the source into the standard LINK message pattern.
Harvester metata describes the operations and other aspects associated with the endpoint.

**postTransform(item)**, returns an object. 
This is called for each item that is posted:

### User Transform:

    module.exports.userTransform = (itm) => {
    return { 
    	"Name": itm.name,        // Name of the item
	    "NodeType":"User",       // type of node in the graph 
	    "Priority": 1,           // does this property override others
	    "ConformedDimensions": { // properties to use as primary key
	      "Id": itm.id	          
    },
    "Properties": {			   // mapping array of destination: from source
      "Username":itm.username,
      "Phone":itm.phone,
      "Website":itm.website,
      "Company":itm.company.name,
          },}}

### postTranform:

    module.exports.postTransform = (itm) => {
    return {
    "Name": itm.title,
    "NodeType":"Post",
    "Priority": 1,
    "ConformedDimensions": {
      "Id": itm.id
    },
    "Properties": {
      "Body": itm.body
    },
    "Connections": [
      {
        "NodeType": "User",
        "RelType": "PostedByUser",
        "ForwardRel": true,
        "ConformedDimensions": {
          "Id": itm.userId
        }
      }
    ]}}   

### commentTransform:


    module.exports.commentTransform = (itm) => {
    return {
    "Name": itm.name,
    "NodeType":"Comment",
    "Priority": 1,
    "ConformedDimensions": {
      "Id": itm.id
    },
    "Properties": {
      "Body": itm.body,
      "Email": itm.email
    },
    "Connections": [
      {
        "NodeType": "Post",
        "RelType": "CommentOnPost",
        "ForwardRel": true,
        "ConformedDimensions": {
          "Id": itm.postId
        }
      }
    ]}}

### albumTranform
    module.exports.albumTransform = (itm) => {
    return {
    "Name": itm.title,
    "NodeType":"Album",
    "Priority": 1,
    "ConformedDimensions": {
      "Id": itm.id
    },
    "Connections": [
      {
        "NodeType": "User",
        "RelType": "AlbumByUser",
        "ForwardRel": true,
        "ConformedDimensions": {
          "Id": itm.userId
        }
      }
    ]}}

### photoTransform

    module.exports.photoTransform = (itm) => {
    return {
    "Name": itm.title,
    "NodeType":"Photo",
    "Priority": 1,
    "ConformedDimensions": {
      "Id": itm.id
    },
    "Properties": {
      "Url": itm.url,
      "ThumbnailUrl": itm.thumbnailUrl
    },
    "Connections": [
      {
        "NodeType": "Album",
        "RelType": "PhotoInAlbum",
        "ForwardRel": true,
        "ConformedDimensions": {
          "Id": itm.albumId
        }
      }
    ]}}

### todoTransform
    module.exports.todoTransform = (itm) => {
    return {
    "Name": itm.title,
    "NodeType": "Todo",
    "Priority": 1,
    "ConformedDimensions": {
      "Id": itm.id
    },
    "Properties": {
      "Completed": itm.completed,
    },
    "Connections": [
      {
        "NodeType": "User",
        "RelType": "TodoByUser",
        "ForwardRel": true,
        "ConformedDimensions": {
          "Id": itm.userId
        }
      }
    ]}}


## app/Harvester
Libraries and supporting code

### helpers.js
Helpers is where helper or supporting functions are placed. 
 
### logger.js
Wrapper for logging errors, output, job state etc. 

### rabbit.js
RabbitMQ message bus logic for connecting to the message bus, and publishing messages on it. 

RabbitConnect, connects up and manages the state of the connection. 

## /config
### conf.json
Configuration for the harvester including data connections

## /test
### Placeholder.js
Location to put tests associated with the 

### gitignore
Which files to ignore inside the project directory

### Dockerfile
Docker definition of the harvester container

### package.json
nodeJS packages required to support the harvester


# Development:

## Baseline Startup/Test Blank Harvester
In order to verify that the harvester is functioning: 

* Open a powershell or terminal window and run NPM install, which will then install the dependancies associated with the harvester.
* Edit the conf.json file, and update the RabbitMQ address to match the address of the master RabbitMQ instance. 
* Exectuing the npm start command will start the harvester: this should start the harvester and connect to the RabbitMQ queue. This will put the harvester into a waiting for POST state. 
* make a POST using POSTMAN to http://localhost:3000 which is the default port that the harvester starts up on unless overridden by config. 
* By default, making a post request will call out to jsonplaceholder as a test

## Developing a REST harvester:
For a REST harvester, first order of business is to remove the SQL processing code. 

### Setup API tokens and login information:
The information regarding the endpoint, tokens and login must go into the **/app/config.js**  file

Environment variables can be used to override the variables in the config as well. 




