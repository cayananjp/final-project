// Test script to verify backend is accessible
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

console.log('Testing backend connection...');
console.log('Backend URL:', backendUrl);

// Test health endpoint
fetch(`${backendUrl}/api/health`)
    .then(response => response.json())
    .then(data => {
        console.log('✅ Backend is accessible!');
        console.log('Response:', data);
        
        if (data.geminiConfigured) {
            console.log('✅ Gemini API key is configured');
        } else {
            console.log('⚠️ Gemini API key is NOT configured');
        }
    })
    .catch(error => {
        console.error('❌ Cannot connect to backend');
        console.error('Error:', error.message);
        console.log('\n💡 Make sure backend server is running:');
        console.log('   cd backend');
        console.log('   npm start');
    });
