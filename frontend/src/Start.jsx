import React from 'react';

const Start = () => {
  const divStyle = {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)',
  };

  const textStyle = {
    fontFamily: "'Qwigley', cursive",
  };
  const textStyle2 = {
/*     fontFamily: "'Luckiest Guy', cursive",
 */    fontFamily:"'Major Mono Display', monospace",
  };

  return (
    <div style={divStyle} className='bg-pink-500 h-screen flex flex-col items-center justify-center'>
      <div style={textStyle2} className="text-white text-6xl mb-5"> KASHITOKARU</div>
      <div className="text-pink-200 text-6xl text-center " style={textStyle}>
        The Art of Conversation, Redefined...
      </div>
    </div>
  );
};

export default Start;
