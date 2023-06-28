const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');

const express = require('express');
const serverless = require('serverless-http');


const app = express();

const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.get('/feedbacks/:feedbackId', async function (req, res) {
  const params = {
    TableName: FEEDBACK_TABLE,
    Key: {
      feedbackId: req.params.feedbackId,
    },
  };

  try {
    const {Item} = await dynamoDbClient.send(new GetCommand(params));
    if (Item) {
      res.json({...Item});
    } else {
      res
        .status(404)
        .json({error: 'Could not find feedback with provided "feedbackId"'});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Could not retreive feedback'});
  }
});

app.post('/feedbacks', async function (req, res) {
  const body = req.body;

  if (typeof body.feedbackId !== 'string') {
    res.status(400).json({error: '"feedbackId" must be a string'});
  } else if (typeof body.exciting !== 'number') {
    res.status(400).json({error: '"exciting" must be a number'});
  } else if (typeof body.design !== 'number') {
    res.status(400).json({error: '"design" must be a number'});
  } else if (typeof body.playersGameMechanics !== 'number') {
    res.status(400).json({error: '"playersGameMechanics" must be a number'});
  } else if (typeof body.otherGameMechanics !== 'number') {
    res.status(400).json({error: '"otherGameMechanics" must be a number'});
  } else if (typeof body.detailedFeedback !== 'string') {
    res.status(400).json({error: '"detailedFeedback" must be a string'});
  }

  const params = {
    TableName: FEEDBACK_TABLE,
    Item: {
      feedbackId: body.feedbackId,
      exciting: body.exciting,
      design: body.design,
      playersGameMechanics: body.playersGameMechanics,
      otherGameMechanics: body.otherGameMechanics,
      detailedFeedback: body.detailedFeedback,
    },
  };

  try {
    await dynamoDbClient.send(new PutCommand(params));
    res.json({
      feedbackId: body.feedbackId,
      exciting: body.exciting,
      design: body.design,
      playersGameMechanics: body.playersGameMechanics,
      otherGameMechanics: body.otherGameMechanics,
      detailedFeedback: body.detailedFeedback,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({error: 'Could not create feedback'});
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});


module.exports.handler = serverless(app);
