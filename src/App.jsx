import React, { useState } from 'react';

const App = () => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    city: '',
    email: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.jobTitle.trim()) {
      setMessage('❌ Job Title is required');
      return false;
    }
    if (!formData.city.trim()) {
      setMessage('❌ Target City is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Prepare the payload in a format n8n can easily handle
      const payload = {
        data: {
          jobTitle: formData.jobTitle.trim(),
          city: formData.city.trim(),
          email: formData.email.trim() || 'not-provided',
          timestamp: new Date().toISOString(),
          status: 'new',
          source: 'lead-generation-form',
          id: Date.now().toString()
        },
        // Alternative flat structure in case n8n expects this
        jobTitle: formData.jobTitle.trim(),
        city: formData.city.trim(),
        email: formData.email.trim() || 'not-provided',
        timestamp: new Date().toISOString(),
        status: 'new',
        source: 'lead-generation-form',
        id: Date.now().toString()
      };
      
      const n8nWebhookUrl = 'https://preetkachhadiyaa.app.n8n.cloud/webhook-test/lead-generation';
      
      console.log('Sending data to:', n8nWebhookUrl);
      console.log('Payload:', payload);

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        let result;
        try {
          result = await response.json();
          console.log('Success response:', result);
        } catch (parseError) {
          console.log('Response is not JSON, treating as success');
          result = { message: 'Success' };
        }
        
        setMessage('✅ Lead generation started successfully! Check your Google Sheet for results.');
        
        // Reset form
        setFormData({
          jobTitle: '',
          city: '',
          email: ''
        });
      } else {
        let errorData;
        try {
          errorData = await response.json();
          console.error('JSON Error response:', errorData);
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Text Error response:', errorText);
          errorData = { message: errorText || 'Unknown error' };
        }
        
        // More specific error handling
        if (response.status === 500) {
          if (errorData.message && errorData.message.includes('No item to return')) {
            setMessage('❌ n8n Workflow Error: The workflow is not configured properly. Please check your n8n workflow setup.');
          } else {
            setMessage(`❌ Server Error (500): ${errorData.message || 'Internal server error in n8n workflow'}`);
          }
        } else if (response.status === 404) {
          setMessage('❌ Webhook Not Found: Check your n8n webhook URL');
        } else if (response.status === 403) {
          setMessage('❌ Access Denied: Check your n8n webhook permissions');
        } else {
          setMessage(`❌ Error (${response.status}): ${errorData.message || 'Unknown error occurred'}`);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      
      // Network and connection errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('❌ Network Error: Cannot connect to n8n. Check if the webhook URL is correct and n8n is running.');
      } else if (error.message.includes('CORS')) {
        setMessage('❌ CORS Error: n8n webhook needs to allow cross-origin requests');
      } else if (error.name === 'AbortError') {
        setMessage('❌ Request Timeout: The request took too long to complete');
      } else {
        setMessage(`❌ Unexpected Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="container mt-5" 
      style={{ 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#0d1117',
        minHeight: '100vh',
        padding: '2rem 1rem'
      }}
    >
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div 
            className="card shadow" 
            style={{ 
              border: '1px solid #30363d',
              borderRadius: '0.75rem',
              backgroundColor: '#161b22',
              boxShadow: '0 16px 32px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div 
              className="card-header text-white" 
              style={{ 
                background: 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                padding: '1.5rem',
                borderRadius: '0.75rem 0.75rem 0 0'
              }}
            >
              <h2 className="mb-0" style={{ fontWeight: '700', fontSize: '1.75rem' }}>
                🎯 AI Lead Generation System
              </h2>
            </div>
            <div className="card-body" style={{ padding: '2rem', backgroundColor: '#0d1117' }}>
              <div>
                <div className="mb-3">
                  <label 
                    className="form-label" 
                    style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: '#f0f6fc'
                    }}
                  >
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Full Stack Developer, React Developer"
                    required
                    style={{ 
                      padding: '0.75rem',
                      border: '1px solid #30363d',
                      borderRadius: '0.5rem',
                      width: '100%',
                      backgroundColor: '#21262d',
                      color: '#f0f6fc',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                
                <div className="mb-3">
                  <label 
                    className="form-label" 
                    style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: '#f0f6fc'
                    }}
                  >
                    Target City *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., New York, San Francisco, Remote"
                    required
                    style={{ 
                      padding: '0.75rem',
                      border: '1px solid #30363d',
                      borderRadius: '0.5rem',
                      width: '100%',
                      backgroundColor: '#21262d',
                      color: '#f0f6fc',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label 
                    className="form-label" 
                    style={{ 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      color: '#f0f6fc'
                    }}
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    style={{ 
                      padding: '0.75rem',
                      border: '1px solid #30363d',
                      borderRadius: '0.5rem',
                      width: '100%',
                      backgroundColor: '#21262d',
                      color: '#f0f6fc',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>

                <div className="d-grid">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    disabled={isLoading}
                    onClick={handleSubmit}
                    style={{
                      background: isLoading 
                        ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)'
                        : 'linear-gradient(135deg, #238636 0%, #2ea043 100%)',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                      width: '100%',
                      color: '#ffffff',
                      boxShadow: isLoading 
                        ? 'none' 
                        : '0 4px 12px rgba(35, 134, 54, 0.3)',
                      transition: 'all 0.3s ease',
                      transform: isLoading ? 'none' : 'translateY(-1px)'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span style={{ marginRight: '0.5rem' }}>⏳</span>
                        Generating Leads...
                      </>
                    ) : (
                      '🚀 Start Lead Generation'
                    )}
                  </button>
                </div>
              </div>

              {message && (
                <div 
                  className={`alert mt-3`}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '0.5rem',
                    backgroundColor: message.includes('✅') ? '#0f2419' : '#2d1b1f',
                    border: `1px solid ${message.includes('✅') ? '#238636' : '#da3633'}`,
                    color: message.includes('✅') ? '#2ea043' : '#f85149',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          <div 
            className="card mt-4" 
            style={{ 
              border: '1px solid #30363d',
              borderRadius: '0.75rem',
              backgroundColor: '#161b22'
            }}
          >
            <div className="card-body" style={{ padding: '2rem', backgroundColor: '#0d1117' }}>
              <h5 
                className="card-title" 
                style={{ 
                  marginBottom: '1.5rem',
                  color: '#f0f6fc',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}
              >
                🤖 How It Works:
              </h5>
              <ol style={{ paddingLeft: '1.5rem', color: '#8b949e' }}>
                <li style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>Submit your job title and target city</li>
                <li style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>AI searches multiple platforms for matching leads</li>
                <li style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>Leads are scored and filtered automatically</li>
                <li style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>Personalized outreach messages are generated</li>
                <li style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>Results appear in your Google Sheet</li>
                <li style={{ marginBottom: '0.75rem', lineHeight: '1.5' }}>Follow-up reminders are set automatically</li>
              </ol>
              
              <div 
                className="mt-4 p-3" 
                style={{ 
                  backgroundColor: '#21262d', 
                  borderRadius: '0.5rem',
                  border: '1px solid #30363d'
                }}
              >
                <h6 style={{ color: '#f0f6fc', marginBottom: '0.75rem' }}>🔧 Troubleshooting Tips:</h6>
                <ul style={{ color: '#8b949e', fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Make sure your n8n workflow is active and published</li>
                  <li style={{ marginBottom: '0.5rem' }}>Check that the webhook URL is correct</li>
                  <li style={{ marginBottom: '0.5rem' }}>Verify that your n8n workflow has a webhook trigger node</li>
                  <li style={{ marginBottom: '0.5rem' }}>Ensure CORS is enabled in your n8n settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;