import React from 'react';

const Marquee: React.FC = () => {
  const messages = [
    "Green Standard: Reduce, Reuse, Recycle",
    "World Environment Day: June 5th",
    "Join our next Cleanliness Drive on July 15th",
    "Earth Day: April 22nd",
    "Tip: Use reusable bags for shopping",
    "Plant a tree, green the Earth!",
  ];

  return (
    <div className="bg-green-700 text-white py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        {messages.map((message, index) => (
          <span key={index} className="mx-4">{message}</span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;