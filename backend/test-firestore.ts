import { db } from './src/config/firebase';

async function testConnection() {
  try {
    console.log('Testing Firestore laptops category query...');
    const snapshot = await db.collection('products').where('category', '==', 'laptops').get();
    
    if (snapshot.empty) {
      console.log('No laptops found in products collection.');
    } else {
      console.log(`Successfully found ${snapshot.size} laptops in Firestore:`);
      snapshot.forEach(doc => {
        console.log('-', doc.data().title);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('Error querying laptops from Firestore:', error);
    process.exit(1);
  }
}

testConnection();
