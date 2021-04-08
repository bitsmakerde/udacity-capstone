const AWS = require("aws-sdk");
const mylocalAuthProxyFn = async (event, context) => {
    
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
};

module.exports = { mylocalAuthProxyFn };