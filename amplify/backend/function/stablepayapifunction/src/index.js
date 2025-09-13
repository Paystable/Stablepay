const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.STABLEPAY_DYNAMODB_TABLE;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// Helper function to create response
const createResponse = (statusCode, body) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Create early access submission
const createEarlyAccessSubmission = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fullName, email, phoneNumber, formType, walletAddress, calculations } = body;

    // Validation
    if (!fullName || !email || !phoneNumber || !formType) {
      return createResponse(400, {
        success: false,
        message: 'Missing required fields: fullName, email, phoneNumber, formType'
      });
    }

    if (!isValidEmail(email)) {
      return createResponse(400, {
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!isValidPhone(phoneNumber)) {
      return createResponse(400, {
        success: false,
        message: 'Invalid phone number format'
      });
    }

    if (!['savings', 'investment'].includes(formType)) {
      return createResponse(400, {
        success: false,
        message: 'Form type must be either savings or investment'
      });
    }

    // Check if email already exists
    const existingSubmission = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { email }
    }).promise();

    if (existingSubmission.Item) {
      return createResponse(409, {
        success: false,
        message: 'Email already registered for early access',
        data: {
          email,
          submittedAt: existingSubmission.Item.submittedAt
        }
      });
    }

    // Create new submission
    const submission = {
      id: uuidv4(),
      email,
      fullName,
      phoneNumber,
      formType,
      walletAddress: walletAddress || '',
      calculations: calculations || {},
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ipAddress: event.requestContext.identity.sourceIp,
      userAgent: event.headers['User-Agent'] || ''
    };

    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: submission
    }).promise();

    return createResponse(201, {
      success: true,
      message: 'Early access request submitted successfully',
      data: {
        id: submission.id,
        email: submission.email,
        formType: submission.formType,
        submittedAt: submission.submittedAt
      }
    });

  } catch (error) {
    console.error('Error creating early access submission:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all early access submissions (admin)
const getEarlyAccessSubmissions = async (event) => {
  try {
    const { page = 1, limit = 50, formType, sortBy = 'createdAt', sortOrder = 'desc' } = event.queryStringParameters || {};

    const params = {
      TableName: TABLE_NAME,
      Limit: parseInt(limit)
    };

    // Add filter if formType is specified
    if (formType) {
      params.FilterExpression = 'formType = :formType';
      params.ExpressionAttributeValues = {
        ':formType': formType
      };
    }

    const result = await dynamodb.scan(params).promise();
    let submissions = result.Items || [];

    // Sort submissions
    submissions.sort((a, b) => {
      const aValue = new Date(a[sortBy] || a.createdAt);
      const bValue = new Date(b[sortBy] || b.createdAt);
      
      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedSubmissions = submissions.slice(skip, skip + parseInt(limit));

    return createResponse(200, {
      success: true,
      data: {
        submissions: paginatedSubmissions.map(sub => ({
          id: sub.id,
          fullName: sub.fullName,
          email: sub.email,
          phoneNumber: sub.phoneNumber,
          formType: sub.formType,
          walletAddress: sub.walletAddress,
          calculations: sub.calculations,
          submittedAt: sub.submittedAt,
          ipAddress: sub.ipAddress
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: submissions.length,
          pages: Math.ceil(submissions.length / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching early access submissions:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get submission statistics
const getEarlyAccessStats = async (event) => {
  try {
    const result = await dynamodb.scan({
      TableName: TABLE_NAME
    }).promise();

    const submissions = result.Items || [];
    const totalSubmissions = submissions.length;
    const savingsSubmissions = submissions.filter(sub => sub.formType === 'savings').length;
    const investmentSubmissions = submissions.filter(sub => sub.formType === 'investment').length;
    
    // Recent submissions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= oneDayAgo
    ).length;

    // Calculate total savings and returns
    const totalCalculatedSavings = submissions
      .filter(sub => sub.calculations?.totalSavings5Years)
      .reduce((sum, sub) => sum + (sub.calculations.totalSavings5Years || 0), 0);

    const totalCalculatedReturns = submissions
      .filter(sub => sub.calculations?.totalYield5Years)
      .reduce((sum, sub) => sum + (sub.calculations.totalYield5Years || 0), 0);

    return createResponse(200, {
      success: true,
      data: {
        totalSubmissions,
        formTypeBreakdown: {
          savings: savingsSubmissions,
          investment: investmentSubmissions
        },
        recentSubmissions,
        totalCalculatedSavings,
        totalCalculatedReturns,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching early access stats:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update submission (admin)
const updateEarlyAccessSubmission = async (event) => {
  try {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    const result = await dynamodb.update({
      TableName: TABLE_NAME,
      Key: { email: id }, // Using email as key since it's unique
      UpdateExpression: 'SET #updatedAt = :updatedAt, #fullName = :fullName, #phoneNumber = :phoneNumber, #formType = :formType, #walletAddress = :walletAddress, #calculations = :calculations',
      ExpressionAttributeNames: {
        '#updatedAt': 'updatedAt',
        '#fullName': 'fullName',
        '#phoneNumber': 'phoneNumber',
        '#formType': 'formType',
        '#walletAddress': 'walletAddress',
        '#calculations': 'calculations'
      },
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString(),
        ':fullName': body.fullName,
        ':phoneNumber': body.phoneNumber,
        ':formType': body.formType,
        ':walletAddress': body.walletAddress || '',
        ':calculations': body.calculations || {}
      },
      ReturnValues: 'ALL_NEW'
    }).promise();

    if (!result.Attributes) {
      return createResponse(404, {
        success: false,
        message: 'Submission not found'
      });
    }

    return createResponse(200, {
      success: true,
      message: 'Submission updated successfully',
      data: { id, updated: true }
    });

  } catch (error) {
    console.error('Error updating early access submission:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete submission (admin)
const deleteEarlyAccessSubmission = async (event) => {
  try {
    const { id } = event.pathParameters;

    const result = await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { email: id }, // Using email as key
      ReturnValues: 'ALL_OLD'
    }).promise();

    if (!result.Attributes) {
      return createResponse(404, {
        success: false,
        message: 'Submission not found'
      });
    }

    return createResponse(200, {
      success: true,
      message: 'Submission deleted successfully',
      data: { id, deleted: true }
    });

  } catch (error) {
    console.error('Error deleting early access submission:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error'
    });
  }
};

// Main handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  const { httpMethod, path } = event;

  try {
    switch (path) {
      case '/api/early-access/submit':
        if (httpMethod === 'POST') {
          return await createEarlyAccessSubmission(event);
        }
        break;

      case '/api/early-access/submissions':
        if (httpMethod === 'GET') {
          return await getEarlyAccessSubmissions(event);
        }
        break;

      case '/api/early-access/stats':
        if (httpMethod === 'GET') {
          return await getEarlyAccessStats(event);
        }
        break;

      default:
        if (path.startsWith('/api/early-access/submissions/') && httpMethod === 'PUT') {
          return await updateEarlyAccessSubmission(event);
        }
        if (path.startsWith('/api/early-access/submissions/') && httpMethod === 'DELETE') {
          return await deleteEarlyAccessSubmission(event);
        }
        break;
    }

    return createResponse(404, {
      success: false,
      message: 'Not found'
    });

  } catch (error) {
    console.error('Handler error:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error'
    });
  }
};
