import { db } from './src/config/firebase';

async function testConnection() {
  try {
    console.log('Testing Firestore connection...');
    const snapshot = await db.collection('products').limit(1).get();
    
    if (snapshot.empty) {
      console.log('Successfully connected to Firestore, but the "products" collection is empty.');
    } else {
      console.log('Successfully connected to Firestore! Found document in "products":');
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
    process.exit(1);
  }
}

testConnection();
