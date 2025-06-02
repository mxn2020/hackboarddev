import React from 'react';
import Guestbook from '../components/examples/Guestbook';
import RedisCounter from '../components/examples/RedisCounter';

const ExamplesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Examples</h1>
      <p className="text-center text-muted-foreground mb-12">
        Interactive examples demonstrating Redis functionality with Netlify Functions
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Guestbook />
        <RedisCounter />
      </div>
    </div>
  );
};

export default ExamplesPage;
