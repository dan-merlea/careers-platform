export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'hatchbeacon.eu.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'oOwD1eiYMSO2S1RnSV8HBUDWADXe3Gpy',
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://hatchbeacon.eu.auth0.com/api/v2/',
  redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI || window.location.origin + '/callback',
  scope: 'openid profile email',
};
