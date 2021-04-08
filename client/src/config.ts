// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'k8jleo0fd2'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-w0po8u6i.eu.auth0.com', // Auth0 domain
  clientId: 'fvvOT1mhvrxlDLZEriCz3iqWBijj4Mxw', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
