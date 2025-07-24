import React from 'react';
import Button from './components/Button';

const App: React.FC = () => {
    const handleClick = () => {
        alert('Button clicked!');
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Beautiful React UI</h1>
            <Button label="Click Me" onClick={handleClick} />
        </div>
    );
};

export default App;