const admin = require('firebase-admin')

const serviceAccount = require('./assignment-10-16846-firebase-adminsdk-xntz8-49a4a6a1b6.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

module.exports = admin
