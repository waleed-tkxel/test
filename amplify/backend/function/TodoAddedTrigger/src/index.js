/* Amplify Params - DO NOT EDIT
	API_TODOAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_TODOAPI_GRAPHQLAPIIDOUTPUT
	API_TODOAPI_GRAPHQLAPIKEYOUTPUT
	ENV
  REGION
  BOOK_TABLE
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const axios = require('axios');
var qs = require('qs');

async function generateAccessToken(refresh_token){
  
  var data = qs.stringify({
    'grant_type': 'refresh_token',
    'client_id': '1df571bb8f102010e168f0b3add5689f',
    'client_secret': 'B|N.|w1cHv',
    'username': 'admin',
    'password': 'Zn6l0YvakSCN',
    'refresh_token': refresh_token
  });
  
  const url = 'https://dev64774.service-now.com/oauth_token.do';
  const config =  { 
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Cookie': 'glide_user_route=glide.ba709e0dee19e2cf4d8aa2c62494d42e; BIGipServerpool_dev64774=2558613258.46912.0000; glide_user_activity=U0N2MzpJVWxBSVBJTE1HOTFleG04bHN0cmtiVUp4TURYN21TdjoxQ25xQTZvVjJJL2thZEVxdjdULzJvUk1oVlAwYWxzQTVPNVRzRC8wS2x3PQ==; JSESSIONID=3B66B901F7B6A70C2D106899424A0B89'
    }
  };

  try {
    const resp = await axios.post(url, data, config);
    console.log(JSON.stringify(resp.data));
    console.log( ">>>> AccessToken: " , JSON.stringify(resp.data.access_token));
    return resp.data.access_token;
  } catch (error) {
    console.log(error)
  } 
}


async function insertServiceNowIncident(todoName, accessToken){
  var data = JSON.stringify({
    "short_description": todoName,
    "assignment_group":"287ebd7da9fe198100f92cc8d1d2154e",
    "urgency":"2",
    "impact":"2"
  });

  const url = 'https://dev64774.service-now.com/api/now/table/incident';

  const config = {
    headers: { 
      'Authorization': "Bearer "+ accessToken, 
      'Content-Type': 'application/json', 
      'Cookie': 'glide_user_route=glide.ba709e0dee19e2cf4d8aa2c62494d42e; BIGipServerpool_dev64774=2558613258.46912.0000; glide_user_activity=U0N2MzpJVWxBSVBJTE1HOTFleG04bHN0cmtiVUp4TURYN21TdjoxQ25xQTZvVjJJL2thZEVxdjdULzJvUk1oVlAwYWxzQTVPNVRzRC8wS2x3PQ==; JSESSIONID=3B66B901F7B6A70C2D106899424A0B89; glide_session_store=54A29E04DB202010D826487039961965'
    }
  };

  try {
    const resp = await axios.post(url, data, config);
    console.log(JSON.stringify(resp.data))
  } catch (error) {
    console.log(error)
  }
} 

AWS.config.update({region: process.env.REGION});

exports.handler = async event => {  
  var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  var i, todoName,todoDescription;
  for (i=0; i<event.Records.length; i++){
    todoName = JSON.stringify(event.Records[i].dynamodb.NewImage.name);
    todoDescription = JSON.stringify(event.Records[i].dynamodb.NewImage.description);
    var params = {
      TableName: process.env.BOOK_TABLE,
      
      Item: {
        'id': {S: ''+event.Records[i].dynamodb.NewImage.id},
        'title': {S: 'todo Name: '+ todoName},
        'author': {S: 'todo desc: '+ todoDescription}
      }
    };
    
    ddb.putItem(params, function(err,data){
      if (err){
        console.log("Error", err);
      }else {
        console.log("Success", data);
      }0
    });
  }
  
  const refresh_token = '90ZD-tVpZCxY0xcFCBMi0h6cPReI4p1MQ06QnIfBrrd5mhqa_ny4xnILQp_jognEj1pkqjZLHe56eqoh1Z3SuA'; 
  const accessToken = await generateAccessToken(refresh_token);
  console.log(">>> generateAccessToken Response:>>> ", accessToken);

  if (accessToken){
    
    // insert incident with TodoName as short_description
    await insertServiceNowIncident(todoName,accessToken);  
  }

};


