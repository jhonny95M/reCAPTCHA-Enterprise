import { useEffect } from 'react';
import './App.css';
import RecaptchaMFA from './MFAChallenge';

function App() {

  const siteKey = '6LdEzm4qAAAAAHKGt9Qb6xZC4JEhBFPdLAEUzWyH';

  useEffect(() => {
    const loadReCaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
      document.body.appendChild(script);
    };
    loadReCaptchaScript();  
  }, [siteKey]);

  return (
    <div className="App">
      <h1 className='title-app'>Integración de <span className='app-recaptcha'>reCAPTCHA</span> y <span className='app-mfa'>MFA</span></h1>
      <RecaptchaMFA keyId={siteKey}  />
    </div>
  );
}

export default App;
